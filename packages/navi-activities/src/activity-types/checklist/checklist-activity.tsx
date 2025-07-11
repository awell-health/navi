import React, { useEffect, useState } from 'react';
import type { BaseActivityProps, ChecklistActivityData } from '@awell-health/navi-core';
import { useActivityEvents } from '../../hooks/use-activity-events';

export interface ChecklistActivityProps extends BaseActivityProps {
  activity: BaseActivityProps['activity'] & {
    inputs?: {
      checklist?: ChecklistActivityData;
    };
  };
  onComplete?: (activityId: string, data: Record<string, unknown>) => void | Promise<void>;
}

/**
 * ChecklistActivity component - manages checklist completion with progress tracking
 * Follows Stripe Elements pattern for events
 */
export function ChecklistActivity({
  activity,
  disabled = false,
  className = '',
  eventHandlers,
  onComplete,
}: ChecklistActivityProps) {
  const { emitActivityEvent } = useActivityEvents(
    activity.id,
    'CHECKLIST',
    eventHandlers
  );

  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  
  const checklist = activity.inputs?.checklist;
  const items = checklist?.items || [];

  // Emit ready event when component mounts
  useEffect(() => {
    emitActivityEvent('activity-ready');
  }, [emitActivityEvent]);

  // Emit progress events when items are checked/unchecked
  useEffect(() => {
    const completedCount = Object.values(checkedItems).filter(Boolean).length;
    emitActivityEvent('activity-progress', {
      progress: completedCount,
      total: items.length
    });
  }, [checkedItems, items.length, emitActivityEvent]);

  const handleItemChange = (index: number, checked: boolean) => {
    setCheckedItems((prev) => ({
      ...prev,
      [index]: checked,
    }));
  };

  const handleCompleteChecklist = async () => {
    const completedData = {
      checklist_items: items.map((item, idx) => ({
        id: idx,
        text: item,
        completed: checkedItems[idx] || false,
      })),
      total_items: items.length,
      completed_items: Object.values(checkedItems).filter(Boolean).length,
    };

    try {
      if (onComplete) {
        await onComplete(activity.id, completedData);
      }
      
      // Emit completion event
      emitActivityEvent('activity-complete', {
        submissionData: completedData
      });
    } catch (error) {
      emitActivityEvent('activity-error', {
        error: error instanceof Error ? error.message : 'Failed to complete checklist'
      });
    }
  };

  const completedCount = Object.values(checkedItems).filter(Boolean).length;
  const totalCount = items.length;
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  const isComplete = completedCount === totalCount && totalCount > 0;

  if (!checklist || items.length === 0) {
    return (
      <div className={`navi-checklist-activity ${className}`}>
        <div>No checklist items available</div>
      </div>
    );
  }

  return (
    <div 
      className={`navi-checklist-activity ${className}`}
      onFocus={() => emitActivityEvent('activity-focus')}
      onBlur={() => emitActivityEvent('activity-blur')}
    >
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              {checklist.title || 'Checklist Activity'}
            </h1>
            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>
              <span>Checklist • {activity.status}</span>
              <span>{new Date(activity.date).toLocaleString()}</span>
            </div>
          </div>
          {activity.status === 'ACTIVE' && isComplete && !disabled && (
            <button 
              onClick={handleCompleteChecklist}
              style={{
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                padding: '0.5rem 1rem',
                cursor: 'pointer'
              }}
            >
              Complete Checklist
            </button>
          )}
        </div>

        {/* Progress Bar */}
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            fontSize: '0.875rem', 
            color: '#6b7280',
            marginBottom: '0.5rem'
          }}>
            <span>Progress</span>
            <span>{completedCount} of {totalCount} items completed</span>
          </div>
          <div style={{
            width: '100%',
            backgroundColor: '#f3f4f6',
            borderRadius: '9999px',
            height: '0.5rem',
            overflow: 'hidden'
          }}>
            <div
              style={{
                backgroundColor: '#10b981',
                height: '100%',
                borderRadius: '9999px',
                transition: 'width 0.3s ease',
                width: `${progressPercentage}%`
              }}
            />
          </div>
        </div>
      </div>

      {/* Checklist Items */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: '0.5rem',
        padding: '1.5rem'
      }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>
          Checklist Items
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {items.map((item, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem',
                borderRadius: '0.5rem',
                border: '1px solid #e5e7eb',
                backgroundColor: checkedItems[idx] ? '#f0fdf4' : '#ffffff',
                transition: 'background-color 0.2s ease'
              }}
            >
              <input
                type="checkbox"
                id={`checklist-item-${idx}`}
                checked={checkedItems[idx] || false}
                onChange={(e) => handleItemChange(idx, e.target.checked)}
                disabled={disabled}
                style={{
                  width: '1.25rem',
                  height: '1.25rem',
                  cursor: disabled ? 'not-allowed' : 'pointer'
                }}
              />
              <label
                htmlFor={`checklist-item-${idx}`}
                style={{
                  flex: 1,
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: disabled ? 'not-allowed' : 'pointer',
                  textDecoration: checkedItems[idx] ? 'line-through' : 'none',
                  color: checkedItems[idx] ? '#6b7280' : '#374151'
                }}
              >
                {item}
              </label>
            </div>
          ))}
        </div>

        {!isComplete && (
          <div style={{
            marginTop: '1.5rem',
            padding: '1rem',
            backgroundColor: '#f9fafb',
            borderRadius: '0.5rem',
            border: '1px solid #e5e7eb'
          }}>
            <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              Complete all items to finish this checklist activity.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}