import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import type { BrandingConfig } from "@awell-health/navi-core";
import { loadNavi } from "@awell-health/navi-js";
import { Navi } from "@awell-health/navi-js/dist/types";

export interface NaviContextType {
  branding: BrandingConfig;
  initialized: boolean;
  loading: boolean;
  error: string | null;
  publishableKey: string;
  navi: Navi | null;
}

const NaviContext = createContext<NaviContextType | null>(null);

export interface NaviProviderProps {
  publishableKey: string;
  branding?: BrandingConfig;
  children: ReactNode;
  verbose?: boolean;
}

export function NaviProvider({
  publishableKey,
  branding = {},
  children,
  verbose = false,
}: NaviProviderProps) {
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [navi, setNavi] = useState<Navi | null>(null);

  useEffect(() => {
    setIsLoading(true);
    loadNavi(publishableKey, {
      origin: "https://cdn.awellhealth.com",
      embedOrigin: "http://localhost:3000",
      verbose,
    })
      .then((navi) => {
        setNavi(navi);
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
    navi,
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
