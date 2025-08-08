import type { CreateCareFlowSessionResponse } from "./types";
import type { CreateCareFlowSessionResponseSuccess } from "./types";

export const isSessionResponseSuccess = (
  response: CreateCareFlowSessionResponse
): response is CreateCareFlowSessionResponseSuccess => {
  return response.success && "embedUrl" in response;
};
