import {
  from,
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  NormalizedCacheObject,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";
import { TokenEnvironment } from "@awell-health/navi-core";
import { getEndpoint } from "../api/environments";

let _apolloClient: ApolloClient<NormalizedCacheObject> | null = null;
let _jwtCache: {
  token: string;
  expiresAt: number;
  environment: TokenEnvironment;
} | null = null;
let _refreshTimer: NodeJS.Timeout | null = null;

/**
 * Clear JWT token cache (used when token is invalid)
 */
function clearJWTCache(): void {
  _jwtCache = null;
  if (_refreshTimer) {
    clearTimeout(_refreshTimer);
    _refreshTimer = null;
  }
}

/**
 * Clear JWT cache and optionally clear cookies
 * Use this when care flow is completed (keeps session for patient return)
 */
export async function clearAuthenticationCache(
  clearCookies: boolean = false
): Promise<void> {
  console.debug("🧹 Clearing authentication cache");
  clearJWTCache();

  if (clearCookies) {
    try {
      // Clear server-side JWT cookie via API
      await fetch("/api/session/clear-jwt", {
        method: "POST",
        credentials: "include",
      });

      console.debug("🍪 JWT cookie cleared successfully");

      // Note: We intentionally leave awell.sid cookie alone
      // so the 30-day session persists in case the patient returns
    } catch (error) {
      console.error("❌ Failed to clear JWT cookie:", error);
    }
  }
}

/**
 * Complete logout: clears all authentication data including session
 * Use this for full logout scenarios where patient needs to re-authenticate
 */
export async function logout(): Promise<void> {
  console.debug("🚪 Performing complete logout");
  clearJWTCache();

  try {
    // Clear both JWT and session cookies via API
    await fetch("/api/session/logout", {
      method: "POST",
      credentials: "include",
    });

    console.debug("🍪 Complete logout successful");
  } catch (error) {
    console.error("❌ Failed to logout:", error);
  }
}

/**
 * Schedule automatic token refresh before expiration
 */
function scheduleTokenRefresh(expiresAt: number): void {
  // Clear any existing timer
  if (_refreshTimer) {
    clearTimeout(_refreshTimer);
  }

  // Schedule refresh 2 minutes before expiration
  const refreshTime = (expiresAt - Math.floor(Date.now() / 1000) - 120) * 1000;

  if (refreshTime > 0) {
    _refreshTimer = setTimeout(async () => {
      console.debug("🔄 Auto-refreshing JWT token...");
      try {
        const response = await fetch("/api/session/refresh", {
          method: "POST",
          credentials: "include",
        });

        if (response.ok) {
          const {
            jwt,
            expiresAt: newExpiresAt,
            environment,
          } = await response.json();
          _jwtCache = { token: jwt, expiresAt: newExpiresAt, environment };
          scheduleTokenRefresh(newExpiresAt); // Schedule next refresh
          console.debug("✅ JWT token refreshed successfully");
        } else {
          console.error("❌ Failed to refresh JWT token:", response.status);
          clearJWTCache(); // Clear cache on failure
        }
      } catch (error) {
        console.error("❌ Error refreshing JWT token:", error);
        clearJWTCache(); // Clear cache on failure
      }
    }, refreshTime);

    console.debug(
      `⏰ JWT refresh scheduled in ${Math.round(refreshTime / 1000)} seconds`
    );
  }
}

/**
 * Fetch JWT token from the session endpoint
 */
async function getJWTToken(): Promise<{
  jwt: string;
  environment: TokenEnvironment;
} | null> {
  try {
    // Check if we have a cached token that's still valid
    if (_jwtCache && _jwtCache.expiresAt > Math.floor(Date.now() / 1000) + 60) {
      return { jwt: _jwtCache.token, environment: _jwtCache.environment };
    }

    // Fetch fresh token from session endpoint
    const response = await fetch("/api/session/jwt", {
      credentials: "include", // Include cookies for session validation
    });

    if (!response.ok) {
      console.error("Failed to fetch JWT token:", response.status);
      return null;
    }

    const { jwt, expiresAt, environment } = await response.json();

    // Cache the token
    _jwtCache = { token: jwt, expiresAt, environment };

    // Schedule automatic refresh
    scheduleTokenRefresh(expiresAt);

    return { jwt, environment };
  } catch (error) {
    console.error("Error fetching JWT token:", error);
    return null;
  }
}

function createApolloClient(): ApolloClient<NormalizedCacheObject> {
  // Handle authentication errors by clearing token cache and retrying
  const errorLink = onError(
    ({ graphQLErrors, networkError, operation, forward }) => {
      console.log("🔄 Error in Apollo client", {
        graphQLErrors,
        networkError,
        operation,
        forward,
      });
      if (
        networkError &&
        "statusCode" in networkError &&
        networkError.statusCode === 401
      ) {
        console.debug("🔄 Received 401, clearing JWT cache and retrying...");
        clearJWTCache();
        // Retry the operation
        return forward(operation);
      }

      if (graphQLErrors) {
        graphQLErrors.forEach(({ message, locations, path }) =>
          console.error(
            `GraphQL error: Message: ${message}, Location: ${locations}, Path: ${path}`
          )
        );
      }

      if (networkError) {
        console.error(`Network error: ${networkError}`);
      }
    }
  );

  const authLink = setContext(async (_, { headers }) => {
    const result = await getJWTToken();
    const authHeaders: Record<string, string> = {};

    if (result?.jwt) {
      authHeaders.Authorization = `Bearer ${result.jwt}`;
    }

    return {
      headers: {
        ...headers,
        ...authHeaders,
      },
    };
  });

  const uriLink = setContext(async (_, { uri, ...rest }) => {
    const result = await getJWTToken();
    const newEndpoint = result?.environment
      ? getEndpoint(result.environment)
      : uri;
    return {
      uri: newEndpoint,
      ...rest,
    };
  });
  const httpLink = createHttpLink();

  return new ApolloClient({
    link: from([errorLink, authLink, uriLink, httpLink]),
    cache: new InMemoryCache(),
    defaultOptions: {
      watchQuery: {
        errorPolicy: "all",
      },
      query: {
        errorPolicy: "all",
      },
    },
  });
}

// Export a getter that creates the client on first access
export const apolloClient = new Proxy(
  {} as ApolloClient<NormalizedCacheObject>,
  {
    get(target, prop) {
      if (!_apolloClient) {
        _apolloClient = createApolloClient();
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (_apolloClient as any)[prop];
    },
  }
);
