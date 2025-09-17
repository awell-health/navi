import { InMemoryCache, type DefaultContext, type FieldFunctionOptions, gql, type ApolloCache, type Reference } from "@apollo/client";
import { PathwayActivitiesDocument } from "./generated/graphql";

type PathwayActivitiesShape = {
  activities?: ReadonlyArray<unknown>;
};

function isEntityWithId(value: unknown): value is { id: string } {
  return typeof value === "object" && value !== null && "id" in value && typeof (value as { id: unknown }).id === "string";
}

function mergeActivitiesById(existingList: ReadonlyArray<unknown>, incomingList: ReadonlyArray<unknown>): unknown[] {
  const byId = new Map<string, unknown>();
  for (const item of existingList) {
    if (isEntityWithId(item)) {
      byId.set(item.id, item);
    }
  }
  for (const item of incomingList) {
    if (isEntityWithId(item)) {
      // Prefer incoming values
      byId.set(item.id, item);
    }
  }
  return Array.from(byId.values());
}

export function createNaviInMemoryCache(): InMemoryCache {
  return new InMemoryCache({
    typePolicies: {
      Activity: { keyFields: ["id"] },
    },
  });
}

// Helper to upsert a single Activity into cache and include it in the appropriate
// pathwayActivities list for a given careflow.
export function upsertActivityInCache(
  cache: ApolloCache<unknown>,
  args: { careflowId: string; activity: { __typename: "Activity"; id: string } & Record<string, unknown> }
): void {
  // Simpler and more readable: update the typed query result in-place.
  cache.updateQuery({
    query: PathwayActivitiesDocument,
    variables: { careflow_id: args.careflowId },
  }, (data) => {
    if (!data?.pathwayActivities) return data;
    const list = data.pathwayActivities.activities ?? [];
    const index = list.findIndex((a: { id: string }) => a.id === args.activity.id);
    let nextList;
    if (index === -1) {
      nextList = [args.activity, ...list];
    } else {
      nextList = list.slice();
      nextList[index] = { ...list[index], ...args.activity };
    }
    // Ensure activities remain sorted by ascending date
    nextList = nextList.slice().sort((a: unknown, b: unknown) => {
      const aa = a as { date?: string };
      const bb = b as { date?: string };
      const aTime = aa?.date ? Date.parse(aa.date) : 0;
      const bTime = bb?.date ? Date.parse(bb.date) : 0;
      return aTime - bTime;
    });
    return {
      ...data,
      pathwayActivities: {
        ...data.pathwayActivities,
        activities: nextList,
      },
    };
  });
}


