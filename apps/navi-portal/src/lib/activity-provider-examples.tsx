/**
 * Examples of using the extended ActivityProvider
 * 
 * The ActivityProvider now supports two modes:
 * 1. Multiple Activities Mode (existing behavior) - fetches all activities for a careflow
 * 2. Single Activity Mode (new) - fetches a specific activity by ID
 */

import React from 'react';
import { ActivityProvider, useActivity } from './activity-provider';

// =================== MULTIPLE ACTIVITIES MODE (EXISTING BEHAVIOR) ===================

export function MultipleActivitiesExample() {
  return (
    <ActivityProvider
      careflowId="careflow-123"
      stakeholderId="stakeholder-456"
    >
      <MultipleActivitiesContent />
    </ActivityProvider>
  );
}

function MultipleActivitiesContent() {
  const { 
    activities, 
    activeActivity, 
    isLoading, 
    error,
    isSingleActivityMode, // false
    progress 
  } = useActivity();

  if (isLoading) return <div>Loading activities...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Multiple Activities Mode</h2>
      <p>Total activities: {activities.length}</p>
      <p>Progress: {progress.completed}/{progress.total} ({progress.percentage}%)</p>
      
      {activeActivity && (
        <div>
          <h3>Active Activity: {activeActivity.object.name}</h3>
          <p>Status: {activeActivity.status}</p>
        </div>
      )}
      
      <ul>
        {activities.map(activity => (
          <li key={activity.id}>
            {activity.object.name} - {activity.status}
          </li>
        ))}
      </ul>
    </div>
  );
}

// =================== SINGLE ACTIVITY MODE (NEW) ===================

export function SingleActivityExample() {
  return (
    <ActivityProvider
      careflowId="careflow-123"
      stakeholderId="stakeholder-456"
      activityId="activity-789" // NEW: This enables single activity mode
    >
      <SingleActivityContent />
    </ActivityProvider>
  );
}

function SingleActivityContent() {
  const { 
    activities, 
    activeActivity, 
    isLoading, 
    error,
    isSingleActivityMode, // true
    activityId, // "activity-789"
    progress 
  } = useActivity();

  if (isLoading) return <div>Loading activity...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Single Activity Mode</h2>
      <p>Activity ID: {activityId}</p>
      <p>Activities count: {activities.length} (should be 1)</p>
      
      {activeActivity && (
        <div>
          <h3>Active Activity: {activeActivity.object.name}</h3>
          <p>Status: {activeActivity.status}</p>
          <p>Type: {activeActivity.object.type}</p>
        </div>
      )}
    </div>
  );
}

// =================== CONDITIONAL USAGE EXAMPLE ===================

export function ConditionalActivityProvider({ 
  careflowId, 
  stakeholderId, 
  activityId 
}: { 
  careflowId: string; 
  stakeholderId?: string; 
  activityId?: string; 
}) {
  return (
    <ActivityProvider
      careflowId={careflowId}
      stakeholderId={stakeholderId}
      activityId={activityId} // Optional: undefined = multiple mode, string = single mode
    >
      <ConditionalContent />
    </ActivityProvider>
  );
}

function ConditionalContent() {
  const { 
    activities, 
    isSingleActivityMode, 
    activityId,
    progress 
  } = useActivity();

  return (
    <div>
      <h2>Conditional Mode</h2>
      <p>Mode: {isSingleActivityMode ? 'Single Activity' : 'Multiple Activities'}</p>
      
      {isSingleActivityMode ? (
        <div>
          <p>Single activity mode for: {activityId}</p>
          <p>Activity: {activities[0]?.object.name}</p>
        </div>
      ) : (
        <div>
          <p>Multiple activities mode</p>
          <p>Total: {activities.length}</p>
          <p>Progress: {progress.completed}/{progress.total}</p>
        </div>
      )}
    </div>
  );
}
