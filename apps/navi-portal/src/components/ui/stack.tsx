"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface StackProps extends React.ComponentProps<"div"> {
  spacing?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
  children: React.ReactNode;
}

export const spacingMap = {
  xs: "gap-2",
  sm: "gap-4",
  md: "gap-6",
  lg: "gap-8",
  xl: "gap-12",
  "2xl": "gap-16",
};

export function Stack({
  spacing = "md",
  className,
  children,
  ...props
}: StackProps) {
  return (
    <div
      className={cn("flex flex-col", spacingMap[spacing], className)}
      {...props}
    >
      {children}
    </div>
  );
}

export interface HStackProps extends React.ComponentProps<"div"> {
  spacing?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
  children: React.ReactNode;
}

export function HStack({
  spacing = "md",
  className,
  children,
  ...props
}: HStackProps) {
  return (
    <div
      className={cn(
        "flex flex-row items-center",
        spacingMap[spacing],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
