import type { BrandingConfig } from "./config";

/**
 * FHIR-inspired Patient Identifier
 */
export interface PatientIdentifier {
  system: string;
  value: string;
}

/**
 * Request to start a new care flow
 */
export interface StartCareFlowRequest {
  publishableKey: string;
  careflowDefinitionId: string;
  awellPatientId?: string;
  patientIdentifier?: PatientIdentifier;
  stakeholderId?: string;
}

/**
 * Response from starting a care flow
 */
export interface StartCareFlowResponse {
  success: boolean;
  careflowId: string;
  patientId: string;
  sessionToken: string;
  redirectUrl: string;
  stakeholderId: string;
}

/**
 * Request to create a session for an existing care flow
 */
export interface CreateCareFlowSessionRequest {
  publishableKey: string;
  careflowId: string;
  trackId?: string;
  activityId?: string;
  stakeholderId?: string;
}

/**
 * Response from creating a care flow session
 */
export interface CreateCareFlowSessionResponse {
  success: boolean;
  careflowId: string;
  patientId: string;
  sessionToken: string;
  redirectUrl: string;
  stakeholderId: string;
}

/**
 * Unified render options for navi.js SDK
 */
export interface RenderOptions {
  // Use Case 1: Start new careflow
  careflowDefinitionId?: string;
  patientIdentifier?: PatientIdentifier;
  awellPatientId?: string;

  // Use Case 2: Resume existing careflow
  careflowId?: string;
  careflowToken?: string; // Alternative to session creation
  trackId?: string;
  activityId?: string;

  // Common options
  branding?: BrandingConfig;
  stakeholderId?: string; // if included, the care session returned will include activities for that stakeholder, rather than for the patient
}
