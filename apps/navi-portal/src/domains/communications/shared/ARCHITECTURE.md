# Communications Domain Architecture

## Overview

Handles **iframe-to-parent communication** via PostMessage API. Bridges activity events from form components to parent window (navi.js).

## Event Flow

```
Form Component
    ↓ emitActivityEvent("activity-ready")
use-activity-events hook  
    ↓ eventHandlers.onActivityReady(event)
useCommunications event handlers (prop drilled)
    ↓ sendActivityEvent(event, activityId, activityType)  
usePostMessageBridge
    ↓ window.parent.postMessage()
navi.js (parent window)
```

## Key Components

- **`use-activity-events`** - Hook for emitting standardized events from components
- **`useCommunications`** - Creates activity-specific event handlers  
- **`usePostMessageBridge`** - Transforms events and sends via PostMessage API

## Event Handler Prop Drilling

```typescript
// CareflowActivitiesClient
const { createActivityEventHandlers } = useCommunications();

<Activities.Form
  eventHandlers={createActivityEventHandlers(activityId, activityType)}
/>
```

**Why prop drilling?** Each activity needs specific `activityId` and `activityType` context.

## Event Types

### Activity Lifecycle
| navi-core Event     | PostMessage Event         | Purpose                        |
| ------------------- | ------------------------- | ------------------------------ |
| `activity-ready`    | `navi.activity.ready`     | Activity loaded                |
| `activity-complete` | `navi.activity.completed` | Activity submitted             |
| `activity-error`    | `navi.activity.error`     | Activity error occurred        |

### User Interactions  
| navi-core Event        | PostMessage Event           | Purpose                   |
| ---------------------- | --------------------------- | ------------------------- |
| `activity-data-change` | `navi.activity.data-change` | User modified form data   |
| `activity-progress`    | `navi.activity.progress`    | Progress updated          |
| `activity-focus`       | `navi.activity.focus`       | Activity focused          |
| `activity-blur`        | `navi.activity.blur`        | Activity lost focus       |

### Infrastructure
| Special Event  | PostMessage Event     | Purpose                |
| -------------- | --------------------- | ---------------------- |
| Height changes | `navi.height.changed` | Iframe height changed  |

## Event Structure

```typescript
// PostMessage event sent to parent
{
  source: "navi",
  instance_id: string,
  type: "navi.activity.ready",
  activity_id: string,
  activity_type: "FORM",
  original_event: ActivityEvent,
  timestamp: number
}
```

## Usage Pattern

```typescript
// 1. In form components
const { emitActivityEvent } = useActivityEvents(activityId, "FORM", eventHandlers);
emitActivityEvent("activity-complete", { submissionData });

// 2. Event flows through handlers automatically
// 3. Reaches parent as PostMessage event
```

## Debugging

```typescript
// Check event emission
console.log("📡 Emitting:", eventType, data);

// Verify PostMessage sending  
console.log("📤 Sending postMessage:", event);

// In parent window dev tools - look for PostMessage events
```

## Adding New Events

1. **Add to navi-core**: `ActivityEventType = "your-new-event"`
2. **Add mapping**: `"your-new-event": "navi.activity.your-new-event"`
3. **Add handler**: `onYourNewEvent: (event) => sendActivityEvent(...)`
4. **Emit**: `emitActivityEvent("your-new-event", data)`

---

**Key Principle**: Activity context (ID + type) travels with every event through prop drilling to enable proper PostMessage tagging.
