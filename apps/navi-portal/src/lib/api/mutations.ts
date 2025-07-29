import { print } from "graphql";
import { AuthService, SessionData } from "@awell-health/navi-core";
import { env } from "@/env";
import {
  StartCareFlowMutation,
  StartCareFlowMutationVariables,
  PatientMatchMutation,
  PatientMatchMutationVariables,
  StartCareFlowDocument,
  PatientMatchDocument,
  PathwayActivitiesDocument,
  PathwayActivitiesQuery,
} from "../awell-client/generated/graphql";

/**
 * GraphQL mutations for care flow operations
 * Used by embed routes to orchestrate care flow creation and management
 *
 * Uses AuthService from navi-core for proper two-phase authentication
 */

interface GraphQLResponse<T = unknown> {
  data?: T;
  errors?: Array<{
    message: string;
    locations?: Array<{ line: number; column: number }>;
    path?: string[];
  }>;
}

interface GraphQLRequest {
  query: string;
  variables?: Record<string, unknown>;
}

/**
 * Execute a GraphQL operation with JWT authentication from SessionData
 * Uses AuthService.createJWTFromSession for proper two-phase auth
 */
async function executeGraphQL<T = unknown>(
  request: GraphQLRequest,
  sessionData: SessionData
): Promise<GraphQLResponse<T>> {
  // Initialize AuthService
  const authService = new AuthService();
  await authService.initialize(env.JWT_SIGNING_KEY);

  // Create JWT from session data using proper AuthService method
  const jwt = await authService.createJWTFromSession(
    {
      patientId: sessionData.patientId,
      careflowId: sessionData.careflowId,
      stakeholderId: sessionData.stakeholderId,
      orgId: sessionData.orgId,
      tenantId: sessionData.tenantId,
      environment: sessionData.environment,
      authenticationState: sessionData.authenticationState,
      exp: Math.floor(Date.now() / 1000) + 15 * 60, // 15 minutes
    },
    sessionData.sessionId,
    "navi-portal.awellhealth.com" // issuer
  );

  console.debug("🔍 Executing GraphQL operation:", {
    query: request.query.substring(0, 100) + "...",
    variables: request.variables,
    sessionData: {
      patientId: sessionData.patientId,
      stakeholderId: sessionData.stakeholderId,
      tenantId: sessionData.tenantId,
    },
  });

  const response = await fetch(env.NEXT_PUBLIC_GRAPHQL_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${jwt}`,
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`GraphQL request failed: ${response.status} ${errorText}`);
  }

  const result: GraphQLResponse<T> = await response.json();

  if (result.errors && result.errors.length > 0) {
    console.error("❌ GraphQL errors:", result.errors);
    throw new Error(
      `GraphQL errors: ${result.errors.map((e) => e.message).join(", ")}`
    );
  }

  console.debug("✅ GraphQL operation successful");
  return result;
}

/**
 * GraphQL mutations for care flow operations
 * Used by embed routes to orchestrate care flow creation and management
 *
 * Uses plain fetch with JWT authentication created from SessionData
 */

// Legacy types for existing functions - TODO: migrate to generated types
interface Patient {
  id: string;
  externalId?: string;
  profile?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    dateOfBirth?: string;
  };
}

interface CareFlow {
  id: string;
  pathwayId: string;
  patientId: string;
  status: "active" | "completed" | "paused";
  activities?: Array<{
    id: string;
    title: string;
    status: "pending" | "active" | "completed";
  }>;
}

interface PathwayActivities {
  activities: Array<{
    id: string;
    title: string;
    status: "pending" | "active" | "completed";
    isRequired: boolean;
  }>;
  hasActivities: boolean;
  nextActivity?: {
    id: string;
    title: string;
  };
}

/**
 * @deprecated Use patientMatch() instead
 * Find or create a patient in the system
 * Used for new care flows to ensure patient exists before starting
 */
export async function findOrCreatePatient(input: {
  externalId: string;
  tenantId: string;
  profile?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    dateOfBirth?: string;
  };
}): Promise<Patient> {
  // Note: This function is deprecated and should be replaced with patientMatch
  // For now, throw an error to force migration to the new approach
  throw new Error(
    "findOrCreatePatient is deprecated. Use patientMatch() instead."
  );
}

/**
 * Start a new care flow for a patient using the new startCareFlow mutation
 * Creates a care flow instance and returns success status with care flow details
 */
export async function startCareflow(
  input: StartCareFlowMutationVariables["input"] & {
    stakeholder_id?: string; // For validation against returned stakeholders
  },
  sessionData: SessionData
): Promise<StartCareFlowMutation["startCareFlow"]> {
  try {
    console.debug("🚀 Starting care flow:", {
      patient_id: input.patient_id,
      careflow_definition_id: input.careflow_definition_id,
      stakeholder_id: input.stakeholder_id,
    });

    // Prepare mutation input (exclude stakeholder_id as it's only for validation)
    const { stakeholder_id, ...mutationInput } = input;

    const response: GraphQLResponse<StartCareFlowMutation> =
      await executeGraphQL(
        {
          query: print(StartCareFlowDocument),
          variables: { input: mutationInput },
        },
        sessionData
      );

    if (!response.data?.startCareFlow) {
      throw new Error("No care flow data returned from startCareFlow");
    }

    if (!response.data.startCareFlow.success) {
      throw new Error(
        `Care flow creation failed: ${response.data.startCareFlow.code}`
      );
    }

    // Validate stakeholder authorization if stakeholder_id is provided
    if (stakeholder_id && response.data.startCareFlow.stakeholders) {
      const authorizedStakeholder =
        response.data.startCareFlow.stakeholders.find(
          (stakeholder: any) => stakeholder.id === stakeholder_id
        );

      if (!authorizedStakeholder) {
        console.warn(
          `❌ Stakeholder ${stakeholder_id} not authorized for care flow ${response.data.startCareFlow.careflow.id}`
        );
        throw new Error(
          `Stakeholder ${stakeholder_id} is not authorized to access this care flow`
        );
      }

      console.debug(
        `✅ Stakeholder validation passed: ${authorizedStakeholder.label.en} (${authorizedStakeholder.clinical_app_role})`
      );
    }

    console.debug(
      "✅ Care flow started:",
      response.data.startCareFlow.careflow.id
    );
    return response.data.startCareFlow;
  } catch (error) {
    console.error("❌ Failed to start care flow:", error);
    throw new Error(
      `Care flow creation failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

/**
 * Find or create a patient using the new patientMatch mutation
 * Handles patient identification by ID or external identifier
 */
export async function patientMatch(
  input: PatientMatchMutationVariables["input"],
  sessionData: SessionData
): Promise<PatientMatchMutation["patientMatch"]> {
  try {
    console.debug("🔍 Matching patient:", {
      patient_id: input.patient_id,
      patient_identifier: input.patient_identifier?.value,
      allow_anonymous_creation: input.allow_anonymous_creation,
    });

    const response: GraphQLResponse<PatientMatchMutation> =
      await executeGraphQL(
        {
          query: print(PatientMatchDocument),
          variables: { input },
        },
        sessionData
      );

    if (!response.data?.patientMatch) {
      throw new Error("No patient data returned from patientMatch");
    }

    if (!response.data.patientMatch.success) {
      throw new Error(
        `Patient matching failed: ${response.data.patientMatch.code} - ${response.data.patientMatch.message}`
      );
    }

    console.debug("✅ Patient matched:", response.data.patientMatch.patient_id);
    return response.data.patientMatch;
  } catch (error) {
    console.error("❌ Failed to match patient:", error);
    throw new Error(
      `Patient matching failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

/**
 * Get pathway activities for an existing care flow
 * Used to validate that there are activities available for the stakeholder
 */
export async function getPathwayActivities(
  input: {
    pathwayId: string;
    stakeholderId: string;
  },
  sessionData: SessionData
): Promise<PathwayActivities> {
  try {
    console.debug("📋 Getting pathway activities:", {
      pathwayId: input.pathwayId,
      stakeholderId: input.stakeholderId,
    });

    const response: GraphQLResponse<PathwayActivitiesQuery> =
      await executeGraphQL(
        {
          query: print(PathwayActivitiesDocument),
          variables: {
            pathway_id: input.pathwayId,
          },
        },
        sessionData
      );

    if (!response.data?.pathwayActivities) {
      throw new Error("No pathway activities data returned");
    }

    console.debug("✅ Pathway activities retrieved:", {
      hasActivities: response.data.pathwayActivities.activities.length > 0,
      activityCount: response.data.pathwayActivities.activities.length,
    });

    // Transform the response to match the expected interface
    return {
      activities: response.data.pathwayActivities.activities.map(
        (activity) => ({
          id: activity.id,
          title: "Activity", // GraphQL schema doesn't have title, using placeholder
          status:
            activity.status === "ACTIVE"
              ? "active"
              : activity.status === "DONE"
              ? "completed"
              : "pending",
          isRequired: true, // Default to required
        })
      ),
      hasActivities: response.data.pathwayActivities.activities.length > 0,
      nextActivity: response.data.pathwayActivities.activities.find(
        (a) => a.status === "ACTIVE"
      )
        ? {
            id: response.data.pathwayActivities.activities.find(
              (a) => a.status === "ACTIVE"
            )!.id,
            title: "Next Activity",
          }
        : undefined,
    };
  } catch (error) {
    console.error("❌ Failed to get pathway activities:", error);
    throw new Error(
      `Failed to retrieve activities: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}
