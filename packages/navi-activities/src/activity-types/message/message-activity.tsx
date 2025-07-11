import React, { useEffect } from 'react';
import type { BaseActivityProps, MessageActivityData } from '@awell-health/navi-core';
import { useActivityEvents } from '../../hooks/use-activity-events';
import { SlateViewer } from '../../components/slate-viewer';
import { Button } from '../../components/ui';
import { cn } from '../../lib/utils';

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
 * Uses shadcn/ui components following the Form Components Plan
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
          <div className="whitespace-pre-wrap text-foreground">
            {message.body}
          </div>
        );
      case 'SLATE':
        try {
          const slateValue = JSON.parse(message.body);
          return <SlateViewer value={slateValue} />;
        } catch {
          return (
            <div className="whitespace-pre-wrap text-foreground">
              {message.body}
            </div>
          );
        }
      default:
        return (
          <div className="whitespace-pre-wrap text-foreground">
            {message.body}
          </div>
        );
    }
  };

  if (!message) {
    return (
      <div className={cn("navi-message-activity", className)}>
        <div>No message content available</div>
      </div>
    );
  }

  return (
    <div 
      className={cn("navi-message-activity", className)}
      onFocus={() => emitActivityEvent('activity-focus')}
      onBlur={() => emitActivityEvent('activity-blur')}
    >
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              {message.subject}
            </h1>
            <div className="flex gap-4 text-sm text-muted-foreground">
              <span>Message • {activity.status}</span>
              <span>{new Date(activity.date).toLocaleString()}</span>
            </div>
          </div>
          {activity.status === 'ACTIVE' && !disabled && (
            <Button onClick={handleMarkAsRead}>
              Mark as Read
            </Button>
          )}
        </div>
      </div>

      {/* Message Content */}
      <div className="bg-card border border-border rounded-lg p-6 mb-6">
        {renderMessageBody()}
      </div>

      {/* Attachments */}
      {message.attachments && message.attachments.length > 0 && (
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Attachments
          </h3>
          <div className="flex flex-col gap-3">
            {message.attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex items-center justify-between p-3 bg-muted rounded-lg border border-border"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <span className="text-primary font-medium text-sm">
                      {attachment.type.split("/")[1]?.toUpperCase() || "FILE"}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-foreground">
                      {attachment.name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {attachment.type}
                    </div>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.open(attachment.url, '_blank', 'noopener,noreferrer')}
                >
                  Download
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}