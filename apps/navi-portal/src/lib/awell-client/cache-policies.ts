import { InMemoryCache } from "@apollo/client";

export function createNaviInMemoryCache(): InMemoryCache {
  return new InMemoryCache({
    typePolicies: {
      Activity: { keyFields: ["id"] },
    },
  });
}

// Manual cache updates removed - ActivitiesManager now handles concurrent updates
// and triggers refetch() to sync Apollo cache safely


