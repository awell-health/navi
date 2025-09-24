# Extension Activity Iframe Switching Example

This example demonstrates how to use the Navi SDK to detect extension activities and switch between the Navi iframe and a third-party application iframe seamlessly.

## What it demonstrates

- **Extension Activity Detection**: Listens for `onActivityReady` and `onActivityCompleted` events
- **Activity Type Filtering**: Only responds to activities where `activityType === "EXTENSION"`
- **Dynamic UI Switching**: Hides/shows different divs based on activity lifecycle
- **Third-party Integration**: Shows how customers can integrate external applications into their care flows

## How it works

1. **Initial State**: The Navi iframe is visible and the Google iframe is hidden
2. **Extension Activity Starts**: When an extension activity becomes ready:
   - The `onActivityReady` event fires with `activityType: "EXTENSION"`
   - The Navi iframe is hidden (`display: none`)
   - The Google iframe is shown (`display: block`)
3. **Extension Activity Completes**: When the extension activity finishes:
   - The `onActivityCompleted` event fires with `activityType: "EXTENSION"`
   - The Google iframe is hidden (`display: none`)
   - The Navi iframe is shown again (`display: block`)

## Running the example

```bash
# Install dependencies
pnpm install

# Start the development server
pnpm dev
```

The example will be available at `http://localhost:3001`.

## Key Implementation Details

### Event Handlers

```typescript
const handleActivityReady = (event: any) => {
  if (event.activityType === "EXTENSION") {
    setShowNavi(false);
    setShowGoogle(true);
  }
};

const handleActivityCompleted = (event: any) => {
  if (event.activityType === "EXTENSION") {
    setShowGoogle(false);
    setShowNavi(true);
  }
};
```

### NaviEmbed Configuration

```typescript
<NaviEmbed
  sessionId={sessionId}
  onActivityReady={handleActivityReady}
  onActivityCompleted={handleActivityCompleted}
  // ... other props
/>
```

### Conditional Rendering

The example uses React state and inline styles to control visibility:

```typescript
const [showNavi, setShowNavi] = useState(true);
const [showGoogle, setShowGoogle] = useState(false);

// In render:
<div style={{ display: showNavi ? 'block' : 'none' }}>
  <NaviEmbed ... />
</div>

<div style={{ display: showGoogle ? 'block' : 'none' }}>
  <iframe src="https://www.google.com/..." />
</div>
```

## Use Cases

This pattern enables healthcare organizations to:

- **Integrate third-party tools**: Seamlessly embed external applications within care flows
- **Maintain workflow continuity**: Users don't need to navigate away from the care flow
- **Customize experiences**: Show different interfaces based on activity types
- **Preserve context**: The care flow state is maintained while showing external content

## Testing Extension Activities

To test this example with actual extension activities, you'll need:

1. A care flow definition that includes extension activities
2. A session ID that corresponds to a patient with extension activities in their flow
3. The extension activities should be configured to trigger the appropriate events

Check the browser console to see activity events being logged as they occur.
