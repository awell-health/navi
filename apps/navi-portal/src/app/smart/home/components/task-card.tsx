"use client";

import React from "react";
import { Calendar, User, ChevronRight } from "lucide-react";
import { TaskStatusBadge } from "./task-status-badge";
import { Task } from "@medplum/fhirtypes";

interface TaskCardProps {
  task: Task;
  onClick: () => void;
}

export function TaskCard({ task, onClick }: TaskCardProps) {
  const isCompleted =
    task.status === "completed" || task.status === "cancelled";

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  const getAssignee = () => {
    if (task.requester?.display) {
      return `Assigned to: ${task.requester.display}`;
    }
    return "Unassigned";
  };

  return (
    <div
      className="flex justify-between p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer transition-colors"
      onClick={onClick}
    >
      <div className="flex justify-between w-full items-center">
        <div className="font-medium text-gray-900 flex flex-col gap-1.5 flex-1">
          <div className="text-sm font-medium">
            {task.description || "Unnamed Task"}
          </div>

          <div className="flex items-center gap-1">
            <TaskStatusBadge status={task.status} />
          </div>

          <div className="flex items-center gap-1 text-xs text-gray-600 font-normal">
            <Calendar className="w-3 h-3" />
            Created: {formatDate(task.authoredOn || "")}
          </div>

          {isCompleted && (
            <div className="flex items-center gap-1 text-xs text-gray-600 font-normal">
              <Calendar className="w-3 h-3" />
              Completed: {formatDate(task.lastModified || "")}
            </div>
          )}

          <div className="flex items-center gap-1 text-xs text-gray-600 font-normal">
            <User className="w-3 h-3" />
            {getAssignee()}
          </div>
        </div>

        <div className="flex items-center gap-2 ml-4">
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </div>
      </div>
    </div>
  );
}
