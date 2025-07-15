"use client";

import React, { createContext, useContext } from "react";
import type { OrgBranding } from "@/lib/branding/types";

interface BrandingContextType {
  // Full branding object
  branding: OrgBranding["branding"];

  // Metadata
  orgId: string;
  hasCustomBranding: boolean;

  // Getter function for any branding property
  getBranding: <K extends keyof OrgBranding["branding"]>(
    key: K
  ) => OrgBranding["branding"][K];

  // Convenience getters for common properties
  getPrimaryColor: () => string | undefined;
  getBackgroundColor: () => string | undefined;
  getLogoUrl: () => string | undefined;
  getFaviconUrl: () => string | undefined;
  getStackSpacing: () => "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | undefined;
}

const BrandingContext = createContext<BrandingContextType | null>(null);

interface BrandingProviderProps {
  children: React.ReactNode;
  branding: OrgBranding["branding"];
  orgId: string;
  hasCustomBranding: boolean;
}

export function BrandingProvider({
  children,
  branding,
  orgId,
  hasCustomBranding,
}: BrandingProviderProps) {
  // Generic getter for any branding property
  const getBranding = <K extends keyof OrgBranding["branding"]>(
    key: K
  ): OrgBranding["branding"][K] => {
    return branding[key];
  };

  // Convenience getters for commonly used properties
  const getPrimaryColor = () => branding.primary;
  const getBackgroundColor = () => branding.background;
  const getLogoUrl = () => branding.logoUrl;
  const getFaviconUrl = () => branding.faviconUrl;
  const getStackSpacing = () => branding.stackSpacing;

  const contextValue: BrandingContextType = {
    // Data
    branding,
    orgId,
    hasCustomBranding,

    // Functions
    getBranding,
    getPrimaryColor,
    getBackgroundColor,
    getLogoUrl,
    getFaviconUrl,
    getStackSpacing,
  };

  return (
    <BrandingContext.Provider value={contextValue}>
      {children}
    </BrandingContext.Provider>
  );
}

export function useBranding() {
  const context = useContext(BrandingContext);
  if (!context) {
    throw new Error("useBranding must be used within a BrandingProvider");
  }
  return context;
}
