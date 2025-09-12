"use client";

import React from "react";

export function TaskCardSkeleton() {
  return (
    <div className="flex justify-between p-3 border border-gray-200 rounded-md bg-white">
      <div className="flex justify-between w-full items-center">
        <div className="flex flex-col gap-2 flex-1">
          {/* Title skeleton */}
          <div className="h-5 bg-gray-200 rounded animate-pulse w-3/4"></div>

          {/* Badges skeleton */}
          <div className="flex items-center gap-2">
            <div className="h-5 bg-gray-200 rounded animate-pulse w-20"></div>
            <div className="h-5 bg-gray-200 rounded animate-pulse w-20"></div>
          </div>

          {/* Created date skeleton */}
          <div className="flex items-center gap-1">
            {/* <div className="w-3 h-3 bg-gray-200 rounded animate-pulse"></div> */}
            <div className="h-3 bg-gray-200 rounded animate-pulse w-32"></div>
          </div>

          {/* Completed date skeleton */}
          <div className="flex items-center gap-1">
            {/* <div className="w-3 h-3 bg-gray-200 rounded animate-pulse"></div> */}
            <div className="h-3 bg-gray-200 rounded animate-pulse w-32"></div>
          </div>

          {/* Assignment status skeleton */}
          <div className="flex items-center gap-1">
            {/* <div className="w-3 h-3 bg-gray-200 rounded animate-pulse"></div> */}
            <div className="h-3 bg-gray-200 rounded animate-pulse w-20"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
