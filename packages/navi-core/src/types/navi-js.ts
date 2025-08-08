import type { BrandingConfig } from "./config";
import type { PatientIdentifier } from "./patient";

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
  height?: string;
  minHeight?: string;
  minWidth?: string;

  /**
   * Custom embed URL override (for testing)
   *
   * DO NOT USE THIS IN PRODUCTION.
   * This is only for testing and development purposes.
   */
  __dangerouslySetEmbedUrl?: string;
}
