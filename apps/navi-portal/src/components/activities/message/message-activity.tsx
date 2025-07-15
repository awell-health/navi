import React, { useEffect } from "react";
import type {
  BaseActivityProps,
  MessageActivity,
} from "@awell-health/navi-core";
import { useActivityEvents } from "@/hooks/use-activity-events";
import { SlateViewer } from "@/components/ui/slate-viewer";
import { Button, Typography, Stack, HStack } from "../../ui";
import { cn } from "@/lib/utils";

export interface MessageActivityProps extends BaseActivityProps {
  activity: MessageActivity;
  onMarkAsRead?: (activityId: string) => void | Promise<void>;
}

/**
 * MessageActivity component - displays message content with unified event system
 * Uses shadcn/ui components following the Form Components Plan
 */
export function Message({
  activity,
  className = "",
  eventHandlers,
  onMarkAsRead,
}: MessageActivityProps) {
  const { emitActivityEvent } = useActivityEvents(
    activity.id,
    "MESSAGE",
    eventHandlers
  );

  const message = activity.inputs?.message;

  // Emit ready event when component mounts
  useEffect(() => {
    emitActivityEvent("activity-ready");
  }, [emitActivityEvent]);

  const handleMarkAsRead = async () => {
    try {
      if (onMarkAsRead) {
        await onMarkAsRead(activity.id);
      }

      // Emit completion event
      emitActivityEvent("activity-complete", {
        submissionData: {
          activityId: activity.id,
          action: "marked_as_read",
          timestamp: Date.now(),
        },
      });
    } catch (error) {
      emitActivityEvent("activity-error", {
        error:
          error instanceof Error ? error.message : "Failed to mark as read",
      });
    }
  };

  const renderMessageBody = () => {
    if (!message) return null;

    switch (message.format) {
      case "HTML":
        return <div dangerouslySetInnerHTML={{ __html: message.body }} />;
      case "MARKDOWN":
        // For now, render as plain text - could add markdown parser later
        return (
          <Typography.P className="whitespace-pre-wrap">
            {message.body}
          </Typography.P>
        );
      case "SLATE":
        try {
          const slateValue = JSON.parse(message.body);
          return <SlateViewer value={slateValue} />;
        } catch {
          return (
            <Typography.P className="whitespace-pre-wrap">
              {message.body}
            </Typography.P>
          );
        }
      default:
        return (
          <Typography.P className="whitespace-pre-wrap">
            {message.body}
          </Typography.P>
        );
    }
  };

  if (!message) {
    return (
      <div className={cn("navi-message-activity", className)}>
        <Typography.P>No message content available</Typography.P>
      </div>
    );
  }

  return (
    <div
      className={cn("navi-message-activity", className)}
      onFocus={() => emitActivityEvent("activity-focus")}
      onBlur={() => emitActivityEvent("activity-blur")}
    >
      <Stack spacing="sm">
        {/* Header */}
        <div>
          <Typography.H1>{message.subject}</Typography.H1>
        </div>

        {/* Message Content */}
        <div>{renderMessageBody()}</div>

        {/* Attachments */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="p-6">
            <Stack spacing="sm">
              <Typography.H3>Attachments</Typography.H3>
              <Stack spacing="xs">
                {message.attachments.map((attachment) => {
                  let attachmentTypeName = attachment.type
                    .split("/")[1]
                    ?.toUpperCase();
                  if (!attachmentTypeName || attachmentTypeName.length > 4) {
                    const suffix = attachment.name.split(".").pop();
                    attachmentTypeName =
                      suffix && suffix.length <= 4
                        ? suffix.toUpperCase()
                        : "FILE";
                  }
                  return (
                    <div
                      key={attachment.id}
                      className="flex items-center justify-between p-3 bg-muted rounded-lg border border-border"
                    >
                      <HStack spacing="xs">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <span className="text-primary font-medium text-xs">
                            {attachmentTypeName}
                          </span>
                        </div>
                        <Stack spacing="xs">
                          <Typography.Large>{attachment.name}</Typography.Large>
                          <Typography.Muted>{attachment.type}</Typography.Muted>
                        </Stack>
                      </HStack>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          window.open(
                            attachment.url,
                            "_blank",
                            "noopener,noreferrer"
                          )
                        }
                      >
                        Download
                      </Button>
                    </div>
                  );
                })}
              </Stack>
            </Stack>
          </div>
        )}
        <div className="flex justify-end">
          <Button onClick={handleMarkAsRead} variant="default">
            Mark as Read
          </Button>
        </div>
      </Stack>
    </div>
  );
}
