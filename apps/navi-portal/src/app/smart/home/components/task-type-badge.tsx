"use client";

import React from "react";
import { Task } from "@medplum/fhirtypes";

interface TaskTypeBadgeProps {
  task: Task;
}

export function TaskTypeBadge({ task }: TaskTypeBadgeProps) {
  const getTaskType = (task: Task): string | null => {
    const davitaTaskType = task.code?.coding?.find(
      (coding) => coding.system === 'http://davita.com/fhir/task-code'
    );

    if (davitaTaskType?.code) {
      return davitaTaskType.code;
    }
    
    return null;
  };

  const getTaskTypeConfig = (taskType: string | null) => {
    switch (taskType) {
      case "approve-reject":
        return {
          label: "Approval/Reject",
          className: "bg-purple-100 text-purple-800 border-purple-200",
        };
      default:
        return {
          label: "Approval",
          className: "bg-blue-100 text-blue-800 border-blue-200",
        };
    }
  };

  const taskType = getTaskType(task);
  const config = getTaskTypeConfig(taskType);

  return (
    <span
      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${config.className}`}
    >
      {config.label}
    </span>
  );
}
