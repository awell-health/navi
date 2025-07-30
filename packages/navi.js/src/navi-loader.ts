import {
  NaviEmbedInstance,
  NaviLoadOptions,
  NaviInstance,
  NaviActivityEvent,
} from "./types";
import type {
  CreateCareFlowSessionResponse,
  RenderOptions,
} from "@awell-health/navi-core";

// Main loader class
export class NaviLoader {
  private instances: Map<string, NaviEmbedInstance> = new Map();
  private eventHandlers: Map<string, Map<string, Function[]>> = new Map();
  private config: NaviLoadOptions = {};

  constructor() {
    console.log("🔍 Navi.js: ENV", process.env.NODE_ENV);
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

    const existingIframe = container.querySelector(
      "iframe[data-navi-instance]"
    ) as HTMLIFrameElement;

    if (existingIframe) {
      console.log("🔍 Navi instance already exists, skipping creation");
      return {
        instanceId: existingIframe.id,
        iframe: existingIframe,
        destroy: () => this.destroyInstance(existingIframe.id),
        on: (event: NaviActivityEvent, callback: (data: any) => void) => {
          this.addEventListener(existingIframe.id, event, callback);
        },
      };
    }

    // Generate unique instance ID
    const instanceId = `navi-${Math.random().toString(36).slice(2, 9)}`;

    // Get session/redirect info
    const sessionInfo = await this.createSession(publishableKey, options);

    // Create iframe with the redirect URL from session creation
    const iframe = this.createIframe(instanceId, sessionInfo, options);

    // Create embed instance
    const instance: NaviEmbedInstance = {
      instanceId,
      iframe,
      destroy: () => this.destroyInstance(instanceId),
      on: (event: NaviActivityEvent, callback: (data: any) => void) => {
        this.addEventListener(instanceId, event, callback);
      },
    };

    // Store instance
    this.instances.set(instanceId, instance);

    // Add to DOM
    container.appendChild(iframe);

    console.log("🔍 Navi.js: iframe added to DOM", { iframe, instanceId });

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
  ): Promise<CreateCareFlowSessionResponse> {
    const baseUrl = this.getEmbedOrigin();
    const { __dangerouslySetEmbedUrl, width, ...sessionOptions } = options;
    const body = {
      publishableKey,
      ...sessionOptions,
    };

    if (!body.careflowId && !body.careflowDefinitionId) {
      throw new Error(
        "Either careflowId or careflowDefinitionId must be provided"
      );
    }

    console.log(`🔍 Navi.js: Creating session using options with body:`, body);
    const response = await fetch(`${baseUrl}/api/create-careflow-session`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
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
      success: data.success,
      embedUrl: data.embedUrl,
      branding: data.branding,
    };
  }

  private createIframe(
    instanceId: string,
    sessionInfo: CreateCareFlowSessionResponse,
    options: RenderOptions
  ): HTMLIFrameElement {
    const iframe = document.createElement("iframe");

    // Use the redirect URL from session creation
    let embedUrl: URL;
    if (options.__dangerouslySetEmbedUrl) {
      if (process.env.NODE_ENV === "production") {
        throw new Error(
          "🚫 Navi.js: __dangerouslySetEmbedUrl is not allowed in production. Please use the embedUrl parameter instead."
        );
      }
      embedUrl = new URL(options.__dangerouslySetEmbedUrl);
    } else {
      const baseUrl = this.getEmbedOrigin();
      embedUrl = new URL(sessionInfo.embedUrl, baseUrl);
    }

    if (options.branding) {
      embedUrl.searchParams.set("branding", JSON.stringify(options.branding));
    }

    // Add instance_id parameter for iframe communication
    embedUrl.searchParams.set("instance_id", instanceId);

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
    // iframe.setAttribute("scrolling", "no");

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

    this.maybeLog("🔍 Navi.js: Processing message:", {
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
    console.log("🔍 Navi.js: handleHeightChange", {
      instanceId,
      height,
      iframe,
    });
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
    this.maybeLog("🔍 Navi.js handleActivityEvent:", {
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

    this.maybeLog("📤 Navi.js: Emitting event to customer:", {
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
    return {
      width: options.width || "100%",
      height: "100px", // Minimal initial height, gets dynamically updated
    };
  }

  private maybeLog(...args: any[]) {
    if (this.config.verbose) {
      console.debug(...args);
    }
  }
}
