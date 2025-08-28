"use client";

import React from "react";
import { ArrowDownUp, ArrowRight, Check, FilterIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Task } from "@medplum/fhirtypes";

interface TaskFiltersProps {
  sortOrder: "asc" | "desc";
  setSortOrder: (order: "asc" | "desc") => void;
  statusFilter: Task["status"] | null;
  setStatusFilter: (status: Task["status"] | null) => void;
  availableStatuses: Task["status"][];
}

export function TaskFilters({
  sortOrder,
  setSortOrder,
  statusFilter,
  setStatusFilter,
  availableStatuses,
}: TaskFiltersProps) {
  const ascLabel = (
    <span className="flex items-center gap-1">
      Old <ArrowRight className="w-3 h-3" /> New
    </span>
  );

  const descLabel = (
    <span className="flex items-center gap-1">
      New <ArrowRight className="w-3 h-3" /> Old
    </span>
  );

  const getItemLabel = (isSelected: boolean) => {
    return isSelected ? (
      <Check className="w-3 h-3" />
    ) : (
      <span className="w-3" />
    );
  };

  const getStatusLabel = (status: Task["status"] | null) => {
    if (!status) return "All Status";
    switch (status) {
      case "draft":
        return "Draft";
      case "requested":
        return "Requested";
      case "received":
        return "Received";
      case "accepted":
        return "Accepted";
      case "rejected":
        return "Rejected";
      case "ready":
        return "Ready";
      case "cancelled":
        return "Cancelled";
      case "in-progress":
        return "In Progress";
      case "on-hold":
        return "On Hold";
      default:
        return status;
    }
  };

  return (
    <div className="flex gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap px-3 py-1.5 text-xs border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <ArrowDownUp className="w-3 h-3" />
            {sortOrder === "asc" ? ascLabel : descLabel}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-32 p-1 text-xs">
          <DropdownMenuItem
            className="flex items-center gap-2"
            onClick={() => setSortOrder("asc")}
          >
            {getItemLabel(sortOrder === "asc")} {ascLabel}
          </DropdownMenuItem>
          <DropdownMenuItem
            className="flex items-center gap-2"
            onClick={() => setSortOrder("desc")}
          >
            {getItemLabel(sortOrder === "desc")} {descLabel}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap px-3 py-1.5 text-xs border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <FilterIcon className="w-3 h-3" />
            {getStatusLabel(statusFilter)}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-36 p-1 text-xs">
          <DropdownMenuItem
            className="flex items-center gap-2"
            onClick={() => setStatusFilter(null)}
          >
            {getItemLabel(statusFilter === null)} All Status
          </DropdownMenuItem>
          {availableStatuses.map((status) => (
            <DropdownMenuItem
              key={status}
              className="flex items-center gap-2"
              onClick={() => setStatusFilter(status)}
            >
              {getItemLabel(statusFilter === status)} {getStatusLabel(status)}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
