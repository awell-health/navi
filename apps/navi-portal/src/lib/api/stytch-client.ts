import { env } from "@/env";

/**
 * Edge-compatible Stytch M2M authentication client
 * Used by navi-portal backend to authenticate with module-navi GraphQL API
 */

interface StytchM2MToken {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

interface GraphQLRequest {
  query: string;
  variables?: Record<string, unknown>;
}

interface GraphQLResponse<T = unknown> {
  data?: T;
  errors?: Array<{
    message: string;
    locations?: Array<{ line: number; column: number }>;
    path?: string[];
  }>;
}

class StytchApiClient {
  private accessToken: string | null = null;
  private tokenExpiresAt: number = 0;
  private readonly baseUrl: string;

  constructor(baseUrl: string = "http://localhost:4000/graphql") {
    this.baseUrl = baseUrl;
  }

  /**
   * Get access token using Stytch M2M authentication
   */
  private async getAccessToken(): Promise<string> {
    // Check if current token is still valid (with 5 minute buffer)
    if (this.accessToken && Date.now() < this.tokenExpiresAt - 300000) {
      return this.accessToken;
    }

    console.debug("🔐 Fetching new Stytch M2M token");

    try {
      const response = await fetch(
        "https://api.stytch.com/v1/b2b/oauth/token",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            grant_type: "client_credentials",
            client_id: env.STYTCH_M2M_CLIENT_ID,
            client_secret: env.STYTCH_M2M_CLIENT_SECRET,
            scope:
              "read:organizations write:organizations read:members write:members",
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Stytch token request failed: ${response.status} ${errorText}`
        );
      }

      const tokenData: StytchM2MToken = await response.json();

      this.accessToken = tokenData.access_token;
      this.tokenExpiresAt = Date.now() + tokenData.expires_in * 1000;

      console.debug("✅ Stytch M2M token acquired");
      return this.accessToken;
    } catch (error) {
      console.error("❌ Failed to get Stytch M2M token:", error);
      throw new Error("Failed to authenticate with Stytch");
    }
  }

  /**
   * Execute a GraphQL query against module-navi with Stytch authentication
   */
  async query<T = unknown>(
    request: GraphQLRequest
  ): Promise<GraphQLResponse<T>> {
    try {
      const accessToken = await this.getAccessToken();

      console.debug("🔍 Executing GraphQL query:", {
        query: request.query.substring(0, 100) + "...",
        variables: request.variables,
      });

      const response = await fetch(this.baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
          "X-Stytch-Project-ID": env.STYTCH_PROJECT_ID,
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `GraphQL request failed: ${response.status} ${errorText}`
        );
      }

      const result: GraphQLResponse<T> = await response.json();

      if (result.errors && result.errors.length > 0) {
        console.error("❌ GraphQL errors:", result.errors);
        throw new Error(
          `GraphQL errors: ${result.errors.map((e) => e.message).join(", ")}`
        );
      }

      console.debug("✅ GraphQL query successful");
      return result;
    } catch (error) {
      console.error("❌ GraphQL query failed:", error);
      throw error;
    }
  }

  /**
   * Execute a GraphQL mutation against module-navi with Stytch authentication
   */
  async mutate<T = unknown>(
    request: GraphQLRequest
  ): Promise<GraphQLResponse<T>> {
    return this.query<T>(request);
  }

  /**
   * Clear cached token (useful for testing or error recovery)
   */
  clearToken(): void {
    this.accessToken = null;
    this.tokenExpiresAt = 0;
  }
}

// Export singleton instance
export const moduleNaviClient = new StytchApiClient(
  env.NEXT_PUBLIC_GRAPHQL_ENDPOINT
);

export type { GraphQLRequest, GraphQLResponse };
