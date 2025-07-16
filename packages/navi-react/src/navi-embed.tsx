import React, { useEffect, useRef, useState } from "react";
import { useNavi } from "./navi-provider";
import type { BrandingConfig } from "@awell-health/navi-core";

// Import interfaces for the unified API
interface PatientIdentifier {
  system: string;
  value: string;
}

interface RenderOptions {
  // Use Case 1: Start new careflow
  careflowDefinitionId?: string;
  patientIdentifier?: PatientIdentifier;
  awellPatientId?: string;

  // Use Case 2: Resume existing careflow
  careflowId?: string;
  careflowToken?: string;
  trackId?: string;
  activityId?: string;

  // Legacy support
  pathwayId?: string;

  // Common options
  stakeholderId?: string;
  branding?: BrandingConfig;

  // Iframe sizing
  size?: "compact" | "standard" | "full" | "custom";
  height?: number;
  width?: string;
}

interface NaviEmbedInstance {
  instanceId: string;
  destroy: () => void;
  iframe: HTMLIFrameElement;
  on: (event: string, callback: (data: any) => void) => void;
}

export interface NaviEmbedProps extends RenderOptions {
  containerId?: string;
  className?: string;
  style?: React.CSSProperties;

  // Event handlers for care flow lifecycle
  onCareFlowStarted?: (data: { careflowId: string; patientId: string }) => void;
  onActivityCompleted?: (data: {
    activityId: string;
    submissionData: any;
  }) => void;
  onCompleted?: (data: { careflowId: string }) => void;
  onError?: (error: { message: string; code?: string }) => void;
  onReady?: () => void;
}

declare global {
  interface Window {
    Navi: (publishableKey: string) => {
      render: (
        containerId: string,
        options: RenderOptions
      ) => Promise<NaviEmbedInstance>;
    };
  }
}

export function NaviEmbed({
  containerId,
  className,
  style,
  onCareFlowStarted,
  onActivityCompleted,
  onCompleted,
  onError,
  onReady,
  ...renderOptions
}: NaviEmbedProps) {
  const {
    publishableKey,
    branding,
    isLoading,
    error: providerError,
  } = useNavi();
  const containerRef = useRef<HTMLDivElement>(null);
  const [instance, setInstance] = useState<NaviEmbedInstance | null>(null);
  const [embedError, setEmbedError] = useState<string | null>(null);
  const [isEmbedLoading, setIsEmbedLoading] = useState(false);

  useEffect(() => {
    if (isLoading || providerError || !publishableKey) {
      return;
    }

    async function loadNaviScript() {
      return new Promise<void>((resolve, reject) => {
        if (typeof window.Navi === "function") {
          resolve();
          return;
        }

        const script = document.createElement("script");
        script.src =
          process.env.NODE_ENV === "production"
            ? "https://cdn.awellhealth.com/navi.js"
            : "http://localhost:3000/navi.js/route";
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("Failed to load Navi SDK"));
        document.head.appendChild(script);
      });
    }

    async function renderEmbed() {
      try {
        setIsEmbedLoading(true);
        setEmbedError(null);

        // Load the navi.js SDK
        await loadNaviScript();

        if (!containerRef.current) {
          throw new Error("Container ref not available");
        }

        // Create unique container ID
        const uniqueContainerId =
          containerId ||
          `navi-embed-${Math.random().toString(36).substr(2, 9)}`;

        // Create the container div
        const embedDiv = document.createElement("div");
        embedDiv.id = uniqueContainerId;
        containerRef.current.appendChild(embedDiv);

        // Merge branding from provider with component-specific branding
        const mergedBranding = {
          ...branding,
          ...renderOptions.branding,
        };

        // Create Navi instance and render
        const navi = window.Navi(publishableKey);
        const embedInstance = await navi.render(`#${uniqueContainerId}`, {
          ...renderOptions,
          branding: mergedBranding,
        });

        // Set up event listeners
        if (onReady) {
          embedInstance.on("navi.activity.ready", onReady);
        }

        if (onCareFlowStarted) {
          embedInstance.on("navi.careflow.started", onCareFlowStarted);
        }

        if (onActivityCompleted) {
          embedInstance.on("navi.activity.completed", onActivityCompleted);
        }

        if (onCompleted) {
          embedInstance.on("navi.careflow.completed", onCompleted);
        }

        if (onError) {
          embedInstance.on("navi.activity.error", onError);
        }

        setInstance(embedInstance);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to render embed";
        setEmbedError(errorMessage);
        onError?.({ message: errorMessage });
      } finally {
        setIsEmbedLoading(false);
      }
    }

    renderEmbed();

    // Cleanup function
    return () => {
      if (instance) {
        instance.destroy();
      }
    };
  }, [publishableKey, isLoading, providerError, JSON.stringify(renderOptions)]);

  // Show loading state
  if (isLoading || isEmbedLoading) {
    return (
      <div
        className={className}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "200px",
          background: "#f8f9fa",
          borderRadius: "8px",
          ...style,
        }}
      >
        <div>
          <div
            style={{
              width: "40px",
              height: "40px",
              border: "3px solid #e5e7eb",
              borderTop: "3px solid var(--navi-primary, #667eea)",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 1rem",
            }}
          />
          <p style={{ color: "#6b7280", textAlign: "center" }}>
            {isLoading
              ? "Initializing Navi..."
              : "Loading your care journey..."}
          </p>
        </div>
      </div>
    );
  }

  // Show error state
  if (providerError || embedError) {
    return (
      <div
        className={className}
        style={{
          padding: "1rem",
          background: "#fef2f2",
          border: "1px solid #fecaca",
          borderRadius: "8px",
          color: "#dc2626",
          textAlign: "center",
          ...style,
        }}
      >
        <p>
          <strong>Error loading care journey:</strong>
        </p>
        <p>{providerError || embedError}</p>
        <button
          onClick={() => window.location.reload()}
          style={{
            marginTop: "0.5rem",
            padding: "0.5rem 1rem",
            background: "var(--navi-primary, #667eea)",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return <div ref={containerRef} className={className} style={style} />;
}
