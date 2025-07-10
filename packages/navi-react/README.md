npm # @awell-health/navi-react

> React components and hooks for integrating Navi care flows

[![npm version](https://badge.fury.io/js/@awell-health%2Fnavi-react.svg)](https://www.npmjs.com/package/@awell-health/navi-react)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/@awell-health/navi-react)](https://bundlephobia.com/package/@awell-health/navi-react)

## What is this package?

This is the **React SDK** for Navi care flows. Instead of using the iframe-based loader script, this package provides native React components and hooks that integrate seamlessly with your React application.

**Key features:**

- ⚛️ **Native React integration** - Components, hooks, and TypeScript support
- 🔧 **Declarative API** - Use JSX components instead of imperative JavaScript
- 🎣 **React Hooks** - `useFlowEmbed` for programmatic control
- 📱 **SSR Compatible** - Works with Next.js, Remix, and other React frameworks
- 🔒 **Type Safe** - Full TypeScript definitions included
- 🎯 **15KB bundle size** - Optimized for performance

## When to use this package?

Choose `@awell-health/navi-react` when:

- ✅ You're building a React/Next.js application
- ✅ You want native React components instead of iframes
- ✅ You need tight integration with React state/lifecycle
- ✅ You want TypeScript support out of the box

Use [`@awell-health/navi`](../navi-loader) (the loader script) when:

- ❌ You're not using React
- ❌ You want the simplest possible integration
- ❌ You need to embed flows in existing non-React pages

## Installation

```bash
npm install @awell-health/navi-react
# or
yarn add @awell-health/navi-react
# or
pnpm add @awell-health/navi-react
```

## Quick Start

### 1. Wrap your app with NaviProvider

```jsx
import { NaviProvider } from "@awell-health/navi-react";

function App() {
  return (
    <NaviProvider publishableKey="pk_test_your_key_here">
      <YourApp />
    </NaviProvider>
  );
}
```

### 2. Use the FlowEmbed component

```jsx
import { FlowEmbed } from "@awell-health/navi-react";

function OnboardingPage() {
  return (
    <div>
      <h1>Complete Your Health Assessment</h1>
      <FlowEmbed
        flowId="health_assessment_123"
        onFlowCompleted={(data) => {
          console.log("Assessment completed!", data);
          // Redirect or update UI
        }}
      />
    </div>
  );
}
```

## Complete Example

```jsx
import React, { useState } from "react";
import {
  NaviProvider,
  FlowEmbed,
  useFlowEmbed,
} from "@awell-health/navi-react";

// Component using FlowEmbed
function HealthScreening() {
  const [isCompleted, setIsCompleted] = useState(false);

  const handleActivityCompleted = (data) => {
    console.log("Activity completed:", data.activityId);
  };

  const handleFlowCompleted = (data) => {
    console.log("Screening completed!");
    setIsCompleted(true);
  };

  const handleError = (error) => {
    console.error("Screening error:", error);
    alert("Something went wrong. Please try again.");
  };

  if (isCompleted) {
    return <div>✅ Health screening completed!</div>;
  }

  return (
    <FlowEmbed
      flowId="health_screening_456"
      className="my-flow-styles"
      options={{
        context: {
          patientId: "patient_123",
          source: "react-app",
        },
      }}
      onActivityCompleted={handleActivityCompleted}
      onFlowCompleted={handleFlowCompleted}
      onError={handleError}
    />
  );
}

// Component using useFlowEmbed hook
function DynamicFlow() {
  const [flowId, setFlowId] = useState("");
  const { embed, destroy, isEmbedded, error } = useFlowEmbed();

  const handleEmbed = () => {
    embed(flowId, "#dynamic-container", {
      context: { timestamp: Date.now() },
    });
  };

  return (
    <div>
      <input
        value={flowId}
        onChange={(e) => setFlowId(e.target.value)}
        placeholder="Enter flow ID"
      />
      <button onClick={handleEmbed} disabled={!flowId}>
        Embed Flow
      </button>
      <button onClick={destroy} disabled={!isEmbedded}>
        Remove Flow
      </button>

      {error && <div>Error: {error.message}</div>}

      <div id="dynamic-container" style={{ minHeight: 300 }} />
    </div>
  );
}

// Main App
function App() {
  return (
    <NaviProvider
      publishableKey="pk_test_your_key_here"
      debug={true} // Enable debug mode in development
    >
      <div className="app">
        <h1>My Healthcare App</h1>
        <HealthScreening />
        <DynamicFlow />
      </div>
    </NaviProvider>
  );
}

export default App;
```

## API Reference

### `<NaviProvider>`

Provides Navi context to all child components. Must wrap any components using Navi.

```jsx
<NaviProvider
  publishableKey="pk_test_your_key"
  apiUrl="https://api.navi.awell.com" // optional
  debug={false} // optional
>
  <App />
</NaviProvider>
```

**Props:**

- `publishableKey` (string, required) - Your Navi publishable key
- `apiUrl` (string, optional) - Custom API URL (for testing)
- `debug` (boolean, optional) - Enable debug logging
- `children` (ReactNode, required) - Your app components

### `<FlowEmbed>`

Renders a care flow as a React component.

```jsx
<FlowEmbed
  flowId="flow_123"
  className="my-styles"
  options={{ context: { userId: "123" } }}
  onActivityLoaded={(data) => {}}
  onActivityCompleted={(data) => {}}
  onFlowCompleted={(data) => {}}
  onError={(error) => {}}
/>
```

**Props:**

- `flowId` (string, required) - The care flow ID to render
- `className` (string, optional) - CSS class for styling
- `options` (object, optional) - Flow configuration
  - `context` (object) - Additional context data
- `onActivityLoaded` (function, optional) - Called when activity loads
- `onActivityCompleted` (function, optional) - Called when activity completes
- `onFlowCompleted` (function, optional) - Called when entire flow completes
- `onError` (function, optional) - Called when errors occur

### `useNavi()`

Hook to access Navi context and loading state.

```jsx
const { config, isLoaded, error } = useNavi();
```

**Returns:**

- `config` - The Navi configuration (publishableKey, apiUrl, debug)
- `isLoaded` - Boolean indicating if Navi script is loaded
- `error` - Any loading errors

### `useFlowEmbed()`

Hook for programmatic flow embedding and management.

```jsx
const { embed, destroy, isEmbedded, error } = useFlowEmbed();
```

**Returns:**

- `embed(flowId, container, options)` - Function to embed a flow
- `destroy()` - Function to remove the embedded flow
- `isEmbedded` - Boolean indicating if a flow is currently embedded
- `error` - Any embedding errors

## Integration Patterns

### Next.js App Router

```jsx
// app/layout.tsx
import { NaviProvider } from '@awell-health/navi-react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <NaviProvider publishableKey={process.env.NEXT_PUBLIC_NAVI_KEY}>
          {children}
        </NaviProvider>
      </body>
    </html>
  );
}

// app/onboarding/page.tsx
import { FlowEmbed } from '@awell-health/navi-react';

export default function OnboardingPage() {
  return (
    <div>
      <h1>Welcome!</h1>
      <FlowEmbed flowId="onboarding_flow" />
    </div>
  );
}
```

### Conditional Rendering

```jsx
function PatientDashboard({ patient }) {
  const showHealthCheck = patient.needsHealthCheck;

  return (
    <div>
      <h1>Dashboard</h1>

      {showHealthCheck && (
        <FlowEmbed
          flowId="daily_health_check"
          options={{ context: { patientId: patient.id } }}
          onFlowCompleted={() => {
            // Refresh patient data
            mutate(`/api/patients/${patient.id}`);
          }}
        />
      )}

      {/* Rest of dashboard */}
    </div>
  );
}
```

### Error Handling

```jsx
function RobustFlow() {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div className="error-state">
        <p>Unable to load care flow.</p>
        <button onClick={() => setHasError(false)}>Try Again</button>
      </div>
    );
  }

  return (
    <FlowEmbed
      flowId="sensitive_flow"
      onError={(error) => {
        console.error("Flow error:", error);
        setHasError(true);
      }}
    />
  );
}
```

### TypeScript Usage

```tsx
import {
  NaviProvider,
  FlowEmbed,
  FlowEmbedProps,
  useNavi,
} from "@awell-health/navi-react";

interface CustomFlowProps {
  patientId: string;
  flowType: "intake" | "followup" | "discharge";
}

const CustomFlow: React.FC<CustomFlowProps> = ({ patientId, flowType }) => {
  const { isLoaded } = useNavi();

  const handleCompleted = (data: { flowId: string; completedAt: string }) => {
    console.log("Flow completed:", data);
  };

  if (!isLoaded) {
    return <div>Loading Navi...</div>;
  }

  return (
    <FlowEmbed
      flowId={`${flowType}_flow`}
      options={{
        context: { patientId },
      }}
      onFlowCompleted={handleCompleted}
    />
  );
};
```

## Styling

The components can be styled with CSS:

```css
/* Style the flow container */
.navi-flow-container {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
}

/* Loading state */
.navi-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  color: #666;
}

/* Error state */
.navi-error {
  background: #fee;
  border: 1px solid #fcc;
  padding: 15px;
  border-radius: 4px;
  color: #c00;
}
```

## Performance

- **Bundle size**: ~15KB gzipped
- **Code splitting**: Import only what you need
- **SSR compatible**: Works with server-side rendering
- **Lazy loading**: Flow content loads on demand

## Browser Support

- React 16.8+ (hooks required)
- Modern browsers (same as Navi loader)

## Migration from Loader Script

If you're migrating from `@awell-health/navi`:

```jsx
// Before (with loader script)
const navi = Navi("pk_test_key");
navi.renderFlow("flow_123", "#container");

// After (with React)
<NaviProvider publishableKey="pk_test_key">
  <FlowEmbed flowId="flow_123" />
</NaviProvider>;
```

## Support

- 📖 [Documentation](https://docs.navi.awell.com/react)
- 💬 [Community Support](https://github.com/awell-health/navi/discussions)
- 🐛 [Report Issues](https://github.com/awell-health/navi/issues)

## License

MIT
