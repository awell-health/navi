"use client";

import React, { useMemo } from "react";
import { ArrowLeft } from "lucide-react";
import { Extension, Task } from "@medplum/fhirtypes";
import { TaskStatusBadge } from "./task-status-badge";
import { InfoCard } from "./info-card";
import { ApolloProvider } from "@/lib/awell-client/provider";
import { ActivityProvider } from "@/lib/activity-provider";
import { CareflowActivitiesContent } from "./careflow-activities-content";
import { BrandingProvider } from "@/lib/branding-provider";
import { awellDefaultBranding } from "@/lib/branding/defaults";

interface TaskViewProps {
  task: Task;
  onBack: () => void;
}

export function TaskView({ task, onBack }: TaskViewProps) {
  // Helper function to format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  let careflowId = null;
  let stakeholderId = null;
  let activityId = null;
  const awellExtension = task.extension?.find(
    (ext) =>
      ext.url === "https://awellhealth.com/fhir/StructureDefinition/awell-task"
  );

  if (awellExtension) {
    const { extension } = awellExtension as Extension;
    careflowId =
      extension?.find((ext) => ext.url === "pathway-id")?.valueString || null;
    stakeholderId =
      extension?.find((ext) => ext.url === "stakeholder-id")?.valueString ||
      null;
    activityId =
      extension?.find((ext) => ext.url === "activity-id")?.valueString || null;
  }

  return (
    <div className="bg-white">
      {/* Back Button */}
      <div className="py-4 -mt-2">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 transition-colors hover:cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to patient
        </button>
      </div>

      {/* Tab Content */}
      <div className="py-2 space-y-4">
        {/* Task Details */}
        <InfoCard
          title="Task Details"
          items={[
            {
              label: "Task Status",
              value: <TaskStatusBadge status={task.status} />,
            },
            {
              label: "Task Intent",
              value: task.intent || "unknown",
            },
            {
              label: "Priority",
              value: task.priority || "unknown",
            },
            {
              label: "Description",
              value: task.description || "-",
            },
            {
              label: "Created Date",
              value: formatDate(task.authoredOn?.toString()),
            },
            {
              label: "Last Modified",
              value: formatDate(task.lastModified),
            },
          ]}
        />

        {/* Activity Resolution Interface */}
        {(task.status !== "completed" && task.status !== "cancelled") && (
        <div className="border border-gray-200 rounded-lg bg-white">
          <div className="px-4 py-3 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Resolve Task</h3>
          </div>
          <div className="px-4 py-4">
            {careflowId && stakeholderId && activityId && (
              <>
               <ApolloProvider>
                {/* <BrandingProvider
                  branding={awellDefaultBranding.branding}
                  orgId={awellDefaultBranding.orgId}
                  hasCustomBranding={false}
                > */}
                  <ActivityProvider
                    careflowId={careflowId}
                    stakeholderId={stakeholderId}
                    activityId={activityId} // NEW: Enable single activity mode when activityId is provided
                  >
                    {/* <CareflowActivitiesContent activityId={activityId} /> */}
                    <div>
                      {activityId}
                    </div>
                  </ActivityProvider>
                {/* </BrandingProvider> */}
              </ApolloProvider>
              </>
            )}
          </div>
        </div>
        )}
      </div>
    </div>
  );
}
