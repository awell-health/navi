import { Meta, StoryObj } from "@storybook/react-vite";
import { MessageActivity } from "../activity-types/message/message-activity";
import {
  isActivityReadyEvent,
  isActivityCompleteEvent,
  isActivityErrorEvent,
} from "../hooks/use-activity-events";

const meta: Meta<typeof MessageActivity> = {
  title: "Activities/MessageActivity",
  component: MessageActivity,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
The MessageActivity component displays message content with a unified event system.
It supports HTML, Markdown, and Slate formats, and includes attachment handling.

## Typed Event System

This component uses a type-safe event system with proper type guards:
- \`ActivityReadyEvent\` - Emitted when component mounts
- \`ActivityCompleteEvent\` - Emitted when message is marked as read  
- \`ActivityErrorEvent\` - Emitted when an error occurs

Use type guards like \`isActivityCompleteEvent(event)\` for type-safe event handling.
        `,
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    activity: {
      description: "Activity data including message content",
      control: "object",
    },
    disabled: {
      description: "Whether the component is disabled",
      control: "boolean",
    },
    className: {
      description: "Additional CSS class names",
      control: "text",
    },
    onMarkAsRead: {
      description: "Callback when message is marked as read",
      action: "onMarkAsRead",
    },
    eventHandlers: {
      description: "Typed event handlers for activity events",
      control: "object",
    },
  },
};

export default meta;
type Story = StoryObj<typeof MessageActivity>;

// Common event handlers for demonstrations
const createEventHandlers = (storyName: string) => ({
  onActivityReady: (event: any) => {
    if (isActivityReadyEvent(event)) {
      console.log(`📋 [${storyName}] Message ready:`, event.activityId);
    }
  },
  onActivityComplete: (event: any) => {
    if (isActivityCompleteEvent(event)) {
      console.log(
        `✅ [${storyName}] Message completed:`,
        event.data?.submissionData
      );
    }
  },
  onActivityError: (event: any) => {
    if (isActivityErrorEvent(event)) {
      console.error(`❌ [${storyName}] Message error:`, event.data?.error);
    }
  },
  onActivityFocus: (event: any) => {
    console.log(`🎯 [${storyName}] Message focused`);
  },
  onActivityBlur: (event: any) => {
    console.log(`👋 [${storyName}] Message blurred`);
  },
});

export const BasicMessage: Story = {
  args: {
    activity: {
      id: "msg-1",
      status: "ACTIVE",
      date: "2024-01-15T10:30:00Z",
      inputs: {
        message: {
          id: "msg-1",
          subject: "Welcome to Your Care Plan",
          body: "Hello! This is your personalized care plan. Please review the information below and let us know if you have any questions.",
          format: "HTML",
        },
      },
    },
    eventHandlers: createEventHandlers("BasicMessage"),
  },
};

export const HTMLWithAttachments: Story = {
  args: {
    activity: {
      id: "msg-2",
      status: "ACTIVE",
      date: "2024-01-15T14:45:00Z",
      inputs: {
        message: {
          id: "msg-2",
          subject: "Lab Results Available",
          body: `
            <h3 class="slate-h3">Your Recent Lab Results</h3>
            <p>Your lab results from January 10th are now available. Key findings:</p>
            <ul>
              <li><strong>Cholesterol:</strong> Within normal range</li>
              <li><strong>Blood Sugar:</strong> Slightly elevated - please review attached diet plan</li>
              <li><strong>Blood Pressure:</strong> Normal</li>
            </ul>
            <p><em>Please download the attached reports and diet recommendations.</em></p>
          `,
          format: "HTML",
          attachments: [
            {
              id: "att-1",
              name: "Lab_Results_Jan_2024.pdf",
              type: "application/pdf",
              url: "/files/lab-results.pdf",
            },
            {
              id: "att-2",
              name: "Diet_Plan.pdf",
              type: "application/pdf",
              url: "/files/diet-plan.pdf",
            },
            {
              id: "att-3",
              name: "Exercise_Guidelines.docx",
              type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
              url: "/files/exercise.docx",
            },
          ],
        },
      },
    },
    eventHandlers: createEventHandlers("HTMLWithAttachments"),
  },
};

export const MarkdownMessage: Story = {
  args: {
    activity: {
      id: "msg-3",
      status: "ACTIVE",
      date: "2024-01-16T09:15:00Z",
      inputs: {
        message: {
          id: "msg-3",
          subject: "Medication Reminder",
          body: `# Important Medication Update

## New Prescription Instructions

**Medication:** Metformin 500mg  
**Dosage:** Take twice daily with meals  
**Duration:** 30 days  

### Important Notes:
- Take with food to reduce stomach upset
- Monitor blood sugar levels daily
- Contact your doctor if you experience any side effects

### Next Steps:
1. Pick up prescription from pharmacy
2. Schedule follow-up appointment in 2 weeks
3. Continue current diet and exercise plan

*Questions? Contact your care team at any time.*`,
          format: "MARKDOWN",
        },
      },
    },
    eventHandlers: createEventHandlers("MarkdownMessage"),
  },
};

export const CompletedMessage: Story = {
  args: {
    activity: {
      id: "msg-4",
      status: "COMPLETED",
      date: "2024-01-14T16:20:00Z",
      inputs: {
        message: {
          id: "msg-4",
          subject: "Appointment Confirmation",
          body: "Your appointment has been confirmed for January 20th at 2:00 PM. Please arrive 15 minutes early.",
          format: "HTML",
        },
      },
    },
    eventHandlers: createEventHandlers("CompletedMessage"),
  },
};

export const ErrorHandling: Story = {
  args: {
    activity: {
      id: "msg-5",
      status: "ACTIVE",
      date: "2024-01-15T11:00:00Z",
      inputs: {
        message: {
          id: "msg-5",
          subject: "Test Error Handling",
          body: "This message will simulate an error when marking as read. Check the console to see the typed error event.",
          format: "HTML",
        },
      },
    },
    onMarkAsRead: async () => {
      // Simulate an API error
      throw new Error("Network error: Unable to mark message as read");
    },
    eventHandlers: {
      ...createEventHandlers("ErrorHandling"),
      onActivityError: (event: any) => {
        if (isActivityErrorEvent(event)) {
          console.error(`❌ [ErrorHandling] Error details:`, event.data);
          alert(`Error occurred: ${event.data?.error}`);
        }
      },
    },
  },
};

export const DisabledState: Story = {
  args: {
    activity: {
      id: "msg-6",
      status: "ACTIVE",
      date: "2024-01-15T13:30:00Z",
      inputs: {
        message: {
          id: "msg-6",
          subject: "Disabled Message",
          body: "This message is in disabled state - the Mark as Read button should not be clickable.",
          format: "HTML",
        },
      },
    },
    disabled: true,
    eventHandlers: createEventHandlers("DisabledState"),
  },
};

export const NoMessageContent: Story = {
  args: {
    activity: {
      id: "msg-7",
      status: "ACTIVE",
      date: "2024-01-15T15:00:00Z",
      inputs: {},
    },
    eventHandlers: createEventHandlers("NoMessageContent"),
  },
};

export const SlateFormatMessage: Story = {
  args: {
    activity: {
      id: "msg-8",
      status: "ACTIVE",
      date: "2024-01-16T10:00:00Z",
      inputs: {
        message: {
          id: "msg-8",
          subject: "Rich Text Content",
          body: JSON.stringify([
            {
              type: "paragraph",
              children: [
                { text: "This is a " },
                { text: "bold", bold: true },
                { text: " word, and this is " },
                { text: "italic", italic: true },
                { text: " text." },
              ],
            },
            {
              type: "paragraph",
              children: [
                { text: "This is a new paragraph with some content." },
              ],
            },
          ]),
          format: "SLATE",
        },
      },
    },
    eventHandlers: createEventHandlers("SlateFormat"),
  },
};
