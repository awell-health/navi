# @awell-health/navi-js-react

> React components and hooks for integrating Navi care flows

[![npm version](https://badge.fury.io/js/@awell-health%2Fnavi-js-react.svg)](https://www.npmjs.com/package/@awell-health/navi-js-react)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/@awell-health/navi-js-react)](https://bundlephobia.com/package/@awell-health/navi-js-react)

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

Choose `@awell-health/navi-js-react` when:

- ✅ You're building a React/Next.js application
- ✅ You want native React components instead of iframes
- ✅ You need tight integration with React state/lifecycle
- ✅ You want TypeScript support out of the box

Use [`@awell-health/navi-dot-js`](../navi.js) (the loader script) when:

- ❌ You're not using React
- ❌ You want the simplest possible integration
- ❌ You need to embed flows in existing non-React pages

## Installation

```bash
npm install @awell-health/navi-js-react @awell-health/navi-js
# or
yarn add @awell-health/navi-js-react @awell-health/navi-js
# or
pnpm add @awell-health/navi-js-react @awell-health/navi-js
```

## Quick Start

### 1. Wrap your app with NaviProvider

```jsx
import { NaviProvider } from "@awell-health/navi-js-react";

function App() {
  return (
    <NaviProvider publishableKey="pk_test_your_key_here">
      <YourApp />
    </NaviProvider>
  );
}
```

### 2. Use the NaviEmbed component

```jsx
import { NaviEmbed } from "@awell-health/navi-js-react";

function OnboardingPage() {
  return (
    <div>
      <h1>Complete Your Health Assessment</h1>
      <NaviEmbed
        careflowDefinitionId="cfdef_12345"
        // Optional:
        // stakeholderId="stk_abc"
        // branding={{ primary: "#3b82f6" }}
        onSessionCompleted={(event) => {
          console.log("Session completed!", event);
        }}
        onActivityCompleted={(event) => {
          console.log("Activity completed!", event);
        }}
        onSessionError={(event) => {
          console.error("Session error", event);
        }}
      />
    </div>
  );
}
```

## API Reference

### `<NaviProvider>`

Provides Navi context to all child components. Must wrap any components using Navi.

```jsx
<NaviProvider
  publishableKey="pk_test_your_key"
  branding={{ primary: "#3b82f6" }}
  config={{
    verbose: true,
    // Advanced overrides (optional)
    // origin: "https://cdn.awellhealth.com", // loader script origin
    // embedOrigin: "https://navi-portal.awellhealth.com", // iframe origin
    // alwaysFetch: false,
  }}
>
  <NaviEmbed careflowDefinitionId="cfdef_12345" />
  {/* children... */}
</NaviProvider>
```

**Props:**

- `publishableKey` (string, required) - Your Navi publishable key
- `config` (object, optional) - Advanced configurations for debugging or custom domains

### `<NaviEmbed>`

Renders a care flow as a React component.

```jsx
<NaviEmbed
  careflowDefinitionId="cfdef_12345"
  stakeholderId="stk_abc"
  branding={{ primary: "#3b82f6" }}
  onActivityCompleted={(event) => {
    /* ... */
  }}
  onSessionReady={(event) => {
    /* ... */
  }}
  onSessionCompleted={(event) => {
    /* ... */
  }}
  onSessionError={(event) => {
    /* ... */
  }}
  onIframeClose={(event) => {
    /* ... */
  }}
/>
```

Render options (selected):

- careflowDefinitionId | careflowId | sessionId | trackId | activityId
- patientIdentifier | awellPatientId
- stakeholderId
- branding
- width | height | minWidth | minHeight

Event handlers:

- onActivityCompleted(event)
- onSessionReady(event)
- onSessionCompleted(event)
- onSessionError(event)
- onIframeClose(event)

### `useNavi()`

Hook to access Navi context and loading state.

```jsx
const { branding, initialized, loading, error, publishableKey, navi } =
  useNavi();
```

Fields:

- branding
- initialized
- loading
- error
- publishableKey
- navi (loaded SDK instance)

<!-- Removed deprecated useFlowEmbed docs. -->

## Integration Patterns

### Next.js App Router

```jsx
// app/layout.tsx
import { NaviProvider } from '@awell-health/navi-js-react';

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
import { NaviEmbed } from '@awell-health/navi-js-react';

export default function OnboardingPage() {
  return (
    <div>
      <h1>Welcome!</h1>
      <NaviEmbed careflowDefinitionId="cfdef_onboarding" />
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
        <NaviEmbed
          careflowDefinitionId="cfdef_daily_health_check"
          onSessionCompleted={() => {
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
    <NaviEmbed
      careflowDefinitionId="cfdef_sensitive"
      onSessionError={(event) => {
        console.error("Session error:", event);
        setHasError(true);
      }}
    />
  );
}
```

### TypeScript Usage

```tsx
import { NaviProvider, NaviEmbed, useNavi } from "@awell-health/navi-js-react";

interface CustomFlowProps {
  patientId: string;
  flowType: "intake" | "followup" | "discharge";
}

const CustomFlow: React.FC<CustomFlowProps> = ({ patientId, flowType }) => {
  const { initialized } = useNavi();

  const handleCompleted = (data: { flowId: string; completedAt: string }) => {
    console.log("Flow completed:", data);
  };

  if (!initialized) {
    return <div>Loading Navi...</div>;
  }

  return (
    <NaviEmbed
      careflowDefinitionId={`cfdef_${flowType}`}
      onSessionCompleted={handleCompleted}
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
