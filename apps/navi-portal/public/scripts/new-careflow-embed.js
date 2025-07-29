// Lightweight embed portal application for new care flows with SSE
class NewCareFlowEmbed {
  constructor() {
    this.retryCount = 0;
    this.maxRetries = 3;
    this.eventSource = null;
    this.config = window.embedConfig || {};
    this.init();
  }

  async init() {
    console.log("🚀 New care flow embed initialized");

    // Set up button click handler
    const startButton = document.getElementById("start-button");
    if (startButton) {
      startButton.addEventListener("click", () => {
        this.startCareFlow();
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

    // Start SSE connection for real-time progress
    this.connectSSE();
  }

  connectSSE() {
    const careflowId = this.config.careflowId;
    const sessionId = this.config.sessionId;

    // Include instance_id in SSE URL if available
    const currentUrlParams = new URLSearchParams(window.location.search);
    const instanceId = currentUrlParams.get("instance_id");

    let sseUrl = `/api/careflow-status?careflow_id=${careflowId}&session_id=${sessionId}`;
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
        this.showStartButton();
      }, 1500);
    };
  }

  updateLoadingMessage(message) {
    const loadingMessage = document.getElementById("loading-message");
    if (loadingMessage) {
      loadingMessage.textContent = message;
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

  showStartButton() {
    document.getElementById("loading-state").style.display = "none";
    document.getElementById("welcome-state").style.display = "block";

    document.getElementById("start-button").addEventListener("click", () => {
      this.startCareFlow();
    });
  }

  async startCareFlow() {
    console.log("🎯 Starting care flow activities");

    try {
      // Disable button to prevent double-clicks
      const button = document.getElementById("start-button");
      button.disabled = true;
      button.textContent = "Loading...";

      // Navigate to care flow activities
      const careflowId = this.config.careflowId;
      const stakeholderId = this.config.patientId;

      // Preserve instance_id parameter if it exists
      const urlParams = new URLSearchParams(window.location.search);
      const instanceId = urlParams.get("instance_id");

      let redirectUrl = `/careflows/${careflowId}/stakeholders/${stakeholderId}`;
      if (instanceId) {
        redirectUrl += `?instance_id=${instanceId}`;
      }

      window.location.href = redirectUrl;
    } catch (error) {
      console.error("❌ Failed to start care flow:", error);
      this.showError();
    }
  }

  showError() {
    // Clean up SSE connection
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }

    document.getElementById("loading-state").style.display = "none";
    document.getElementById("welcome-state").style.display = "none";
    document.getElementById("error-state").style.display = "block";
  }

  // Clean up on page unload
  cleanup() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }
}

// Initialize when page loads
let embedApp;
document.addEventListener("DOMContentLoaded", () => {
  embedApp = new NewCareFlowEmbed();
});

// Clean up SSE connection on page unload
window.addEventListener("beforeunload", () => {
  if (embedApp) {
    embedApp.cleanup();
  }
});
