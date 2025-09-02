# ActivityProvider Extension: Single Activity Mode

## Overview

The `ActivityProvider` has been extended to support both multiple activities mode (existing behavior) and single activity mode (new). This allows you to use the same provider for different use cases without duplicating code.

## Modes

### 1. Multiple Activities Mode (Existing Behavior)
- **Trigger**: No `activityId` prop provided
- **Behavior**: Fetches all activities for a careflow using `usePathwayActivitiesQuery`
- **Use Case**: When you need to display a list of activities, show progress, or manage multiple activities

### 2. Single Activity Mode (New)
- **Trigger**: `activityId` prop provided
- **Behavior**: Fetches a specific activity using `useGetActivityQuery`
- **Use Case**: When you need to focus on a single activity, such as in task views or activity-specific pages

## Usage Examples

### Multiple Activities Mode
```tsx
<ActivityProvider
  careflowId="careflow-123"
  stakeholderId="stakeholder-456"
>
  <YourComponent />
</ActivityProvider>
```

### Single Activity Mode
```tsx
<ActivityProvider
  careflowId="careflow-123"
  stakeholderId="stakeholder-456"
  activityId="activity-789" // NEW: Enables single activity mode
>
  <YourComponent />
</ActivityProvider>
```

### Conditional Usage
```tsx
<ActivityProvider
  careflowId={careflowId}
  stakeholderId={stakeholderId}
  activityId={activityId} // Optional: undefined = multiple mode, string = single mode
>
  <YourComponent />
</ActivityProvider>
```

## Context Changes

The `useActivity()` hook now provides additional information:

```tsx
const { 
  // Existing properties
  activities, 
  activeActivity, 
  isLoading, 
  error,
  visitedActivities,
  newActivities,
  setActiveActivity,
  markActivityAsViewed,
  refetchActivities,
  completeActivity,
  service,
  progress,
  
  // NEW properties
  isSingleActivityMode, // boolean: true if in single activity mode
  activityId,           // string | undefined: the activity ID if in single mode
} = useActivity();
```

## Implementation Details

### GraphQL Queries
- **Multiple Mode**: Uses `usePathwayActivitiesQuery` to fetch all activities
- **Single Mode**: Uses `useGetActivityQuery` to fetch a specific activity
- **Conditional Execution**: Queries are skipped when not needed using Apollo's `skip` option

### State Management
- Both modes use the same state structure (`activities`, `activeActivity`, etc.)
- Single mode sets `activities` to an array with one item
- Subscriptions work with both modes and update state accordingly

### Backward Compatibility
- Existing code continues to work without changes
- New `activityId` prop is optional
- All existing functionality is preserved

## Benefits

1. **Code Reuse**: Single provider handles both use cases
2. **Consistent API**: Same context interface regardless of mode
3. **Performance**: Only fetches data that's needed
4. **Maintainability**: Single source of truth for activity logic
5. **Flexibility**: Easy to switch between modes based on requirements

## Migration Guide

### From Multiple Activities to Single Activity
```tsx
// Before (multiple activities)
<ActivityProvider careflowId={careflowId} stakeholderId={stakeholderId}>
  <Component />
</ActivityProvider>

// After (single activity)
<ActivityProvider 
  careflowId={careflowId} 
  stakeholderId={stakeholderId}
  activityId={activityId} // Add this line
>
  <Component />
</ActivityProvider>
```

### Component Updates
```tsx
// Your component can now handle both modes
function MyComponent() {
  const { isSingleActivityMode, activities, progress } = useActivity();
  
  if (isSingleActivityMode) {
    // Single activity logic
    const activity = activities[0];
    return <SingleActivityView activity={activity} />;
  } else {
    // Multiple activities logic
    return <MultipleActivitiesView activities={activities} progress={progress} />;
  }
}
```

## Testing

The provider supports service injection for testing:

```tsx
const mockService = new ActivityService();
<ActivityProvider
  careflowId="test"
  service={mockService}
  activityId="test-activity" // Test single mode
>
  <TestComponent />
</ActivityProvider>
```

## Future Enhancements

Potential improvements that could be added:
- Support for multiple specific activities (array of IDs)
- Lazy loading of activity details
- Caching strategies for single vs. multiple modes
- Performance optimizations for large activity lists
