import { TokenEnvironment } from "@awell-health/navi-core";

export const ENDPOINTS: Record<TokenEnvironment, string> = {
  local: "http://localhost:4000/graphql",
  test: "http://localhost:4000/graphql",
  development: "https://navi.development.awellhealth.com/graphql",
  staging: "https://navi.staging.awellhealth.com/graphql",
  "production-eu": "https://navi.awellhealth.com/graphql",
  "production-us": "https://navi.us.awellhealth.com/graphql",
  "production-uk": "https://navi.uk.awellhealth.com/graphql",
  sandbox: "https://navi.sandbox.awellhealth.com/graphql",
};

/**
 * Get endpoint for a specific environment
 */
export function getEndpoint(environment: TokenEnvironment): string {
  return ENDPOINTS[environment] || ENDPOINTS.development;
}

/**
 * Get endpoint from session data
 */
export function getEndpointFromSession(sessionData: any): string {
  const environment = sessionData?.environment as TokenEnvironment;
  return getEndpoint(environment);
}
