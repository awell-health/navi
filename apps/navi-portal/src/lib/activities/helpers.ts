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


