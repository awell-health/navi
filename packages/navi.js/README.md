# @awell-health/navi-loader

> The Navi SDK loader script for embedding activities into any website (POC)

## What is this package?

This is the **main loader script** that customers embed in their websites to integrate Navi activities. Think of it like Stripe's main script - you load it via a `<script>` tag, and it gives you a global `Navi` function to embed activities anywhere on your website.

**🚧 POC Version**: This is a proof-of-concept implementation with mock data for testing the SDK architecture.

**POC Features:**

- ✅ **Script loading** - Loads from localhost:3000 portal
- ✅ **Activities embedding** - Renders mock activities in iframe
- ✅ **Branding system** - CSS custom properties for theming
- ✅ **Event communication** - PostMessage between iframe and parent
- ✅ **Mock authentication** - Simulated publishable key → JWT flow

## POC Testing

To test this POC:

1. **Build**: `turbo build --filter=@awell-health/navi-loader`
2. **Start Portal**: `turbo dev --filter=navi-portal` (localhost:3000)
3. **Start Test App**: `turbo dev --filter=navi-sdk-test-app` (localhost:3001)
4. **Visit**: `http://localhost:3001` to see the integration

## Quick Start

### 1. Load the script (POC)

```html
<script src="http://localhost:3000/navi.js"></script>
```

### 2. Embed activities

```javascript
// Initialize with your publishable key
const navi = Navi("pk_test_demo123");

// Render activities into any container
const instance = navi.renderActivities("#my-container", {
  pathwayId: "pathway_patient_intake",
  stakeholderId: "stakeholder_demo",
  branding: {
    primary: "#3b82f6",
    secondary: "#6b7280",
    fontFamily: "Inter, sans-serif",
  },
});
```

### 3. Listen to events (optional)

```javascript
// Listen to SDK events
instance.on("navi.ready", (data) => {
  console.log("Navi ready:", data);
});

instance.on("navi.activity.completed", (data) => {
  console.log("Activity completed:", data);
});

instance.on("navi.pathway.completed", (data) => {
  console.log("Pathway completed:", data);
  // Redirect user, show success message, etc.
});
```

## Complete Example

```html
<!DOCTYPE html>
<html>
  <head>
    <title>My Healthcare App</title>
  </head>
  <body>
    <h1>Complete Your Onboarding</h1>

    <!-- Container where the care flow will appear -->
    <div id="care-flow-container" style="min-height: 400px;"></div>

    <button id="start-flow">Start Care Flow</button>
    <button id="destroy-flow">Close Flow</button>

    <!-- Load Navi -->
    <script src="https://cdn.awellhealth.com.com/v1/loader.js"></script>

    <script>
      let flowInstance = null;

      document.getElementById("start-flow").addEventListener("click", () => {
        // Initialize Navi with your publishable key
        const navi = Navi("pk_test_your_key_here");

        // Render the care flow
        flowInstance = navi.renderFlow(
          "flow_onboarding_123",
          "#care-flow-container",
          {
            context: {
              patientId: "patient_123",
              source: "website",
            },
          }
        );

        // Listen to events
        flowInstance.on("navi.activity.completed", (data) => {
          console.log("Activity completed:", data.activityId);
        });

        flowInstance.on("navi.flow.completed", (data) => {
          console.log("Flow completed!");
          // Redirect to next step, show success message, etc.
          window.location.href = "/dashboard";
        });

        flowInstance.on("navi.error", (error) => {
          console.error("Flow error:", error);
          alert("Something went wrong. Please try again.");
        });
      });

      document.getElementById("destroy-flow").addEventListener("click", () => {
        if (flowInstance) {
          flowInstance.destroy();
          flowInstance = null;
        }
      });
    </script>
  </body>
</html>
```

## API Reference

### `Navi(publishableKey)`

Creates a new Navi instance with your publishable key.

```javascript
const navi = Navi("pk_test_your_key_here");
```

**Parameters:**

- `publishableKey` (string) - Your Navi publishable key (starts with `pk_test_` or `pk_live_`)

**Returns:** Navi API object

### `navi.renderFlow(flowId, container, options)`

Renders a care flow into the specified container.

```javascript
const flowInstance = navi.renderFlow("flow_123", "#container", {
  context: { patientId: "patient_123" },
});
```

**Parameters:**

- `flowId` (string) - The ID of the care flow to render
- `container` (string) - CSS selector for the container element
- `options` (object, optional) - Configuration options
  - `context` (object) - Additional context data to pass to the flow

**Returns:** Flow instance with event methods

### Flow Instance Methods

#### `flowInstance.on(event, callback)`

Listen to care flow events.

```javascript
flowInstance.on("navi.activity.completed", (data) => {
  // Handle activity completion
});
```

**Available Events:**

- `navi.activity.loaded` - A new activity has loaded
- `navi.activity.completed` - User completed an activity
- `navi.flow.completed` - Entire care flow is complete
- `navi.error` - An error occurred

#### `flowInstance.destroy()`

Removes the care flow iframe and cleans up event listeners.

```javascript
flowInstance.destroy();
```

## Integration Patterns

### E-commerce Checkout Style

```javascript
// Embed during checkout process
const navi = Navi("pk_live_xyz");
navi.renderFlow("health_screening", "#checkout-health-form");
```

### Patient Portal Integration

```javascript
// Embed in patient dashboard
const navi = Navi("pk_live_xyz");
const flow = navi.renderFlow("daily_checkin", "#dashboard-widget");

flow.on("navi.flow.completed", () => {
  // Refresh dashboard data
  location.reload();
});
```

### Progressive Enhancement

```javascript
// Only load if container exists
if (document.getElementById("navi-container")) {
  const navi = Navi("pk_live_xyz");
  navi.renderFlow("intake_form", "#navi-container");
}
```

## Security

- **Origin validation**: All iframe communication is validated against expected origins
- **Publishable keys**: Only use publishable keys (starting with `pk_`) in frontend code
- **HTTPS required**: Production usage requires HTTPS
- **Content Security Policy**: The iframe source is `https://navi.awell.com`

## Browser Support

- Chrome 70+
- Firefox 65+
- Safari 12+
- Edge 79+

## Bundle Size

| Build | Size | Gzipped |
| ----- | ---- | ------- |
| UMD   | ~5KB | ~2KB    |
| ESM   | ~4KB | ~1.8KB  |

## Need React Integration?

If you're building a React app, consider using [`@awell-health/navi-react`](../navi-react) instead, which provides native React components and hooks.

## Support

- 📖 [Documentation](https://docs.navi.awell.com)
- 💬 [Community Support](https://github.com/awell-health/navi/discussions)
- 🐛 [Report Issues](https://github.com/awell-health/navi/issues)

---

## 🚧 POC Disclaimer

**This is a proof-of-concept implementation.** The API, examples, and documentation below represent the intended final design, but the current implementation includes:

- Mock authentication (no real JWT validation)
- Hardcoded localhost URLs
- Simplified event system
- Mock activity data

For production implementation details, see the main project documentation.

## License

MIT
