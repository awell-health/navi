import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

const httpLink = createHttpLink({
  uri: 'https://api.development.awellhealth.com/orchestration/m2m/graphql',
});

const authLink = setContext((_, { headers }) => {
  const apiKey = process.env.PROTOTYPE_API_KEY;
  
  return {
    headers: {
      ...headers,
      ...(apiKey ? { apiKey } : {}),
    }
  };
});

export const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
    },
    query: {
      errorPolicy: 'all',
    },
  },
}); 