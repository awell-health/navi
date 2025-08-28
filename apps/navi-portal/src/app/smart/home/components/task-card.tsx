"use client";

import React from "react";
import { type ActivityFragment } from "@/lib/awell-client/generated/graphql";
import { Calendar, User, ChevronRight } from "lucide-react";
import { TaskStatusBadge } from "./task-status-badge";

interface TaskCardProps {
  task: ActivityFragment;
  onClick: () => void;
}

export function TaskCard({ task, onClick }: TaskCardProps) {
  const isCompleted = task.status === "DONE";
  
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
    if (task.indirect_object?.name) {
      return `Assigned to: ${task.indirect_object.name}`;
    }
    if (task.object?.name && task.object.type === "STAKEHOLDER") {
      return `Assigned to: ${task.object.name}`;
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
            {task.object.name || "Unnamed Task"}
          </div>
          
          <TaskStatusBadge status={task.status} />
          
          <div className="flex items-center gap-1 text-xs text-gray-600 font-normal">
            <Calendar className="w-3 h-3" />
            Created: {formatDate(task.date)}
          </div>
          
          {isCompleted && task.resolution && (
            <div className="flex items-center gap-1 text-xs text-gray-600 font-normal">
              <Calendar className="w-3 h-3" />
              Completed: Task completed
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
