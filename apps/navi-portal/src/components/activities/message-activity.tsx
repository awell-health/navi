"use client";

import type {
  ActivityFragment,
  ActivityMessage,
} from "@/lib/awell-client/generated/graphql";
import { MessageFormat } from "@/lib/awell-client/generated/graphql";
import { Button } from "@/components/ui/button";

interface MessageActivityProps {
  messageActivity: ActivityFragment & { message: ActivityMessage };
  className?: string;
  onMarkAsRead?: (activityId: string) => void | Promise<void>;
}

export function MessageActivityComponent({
  messageActivity,
  className,
  onMarkAsRead,
}: MessageActivityProps) {
  const { message } = messageActivity;

  const handleMarkAsRead = async () => {
    console.log("Marking message as read:", messageActivity.id);

    if (onMarkAsRead) {
      await onMarkAsRead(messageActivity.id);
    } else {
      // Mock success feedback
      alert(
        "Message marked as read! (This is a prototype - action was logged to console)"
      );
    }
  };

  const renderMessageBody = () => {
    switch (message.format) {
      case MessageFormat.Html:
        return <div dangerouslySetInnerHTML={{ __html: message.body }} />;
      case MessageFormat.Markdown:
        // For now, render as plain text - could add markdown parser later
        return (
          <div className="whitespace-pre-wrap text-foreground">
            {message.body}
          </div>
        );
      default:
        return (
          <div className="whitespace-pre-wrap text-foreground">
            {message.body}
          </div>
        );
    }
  };

  return (
    <div className={`min-h-screen bg-background p-6 ${className || ""}`}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-2">
                {message.subject}
              </h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>Message • {messageActivity.status}</span>
                <span>{new Date(messageActivity.date).toLocaleString()}</span>
              </div>
            </div>
            {messageActivity.status === "ACTIVE" && (
              <Button onClick={handleMarkAsRead} variant="default">
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
            <div className="space-y-3">
              {message.attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
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
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href={attachment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Download
                    </a>
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
