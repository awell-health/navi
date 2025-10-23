# Activity Management Architecture

This document describes the clean architecture for activity management in navi-portal as of September, 2025.

## Architecture Overview

The activity management system follows a clean, layered architecture with clear boundaries:

```
┌─ Data Layer ─────────────────────────────────────────────┐
│ • ActivityContextProvider (context + subscriptions)     │  
│ • SessionProvider (session management)                  │
│ • useActivityCounts (cache-derived counts)              │
│ • useSessionCompletionTimer (timer state)               │
│ • activities/helpers.ts (pure business logic)           │
│ • ActivityEventCoordinator (pure event bus)             │
└──────────────────────────────────────────────────────────┘
                           ↓
┌─ UI Controller Layer ────────────────────────────────────┐
│ • useActivityFlowState (combines data → UI state)       │  
│ • useRecentActivityEvents (temporal event tracking)     │
└──────────────────────────────────────────────────────────┘
                           ↓  
┌─ UI Component Layer ─────────────────────────────────────┐
│ • ActivityFlowRenderer (orchestrates based on state)    │
│ • SessionCompletionUI (pure completion UI)              │
│ • [Your Activity List Components]                       │
└──────────────────────────────────────────────────────────┘
```

## Component Responsibilities

### Data Layer

#### `ActivityContextProvider` (`src/lib/activity-context-provider.tsx`)
- **Purpose**: Context provider for activity data and actions
- **Responsibilities**: 
  - Apollo GraphQL subscriptions (activity.ready, activity.completed, etc.)
  - UI state management (activeActivity, visitedActivities, newActivities)
  - Activity completion mutations
  - Event coordination via ActivityEventCoordinator
- **Boundaries**: Does NOT contain business logic or UI concerns

#### `SessionProvider` (`src/lib/session-provider.tsx`)  
- **Purpose**: Session lifecycle management
- **Responsibilities**:
  - Session ID, status, details, TTL management
  - Session initialization, refresh, logout
  - Cross-tab session coordination
- **Boundaries**: Completely separate from activity concerns

#### `useActivityCounts` (`src/lib/activities/use-activity-counts.ts`)
- **Purpose**: Cache-derived activity metrics
- **Responsibilities**:
  - Derives totalCount, pendingCount, pendingIds from Apollo cache
  - Tracks lastChangeAt for temporal context
- **Boundaries**: Pure derivation, no state management

#### `useSessionCompletionTimer` (`src/hooks/use-session-completion-timer.tsx`)
- **Purpose**: Session completion countdown management
- **Responsibilities**:
  - Detects when all activities are complete
  - Manages countdown timer (5s default)
  - Triggers session cleanup and logout
  - Coordinates with parent via postMessage
- **Boundaries**: Single-purpose timer logic, no UI concerns

#### `activities/helpers.ts` (`src/lib/activities/helpers.ts`)
- **Purpose**: Pure business logic functions
- **Responsibilities**:
  - Activity filtering, completion logic, progress calculation
  - Business rules (canTransitionTo, etc.)
  - No side effects, no caching
- **Boundaries**: Pure functions only, no React dependencies

#### `ActivityEventCoordinator` (`src/lib/activity-context-provider.tsx`)
- **Purpose**: Cross-component event communication
- **Responsibilities**:
  - Event bus (emit/on methods)
  - Event coordination between providers and hooks
- **Boundaries**: Pure event coordination, no business logic

### UI Controller Layer

#### `useActivityFlowState` (`src/hooks/use-activity-flow-state.tsx`)
- **Purpose**: Determines what UI should be rendered
- **Responsibilities**:
  - Combines data from multiple sources (counts, completion, events)
  - Returns discriminated union for UI state decisions
  - Handles temporal context (just submitted vs truly empty)
- **State Types**:
  ```typescript
  type ActivityFlowState = 
    | { type: 'awaiting_subscription'; timeRemaining: number }
    | { type: 'truly_empty'; duration: number }
    | { type: 'completion_countdown'; countdown: number | null }
    | { type: 'has_activities'; count: number }
    | { type: 'loading' }
    | { type: 'error'; message: string };
  ```

#### `useRecentActivityEvents` (`src/hooks/use-recent-activity-events.tsx`)
- **Purpose**: Tracks temporal activity events
- **Responsibilities**:
  - Listens to activity.completed events
  - Provides isAwaitingSubscription flag
  - Distinguishes "just submitted" from "been empty for 5+ seconds"
- **Boundaries**: Temporal event tracking only

### UI Component Layer  

#### `ActivityFlowRenderer` (`src/components/activity-flow-renderer.tsx`)
- **Purpose**: UI orchestration based on flow state
- **Responsibilities**:
  - Uses useActivityFlowState to determine what to render
  - Provides default UI for each state type
  - Supports render prop pattern for customization
- **Usage**:
  ```tsx
  <ActivityFlowRenderer 
    careflowId={careflowId}
    activities={activities}
    renderActivities={(count) => <YourActivityList />}
    renderEmpty={(duration) => <YourEmptyState />}
  />
  ```

#### `SessionCompletionUI` (`src/components/session-completion-ui.tsx`)
- **Purpose**: Pure UI for session completion states
- **Responsibilities**:
  - Renders countdown timer UI
  - Shows "All done" message in final 3 seconds
  - Displays final completion state
- **Boundaries**: Pure UI component, no state management

## Key Architectural Principles

### 1. **Clear Separation of Concerns**
- **Data**: Apollo cache, subscriptions, session management
- **UI Logic**: State derivation, event coordination, temporal context
- **UI**: Pure rendering based on props/state

### 2. **Single Responsibility**
- Each component has one clear purpose
- No mixing of data fetching and UI logic
- No business logic in UI components

### 3. **Temporal State Handling**
The architecture explicitly handles different "empty" states:
- **Loading**: Initial data fetch
- **Awaiting Subscription**: Just submitted, may get updates in 2s
- **Truly Empty**: Been empty for 5+ seconds
- **Completion Countdown**: In session end flow

### 4. **Event-Driven Architecture**
- ActivityEventCoordinator provides clean event bus
- Components can react to events without tight coupling
- Events: activity.completed, activity.ready, activity.cleared, etc.

## Migration Guide

### From Old Architecture
```typescript
// OLD: Mixed concerns
const { service, activities, completionState } = useActivity();

// NEW: Clean separation  
const { coordinator, activities } = useActivityContext();
const flowState = useActivityFlowState(careflowId);
const { completionState } = useSessionCompletionTimer(activities);
```

### Backward Compatibility
All original exports are maintained for compatibility:
```typescript
// These still work
export const useActivity = useActivityContext;
export const CompletionStateRenderer = SessionCompletionUI;
```

## Usage Examples

### Basic Activity Flow
```tsx
function MyActivityPage({ careflowId }: { careflowId: string }) {
  return (
    <ActivityContextProvider careflowId={careflowId}>
      <ActivityFlowRenderer 
        careflowId={careflowId}
        renderActivities={(count) => <ActivityList />}
        renderEmpty={() => <EmptyState />}
        renderAwaitingSubscription={() => <SavingSpinner />}
      />
    </ActivityContextProvider>
  );
}
```

### Custom Flow State Logic
```tsx
function CustomActivityManager({ careflowId }: { careflowId: string }) {
  const flowState = useActivityFlowState(careflowId);
  
  switch (flowState.type) {
    case 'awaiting_subscription':
      return <div>Saving your response... ({flowState.timeRemaining}ms remaining)</div>;
    case 'truly_empty':
      return <div>Been empty for {flowState.duration}ms</div>;
    case 'completion_countdown':
      return <SessionCompletionUI countdown={flowState.countdown} />;
    case 'has_activities':
      return <div>{flowState.count} activities to complete</div>;
    default:
      return <LoadingSpinner />;
  }
}
```

### Session Completion Integration
```tsx
function CareflowPage({ careflowId }: { careflowId: string }) {
  const { activities } = useActivityContext();
  const { completionState } = useSessionCompletionTimer(activities, {
    onSessionCompleted: () => sendPostMessage('session.completed'),
    onIframeClose: () => sendPostMessage('iframe.close'),
  });
  
  if (completionState === 'completed') {
    return <SessionCompletionUI completionState="completed" />;
  }
  
  return <ActivityFlowRenderer careflowId={careflowId} />;
}
```

## Testing Strategy

### Unit Tests
- Test business logic functions in `activities/helpers.ts`
- Test event coordination in `ActivityEventCoordinator`
- Test state derivation in `useActivityFlowState`

### Integration Tests  
- Test data flow from Apollo cache through UI controller to components
- Test temporal state transitions (loading → awaiting → empty)
- Test session completion flow end-to-end

### Component Tests
- Test `ActivityFlowRenderer` with different flow states
- Test `SessionCompletionUI` countdown behavior
- Test render prop customization

## Future Enhancements

### 1. **Error Boundaries**
Add error boundaries at each layer for graceful degradation.

### 2. **Analytics Integration**
Use ActivityEventCoordinator to emit analytics events.

### 3. **Optimistic Updates**
Enhance temporal state handling for immediate UI feedback.

### 4. **State Persistence**
Add state persistence for better user experience across page loads.

## Troubleshooting

### Common Issues

**Issue**: Component not re-rendering on activity changes
**Solution**: Ensure you're using `useActivityContext()` within `ActivityContextProvider`

**Issue**: Temporal states not working (always shows empty)
**Solution**: Check that `useRecentActivityEvents` is properly listening to coordinator events

**Issue**: Session completion not triggering  
**Solution**: Verify `useSessionCompletionTimer` is receiving updated activities array

**Issue**: Build errors after refactor
**Solution**: Check imports are using new file paths, old names export backward compatibility

### Debug Tools
1. Use React DevTools to inspect provider context values
2. Add console logs to ActivityEventCoordinator events  
3. Check Apollo DevTools for cache state
4. Monitor temporal state transitions in useActivityFlowState

---

*This architecture was established in December 2024 to create clear boundaries and improve maintainability. All components follow these patterns for consistency.*