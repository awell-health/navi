"use client";

import React from "react";

interface InfoItem {
  label: string;
  value: React.ReactNode;
}

interface InfoCardProps {
  title: string;
  items?: InfoItem[];
  children?: React.ReactNode;
}

export function InfoCard({ title, items, children }: InfoCardProps) {
  return (
    <div className="border border-gray-200 rounded-lg bg-white">
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="text-sm font-medium text-gray-900">{title}</div>
      </div>
      {items && <div className="px-4 py-4 space-y-3">
        {items?.map((item, index) => (
          <div key={index} className="flex justify-between items-start">
            <span className="text-xs text-gray-600 font-normal">{item.label}</span>
            <span className="text-sm font-medium text-gray-900 text-right max-w-[60%]">
              {item.value}
            </span>
          </div>
        ))}
      </div>}
      {children && <div className="px-4 py-4">{children}</div>}
    </div>
  );
}
