"use client";

import { useState, useMemo } from "react";
import { Task } from "@medplum/fhirtypes";

interface UseTaskFilteringResult {
  filteredTasks: Task[];
  sortOrder: "asc" | "desc";
  setSortOrder: (order: "asc" | "desc") => void;
  statusFilter: Task["status"] | null;
  setStatusFilter: (status: Task["status"] | null) => void;
  availableStatuses: Task["status"][];
}

export function useTaskFiltering(tasks: Task[]): UseTaskFilteringResult {
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [statusFilter, setStatusFilter] = useState<Task["status"] | null>(null);

  const availableStatuses = useMemo(() => {
    const statuses = [...new Set(tasks.map((task) => task.status))];
    return statuses.sort();
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    let filtered = tasks.filter((task) => {
      if (statusFilter === null) return true;
      return task.status === statusFilter;
    });

    filtered = filtered.sort((a, b) => {
      const dateA = new Date(a.authoredOn || "").getTime();
      const dateB = new Date(b.authoredOn || "").getTime();

      if (sortOrder === "asc") {
        return dateA - dateB;
      } else {
        return dateB - dateA;
      }
    });

    return filtered;
  }, [tasks, statusFilter, sortOrder]);

  return {
    filteredTasks,
    sortOrder,
    setSortOrder,
    statusFilter,
    setStatusFilter,
    availableStatuses,
  };
}
