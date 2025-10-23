import { ActivityFragment } from "@/lib/awell-client/generated/graphql";

/**
 * ActivitiesManager - Concurrent-safe activity storage (single source of truth)
 *
 * Handles race conditions when multiple subscription updates arrive simultaneously
 * by using a Map-based storage system instead of array operations.
 *
 * Flow:
 * 1. Subscription handlers call upsertActivity()
 * 2. Activities stored safely in Map (no race conditions)
 * 3. Manager triggers onChange callback to update UI
 * 4. UI reads directly from manager
 */
export class ActivitiesManager {
  private activities: Map<string, ActivityFragment> = new Map();
  private careflowId: string;
  public onChangeCallback?: () => void;

  constructor(careflowId: string, onChangeCallback?: () => void) {
    this.careflowId = careflowId;
    this.onChangeCallback = onChangeCallback;
  }

  /**
   * Safely upsert an activity (concurrent-safe via Map operations)
   */
  upsertActivity(activity: ActivityFragment): void {
    if (activity.careflow_id !== this.careflowId) {
      console.warn(`⚠️ Activity ${activity.id} careflow mismatch: expected ${this.careflowId}, got ${activity.careflow_id}`);
      return;
    }

    const existing = this.activities.get(activity.id);
    const merged = existing ? { ...existing, ...activity } : activity;

    this.activities.set(activity.id, merged);
    console.log(`📝 ActivitiesManager: Upserted activity ${activity.id} for careflow ${this.careflowId}`);

    // Trigger UI update
    this.notifyChange();
  }

  /**
   * Remove an activity from the manager
   */
  removeActivity(activityId: string): void {
    const removed = this.activities.delete(activityId);
    if (removed) {
      console.log(`🗑️ ActivitiesManager: Removed activity ${activityId} for careflow ${this.careflowId}`);
      this.notifyChange();
    }
  }

  /**
   * Get all activities as array (sorted by date, newest first)
   */
  getActivities(): ActivityFragment[] {
    return Array.from(this.activities.values()).sort((a, b) => {
      const aDate = new Date(a.date).getTime();
      const bDate = new Date(b.date).getTime();
      return bDate - aDate; // Newest first
    });
  }

  /**
   * Get a specific activity by ID
   */
  getActivity(id: string): ActivityFragment | null {
    return this.activities.get(id) || null;
  }

  /**
   * Get the number of activities in the manager
   */
  getActivityCount(): number {
    return this.activities.size;
  }

  /**
   * Notify UI that activities have changed
   */
  private notifyChange(): void {
    if (this.onChangeCallback) {
      this.onChangeCallback();
    }
  }

  /**
   * Load activities from external source (like Apollo cache)
   */
  loadActivities(activities: ActivityFragment[]): void {
    console.log(`📂 ActivitiesManager: Loading ${activities.length} activities from external source for careflow ${this.careflowId}`);
    activities.forEach(activity => {
      if (activity.careflow_id === this.careflowId) {
        this.upsertActivity(activity);
      }
    });
  }

  /**
   * Clear all activities
   */
  clear(): void {
    this.activities.clear();
    console.log(`🧹 ActivitiesManager: Cleared all activities for careflow ${this.careflowId}`);
    this.notifyChange();
  }
}