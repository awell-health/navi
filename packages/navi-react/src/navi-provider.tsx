import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  NaviClient,
  AuthResult,
  BrandingConfig,
} from "@awell-health/navi-core";

export interface NaviContextType {
  client: NaviClient | null;
  auth: AuthResult | null;
  branding: BrandingConfig;
  cssProperties: Record<string, string>;
  isLoading: boolean;
  error: string | null;
  pathwayId: string | null;
  publishableKey: string;
}

const NaviContext = createContext<NaviContextType | null>(null);

export interface NaviProviderProps {
  publishableKey: string;
  pathwayId: string;
  branding?: BrandingConfig;
  children: ReactNode;
}

export function NaviProvider({
  publishableKey,
  pathwayId,
  branding = {},
  children,
}: NaviProviderProps) {
  const [client, setClient] = useState<NaviClient | null>(null);
  const [auth, setAuth] = useState<AuthResult | null>(null);
  const [cssProperties, setCssProperties] = useState<Record<string, string>>(
    {}
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function initNavi() {
      try {
        setIsLoading(true);
        setError(null);

        const naviClient = new NaviClient({ publishableKey }, branding);
        const initResult = await naviClient.init(pathwayId);

        setClient(naviClient);
        setAuth(initResult.auth);
        setCssProperties(initResult.cssProperties);

        // Apply CSS custom properties to document
        const root = document.documentElement;
        Object.entries(initResult.cssProperties).forEach(([key, value]) => {
          root.style.setProperty(key, value);
        });
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to initialize Navi";
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    }

    initNavi();
  }, [publishableKey, pathwayId, branding]);

  const value: NaviContextType = {
    client,
    auth,
    branding,
    cssProperties,
    isLoading,
    error,
    pathwayId,
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
