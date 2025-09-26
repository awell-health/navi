"use client";

import { useState } from "react";
import { ArrowLeft, Check, Loader2 } from "lucide-react";
import { Coding, Extension } from "@medplum/fhirtypes";
import { TaskStatusBadge } from "./task-status-badge";
import { InfoCard } from "./info-card";
import { ActivityContextProvider } from "@/lib/activity-context-provider";
import { CareflowActivitiesContent } from "./careflow-activities-content";
import { BrandingProvider } from "@/lib/branding-provider";
import { awellDefaultBranding } from "@/lib/branding/defaults";
import { toast } from "sonner";
import TaskApproval from "./task-approval";
import { useTasks } from "../contexts/tasks-context";


export function TaskView() {
  const { setSelectedTask, getSelectedTask } = useTasks();
  const [submitted, setSubmitted] = useState(false);
  const task = getSelectedTask();
  
  if (!task) return <div>No task selected</div>;

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

  const handleTaskCompleted = () => {
    setSubmitted(true);
    toast.success("Task completed");

    setTimeout(() => {
      setSelectedTask(null);
      setSubmitted(false);
    }, 500);
  };

  const isDavitaApprovalRejectTask = task?.code?.coding?.find(
    (c: Coding) =>
      c.system === 'http://davita.com/fhir/task-code' &&
      (c.code === 'approval-reject' || c.code === 'approve-reject'),
  )

  const hideActivity =
    task.status === "completed" || task.status === "cancelled" || submitted;

  return (
    <div className="bg-white">
      {/* Back Button */}
      <div className="py-4 -mt-2">
        <button
          onClick={() => setSelectedTask(null)}
          className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 transition-colors hover:cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to tasks list
        </button>
      </div>

      {/* Tab Content */}
      <div className="py-2 space-y-4">
        {/* Task Details */}
        <InfoCard
          title="Task Details"
          items={[
            {
              label: "Description",
              value: task.description || "-",
            },
            {
              label: "Task Status",
              value: <TaskStatusBadge status={task.status} />,
            },
            {
              label: "Assigned To",
              value: task.owner?.display || "Unassigned",
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
        <div className="border border-gray-200 rounded-lg bg-white">
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="font-semibold text-gray-900 text-sm">Resolve Task</div>
          </div>
          {submitted && (
            <div className="px-4 py-4 flex items-center gap-2 justify-center">
              <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />{" "}
              Submitting task...
            </div>
          )}
          {!submitted && hideActivity && (
            <div className="px-4 py-4 flex items-center gap-2 justify-center">
              <Check className="w-5 h-5 text-green-500" /> Task completed
            </div>
          )}
          {!hideActivity && (
            <div className="px-4 py-4">
              {isDavitaApprovalRejectTask && (
                <TaskApproval />
              )}
              {careflowId && stakeholderId && activityId && !isDavitaApprovalRejectTask && (
                
                  <BrandingProvider
                    branding={awellDefaultBranding.branding}
                    orgId={awellDefaultBranding.orgId}
                    hasCustomBranding={false}
                  >
                    <ActivityContextProvider
                      careflowId={careflowId}
                      stakeholderId={stakeholderId}
                      activityId={activityId}
                    >
                      <CareflowActivitiesContent
                        activityId={activityId}
                        onCompleted={handleTaskCompleted}
                      />
                    </ActivityContextProvider>
                  </BrandingProvider>
                
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
