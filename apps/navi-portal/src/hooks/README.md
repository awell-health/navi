# Activity Management Hooks

This directory contains the UI controller layer hooks that combine data sources and determine UI state.

## Architecture Position

These hooks sit between the data layer (providers, cache) and UI components, acting as UI controllers that decide what should be rendered.

```
Data Layer → UI Controller Hooks → UI Components
```

## Hooks Overview

### `useActivityFlowState`
**File**: `use-activity-flow-state.tsx`  
**Purpose**: Master UI controller that determines what should be rendered  
**Returns**: Discriminated union of UI states

```typescript
const flowState = useActivityFlowState(careflowId);
// Returns: 'loading' | 'awaiting_subscription' | 'truly_empty' | 'completion_countdown' | 'has_activities' | 'error'
```

### `useRecentActivityEvents`  
**File**: `use-recent-activity-events.tsx`  
**Purpose**: Tracks temporal activity events for UI context  
**Returns**: Recent submission timing and flags

```typescript
const { isAwaitingSubscription, timeSinceSubmission } = useRecentActivityEvents();
```

### `useSessionCompletionTimer`
**File**: `use-session-completion-timer.tsx`  
**Purpose**: Session completion countdown management  
**Returns**: Completion state and countdown timer

```typescript
const { completionState, waitingCountdown } = useSessionCompletionTimer(activities);
```

## Usage Patterns

### Master Controller Pattern
Use `useActivityFlowState` as the master controller:

```tsx
function ActivityPage({ careflowId }: { careflowId: string }) {
  const flowState = useActivityFlowState(careflowId);
  
  switch (flowState.type) {
    case 'loading': return <LoadingSpinner />;
    case 'awaiting_subscription': return <SavingState />;
    case 'truly_empty': return <EmptyState />;
    case 'has_activities': return <ActivityList />;
    // ... etc
  }
}
```

### Temporal State Handling
The hooks distinguish between different "empty" states:

- **awaiting_subscription**: Just completed activity, expecting updates via subscription
- **truly_empty**: Been empty for 5+ seconds, genuinely no work to do
- **loading**: Initial data fetch in progress

### Session Completion Integration
```tsx
function CareflowWrapper({ activities }: { activities: Activity[] }) {
  const { completionState, waitingCountdown } = useSessionCompletionTimer(activities, {
    onSessionCompleted: () => notifyParent('session.completed'),
    waitingDuration: 5,
  });

  if (completionState === 'waiting') {
    return <CompletionCountdown seconds={waitingCountdown} />;
  }
  
  return <ActivityFlowRenderer />;
}
```

## Design Principles

### 1. Single Responsibility
Each hook has one clear purpose and doesn't mix concerns.

### 2. Data Combination
Hooks combine multiple data sources (cache, events, timers) into single decisions.

### 3. UI State Abstraction  
Hooks abstract complex logic into simple UI state decisions.

### 4. Temporal Awareness
Hooks provide time-aware state that helps distinguish user context.

## Testing

### Unit Testing
```typescript
// Mock the data dependencies
jest.mock('@/lib/activities/use-activity-counts');
jest.mock('./use-recent-activity-events');

test('useActivityFlowState returns awaiting_subscription when recently submitted', () => {
  mockUseActivityCounts.mockReturnValue({ pendingCount: 0 });
  mockUseRecentActivityEvents.mockReturnValue({ isAwaitingSubscription: true });
  
  const { result } = renderHook(() => useActivityFlowState('careflow-123'));
  expect(result.current.type).toBe('awaiting_subscription');
});
```

### Integration Testing
Test the full data → controller → UI flow with real providers.

## Migration Notes

### From Old Architecture
```typescript
// OLD: Mixed data and UI logic
const { activities, service, completionState } = useActivity();

// NEW: Separated concerns
const { activities } = useActivityContext();
const flowState = useActivityFlowState(careflowId);
const { completionState } = useSessionCompletionTimer(activities);
```