/**
 * Navi Loader - Customer SDK Script
 * Built with Turborepo + tsup
 */

import type { BrandingConfig } from "@awell-health/navi-core";

interface NaviLoadOptions {
  /** Override the CDN origin for loading navi.js script */
  origin?: string;
  /** Override the embed origin for iframe destinations */
  embedOrigin?: string;
}

interface NaviInstance {
  render: (
    containerId: string,
    options: RenderOptions
  ) => Promise<NaviEmbedInstance>;
}

interface RenderOptions {
  // Use Case 1: Start new careflow
  careflowDefinitionId?: string;
  patientIdentifier?: {
    system: string;
    value: string;
  };
  awellPatientId?: string;

  // Use Case 2: Resume existing careflow
  careflowId?: string;
  careflowToken?: string; // Alternative to session creation
  trackId?: string;
  activityId?: string;

  // Legacy support (backward compatibility)
  pathwayId?: string; // Maps to careflowId

  // Common options
  stakeholderId?: string;
  branding?: BrandingConfig;

  // Iframe sizing
  size?: "compact" | "standard" | "full" | "custom";
  height?: number;
  width?: string;

  // Custom embed URL override (for testing)
  embedUrl?: string;
}

interface NaviEmbedInstance {
  instanceId: string; // Add instanceId property
  destroy: () => void;
  iframe: HTMLIFrameElement;
  on: (event: string, callback: (data: any) => void) => void;
}

// Main loader class
class NaviLoader {
  private instances: Map<string, NaviEmbedInstance> = new Map();
  private eventHandlers: Map<string, Map<string, Function[]>> = new Map();
  private config: NaviLoadOptions = {};

  constructor() {
    // Listen for messages from iframes
    window.addEventListener("message", this.handleMessage.bind(this));
  }

  createNavi(publishableKey: string, options?: NaviLoadOptions): NaviInstance {
    // Store configuration for this instance
    this.config = options || {};

    return {
      render: async (containerId: string, renderOptions: RenderOptions) => {
        return this.render(publishableKey, containerId, renderOptions);
      },
    };
  }

  private async render(
    publishableKey: string,
    containerId: string,
    options: RenderOptions
  ): Promise<NaviEmbedInstance> {
    const container = document.querySelector(containerId);
    if (!container) {
      throw new Error(`Container ${containerId} not found`);
    }

    // Generate unique instance ID
    const instanceId = `navi-${Math.random().toString(36).substr(2, 9)}`;

    // Determine which use case and get session/redirect info
    const sessionInfo = await this.createSession(publishableKey, options);

    // Create iframe with the redirect URL from session creation
    const iframe = this.createIframe(instanceId, sessionInfo, options);

    // Create embed instance
    const instance: NaviEmbedInstance = {
      instanceId,
      iframe,
      destroy: () => this.destroyInstance(instanceId),
      on: (event: string, callback: (data: any) => void) => {
        this.addEventListener(instanceId, event, callback);
      },
    };

    // Store instance
    this.instances.set(instanceId, instance);

    // Add to DOM
    container.appendChild(iframe);

    return instance;
  }

  private getEmbedOrigin(): string {
    // Use explicit config first
    if (this.config.embedOrigin) {
      return this.config.embedOrigin;
    }

    // Fall back to environment detection
    return process.env.NODE_ENV === "production"
      ? "https://navi-portal.awellhealth.com"
      : "http://localhost:3000";
  }

  private async createSession(
    publishableKey: string,
    options: RenderOptions
  ): Promise<{ redirectUrl: string; careflowId: string; patientId: string }> {
    const baseUrl = this.getEmbedOrigin();

    // Use Case 1: Start new care flow
    if (options.careflowDefinitionId) {
      const response = await fetch(`${baseUrl}/api/start-careflow`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          publishableKey,
          careflowDefinitionId: options.careflowDefinitionId,
          awellPatientId: options.awellPatientId,
          patientIdentifier: options.patientIdentifier,
          stakeholderId: options.stakeholderId,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to start care flow: ${response.statusText}`);
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(`Failed to start care flow: ${data.error}`);
      }

      return {
        redirectUrl: data.redirectUrl,
        careflowId: data.careflowId,
        patientId: data.patientId,
      };
    }

    // Use Case 2: Resume existing care flow
    const careflowId = options.careflowId || options.pathwayId; // Support legacy pathwayId
    if (careflowId) {
      const response = await fetch(`${baseUrl}/api/create-careflow-session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          publishableKey,
          careflowId,
          trackId: options.trackId,
          activityId: options.activityId,
          stakeholderId: options.stakeholderId,
        }),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to create care flow session: ${response.statusText}`
        );
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(`Failed to create care flow session: ${data.error}`);
      }

      return {
        redirectUrl: data.redirectUrl,
        careflowId: data.careflowId,
        patientId: data.patientId,
      };
    }

    throw new Error(
      "Either careflowDefinitionId or careflowId must be provided"
    );
  }

  private createIframe(
    instanceId: string,
    sessionInfo: { redirectUrl: string; careflowId: string; patientId: string },
    options: RenderOptions
  ): HTMLIFrameElement {
    const iframe = document.createElement("iframe");

    // Use the redirect URL from session creation
    let embedUrl: URL;
    if (options.embedUrl) {
      embedUrl = new URL(options.embedUrl);
    } else {
      const baseUrl = this.getEmbedOrigin();
      embedUrl = new URL(sessionInfo.redirectUrl, baseUrl);
    }

    // Add instance_id parameter for iframe communication
    embedUrl.searchParams.set("instance_id", instanceId);

    // Add branding supplements if provided
    if (options.branding) {
      embedUrl.searchParams.set("branding", JSON.stringify(options.branding));
    }

    // Configure iframe with session-based URL
    iframe.src = embedUrl.toString();
    iframe.id = instanceId;
    iframe.setAttribute("data-navi-instance", instanceId);

    // Apply sizing based on options
    const { width, height } = this.getIframeDimensions(options);

    iframe.style.cssText = `
      width: ${width};
      height: ${height};
      border: none;
      border-radius: 8px;
      transition: height 0.3s ease;
      background: #ffffff;
      display: block;
    `;
    iframe.setAttribute("frameborder", "0");
    iframe.setAttribute("scrolling", "no");

    return iframe;
  }

  private handleMessage(event: MessageEvent) {
    console.log("🔍 Navi.js handleMessage called:", {
      origin: event.origin,
      data: event.data,
      expectedOrigin: "http://localhost:3000",
    });

    // Security: Only accept messages from Navi portal (cross-origin!)
    const expectedOrigin = this.getEmbedOrigin();
    if (event.origin !== expectedOrigin) {
      console.warn(
        "🚫 Navi.js: Rejecting message from wrong origin:",
        event.origin,
        "Expected:",
        expectedOrigin
      );
      return;
    }

    const { source, instance_id, type, ...data } = event.data;

    console.log("🔍 Navi.js: Processing message:", {
      source,
      instance_id,
      type,
      data,
    });

    // Only handle Navi messages
    if (source !== "navi") {
      console.debug("🚫 Navi.js: Rejecting message from wrong source:", source);
      return;
    }

    const instance = this.instances.get(instance_id);
    console.debug("🔍 Navi.js: Instance lookup:", {
      instance_id,
      found: !!instance,
      availableInstances: Array.from(this.instances.keys()),
    });

    if (!instance) {
      console.warn("⚠️ Navi.js: No instance found for:", instance_id);
      return;
    }

    // Handle specific message types
    switch (type) {
      case "navi.height.changed":
        this.handleHeightChange(instance_id, data.height);
        break;
      case "navi.activity.ready":
        this.handleActivityEvent(instance, "ready", data);
        break;
      case "navi.activity.activate":
        this.handleActivityEvent(instance, "activate", data);
        break;
      case "navi.activity.progress":
        this.handleActivityEvent(instance, "progress", data);
        break;
      case "navi.activity.data-change":
        this.handleActivityEvent(instance, "dataChange", data);
        break;
      case "navi.activity.completed":
        this.handleActivityEvent(instance, "completed", data);
        break;
      case "navi.activity.error":
        this.handleActivityEvent(instance, "error", data);
        break;
      case "navi.activity.focus":
        this.handleActivityEvent(instance, "focus", data);
        break;
      case "navi.activity.blur":
        this.handleActivityEvent(instance, "blur", data);
        break;
      default:
        console.warn("🔍 Navi.js: Unknown message type:", type);
    }
  }

  private handleHeightChange(instanceId: string, height: number) {
    const iframe = document.querySelector(
      `iframe[data-navi-instance="${instanceId}"]`
    ) as HTMLIFrameElement;

    if (iframe) {
      iframe.style.height = `${height}px`;
      console.debug(
        "✅ SUCCESS: Height updated to",
        height,
        "px for instance",
        instanceId
      );
    } else {
      const allIframes = document.querySelectorAll("iframe");
      console.warn(
        "❌ FAILED: No iframe found with selector:",
        `iframe[data-navi-instance="${instanceId}"]`,
        "All iframes:",
        Array.from(allIframes).map((iframe) => ({
          id: iframe.id,
          attributes: Array.from(iframe.attributes)
            .map((attr) => `${attr.name}="${attr.value}"`)
            .join(", "),
        }))
      );
    }
  }

  private handleActivityEvent(instance: any, eventType: string, data: any) {
    console.log("🔍 Navi.js handleActivityEvent:", {
      instanceId: instance.instanceId,
      eventType,
      data,
      eventName: `navi.activity.${eventType}`,
    });

    // Emit the event to customer callbacks
    const eventData = {
      ...data,
      activityId: data.activity_id || data.activityId,
      activityType: data.activity_type || data.activityType,
      timestamp: data.timestamp || Date.now(),
    };

    console.log("📤 Navi.js: Emitting event to customer:", {
      instanceId: instance.instanceId,
      eventName: `navi.activity.${eventType}`,
      eventData,
    });

    this.emitEvent(
      instance.instanceId,
      `navi.activity.${eventType}`,
      eventData
    );
  }

  private addEventListener(
    instanceId: string,
    event: string,
    callback: Function
  ) {
    if (!this.eventHandlers.has(instanceId)) {
      this.eventHandlers.set(instanceId, new Map());
    }

    const handlers = this.eventHandlers.get(instanceId)!;
    if (!handlers.has(event)) {
      handlers.set(event, []);
    }

    handlers.get(event)!.push(callback);
  }

  private emitEvent(instanceId: string, type: string, data: any) {
    const handlers = this.eventHandlers.get(instanceId);
    if (!handlers || !handlers.has(type)) {
      return;
    }

    handlers.get(type)!.forEach((callback) => {
      try {
        callback({ type, ...data });
      } catch (error) {
        console.error("Navi event handler error:", error);
      }
    });
  }

  private destroyInstance(instanceId: string) {
    const instance = this.instances.get(instanceId);
    if (instance) {
      instance.iframe.remove();
      this.instances.delete(instanceId);
      this.eventHandlers.delete(instanceId);
    }
  }

  private getIframeDimensions(options: RenderOptions): {
    width: string;
    height: string;
  } {
    // Custom dimensions
    if (options.size === "custom") {
      return {
        width: options.width || "100%",
        height: `${options.height || 500}px`,
      };
    }

    // Preset sizes for different use cases
    switch (options.size) {
      case "compact":
        return { width: "100%", height: "300px" };
      case "standard":
        return { width: "100%", height: "500px" };
      case "full":
        return { width: "100%", height: "80vh" };
      default:
        return { width: "100%", height: "500px" }; // default to standard
    }
  }
}

// Initialize when script loads
(() => {
  // Prevent double loading
  if ((window as any).Navi) {
    return;
  }

  // Create global Navi function
  const loader = new NaviLoader();

  (window as any).Navi = function (
    publishableKey: string,
    options?: NaviLoadOptions
  ): NaviInstance {
    if (!publishableKey || !publishableKey.startsWith("pk_")) {
      throw new Error('Invalid publishable key. Must start with "pk_"');
    }

    return loader.createNavi(publishableKey, options);
  };

  // Add version and debug info
  (window as any).Navi.version = "1.0.0-poc";
  (window as any).Navi.debug = () => {
    console.debug("🚀 Navi Loader initialized with Turborepo");
    console.debug("📊 Active instances:", (loader as any).instances.size);
  };

  console.log("🚀 Navi Loader ready");
})();
