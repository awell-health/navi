import { useMemo, useRef } from "react";
import { ActivityFragment, usePathwayActivitiesQuery } from "@/lib/awell-client/generated/graphql";
import { isUserCompletable } from "./helpers";

export function useActivityCounts(careflowId: string) {
  const { data, loading } = usePathwayActivitiesQuery({
    variables: { careflow_id: careflowId },
  });

  const activities = (data?.pathwayActivities?.activities ?? []) as ActivityFragment[];

  const derived = useMemo(() => {
    const userActivities = activities.filter((a) => a.is_user_activity);
    const pending = userActivities.filter(isUserCompletable);
    return {
      totalCount: userActivities.length,
      pendingIds: pending.map((a) => a.id),
      pendingCount: pending.length,
    };
  }, [activities]);

  const lastChangeAtRef = useRef<number>(Date.now());
  const prevIdsRef = useRef<string[]>([]);
  if (prevIdsRef.current.join(",") !== derived.pendingIds.join(",")) {
    prevIdsRef.current = derived.pendingIds;
    lastChangeAtRef.current = Date.now();
  }

  return {
    isLoading: loading,
    totalCount: derived.totalCount,
    pendingIds: derived.pendingIds,
    pendingCount: derived.pendingCount,
    lastChangeAt: lastChangeAtRef.current,
  };
}

// Backward compatibility
export const usePendingActivities = useActivityCounts;


