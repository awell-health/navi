"use client";

import React from "react";
import { X, Calendar, User, FileText } from "lucide-react";
import { TaskStatusBadge } from "./task-status-badge";
import { Task } from "@medplum/fhirtypes";

interface TaskDetailsProps {
  task: Task;
  onClose: () => void;
}

export function TaskDetails({ task, onClose }: TaskDetailsProps) {
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        month: "long",
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Task Details</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">
              {task.description || "Unnamed Task"}
            </h3>
            <TaskStatusBadge status={task.status} />
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Calendar className="w-4 h-4 text-gray-500 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-gray-900">Created</div>
                <div className="text-sm text-gray-600">
                  {formatDate(task.authoredOn || "")}
                </div>
              </div>
            </div>

            {task.status === "completed" && (
              <div className="flex items-start gap-3">
                <Calendar className="w-4 h-4 text-gray-500 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    Completed
                  </div>
                  <div className="text-sm text-gray-600">Task completed</div>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <User className="w-4 h-4 text-gray-500 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-gray-900">
                  Assignee
                </div>
                <div className="text-sm text-gray-600">{getAssignee()}</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <FileText className="w-4 h-4 text-gray-500 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-gray-900">Type</div>
                <div className="text-sm text-gray-600">
                  {task.code?.coding?.[0]?.display || "Unknown"}
                </div>
              </div>
            </div>

            {task.id && (
              <div className="flex items-start gap-3">
                <FileText className="w-4 h-4 text-gray-500 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    Reference ID
                  </div>
                  <div className="text-sm text-gray-600 font-mono">
                    {task.id}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 pt-4">
            <div className="text-sm font-medium text-gray-900 mb-2">
              Activity Completion
            </div>
            <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
              Activity completion interface will be integrated here in a future
              update.
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
