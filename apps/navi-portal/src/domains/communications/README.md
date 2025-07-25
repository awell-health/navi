# Communications Domain

This domain handles iframe-to-parent communication via PostMessage API, enabling real-time event tracking between the embedded navi-portal and the parent window (navi.js).

## 📖 **Documentation**

- **[Architecture & Flow](./shared/ARCHITECTURE.md)** - Complete documentation of the communications architecture, event flow, and debugging guide
- **[Types](./shared/types.ts)** - PostMessage event type definitions

## 🚀 **Quick Start**

```typescript
// 1. Create event handlers (in CareflowActivitiesClient)
const { createActivityEventHandlers } = useCommunications();

// 2. Pass to activity components
<Activities.Form
  eventHandlers={createActivityEventHandlers(activityId, activityType)}
/>;

// 3. Emit events from components
const { emitActivityEvent } = useActivityEvents(
  activityId,
  "FORM",
  eventHandlers
);
emitActivityEvent("activity-complete", { submissionData });
```

## 🏗️ **Components**

- **`IframeCommunicator`** - Provides event handler factory
- **`usePostMessageBridge`** - Handles PostMessage API communication
- **Event Types** - Type-safe PostMessage event definitions

## 🔄 **Event Flow**

```
Form Component → use-activity-events → useCommunications → usePostMessageBridge → Parent Window
```

See [ARCHITECTURE.md](./shared/ARCHITECTURE.md) for complete details.
