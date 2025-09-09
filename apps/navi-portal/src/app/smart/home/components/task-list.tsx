"use client";

import React, { useState } from "react";
import { usePatientTasks } from "../hooks/use-patient-tasks";
import { useTaskFiltering } from "../hooks/use-task-filtering";
import { TaskCard } from "./task-card";
import { TaskFilters } from "./task-filters";
import { PatientIdentifier } from "@awell-health/navi-core";
import { Task } from "@medplum/fhirtypes";
import { Button } from "../../../../components/ui";
import { RefreshCcwIcon } from "lucide-react";
import Loading from "./loading";

interface TaskListProps {
  patientIdentifier: PatientIdentifier;
  setSelectedTask: (task: Task) => void;
}

export function TaskList({ patientIdentifier, setSelectedTask }: TaskListProps) {
  const { tasks, loading, error, refetchTasks } = usePatientTasks(patientIdentifier);
  const {
    filteredTasks,
    sortOrder,
    setSortOrder,
    statusFilter,
    setStatusFilter,
    availableStatuses,
  } = useTaskFiltering(tasks);


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

  return (
    <>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <TaskFilters
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            availableStatuses={availableStatuses}
          />
          <div>
            <Button size="icon" variant="ghost" onClick={refetchTasks} title="Refresh Tasks">
              <RefreshCcwIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        <Loading loading={loading}>
          <div className="space-y-2">
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onClick={() => setSelectedTask(task)}
            />
            ))}
          </div>
        </Loading>
      </div>
    </>
  );
}
