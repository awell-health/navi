"use client";

import React from "react";

interface InfoItem {
  label: string;
  value: React.ReactNode;
}

interface InfoCardProps {
  title: string;
  items: InfoItem[];
}

export function InfoCard({ title, items }: InfoCardProps) {
  return (
    <div className="border border-gray-200 rounded-lg bg-white">
      <div className="px-4 py-3 border-b border-gray-100">
        <h3 className="font-semibold text-gray-900">{title}</h3>
      </div>
      <div className="px-4 py-4 space-y-3">
        {items.map((item, index) => (
          <div key={index} className="flex justify-between items-start">
            <span className="text-sm text-gray-600 font-medium">{item.label}</span>
            <span className="text-sm text-gray-900 text-right max-w-[60%]">
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
