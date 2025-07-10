import { env } from "@/env";
import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  NormalizedCacheObject,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";

let _apolloClient: ApolloClient<NormalizedCacheObject> | null = null;

function createApolloClient(): ApolloClient<NormalizedCacheObject> {
  const httpLink = createHttpLink({
    uri: env.NEXT_PUBLIC_GRAPHQL_ENDPOINT,
  });

  const authLink = setContext((_, { headers }) => {
    const apiKey = process.env.PROTOTYPE_API_KEY;

    return {
      headers: {
        ...headers,
        ...(apiKey ? { apiKey } : {}),
      },
    };
  });

  return new ApolloClient({
    link: authLink.concat(httpLink),
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
