"use client";

import React from "react";

interface ReusableTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  tabs: Array<{
    id: string;
    label: string;
  }>;
  children: React.ReactNode;
}

export function ReusableTabs({
  activeTab,
  onTabChange,
  tabs,
  children,
}: ReusableTabsProps) {
  return (
    <div className="bg-white">
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
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
      </div>

      {/* Tab Content */}
      <div className="py-4">
        {children}
      </div>
    </div>
  );
}
