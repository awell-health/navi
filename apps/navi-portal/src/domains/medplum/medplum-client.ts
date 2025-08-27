import type { MedplumClient } from '@medplum/core'
import type {
  Bundle,
  Parameters,
  Patient,
  Subscription,
  Task,
} from '@medplum/fhirtypes'

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export type ResourceHandler = (resource: any) => void

// Pagination interfaces for progressive loading
export interface PaginationOptions {
  pageSize?: number
  lastUpdated?: string // cursor for pagination
}

export interface PaginatedResult<T> {
  data: T[]
  hasMore: boolean
  nextCursor?: string
  totalCount?: number // Total count from FHIR bundle
}
export class MedplumStoreClient {
  private client: MedplumClient
  private socketsBaseUrl: string
  private initialized = false
  private resourceHandlers: Map<string, Set<ResourceHandler>> = new Map()

  constructor(client: MedplumClient, socketsBaseUrl: string) {
    this.client = client
    this.socketsBaseUrl = socketsBaseUrl
  }

  // Initialize the store with client login
  async initialize(clientId?: string, clientSecret?: string): Promise<void> {
    if (!this.initialized) {
      if (!this.client) {
        throw new Error('Failed to create Medplum client')
      }

      try {
        if (!clientId || !clientSecret) {
          throw new Error(
            'Medplum credentials are missing. Please check your .env.local file.',
          )
        }

        // Skip WebSocket initialization for now - only needed for real-time subscriptions
        // await this.initializeWebSocket()
        this.initialized = true
      } catch (error) {
        console.error('Failed to initialize Medplum client:', error)
        throw error
      }
    }
  }

  async initializeWebSocket() {
    // Create subscriptions for both Task and Patient
    const taskSubscription = await this.client.createResource<Subscription>({
      resourceType: 'Subscription',
      criteria: 'Task',
      status: 'active',
      reason: 'Watch for tasks',
      channel: {
        type: 'websocket',
      },
    })

    const patientSubscription = await this.client.createResource<Subscription>({
      resourceType: 'Subscription',
      criteria: 'Patient',
      status: 'active',
      reason: 'Watch for patients',
      channel: {
        type: 'websocket',
      },
    })

    // Get binding tokens for both subscriptions
    const taskBinding = (await this.client.get(
      `/fhir/R4/Subscription/${taskSubscription.id}/$get-ws-binding-token`,
    )) as Parameters

    const patientBinding = (await this.client.get(
      `/fhir/R4/Subscription/${patientSubscription.id}/$get-ws-binding-token`,
    )) as Parameters

    const taskToken =
      taskBinding.parameter?.find((p) => p.name === 'token')?.valueString || ''
    const patientToken =
      patientBinding.parameter?.find((p) => p.name === 'token')?.valueString ||
      ''

    // Initialize WebSocket connection
    const ws = new WebSocket(`${this.socketsBaseUrl}/ws/subscriptions-r4`)
    ws.addEventListener('open', () => {
      console.log('WebSocket open')
      // Bind both tokens
      ws?.send(
        JSON.stringify({
          type: 'bind-with-token',
          payload: { token: taskToken },
        }),
      )
      ws?.send(
        JSON.stringify({
          type: 'bind-with-token',
          payload: { token: patientToken },
        }),
      )
    })

    ws.addEventListener('message', (event: MessageEvent<string>) => {
      const bundle = JSON.parse(event.data) as Bundle

      for (const entry of bundle.entry || []) {
        if (!entry.resource) return

        const resourceType = entry.resource.resourceType

        if (
          resourceType === 'SubscriptionStatus' &&
          entry.resource.status === 'active'
        ) {
          //console.log('Heartbeat received');
        } else {
          //console.log("Trying to handle resource", resourceType)
          // Call all handlers for this resource type
          console.log('Bundle received', resourceType)

          const handlers = this.resourceHandlers.get(resourceType)
          if (handlers) {
            for (const handler of handlers) {
              handler(entry.resource)
            }
          }
        }
      }
    })

    ws.addEventListener('error', (error) => {
      console.error('WebSocket error:', error)
    })

    ws.addEventListener('close', () => {
      console.log('WebSocket closed')
    })
  }

  // Subscribe to tasks
  async subscribeToTasks(handler: (task: Task) => void): Promise<() => void> {
    return this.subscribe('Task', handler)
  }

  // Subscribe to patients
  async subscribeToPatients(
    handler: (patient: Patient) => void,
  ): Promise<() => void> {
    return this.subscribe('Patient', handler)
  }

  // Internal subscription method
  private subscribe(
    resourceType: 'Task' | 'Patient',
    handler: ResourceHandler,
  ): () => void {
    if (!this.resourceHandlers.has(resourceType)) {
      this.resourceHandlers.set(resourceType, new Set())
    }
    this.resourceHandlers.get(resourceType)?.add(handler)

    // Return unsubscribe function
    return () => {
      this.resourceHandlers.get(resourceType)?.delete(handler)
    }
  }

  // Get the current access token
  async getAccessToken(): Promise<string | undefined> {
    const token = this.client.getAccessToken()
    return token
  }

  async getPatient(patientId: string): Promise<Patient> {
    try {
      const patientResource = await this.client.readResource(
        'Patient',
        patientId,
      )
      return patientResource as Patient
    } catch (error) {
      console.error('Error getting patient:', error)
      throw error
    }
  }
}
