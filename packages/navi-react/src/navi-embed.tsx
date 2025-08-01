import React, { useEffect, useRef, useState } from "react";
import { useNavi } from "./navi-provider";
import type { RenderOptions } from "@awell-health/navi-core";

interface NaviEmbedInstance {
  instanceId: string;
  destroy: () => void;
  iframe: HTMLIFrameElement;
  on: (event: string, callback: (data: any) => void) => void;
}

export interface NaviEmbedProps extends RenderOptions {
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

export function NaviEmbed({
  className,
  style,
  onCareFlowStarted,
  onActivityCompleted,
  onCompleted,
  onError,
  onReady,
  ...renderOptions
}: NaviEmbedProps) {
  // Add ref to track if rendering is in progress to prevent race conditions
  const isRenderingRef = useRef(false);
  console.log("🔍 NaviEmbed component mounting/re-rendering...", {
    renderOptions,
  });

  const {
    publishableKey,
    branding,
    loading,
    initialized,
    error: providerError,
    navi,
  } = useNavi();
  const containerRef = useRef<HTMLDivElement>(null);
  const [instance, setInstance] = useState<NaviEmbedInstance | null>(null);
  const [embedError, setEmbedError] = useState<string | null>(null);
  const [isEmbedLoading, setIsEmbedLoading] = useState(false);

  useEffect(() => {
    if (isRenderingRef.current || !navi || !containerRef.current) {
      console.log("🔍 Iframe creation already in progress, skipping duplicate");
      return;
    }
    isRenderingRef.current = true;
    if (loading || providerError || !publishableKey || !initialized) {
      return;
    }

    async function renderEmbed() {
      // Prevent race conditions from React StrictMode or rapid re-renders
      try {
        if (isEmbedLoading) {
          console.debug("🔍 Embed is already loading, skipping duplicate");
          return;
        }
        setIsEmbedLoading(true);
        setEmbedError(null);

        // Check if Navi is already loaded (should be loaded via loadNavi at app level)
        if (!navi) {
          throw new Error(
            "Navi SDK not loaded. Please call loadNavi() at your app root before using NaviEmbed components."
          );
        }

        if (!containerRef.current) {
          throw new Error("Container ref not available");
        }

        // If we already have an instance, don't create another
        if (instance) {
          console.log("🔍 Instance already exists, skipping creation");
          return;
        }

        // Merge branding from provider with component-specific branding
        const mergedBranding = {
          ...branding,
          ...renderOptions.branding,
        };

        console.log("🎨 Applying branding:", {
          hasProviderBranding: Object.keys(branding).length > 0,
          hasComponentBranding: renderOptions.branding
            ? Object.keys(renderOptions.branding).length > 0
            : false,
          brandingKeys: Object.keys(mergedBranding),
          primaryColor: mergedBranding.primary,
        });

        const embedInstance = await navi.render(`#navi-embed-container`, {
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
          embedInstance.on("navi.error", onError);
        }

        setInstance(embedInstance);
        console.log("✅ NaviEmbed instance created:", embedInstance.instanceId);
      } catch (err) {
        console.error("❌ Failed to render embed:", err);
        const errorMessage =
          err instanceof Error ? err.message : "Failed to render embed";
        setEmbedError(errorMessage);
        onError?.({ message: errorMessage });
      } finally {
        setIsEmbedLoading(false);
        isRenderingRef.current = false;
      }
    }

    void renderEmbed();

    // Cleanup function
    return () => {
      if (instance) {
        console.log("🧹 Cleaning up NaviEmbed instance:", instance.instanceId);
        instance.destroy();
        setInstance(null);
      }
      isRenderingRef.current = false;
    };
  }, [
    publishableKey,
    initialized,
    loading,
    providerError,
    // Simplified dependencies - only track essential changes
    renderOptions.careflowDefinitionId,
    renderOptions.careflowId,
    renderOptions.stakeholderId,
    // Don't stringify branding - causes unnecessary re-renders
  ]);

  if (loading || !initialized) {
    return <div id="navi-embed-container-loading" />;
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
          <strong>There was a problem while loading your care journey:</strong>
        </p>
        <p>{providerError || embedError}</p>
        <p>
          (A message has already been sent to our support team. Please try
          again.)
        </p>
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

  return (
    <div
      id="navi-embed-container"
      ref={containerRef}
      className={className}
      style={{ minHeight: "500px", ...style }}
    />
  );
}
