# Navi Core Types

## Type Generation Strategy

This package uses a hybrid approach for GraphQL type management:

### ✅ Current State (Production Ready)

- **Generated Types**: Types are generated from the backend GraphQL schema via `pnpm codegen`
- **Import Path**: Types are imported from `../generated/graphql.js`
- **Single Source of Truth**: Backend GraphQL schema at `../../../awell-next/packages/module-navi/src/graphql/schema.graphql`

### Type Generation Process

1. Backend schema serves as the authoritative source
2. `pnpm codegen` generates TypeScript types from schema
3. `activity.ts` imports and re-exports the generated types
4. All packages consume types from `navi-core` for consistency

## Regenerating Types

To update types when the backend schema changes:

1. Ensure the backend module is up to date at `../../../awell-next/packages/module-navi/`
2. Run `pnpm codegen` to regenerate types from the updated schema
3. Types are automatically imported and available throughout the codebase

## Activity Types

### ActivityInputType

Primary types for user-interactive activities:

- `FORM` - Standard forms/questionnaires
- `DYNAMIC_FORM` - Forms with conditional logic
- `MESSAGE` - Informational messages
- `CHECKLIST` - Task checklists
- `EXTENSION` - Custom extensions

System-only types:

- `CLINICAL_NOTE` - Generated clinical documentation
- `CALCULATION` - Computed activities

### UserActivityType

Subset of `ActivityInputType` for user-facing activities in navi-portal. Excludes system-only types.

## Activity Lifecycle in Navi-Portal

Based on the current implementation, here's how activities flow through the navi-portal system:

### 1. Authentication & Session Setup

- User accesses portal via secure JWT token (from `/api/magic` route)
- JWT contains `careflowId`, `patientId`, `tenantId`, and other context
- Session cookies (`awell.sid`, `awell.jwt`) are set for subsequent requests

### 2. Activity Loading Process

```typescript
// 1. Route: /careflows/[careflow_id]/stakeholders/[stakeholder_id]
// 2. Server-side page component validates session
// 3. Client component initializes with GraphQL queries
```

**Query Flow:**

```graphql
# Primary query: PathwayActivities
query PathwayActivities($pathway_id: String!) {
  pathwayActivities(pathway_id: $pathway_id) {
    activities {
      ...Activity # Full activity fragment with inputs/outputs
    }
  }
}
```

### 3. Activity Filtering & Selection

```typescript
// Filter activities for specific stakeholder
const stakeholderActivities = allActivities.filter(
  (activity) =>
    activity.indirect_object?.id === stakeholderId &&
    activity.is_user_activity === true
);

// Auto-select first active, displayable activity
const defaultActivity = activities.find(
  (activity) => activity.status === "ACTIVE" && canDisplayActivity(activity)
);
```

### 4. Activity Type Detection & Rendering

```typescript
// Type-based component routing
switch (activeActivity.object.type) {
  case "FORM":
    return <FormActivity activity={adaptedActivity} />;
  case "MESSAGE":
    return <MessageActivity activity={adaptedActivity} />;
  case "CHECKLIST":
    return <ChecklistActivity activity={adaptedActivity} />;
  default:
    return <UnsupportedActivityType />;
}
```

### 5. Real-time Updates via Subscriptions

```typescript
// Live activity updates
useOnActivityCompletedSubscription({ careflow_id });
useOnActivityCreatedSubscription({ careflow_id });
useOnActivityUpdatedSubscription({ careflow_id });
useOnActivityExpiredSubscription({ careflow_id });
```

### 6. Activity State Management

```typescript
// Local state tracks:
- activities: ActivityFragment[]        // All activities for stakeholder
- activeActivity: ActivityFragment      // Currently displayed activity
- events: ActivityEvent[]              // Recent activity events
```

### 7. Activity Completion Flow

```typescript
// 1. User completes activity in component
// 2. Component calls onSubmit/onComplete handler
// 3. Handler calls CompleteActivity GraphQL mutation
// 4. Subscription receives completion event
// 5. UI updates activity status and progress
```

### Activity Event System

Each activity component supports event handlers:

```typescript
interface ActivityEventHandlers {
  onActivityReady: (event) => void; // Component mounted
  onActivityProgress: (event) => void; // Progress updated
  onActivityComplete: (event) => void; // Activity finished
  onActivityError: (event) => void; // Error occurred
  onActivityFocus: (event) => void; // Activity focused
  onActivityBlur: (event) => void; // Activity lost focus
}
```

### Data Adaptation Layer

The portal includes type adapters to convert GraphQL types to navi-activities component props:

```typescript
// Example: Form activity adaptation
const adaptedForm = {
  ...graphqlForm,
  questions: graphqlForm.questions.map((q) => ({
    ...q,
    required: q.required ?? false, // Handle nullable GraphQL fields
  })),
};
```

This architecture provides:

- **Real-time updates** via GraphQL subscriptions
- **Type safety** through generated GraphQL types
- **Component isolation** with event-driven communication
- **Progressive enhancement** from basic HTML to rich React components
