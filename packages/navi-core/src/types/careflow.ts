import type { BrandingConfig } from "./config";

/**
 * FHIR-inspired Patient Identifier
 */
export interface PatientIdentifier {
  system: string;
  value: string;
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
  sessionId?: string; // Alternative to session creation
  trackId?: string;
  activityId?: string;

  // Common options
  stakeholderId?: string;
  branding?: BrandingConfig;

  // Iframe styling
  width?: string;

  /**
   * Custom embed URL override (for testing)
   *
   * DO NOT USE THIS IN PRODUCTION.
   * This is only for testing and development purposes.
   */
  __dangerouslySetEmbedUrl?: string;
}

/**
 * Request to create a session for an existing care flow
 */
export interface CreateCareFlowSessionRequest
  extends Omit<RenderOptions, "width" | "__dangerouslySetEmbedUrl"> {
  publishableKey: string;
}

/**
 * Response from creating a care flow session
 */
export interface CreateCareFlowSessionResponse {
  success: boolean;
  embedUrl: string;
  branding?: BrandingConfig;
}
