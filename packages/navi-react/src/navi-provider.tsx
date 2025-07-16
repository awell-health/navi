import React, { createContext, useContext, useState, ReactNode } from "react";
import type { BrandingConfig } from "@awell-health/navi-core";

export interface NaviContextType {
  branding: BrandingConfig;
  isLoading: boolean;
  error: string | null;
  publishableKey: string;
}

const NaviContext = createContext<NaviContextType | null>(null);

export interface NaviProviderProps {
  publishableKey: string;
  branding?: BrandingConfig;
  children: ReactNode;
}

export function NaviProvider({
  publishableKey,
  branding = {},
  children,
}: NaviProviderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const value: NaviContextType = {
    branding,
    isLoading,
    error,
    publishableKey,
  };

  return <NaviContext.Provider value={value}>{children}</NaviContext.Provider>;
}

export function useNavi(): NaviContextType {
  const context = useContext(NaviContext);
  if (!context) {
    throw new Error("useNavi must be used within a NaviProvider");
  }
  return context;
}
