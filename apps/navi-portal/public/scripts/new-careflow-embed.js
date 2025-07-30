// New care flow embed application with SSE
class NewCareflowEmbedApp {
  constructor() {
    this.retryCount = 0;
    this.maxRetries = 3;
    this.eventSource = null;
    this.config = window.embedConfig || {};
    this.instanceId = this.getInstanceId();
    this.init();
  }

  getInstanceId() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("instance_id") || `navi-${Date.now()}`;
  }

  sendHeightUpdate() {
    if (!window.parent || window.parent === window) {
      return; // Not in an iframe
    }

    try {
      // Get the full document height
      const height = Math.max(
        document.body.offsetHeight,
        document.documentElement.offsetHeight
      );

      window.parent.postMessage(
        {
          source: "navi",
          type: "navi.height.changed",
          instance_id: this.instanceId,
          height,
        },
        "*"
      );
    } catch (error) {
      console.error("❌ Failed to send height update:", error);
    }
  }

  async init() {
    console.log("🚀 New care flow embed initialized");
    console.log("📍 Navigation context:", {
      careflowDefinitionId: this.config.careflowDefinitionId,
      instanceId: this.instanceId,
    });

    // Send initial height update
    this.sendHeightUpdate();

    // Set up button click handler
    const startButton = document.getElementById("start-button");
    if (startButton) {
      startButton.addEventListener("click", () => {
        this.startCareFlow();
      });
    }

    // Watch for height changes
    this.observeHeightChanges();
  }

  observeHeightChanges() {
    // Use ResizeObserver if available for better performance
    if (window.ResizeObserver) {
      const resizeObserver = new ResizeObserver(() => {
        this.sendHeightUpdate();
      });
      resizeObserver.observe(document.body);
    } else {
      // Fallback: watch for window resize events
      window.addEventListener("resize", () => {
        this.sendHeightUpdate();
      });
    }

    // Also watch for DOM mutations that might change height
    if (window.MutationObserver) {
      const mutationObserver = new MutationObserver(() => {
        // Debounce height updates
        clearTimeout(this.heightUpdateTimeout);
        this.heightUpdateTimeout = setTimeout(() => {
          this.sendHeightUpdate();
        }, 100);
      });

      mutationObserver.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["style", "class"],
      });
    }
  }

  startCareFlow() {
    console.log("🎯 Starting care flow...");

    // Hide welcome state, show loading state
    const welcomeState = document.getElementById("welcome-state");
    const loadingState = document.getElementById("loading-state");

    if (welcomeState) welcomeState.style.display = "none";
    if (loadingState) loadingState.style.display = "flex";

    // Send height update after state change
    setTimeout(() => this.sendHeightUpdate(), 50);

    // Start SSE connection for real-time progress
    this.connectSSE();
  }

  connectSSE() {
    const careflowDefinitionId = this.config.careflowDefinitionId;
    const sessionId = this.config.sessionId;

    // Include instance_id in SSE URL if available
    const currentUrlParams = new URLSearchParams(window.location.search);
    const instanceId = currentUrlParams.get("instance_id");

    let sseUrl = `/api/careflow-status?careflow_definition_id=${careflowDefinitionId}&session_id=${sessionId}`;
    if (instanceId) {
      sseUrl += `&instance_id=${instanceId}`;
    }

    console.log("📡 Connecting to SSE for new care flow:", sseUrl);

    this.eventSource = new EventSource(sseUrl);

    this.eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("📨 SSE message:", data);

        switch (data.type) {
          case "connection":
            this.updateLoadingMessage(
              "Connected! Setting up your care journey..."
            );
            break;

          case "progress":
            this.updateProgress(data.progress, data.message);
            break;

          case "ready":
            this.onCareFlowReady(data.redirectUrl);
            break;

          default:
            console.log("📝 Unknown SSE message type:", data.type);
        }
      } catch (error) {
        console.error("❌ Error parsing SSE message:", error);
      }
    };

    this.eventSource.onerror = (error) => {
      console.error("❌ SSE connection error:", error);
      this.eventSource.close();

      // Fallback to timeout-based loading
      setTimeout(() => {
        this.showError();
      }, 1500);
    };
  }

  updateLoadingMessage(message) {
    const loadingMessage = document.getElementById("loading-message");
    if (loadingMessage) {
      loadingMessage.textContent = message;
      // Send height update in case message length changes layout
      setTimeout(() => this.sendHeightUpdate(), 50);
    }
  }

  updateProgress(progress, message) {
    const progressFill = document.getElementById("progress-fill");
    const progressText = document.getElementById("progress-text");
    const loadingMessage = document.getElementById("loading-message");

    if (progressFill) {
      progressFill.style.width = `${progress}%`;
    }

    if (progressText) {
      progressText.textContent = `${progress}%`;
    }

    if (loadingMessage && message) {
      loadingMessage.textContent = message;
    }

    // Send height update after progress change
    setTimeout(() => this.sendHeightUpdate(), 50);
  }

  onCareFlowReady(redirectUrl) {
    console.log("✅ New care flow ready, redirecting to:", redirectUrl);

    if (this.eventSource) {
      this.eventSource.close();
    }

    // Show 100% completion briefly before redirect
    this.updateProgress(100, "Complete! Redirecting to your care journey...");

    setTimeout(() => {
      // Preserve instance_id parameter when redirecting
      const currentUrlParams = new URLSearchParams(window.location.search);
      const instanceId = currentUrlParams.get("instance_id");

      let finalRedirectUrl = redirectUrl;
      if (instanceId) {
        const separator = redirectUrl.includes("?") ? "&" : "?";
        finalRedirectUrl += `${separator}instance_id=${instanceId}`;
      }

      console.log(
        "🔄 Redirecting to care flow with instanceId preserved:",
        finalRedirectUrl
      );
      window.location.href = finalRedirectUrl;
    }, 800);
  }

  showError() {
    document.getElementById("loading-state").style.display = "none";
    document.getElementById("welcome-state").style.display = "none";
    document.getElementById("error-state").style.display = "block";

    // Send height update after showing error state
    setTimeout(() => this.sendHeightUpdate(), 50);
  }

  // Clean up on page unload
  cleanup() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }

    // Clear any pending height update timeouts
    if (this.heightUpdateTimeout) {
      clearTimeout(this.heightUpdateTimeout);
    }
  }
}

// Initialize when page loads
let embedApp;
document.addEventListener("DOMContentLoaded", () => {
  embedApp = new NewCareflowEmbedApp();
});

// Clean up SSE connection on page unload
window.addEventListener("beforeunload", () => {
  if (embedApp) {
    embedApp.cleanup();
  }
});
