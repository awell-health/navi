# Activity Management Components

This directory contains the UI component layer for activity management.

## Architecture Position

These components form the UI layer that renders based on props and state provided by the UI controller hooks.

```
Data Layer → UI Controller Hooks → UI Components
```

## Components Overview

### `ActivityFlowRenderer`
**File**: `activity-flow-renderer.tsx`  
**Purpose**: Master UI orchestrator that renders appropriate UI based on flow state  
**Pattern**: Render props with sensible defaults

```tsx
<ActivityFlowRenderer 
  careflowId={careflowId}
  activities={activities}
  renderActivities={(count) => <YourActivityList />}
  renderEmpty={(duration) => <YourEmptyState />}
  renderAwaitingSubscription={() => <SaveSpinner />}
/>
```

### `SessionCompletionUI`  
**File**: `session-completion-ui.tsx`  
**Purpose**: Pure UI component for session completion states  
**States**: waiting (with countdown), completed

```tsx
<SessionCompletionUI 
  completionState="waiting" 
  waitingCountdown={3}
/>
```

## Design Principles

### 1. Pure UI Components
Components receive all data via props and don't manage complex state.

### 2. Render Props Pattern
`ActivityFlowRenderer` allows customization while providing sensible defaults.

### 3. Single Purpose
Each component handles one specific UI concern.

### 4. Accessibility First
All components follow WCAG 2.1 AA standards.

## Usage Patterns

### Default UI Flow
```tsx
function SimpleActivityPage({ careflowId }: { careflowId: string }) {
  const { activities } = useActivityContext();
  
  return (
    <ActivityFlowRenderer 
      careflowId={careflowId}
      activities={activities}
      // Uses default implementations for all states
    />
  );
}
```

### Custom UI Flow
```tsx
function CustomActivityPage({ careflowId }: { careflowId: string }) {
  const { activities } = useActivityContext();
  
  return (
    <ActivityFlowRenderer 
      careflowId={careflowId}
      activities={activities}
      renderLoading={() => <MyLoadingSpinner />}
      renderActivities={(count) => (
        <div>
          <h2>You have {count} tasks</h2>
          <MyActivityList />
        </div>
      )}
      renderEmpty={(duration) => (
        <div>
          <h2>All caught up!</h2>
          <p>Empty for {Math.round(duration / 1000)}s</p>
        </div>
      )}
      renderAwaitingSubscription={(timeRemaining) => (
        <div>
          <h2>Saving your response...</h2>
          <p>{timeRemaining}ms remaining</p>
        </div>
      )}
    />
  );
}
```

### Session Completion
```tsx
function CareflowPage() {
  const { completionState, waitingCountdown } = useSessionCompletionTimer(activities);
  
  // Handle completion UI at page level
  if (completionState === 'waiting' || completionState === 'completed') {
    return (
      <SessionCompletionUI 
        completionState={completionState}
        waitingCountdown={waitingCountdown}
      />
    );
  }
  
  return <ActivityFlowRenderer />;
}
```

## Component States

### ActivityFlowRenderer States

1. **Loading**: Shows spinner while initial data loads
2. **Awaiting Subscription**: Shows "Saving..." after activity submission  
3. **Truly Empty**: Shows empty state after being empty for 5+ seconds
4. **Has Activities**: Shows your custom activity list UI
5. **Completion Countdown**: Delegates to SessionCompletionUI
6. **Error**: Shows error state with message

### SessionCompletionUI States

1. **Waiting**: Shows countdown timer and "Finishing up..." message
2. **Final 3 seconds**: Shows "All done!" with final countdown  
3. **Completed**: Shows "Session Complete" with checkmark

## Customization

### Styling
Components use Tailwind classes and can be customized via:
- CSS class overrides
- Custom render props
- Wrapping with styled components

### Accessibility
All components include:
- Proper ARIA labels
- Keyboard navigation support  
- Screen reader compatibility
- High contrast support

## Testing

### Component Testing
```typescript
test('ActivityFlowRenderer renders loading state', () => {
  // Mock useActivityFlowState
  jest.mock('@/hooks/use-activity-flow-state');
  mockUseActivityFlowState.mockReturnValue({ type: 'loading' });
  
  render(<ActivityFlowRenderer careflowId="test" />);
  expect(screen.getByText('Loading activities...')).toBeInTheDocument();
});
```

### Visual Regression Testing
Components should be tested across:
- Different screen sizes
- Light/dark themes  
- High contrast modes
- Various countdown states

## Performance

### Optimization
- Components use React.memo where appropriate
- Render props prevent unnecessary re-renders
- Default implementations are lightweight

### Bundle Size
- Tree-shakeable exports
- Minimal external dependencies
- Efficient default UI implementations