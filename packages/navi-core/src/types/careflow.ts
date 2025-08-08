import type { BrandingConfig } from "./config";
import type { RenderOptions } from "./navi-js";

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
export type CreateCareFlowSessionResponseSuccess = {
  success: boolean;
  embedUrl: string;
  branding?: BrandingConfig;
};

export type CreateCareFlowSessionResponseError = {
  success: false;
  error: string;
};

export type CreateCareFlowSessionResponse =
  | CreateCareFlowSessionResponseSuccess
  | CreateCareFlowSessionResponseError;
