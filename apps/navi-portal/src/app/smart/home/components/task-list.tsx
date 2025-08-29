"use client";

import React, { useState } from "react";
import { usePatientTasks } from "../hooks/use-patient-tasks";
import { useTaskFiltering } from "../hooks/use-task-filtering";
import { TaskCard } from "./task-card";
import { TaskFilters } from "./task-filters";
import { TaskDetails } from "./task-details";
import { PatientIdentifier } from "@awell-health/navi-core";
import { Task } from "@medplum/fhirtypes";

interface TaskListProps {
  patientIdentifier: PatientIdentifier;
}

export function TaskList({ patientIdentifier }: TaskListProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const { tasks, loading, error } = usePatientTasks(patientIdentifier);
  const {
    filteredTasks,
    sortOrder,
    setSortOrder,
    statusFilter,
    setStatusFilter,
    availableStatuses,
  } = useTaskFiltering(tasks);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 font-medium mb-2">Error Loading Tasks</div>
        <p className="text-gray-600 text-sm">
          {error.message || "Unable to load patient tasks"}
        </p>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-900 font-medium mb-2">No Tasks Found</div>
        <p className="text-gray-600 text-sm">
          This patient currently has no active tasks.
        </p>
      </div>
    );
  }

  if (selectedTask) {
    return (
      <>
        <TaskDetails
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      </>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <TaskFilters
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          availableStatuses={availableStatuses}
        />

        <div className="space-y-2">
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onClick={() => setSelectedTask(task)}
            />
          ))}
        </div>
      </div>
    </>
  );
}
