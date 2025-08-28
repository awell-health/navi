"use client";

import { useState, useMemo } from "react";
import { type ActivityFragment, type ActivityStatus } from "@/lib/awell-client/generated/graphql";

interface UseTaskFilteringResult {
  filteredTasks: ActivityFragment[];
  sortOrder: "asc" | "desc";
  setSortOrder: (order: "asc" | "desc") => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  availableStatuses: ActivityStatus[];
}

export function useTaskFiltering(tasks: ActivityFragment[]): UseTaskFilteringResult {
  const ALL_STATUS_FILTER = "all-status";
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [statusFilter, setStatusFilter] = useState<string>(ALL_STATUS_FILTER);

  const availableStatuses = useMemo(() => {
    const statuses = [...new Set(tasks.map((task) => task.status))];
    return statuses.sort();
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    let filtered = tasks.filter((task) => {
      if (statusFilter === ALL_STATUS_FILTER) return true;
      return task.status === statusFilter;
    });

    filtered = filtered.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      
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
