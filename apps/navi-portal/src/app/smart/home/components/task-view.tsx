"use client";

import React from "react";
import { ArrowLeft } from "lucide-react";
// import { ReusableTabs } from "./reusable-tabs";
import { Task } from "@medplum/fhirtypes";
import { TaskStatusBadge } from "./task-status-badge";
import { InfoCard } from "./info-card";

interface TaskViewProps {
  task: Task;
  onBack: () => void;
}

export function TaskView({ task, onBack }: TaskViewProps) {
  // const [activeTab, setActiveTab] = React.useState("context");

  // const tabs = [
  //   { id: "context", label: "Context" },
  //   { id: "task", label: "Task" },
  // ];

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

  return (
    <div className="bg-white min-h-screen">
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

      {/* Tabs */}
      {/* <div className="border-b border-gray-200">
        <div className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors hover:cursor-pointer ${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600 bg-white"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div> */}

      {/* Tab Content */}
      <div className="py-2 space-y-4">
        {/* Task Details */}
        <InfoCard
          title="Task Details"
          items={[
            {
              label: "Task Status",
              value: <TaskStatusBadge status={task.status} />
            },
            {
              label: "Task Intent",
              value: task.intent || "unknown"
            },
            {
              label: "Priority",
              value: task.priority || "unknown"
            },
            {
              label: "Description",
              value: task.description || "-"
            },
            {
              label: "Created Date",
              value: formatDate(task.authoredOn?.toString())
            },
            {
              label: "Last Modified",
              value: formatDate(task.lastModified)
            }
          ]}
        />

          <div className="border border-gray-200 rounded-lg bg-white">
            <div className="px-4 py-3 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">Resolve Task</h3>
            </div>
            <div className="px-4 py-8 text-center">
              <p className="text-gray-600">Task resolution interface will be implemented here</p>
            </div>
          </div>
        
      </div>
    </div>
  );
}
