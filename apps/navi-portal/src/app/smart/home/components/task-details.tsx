"use client";

import React from "react";
import { X, ChevronUpIcon } from "lucide-react";
import { TaskStatusBadge } from "./task-status-badge";
import { Task } from "@medplum/fhirtypes";
import { Card, CardHeader, CardContent } from "@/components/ui";

interface TaskDetailsProps {
  task: Task;
  onClose: () => void;
}

export function TaskDetails({ task, onClose }: TaskDetailsProps) {
  const [isExpanded, setIsExpanded] = React.useState(true);

  const formatDate = (dateString: string) => {
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

  const getAssignee = () => {
    if (task.requester?.display) {
      return task.requester.display;
    }
    return "Unassigned";
  };

  const getTaskType = () => {
    return task.code?.coding?.[0]?.display || "Unknown";
  };

  const getTaskStatus = () => {
    return task.status || "Unknown";
  };

  const infoItems = [
    { label: "Task Status", value: getTaskStatus() },
    { label: "Task Type", value: getTaskType() },
    { label: "Description", value: task.description || "No description" },
    { label: "Created Date", value: formatDate(task.authoredOn || "") },
    { label: "Assignee", value: getAssignee() },
    { label: "Reference ID", value: task.id || "-" },
  ];

  return (
    <Card className="w-full bg-gray-50 border-gray-200">
      <CardHeader
        className="flex flex-row items-center justify-between cursor-pointer pb-2"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="font-semibold text-gray-900">Task Information</h3>
        <div className="flex items-center gap-2">
          <ChevronUpIcon
            className={`w-4 h-4 text-gray-500 transition-transform ${
              isExpanded ? "rotate-0" : "rotate-180"
            }`}
          />
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0">
          <div className="space-y-3">
            {infoItems.map((item, index) => (
              <div key={index} className="flex justify-between items-start">
                <span className="text-sm text-gray-600 font-medium">
                  {item.label}
                </span>
                <span className="text-sm text-gray-900 text-right max-w-[60%]">
                  {item.label === "Task Status" ? (
                    <TaskStatusBadge status={item.value as Task["status"]} />
                  ) : (
                    item.value
                  )}
                </span>
              </div>
            ))}
            <div>SPACE FOR NAVI ACTIVITY COMPLETION</div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
