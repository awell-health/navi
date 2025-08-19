import React, { useEffect, useRef, useState } from "react";
import { useNavi } from "./navi-provider";
import type {
  RenderOptions,
  NaviEventType,
  ActivityEvent,
  SessionEvent,
} from "@awell-health/navi-core";

interface NaviEmbedInstance {
  instanceId: string;
  destroy: () => void;
  iframe: HTMLIFrameElement;
  on: (event: NaviEventType, callback: (data: any) => void) => void;
}

export interface NaviEmbedProps extends RenderOptions {
  className?: string;
  style?: React.CSSProperties;

  // Event handlers using centralized navi-core types
  onActivityCompleted?: (event: ActivityEvent<{ submissionData: any }>) => void;
  onSessionReady?: (
    event: SessionEvent<{ sessionId: string; environment: string }>
  ) => void;
  onSessionCompleted?: (event: SessionEvent) => void;
  onSessionError?: (event: SessionEvent<{ error: string }>) => void;
  onIframeClose?: (event: SessionEvent) => void;

  // Deprecated: Legacy event handlers (for backward compatibility)
  /** @deprecated Use onSessionReady instead */
  onReady?: () => void;
  /** @deprecated Use onSessionCompleted instead */
  onCompleted?: () => void;
  /** @deprecated Use onSessionError instead */
  onError?: (error: { message: string; code?: string }) => void;
  /** @deprecated Use onIframeClose instead */
  onClose?: () => void;
}

export function NaviEmbed({
  className,
  style,
  onActivityCompleted,
  onSessionReady,
  onSessionCompleted,
  onSessionError,
  onIframeClose,
  // Legacy event handlers
  onReady,
  onCompleted,
  onError,
  onClose,
  ...renderOptions
}: NaviEmbedProps) {
  // Add ref to track if rendering is in progress to prevent race conditions
  const isRenderingRef = useRef(false);
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

        // Set up event listeners using centralized event types

        // Activity events
        if (onActivityCompleted) {
          embedInstance.on("activity-complete", onActivityCompleted);
        }

        // Session events
        if (onSessionReady) {
          embedInstance.on("navi.session.ready", onSessionReady);
        }

        if (onSessionCompleted) {
          embedInstance.on("navi.session.completed", onSessionCompleted);
        }

        if (onSessionError) {
          embedInstance.on("navi.session.error", onSessionError);
        }

        if (onIframeClose) {
          embedInstance.on("navi.iframe.close", onIframeClose);
        }

        // Legacy event handlers (for backward compatibility)
        if (onReady) {
          embedInstance.on("navi.session.ready", onReady);
        }

        if (onCompleted) {
          embedInstance.on("navi.session.completed", onCompleted);
        }

        if (onError) {
          embedInstance.on(
            "navi.session.error",
            (event: SessionEvent<{ error: string }>) => {
              onError({ message: event.data?.error || "Unknown error" });
            }
          );
        }

        if (onClose) {
          embedInstance.on("navi.iframe.close", onClose);
        }

        setInstance(embedInstance);
        console.log("✅ NaviEmbed instance created:", embedInstance.instanceId);
      } catch (err) {
        console.error("❌ Failed to render embed:", err);
        const errorMessage =
          err instanceof Error ? err.message : "Failed to render embed";
        setEmbedError(errorMessage);

        // Notify both new and legacy error handlers
        onSessionError?.({
          type: "navi.session.error",
          instanceId: "unknown",
          data: { error: errorMessage },
          timestamp: Date.now(),
        });
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
          padding: "2rem",
          background: branding.destructive ?? "#fef2f2",
          borderRadius: "8px",
          color: branding.destructiveForeground ?? "#dc2626",
          textAlign: "center",
          ...style,
        }}
      >
        <p>
          <strong>There was a problem while loading your care journey:</strong>
        </p>
        <p>{providerError || embedError}</p>
        <button
          onClick={() => window.location.reload()}
          style={{
            marginTop: "1rem",
            padding: "0.5rem 1rem",
            background: branding.primary ?? "#667eea",
            color: branding.primaryForeground ?? "white",
            border: "none",
            borderRadius: branding.radius ?? "8px",
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
