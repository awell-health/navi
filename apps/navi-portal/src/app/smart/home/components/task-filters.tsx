"use client";

import React from "react";
import { ArrowDownUp, ArrowRight, Check, FilterIcon } from "lucide-react";
import { type ActivityStatus } from "@/lib/awell-client/generated/graphql";

interface TaskFiltersProps {
  sortOrder: "asc" | "desc";
  setSortOrder: (order: "asc" | "desc") => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  availableStatuses: ActivityStatus[];
}

export function TaskFilters({
  sortOrder,
  setSortOrder,
  statusFilter,
  setStatusFilter,
  availableStatuses,
}: TaskFiltersProps) {
  const ALL_STATUS_FILTER = "all-status";

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
    return isSelected ? <Check className="w-3 h-3" /> : <span className="w-3" />;
  };

  const getStatusLabel = (status: string) => {
    if (status === ALL_STATUS_FILTER) return "All Status";
    switch (status) {
      case "ACTIVE": return "Active";
      case "DONE": return "Completed";
      case "CANCELLED": return "Cancelled";
      default: return status;
    }
  };

  return (
    <div className="flex gap-2">
      <div className="dropdown">
        <button 
          type="button" 
          tabIndex={0} 
          className="flex items-center gap-1 px-3 py-1.5 text-xs border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <ArrowDownUp className="w-3 h-3" />
          {sortOrder === "asc" ? ascLabel : descLabel}
        </button>
        <ul className="dropdown-content menu bg-white rounded-md shadow-lg z-10 w-32 p-1 text-xs border border-gray-200 mt-1">
          <li>
            <button
              type="button"
              className="w-full text-left px-2 py-1 hover:bg-gray-100 rounded flex items-center gap-2"
              onClick={() => {
                setSortOrder("asc");
                (document.activeElement as HTMLElement)?.blur();
              }}
            >
              {getItemLabel(sortOrder === "asc")} {ascLabel}
            </button>
          </li>
          <li>
            <button
              type="button"
              className="w-full text-left px-2 py-1 hover:bg-gray-100 rounded flex items-center gap-2"
              onClick={() => {
                setSortOrder("desc");
                (document.activeElement as HTMLElement)?.blur();
              }}
            >
              {getItemLabel(sortOrder === "desc")} {descLabel}
            </button>
          </li>
        </ul>
      </div>

      <div className="dropdown">
        <button 
          type="button" 
          tabIndex={0} 
          className="flex items-center gap-1 px-3 py-1.5 text-xs border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <FilterIcon className="w-3 h-3" />
          {getStatusLabel(statusFilter)}
        </button>
        <ul className="dropdown-content menu bg-white rounded-md shadow-lg z-10 w-36 p-1 text-xs border border-gray-200 mt-1">
          <li>
            <button
              type="button"
              className="w-full text-left px-2 py-1 hover:bg-gray-100 rounded flex items-center gap-2"
              onClick={() => {
                setStatusFilter(ALL_STATUS_FILTER);
                (document.activeElement as HTMLElement)?.blur();
              }}
            >
              {getItemLabel(statusFilter === ALL_STATUS_FILTER)}
              All Status
            </button>
          </li>
          {availableStatuses.map((status) => (
            <li key={status}>
              <button
                type="button"
                className="w-full text-left px-2 py-1 hover:bg-gray-100 rounded flex items-center gap-2"
                onClick={() => {
                  setStatusFilter(status);
                  (document.activeElement as HTMLElement)?.blur();
                }}
              >
                {getItemLabel(statusFilter === status)}
                {getStatusLabel(status)}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
