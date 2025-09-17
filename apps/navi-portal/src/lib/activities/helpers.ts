import { ActivityFragment } from "@/lib/awell-client/generated/graphql";

export function isActivityCompleted(activity: ActivityFragment): boolean {
  if (activity.object.type === "MESSAGE") {
    return activity.resolution === "SUCCESS";
  }
  return activity.status === "DONE";
}

export function isUserCompletable(activity: ActivityFragment): boolean {
  if (!activity.is_user_activity) return false;
  if (isActivityCompleted(activity)) return false;
  return activity.status === "ACTIVE";
}

export function filterUserActivities(
  activities: ActivityFragment[],
  stakeholderId?: string
): ActivityFragment[] {
  const userActivities = activities.filter((a) => a.is_user_activity);

  if (stakeholderId) {
    return userActivities.filter(
      (activity) =>
        activity.indirect_object?.id === stakeholderId ||
        activity.object?.id === stakeholderId ||
        activity.stakeholders?.some((s) => s.id === stakeholderId)
    );
  }

  return userActivities;
}

export function findFirstActiveActivity(
  activities: ActivityFragment[]
): ActivityFragment | null {
  return activities.find((a) => a.status === "ACTIVE") || null;
}

export function getCompletableActivities(activities: ActivityFragment[]): ActivityFragment[] {
  return activities.filter((activity) => {
    if (isActivityCompleted(activity)) {
      return false;
    }
    return activity.is_user_activity;
  });
}

export function findFirstCompletableActivity(
  activities: ActivityFragment[]
): ActivityFragment | null {
  const completableActivities = getCompletableActivities(activities);
  return completableActivities[0] || null;
}

export function getNextCompletableActivity(
  currentActivityId: string,
  activities: ActivityFragment[]
): ActivityFragment | null {
  const completableActivities = getCompletableActivities(activities);
  console.log(
    "✅ Completable activities:",
    completableActivities.map((a) => ({
      id: a.id,
      name: a.object.name,
      status: a.status,
      type: a.object.type,
    }))
  );

  const nextActivity = completableActivities[0] || null;
  console.log(
    "🎯 Next activity to advance to:",
    nextActivity ? nextActivity.object.name : "none"
  );

  return nextActivity;
}

export function getActivitiesRequiringCompletion(
  activities: ActivityFragment[]
): ActivityFragment[] {
  return activities.filter((activity) => !isActivityCompleted(activity));
}

export function calculateProgress(activities: ActivityFragment[]): {
  completed: number;
  total: number;
  percentage: number;
} {
  const completed = activities.filter((a) => isActivityCompleted(a)).length;
  const total = activities.length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return { completed, total, percentage };
}

export function canTransitionTo(
  currentActivity: ActivityFragment | null,
  targetActivity: ActivityFragment
): boolean {
  if (!currentActivity) return targetActivity.status === "ACTIVE";
  if (currentActivity.status !== "DONE") return false;
  if (targetActivity.status !== "ACTIVE") return false;

  return true;
}


