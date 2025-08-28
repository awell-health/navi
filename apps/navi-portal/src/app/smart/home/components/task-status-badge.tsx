"use client";

import React from "react";
import { type ActivityStatus } from "@/lib/awell-client/generated/graphql";

interface TaskStatusBadgeProps {
  status: ActivityStatus;
}

export function TaskStatusBadge({ status }: TaskStatusBadgeProps) {
  const getStatusConfig = (status: ActivityStatus) => {
    switch (status) {
      case "ACTIVE":
        return {
          label: "Active",
          className: "bg-blue-100 text-blue-800 border-blue-200",
        };
      case "DONE":
        return {
          label: "Completed",
          className: "bg-green-100 text-green-800 border-green-200",
        };
      case "CANCELLED":
        return {
          label: "Cancelled",
          className: "bg-red-100 text-red-800 border-red-200",
        };
      default:
        return {
          label: status,
          className: "bg-gray-100 text-gray-800 border-gray-200",
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${config.className}`}>
      {config.label}
    </span>
  );
}
