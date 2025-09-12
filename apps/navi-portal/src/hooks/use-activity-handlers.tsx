"use client";

import { useCallback } from "react";

interface UseActivityHandlersProps {
  completeActivity: (
    activityId: string,
    data: Record<string, unknown>,
    activityType?: string
  ) => Promise<void>;
}

/**
 * Custom hook for activity completion handlers
 *
 * Provides consistent handlers for different activity types:
 * - Form submissions
 * - Message mark as read
 * - Checklist completions
 */
export function useActivityHandlers({
  completeActivity,
}: UseActivityHandlersProps) {
  const handleFormSubmit = useCallback(
    async (activityId: string, data: Record<string, unknown>) => {
      console.log("📝 Form submitted with data:", data);
      console.log("📋 Activity ID:", activityId);

      try {
        await completeActivity(activityId, { formData: data }, "FORM");
        console.log("✅ Form completion successful");
      } catch (error) {
        console.error("❌ Form completion failed:", error);
      }
    },
    [completeActivity]
  );

  const handleMessageMarkAsRead = useCallback(
    async (activityId: string) => {
      console.log("📧 Message marked as read:", activityId);

      try {
        await completeActivity(activityId, { action: "read" }, "MESSAGE");
        console.log("✅ Message completion successful");
      } catch (error) {
        console.error("❌ Message completion failed:", error);
      }
    },
    [completeActivity]
  );

  const handleChecklistComplete = useCallback(
    async (activityId: string, data: Record<string, unknown>) => {
      console.log("☑️ Checklist completed:", activityId, data);

      try {
        await completeActivity(activityId, data, "CHECKLIST");
        console.log("✅ Checklist completion successful");
      } catch (error) {
        console.error("❌ Checklist completion failed:", error);
      }
    },
    [completeActivity]
  );

  const handleExtensionSubmit = useCallback(
    async (activityId: string, data: Record<string, unknown>) => {
      console.log("📝 Extension submitted:", activityId, data);
    },
    [completeActivity]
  );

  return {
    handleFormSubmit,
    handleMessageMarkAsRead,
    handleChecklistComplete,
    handleExtensionSubmit,
  };
}
