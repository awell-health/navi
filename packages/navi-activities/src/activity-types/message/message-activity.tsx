import React, { useEffect } from 'react';
import type { BaseActivityProps, MessageActivityData } from '@awell-health/navi-core';
import { useActivityEvents } from '../../hooks/use-activity-events';
import { SlateViewer } from '../../components/slate-viewer';

export interface MessageActivityProps extends BaseActivityProps {
  activity: BaseActivityProps['activity'] & {
    inputs?: {
      message?: MessageActivityData;
    };
  };
  onMarkAsRead?: (activityId: string) => void | Promise<void>;
}

/**
 * MessageActivity component - displays message content with unified event system
 * Follows Stripe Elements pattern for events
 */
export function MessageActivity({
  activity,
  disabled = false,
  className = '',
  eventHandlers,
  onMarkAsRead,
}: MessageActivityProps) {
  const { emitActivityEvent } = useActivityEvents(
    activity.id,
    'MESSAGE',
    eventHandlers
  );

  const message = activity.inputs?.message;

  // Emit ready event when component mounts
  useEffect(() => {
    emitActivityEvent('activity-ready');
  }, [emitActivityEvent]);

  const handleMarkAsRead = async () => {
    try {
      if (onMarkAsRead) {
        await onMarkAsRead(activity.id);
      }
      
      // Emit completion event
      emitActivityEvent('activity-complete', {
        submissionData: {
          activityId: activity.id,
          action: 'marked_as_read',
          timestamp: Date.now()
        }
      });
    } catch (error) {
      emitActivityEvent('activity-error', {
        error: error instanceof Error ? error.message : 'Failed to mark as read'
      });
    }
  };

  const renderMessageBody = () => {
    if (!message) return null;

    switch (message.format) {
      case 'HTML':
        return <div dangerouslySetInnerHTML={{ __html: message.body }} />;
      case 'MARKDOWN':
        // For now, render as plain text - could add markdown parser later
        return (
          <div style={{ whiteSpace: 'pre-wrap' }}>
            {message.body}
          </div>
        );
      case 'SLATE':
        try {
          const slateValue = JSON.parse(message.body);
          return <SlateViewer value={slateValue} />;
        } catch {
          return (
            <div style={{ whiteSpace: 'pre-wrap' }}>
              {message.body}
            </div>
          );
        }
      default:
        return (
          <div style={{ whiteSpace: 'pre-wrap' }}>
            {message.body}
          </div>
        );
    }
  };

  if (!message) {
    return (
      <div className={`navi-message-activity ${className}`}>
        <div>No message content available</div>
      </div>
    );
  }

  return (
    <div 
      className={`navi-message-activity ${className}`}
      onFocus={() => emitActivityEvent('activity-focus')}
      onBlur={() => emitActivityEvent('activity-blur')}
    >
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              {message.subject}
            </h1>
            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>
              <span>Message • {activity.status}</span>
              <span>{new Date(activity.date).toLocaleString()}</span>
            </div>
          </div>
          {activity.status === 'ACTIVE' && !disabled && (
            <button 
              onClick={handleMarkAsRead}
              style={{
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                padding: '0.5rem 1rem',
                cursor: 'pointer'
              }}
            >
              Mark as Read
            </button>
          )}
        </div>
      </div>

      {/* Message Content */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: '0.5rem',
        padding: '1.5rem',
        marginBottom: '1.5rem'
      }}>
        {renderMessageBody()}
      </div>

      {/* Attachments */}
      {message.attachments && message.attachments.length > 0 && (
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: '0.5rem',
          padding: '1.5rem'
        }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>
            Attachments
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {message.attachments.map((attachment) => (
              <div
                key={attachment.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem',
                  backgroundColor: '#f9fafb',
                  borderRadius: '0.5rem',
                  border: '1px solid #e5e7eb'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    width: '2.5rem',
                    height: '2.5rem',
                    backgroundColor: '#dbeafe',
                    borderRadius: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <span style={{ color: '#3b82f6', fontWeight: '500', fontSize: '0.75rem' }}>
                      {attachment.type.split("/")[1]?.toUpperCase() || "FILE"}
                    </span>
                  </div>
                  <div>
                    <div style={{ fontWeight: '500' }}>
                      {attachment.name}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                      {attachment.type}
                    </div>
                  </div>
                </div>
                <a
                  href={attachment.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    border: '1px solid #d1d5db',
                    backgroundColor: '#ffffff',
                    color: '#374151',
                    padding: '0.375rem 0.75rem',
                    borderRadius: '0.375rem',
                    textDecoration: 'none',
                    fontSize: '0.875rem'
                  }}
                >
                  Download
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}