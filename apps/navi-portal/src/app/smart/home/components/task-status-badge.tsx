"use client";

import React from "react";
import { Task } from "@medplum/fhirtypes";
import { capitalize } from "@medplum/core";

interface TaskStatusBadgeProps {
  status: Task["status"];
}

export function TaskStatusBadge({ status }: TaskStatusBadgeProps) {
  const getStatusConfig = (status: Task["status"]) => {
    switch (status) {
      case "in-progress":
      case "ready":
      case "received":
      case "requested":
        return {
          label: capitalize(status),
          className: "bg-blue-100 text-blue-800 border-blue-200",
        };
      case "completed":
        return {
          label: "Completed",
          className: "bg-green-100 text-green-800 border-green-200",
        };
      case "rejected":
      case "cancelled":
        return {
          label: capitalize(status),
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
    <span
      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${config.className}`}
    >
      {config.label}
    </span>
  );
}
