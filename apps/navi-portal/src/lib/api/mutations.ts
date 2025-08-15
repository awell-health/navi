"use server";

import { print } from "graphql";
import {
  AuthService,
  SessionData,
  SessionTokenDataSchema,
} from "@awell-health/navi-core";
import { NaviSession } from "@/domains/session/navi-session";
import { env } from "@/env";
import {
  StartCareFlowMutation,
  StartCareFlowMutationVariables,
  PatientMatchMutation,
  PatientMatchMutationVariables,
  StartCareFlowDocument,
  PatientMatchDocument,
} from "../awell-client/generated/graphql";
import { ENDPOINTS } from "./environments";

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

  // Create JWT from session data using helper (no auth state in tokenData)
  const jwt = await authService.createJWTFromSession(
    NaviSession.renewJwtExpiration(
      SessionTokenDataSchema.parse(sessionData),
      NaviSession.DEFAULT_JWT_TTL_SECONDS
    ),
    sessionData.sessionId,
    env.JWT_KEY_ID,
    { authenticationState: "unauthenticated" }
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

  const response = await fetch(ENDPOINTS[sessionData.environment], {
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

    const response: GraphQLResponse<StartCareFlowMutation> =
      await executeGraphQL(
        {
          query: print(StartCareFlowDocument),
          variables: {
            input: {
              careflow_definition_id: input.careflow_definition_id,
              patient_id: input.patient_id,
              data_points: input.data_points,
              session_id: input.session_id,
            },
          },
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
      patient_identifier_system: input.patient_identifier?.system,
      patient_identifier_value: input.patient_identifier?.value,
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
