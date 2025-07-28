import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import type { BrandingConfig } from "@awell-health/navi-core";
import { loadNavi } from "@awell-health/navi-js";

export interface NaviContextType {
  branding: BrandingConfig;
  initialized: boolean;
  loading: boolean;
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
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    loadNavi(publishableKey, {
      origin: "https://cdn.awellhealth.com",
      embedOrigin: "http://localhost:3000",
    })
      .then(() => {
        console.log("✅ Navi SDK loaded successfully");
        setIsLoading(false);
        setIsInitialized(true);
      })
      .catch((error) => {
        console.error("❌ Failed to load Navi SDK:", error);
        setLoadError(error.message);
        setIsInitialized(false);
      });
  }, []);

  const value: NaviContextType = {
    branding,
    initialized: isInitialized,
    loading: isLoading,
    error: loadError,
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
