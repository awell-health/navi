import {
  NaviEmbedInstance,
  NaviLoadOptions,
  NaviInstance,
  NaviEventType,
} from "./types";
import type {
  ActivityEventType,
  CreateCareFlowSessionResponse,
  CreateCareFlowSessionResponseSuccess,
  RenderOptions,
} from "@awell-health/navi-core";
import { isSessionResponseSuccess } from "@awell-health/navi-core/helpers";

// Main loader class
export class NaviLoader {
  private instances: Map<string, NaviEmbedInstance> = new Map();
  private eventHandlers: Map<string, Map<string, Function[]>> = new Map();
  private config: NaviLoadOptions = {};

  constructor() {
    console.log(`Loaded Navi.js version __VERSION_TOKEN__`);
    // Listen for messages from iframes
    window.addEventListener("message", this.handleMessage.bind(this));
  }

  createNavi(publishableKey: string, options?: NaviLoadOptions): NaviInstance {
    console.log("createNavi with options", options);
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
        on: (event: NaviEventType, callback: (data: any) => void) => {
          this.addEventListener(existingIframe.id, event, callback);
        },
      };
    }

    // Generate unique instance ID
    const instanceId = `navi-${Math.random().toString(36).slice(2, 9)}`;

    // Get session/redirect info
    const sessionInfo = await this.createSession(publishableKey, options);

    // Create iframe with the redirect URL from session creation
    const iframe = this.createIframe(
      instanceId,
      sessionInfo,
      options,
      container
    );

    // Create embed instance
    const instance: NaviEmbedInstance = {
      instanceId,
      iframe,
      destroy: () => this.destroyInstance(instanceId),
      on: (event: NaviEventType, callback: (data: any) => void) => {
        this.addEventListener(instanceId, event, callback);
      },
    };

    // Store instance
    this.instances.set(instanceId, instance);

    // Add to DOM
    container.appendChild(iframe);

    this.maybeLog("🔍 Navi.js: iframe added to DOM", { instanceId });

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
  ): Promise<CreateCareFlowSessionResponseSuccess> {
    const baseUrl = this.getEmbedOrigin();
    const { __dangerouslySetEmbedUrl, width, ...sessionOptions } = options;

    let sessionId: string | undefined = undefined;
    const maybeSessionId = document.cookie
      .split("; ")
      .find((cookie) => cookie.startsWith("awell.sid="));
    if (maybeSessionId) {
      sessionId = maybeSessionId.split("=")[1];
      console.log("🔍 Navi.js: Found sessionId in cookie:", sessionId);
    }

    const body = {
      publishableKey,
      sessionId,
      ...sessionOptions,
    };

    if (!body.careflowId && !body.careflowDefinitionId && !body.sessionId) {
      throw new Error(
        "Either careflowId or careflowDefinitionId or sessionId must be provided"
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

    const data: CreateCareFlowSessionResponse = await response.json();
    if (!isSessionResponseSuccess(data)) {
      throw new Error(`Failed to create care flow session: ${data.error}`);
    }

    return data;
  }

  private createIframe(
    instanceId: string,
    sessionInfo: CreateCareFlowSessionResponseSuccess,
    options: RenderOptions,
    container: Element
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

    // Apply sizing based on options and container
    const { width, height, minHeight, minWidth } = this.getIframeDimensions(
      options,
      container
    );

    iframe.style.cssText = `
      ${width ? `width: ${width};` : ""}
      ${height ? `height: ${height};` : ""}
      ${minHeight ? `min-height: ${minHeight};` : ""}
      ${minWidth ? `min-width: ${minWidth};` : ""}
      border: none;
      border-radius: 8px;
      transition: height 0.3s ease;
      background: transparent;
      display: block;
      box-sizing: border-box;
      max-width: 100%;
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
      case "navi.session.ready":
        this.handleSessionReady(instance, data);
        break;
      case "navi.session.completed":
        this.handleSessionCompleted(instance, data);
        break;
      case "navi.session.error":
        this.handleSessionError(instance, data);
        break;
      case "navi.iframe.close":
        this.handleIframeClose(instance, data);
        break;
      case "navi.height.changed":
        this.handleHeightChange(instance_id, data.height);
        break;
      case "navi.width.changed":
        // No-op for now. Width should be responsive via CSS (width:100%, max-width:100%).
        // Height recalculation is already handled by ResizeObserver in the portal
        // which will emit navi.height.changed when width-driven reflow changes height.
        this.maybeLog("ℹ️ Navi.js: width changed (no-op)", {
          instanceId: instance.instanceId,
          width: data.width,
        });
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

  private handleSessionReady(instance: any, data: any) {
    this.maybeLog("🔍 Navi.js handleSessionReady:", {
      instanceId: instance.instanceId,
      sessionId: data.sessionId,
      environment: data.environment,
    });

    // Store session ID in a cookie on the client side
    if (data.sessionId) {
      this.setSessionCookie(data.sessionId);
      this.maybeLog("✅ Navi.js: Session cookie stored:", data.sessionId);
    }

    // Emit session ready event to customer callbacks
    this.emitEvent(instance.instanceId, "navi.session.ready", {
      sessionId: data.sessionId,
      timestamp: Date.now(),
    });
  }

  private async handleSessionCompleted(instance: any, data: any) {
    this.maybeLog("🔍 Navi.js handleSessionCompleted:", {
      instanceId: instance.instanceId,
      sessionId: data.sessionId,
    });

    // Clear session cookie on parent domain
    this.clearSessionCookie();

    // Also call server-side logout to clear KV store
    try {
      const baseUrl = this.getEmbedOrigin();
      await fetch(`${baseUrl}/api/session/logout`, {
        method: "POST",
        credentials: "include", // Include cookies
      });
      this.maybeLog("🧹 Navi.js: Server-side logout completed");
    } catch (error) {
      console.warn("⚠️ Navi.js: Server-side logout failed:", error);
      // Don't block the completion flow if logout fails
    }

    // Emit session completed event to customer callbacks
    this.emitEvent(instance.instanceId, "navi.session.completed", {
      timestamp: Date.now(),
    });
  }

  private handleSessionError(instance: any, data: any) {
    this.maybeLog("❌ Navi.js handleSessionError:", {
      instanceId: instance.instanceId,
      sessionId: data.sessionId,
      environment: data.environment,
      error: data.error,
    });

    // Emit session error event to customer callbacks
    this.emitEvent(instance.instanceId, "navi.session.error", {
      error: data.error,
      timestamp: Date.now(),
    });
  }

  private handleIframeClose(instance: any, data: any) {
    this.maybeLog("🔒 Navi.js handleIframeClose:", {
      instanceId: instance.instanceId,
    });

    // Emit iframe close event to customer callbacks first
    this.emitEvent(instance.instanceId, "navi.iframe.close", {
      timestamp: Date.now(),
    });

    // Clean up the iframe and instance
    this.destroyInstance(instance.instanceId);
  }

  private setSessionCookie(sessionId: string) {
    // Set cookie with same attributes as the server would use
    const isProduction = window.location.protocol === "https:";
    const cookieValue = `awell.sid=${sessionId}`;
    const cookieAttributes = [
      "HttpOnly=false", // Allow JavaScript access
      `SameSite=${isProduction ? "None" : "Lax"}`,
      `Secure=${isProduction}`,
      "Path=/",
      `Max-Age=${30 * 24 * 60 * 60}`, // 30 days
    ].join("; ");

    document.cookie = `${cookieValue}; ${cookieAttributes}`;

    this.maybeLog("🍪 Navi.js: Cookie set:", {
      sessionId,
      isProduction,
      cookieAttributes,
    });
  }

  private clearSessionCookie() {
    // Clear the session cookie by setting it to expire immediately
    const isProduction = window.location.protocol === "https:";
    const cookieAttributes = [
      "HttpOnly=false",
      `SameSite=${isProduction ? "None" : "Lax"}`,
      `Secure=${isProduction}`,
      "Path=/",
      "Max-Age=0", // Expire immediately
    ].join("; ");

    document.cookie = `awell.sid=; ${cookieAttributes}`;

    this.maybeLog("🗑️ Navi.js: Session cookie cleared");
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
      `navi.activity.${eventType}` as ActivityEventType,
      eventData
    );
  }

  private addEventListener(
    instanceId: string,
    event: NaviEventType,
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

  private emitEvent(instanceId: string, type: NaviEventType, data: any) {
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

  private getIframeDimensions(
    options: RenderOptions,
    container: Element
  ): {
    width: string;
    height: string;
    minHeight: string;
    minWidth: string;
  } {
    const containerRect = container.getBoundingClientRect();
    const containerHeight = containerRect.height;

    const baseHeight = containerHeight > 50 ? `${containerHeight}px` : "400px";
    const initialHeight = options.height || baseHeight;
    const initialWidth = options.width || "100%";
    const minimumHeight = options.minHeight || "400px"; // Reasonable minimum
    const minimumWidth = options.minWidth || "320px"; // Reasonable minimum
    return {
      width: initialWidth, // Fill container immediately with 100% default
      height: initialHeight, // Fill container immediately
      minHeight: minimumHeight, // Never shrink below reasonable minimum
      minWidth: minimumWidth, // Never shrink below reasonable minimum
    };
  }

  private maybeLog(...args: any[]) {
    if (this.config.verbose) {
      console.debug(...args);
    }
  }
}
