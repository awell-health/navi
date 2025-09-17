# Activity Management Data Layer

This directory contains the data layer components for activity management.

## Architecture Position

The data layer handles Apollo cache, subscriptions, session management, and business logic. It provides clean interfaces to the UI controller layer.

```
Data Layer → UI Controller Hooks → UI Components
```

## Components Overview

### Context Providers

#### `ActivityContextProvider`
**File**: `activity-context-provider.tsx`  
**Purpose**: Main context provider for activity data and actions  
**Responsibilities**:
- Apollo GraphQL subscriptions (ready, completed, expired, updated)
- UI state management (activeActivity, visitedActivities, newActivities)  
- Activity completion mutations
- Event coordination via ActivityEventCoordinator

```tsx
<ActivityContextProvider careflowId={careflowId} stakeholderId={stakeholderId}>
  <YourApp />
</ActivityContextProvider>
```

#### `SessionProvider`
**File**: `session-provider.tsx`  
**Purpose**: Session lifecycle management  
**Responsibilities**:
- Session ID, status, details, TTL
- Session initialization, refresh, logout
- Cross-tab session coordination

```tsx
<SessionProvider>
  <YourApp />
</SessionProvider>
```

### Data Hooks

#### `useActivityCounts`
**File**: `activities/use-activity-counts.ts`  
**Purpose**: Cache-derived activity metrics  
**Returns**: totalCount, pendingCount, pendingIds, lastChangeAt

```typescript
const { totalCount, pendingCount, lastChangeAt } = useActivityCounts(careflowId);
```

### Business Logic

#### `activities/helpers.ts`
**File**: `activities/helpers.ts`  
**Purpose**: Pure business logic functions  
**Functions**:
- `isActivityCompleted(activity)`: Determines if activity is completed
- `isUserCompletable(activity)`: Determines if activity needs user action  
- `filterUserActivities(activities, stakeholderId)`: Filters by stakeholder
- `calculateProgress(activities)`: Calculates completion percentage
- Plus more utility functions

### Event Coordination

#### `ActivityEventCoordinator`
**File**: `activity-context-provider.tsx` (exported class)  
**Purpose**: Cross-component event bus  
**Methods**:
- `emit(event, data)`: Emit event to all listeners
- `on(event, handler)`: Listen to events, returns unsubscribe function

```typescript
const { coordinator } = useActivityContext();

// Listen to events
useEffect(() => {
  return coordinator.on('activity.completed', (data) => {
    console.log('Activity completed:', data);
  });
}, [coordinator]);

// Emit events
coordinator.emit('custom.event', { someData: 'value' });
```

## Usage Patterns

### Basic Setup
```tsx
function App() {
  return (
    <ApolloProvider>
      <SessionProvider>
        <ActivityContextProvider careflowId="cf-123" stakeholderId="user-456">
          <YourAppContent />
        </ActivityContextProvider>
      </SessionProvider>
    </ApolloProvider>
  );
}
```

### Accessing Data
```tsx
function YourComponent() {
  // Activity context
  const { 
    activities, 
    activeActivity, 
    setActiveActivity,
    completeActivity,
    coordinator 
  } = useActivityContext();
  
  // Session context  
  const { sessionId, status } = useSession();
  
  // Derived metrics
  const { pendingCount, totalCount } = useActivityCounts(careflowId);
}
```

### Event-Driven Architecture
```tsx
function EventAwareComponent() {
  const { coordinator } = useActivityContext();
  
  useEffect(() => {
    // Listen to activity completion
    const unsubscribe = coordinator.on('activity.completed', (data) => {
      // React to completion
      showSuccessToast('Activity completed!');
      // Maybe navigate somewhere
      router.push('/next-step');
    });
    
    return unsubscribe;
  }, [coordinator]);
}
```

## Data Flow

### Activity Subscriptions
1. **activity.ready**: New activity becomes available
2. **activity.updated**: Existing activity data changes  
3. **activity.completed**: Activity marked as completed
4. **activity.expired**: Activity expired/timed out

### Cache Management
- Apollo cache is the single source of truth for activity data
- Subscriptions upsert into cache using `upsertActivityInCache`
- UI state derives from cache, doesn't duplicate data

### Event Flow
```
GraphQL Subscription → Cache Update → Event Emission → Component Reaction
```

## Business Logic Patterns

### Activity Completion Logic
```typescript
// Use helper functions for business rules
import { isActivityCompleted, isUserCompletable } from './activities/helpers';

const completedActivities = activities.filter(isActivityCompleted);
const pendingActivities = activities.filter(isUserCompletable);
```

### Progress Calculation
```typescript
import { calculateProgress } from './activities/helpers';

const progress = calculateProgress(activities);
// Returns: { completed: 5, total: 10, percentage: 50 }
```

### Activity Filtering
```typescript
import { filterUserActivities } from './activities/helpers';

const userActivities = filterUserActivities(allActivities, stakeholderId);
```

## Configuration

### ActivityContextProvider Options
```tsx
<ActivityContextProvider 
  careflowId="cf-123"
  stakeholderId="user-456"           // Optional: filter by stakeholder
  activityId="act-789"              // Optional: single activity mode
  autoAdvanceOnComplete={true}      // Auto-advance to next activity
  coordinator={customCoordinator}   // Optional: inject for testing
>
```

### SessionProvider Options
```tsx
<SessionProvider
  initialSessionIdFromUrl="sess-123" // Optional: session from URL
  enableFocusRefresh={true}          // Refresh on window focus
  heartbeatMs={24 * 60 * 60 * 1000} // Heartbeat interval
  onSessionSwitch={(prev, next) => {}} // Session change callback
>
```

## Error Handling

### GraphQL Errors
```tsx
const { error, isLoading } = useActivityContext();

if (error) {
  return <ErrorBoundary error={error} />;
}
```

### Session Errors  
```tsx
const { status } = useSession();

switch (status) {
  case 'missing': return <LoginRequired />;
  case 'expired': return <SessionExpired />;
  case 'error': return <SessionError />;
}
```

## Testing

### Provider Testing
```tsx
function renderWithProviders(component: ReactElement) {
  return render(
    <MockedProvider mocks={mockQueries}>
      <SessionProvider>
        <ActivityContextProvider careflowId="test-cf">
          {component}
        </ActivityContextProvider>
      </SessionProvider>
    </MockedProvider>
  );
}
```

### Business Logic Testing
```typescript
import { isActivityCompleted, calculateProgress } from './activities/helpers';

test('isActivityCompleted handles MESSAGE activities', () => {
  const messageActivity = { object: { type: 'MESSAGE' }, resolution: 'SUCCESS' };
  expect(isActivityCompleted(messageActivity)).toBe(true);
});
```

### Event Testing
```typescript
test('ActivityEventCoordinator emits and receives events', () => {
  const coordinator = new ActivityEventCoordinator();
  const handler = jest.fn();
  
  coordinator.on('test.event', handler);
  coordinator.emit('test.event', { data: 'test' });
  
  expect(handler).toHaveBeenCalledWith({ data: 'test' });
});
```

## Performance

### Caching Strategy
- Apollo cache handles all data caching
- No duplicate state in React components  
- Subscriptions update cache efficiently

### Event Optimization
- Event listeners auto-cleanup with unsubscribe functions
- Minimal event payload sizes
- Debounced/throttled where appropriate

## Security

### Session Management
- HttpOnly cookies for session tokens
- Automatic session refresh on focus
- Cross-tab logout coordination
- Session TTL management

### Data Access
- GraphQL authentication via JWT
- Stakeholder-based activity filtering
- Secure completion context tracking