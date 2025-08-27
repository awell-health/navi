import type { MedplumClient } from "@medplum/core";
import type { Patient, Task } from "@medplum/fhirtypes";

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export type ResourceHandler = (resource: any) => void;

// Pagination interfaces for progressive loading
export interface PaginationOptions {
  pageSize?: number;
  lastUpdated?: string; // cursor for pagination
}

export interface PaginatedResult<T> {
  data: T[];
  hasMore: boolean;
  nextCursor?: string;
  totalCount?: number; // Total count from FHIR bundle
}
export class MedplumStoreClient {
  private client: MedplumClient;
  private initialized = false;

  constructor(client: MedplumClient) {
    this.client = client;
  }

  // Initialize the store with client login
  async initialize(clientId?: string, clientSecret?: string): Promise<void> {
    if (!this.initialized) {
      if (!this.client) {
        throw new Error("Failed to create Medplum client");
      }

      try {
        if (!clientId || !clientSecret) {
          throw new Error(
            "Medplum credentials are missing. Please check your .env.local file."
          );
        }

        // Perform client credentials login if not already authenticated
        // This is safe on the server and will not expose secrets to the client
        // On the client, callers should avoid passing secrets
        // Only attempt if the client supports startClientLogin
        // biome-ignore lint/suspicious/noExplicitAny: MedplumClient has runtime methods we call safely
        const isAuthenticated =
          (this.client as any).isAuthenticated?.() === true;

        if (!isAuthenticated) {
          // biome-ignore lint/suspicious/noExplicitAny: see above
          await (this.client as any).startClientLogin(clientId, clientSecret);
        }

        this.initialized = true;
      } catch (error) {
        console.error("Failed to initialize Medplum client:", error);
        throw error;
      }
    }
  }

  // Get the current access token
  async getAccessToken(): Promise<string | undefined> {
    const token = this.client.getAccessToken();
    return token;
  }

  async getPatient(patientId: string): Promise<Patient> {
    try {
      const patientResource = await this.client.readResource(
        "Patient",
        patientId
      );
      return patientResource as Patient;
    } catch (error) {
      console.error("Error getting patient:", error);
      throw error;
    }
  }

  async getTasks(): Promise<Task[]> {
    try {
      const bundle = await this.client.search("Task", {
        _count: 1000,
        _sort: "-_lastUpdated",
      });

      return (bundle.entry || []).map((entry) => entry.resource as Task);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      throw error;
    }
  }

  async getTasksForPatient(patientId: string): Promise<Task[]> {
    try {
      const bundle = await this.client.search("Task", {
        subject: `Patient/${patientId}`,
        _count: 100,
        _sort: "-_lastUpdated",
      });
      return (bundle.entry || []).map((entry) => entry.resource as Task);
    } catch (error) {
      console.error("Error fetching patient tasks:", error);
      throw error;
    }
  }

  async getPatientByIdentifier(identifier: string): Promise<Patient | null> {
    try {
      const bundle = await this.client.search("Patient", {
        identifier,
        _count: 1,
      });
      const first = bundle.entry?.[0]?.resource as Patient | undefined;
      return first ?? null;
    } catch (error) {
      console.error("Error fetching patient by identifier:", error);
      throw error;
    }
  }
}
