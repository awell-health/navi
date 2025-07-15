"use client";

import React from "react";
import { ListTodo } from "lucide-react";
import { useBranding } from "@/lib/branding-provider";
import { useActivity } from "@/lib/activity-provider";
import { Typography } from "@/components/ui/typography";

interface ActivityHeaderProps {
  onActivityListClick?: () => void;
}

export function ActivityHeader({ onActivityListClick }: ActivityHeaderProps) {
  const { branding, getLogoUrl } = useBranding();
  const { newActivities } = useActivity();

  const logoUrl = getLogoUrl();
  const hasNewActivities = newActivities.size > 0;

  return (
    <header className="flex items-start justify-between bg-background">
      {/* Left side - Activity list icon */}
      <div className="w-16 flex justify-start items-center">
        <button
          onClick={onActivityListClick}
          type="button"
          className="cursor-pointer ring-offset-background focus:ring-ring absolute top-4 left-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none"
          aria-label={`View activities${
            hasNewActivities ? " (new activities available)" : ""
          }`}
        >
          <ListTodo className="size-6" />

          {/* Ping animation dot for new activities */}
          {hasNewActivities && (
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
            </span>
          )}
        </button>
      </div>

      {/* Center - Logo */}
      <div className="flex-1 flex justify-center items-center">
        {logoUrl ? (
          <img
            src={
              "https://res.cloudinary.com/da7x4rzl4/image/upload/v1678995530/DEV%20SANDBOX%20-%20Awell%20Studio%20-%20TextEditor%20-%20Image%20upload/jxv6d1qm7cwmsznj4pzc.png"
            }
            alt="Logo"
            className="max-h-[100px] max-w-[300px] object-contain"
            style={{
              maxWidth: branding.logoWidth ?? "200px",
              maxHeight: branding.logoHeight ?? "80px",
            }}
          />
        ) : (
          <Typography.Large className="font-semibold">
            {branding.welcomeTitle || "Care Portal"}
          </Typography.Large>
        )}
      </div>

      {/* Right side - Fixed width for balance */}
      <div className="w-16 flex justify-end items-center">
        {/* Future content goes here */}
      </div>
    </header>
  );
}
