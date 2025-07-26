import { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Message } from "../src/components/activities/message/message-activity";
import {
  isActivityReadyEvent,
  isActivityCompleteEvent,
  isActivityErrorEvent,
} from "../src/domains/communications/hooks/use-activity-events.client";
import { createMessageActivity } from "./storybook-helpers";

const messageActivity = {
  id: "UvMjkfriBXBk3upd7zdwd",
  action: "ASSIGNED",
  careflow_id: "NX9Hw12TBclt",
  container_name: "step w/message and checklist",
  date: "2025-07-11T16:27:06.836Z",
  indirect_object: {
    id: "Eh4UQbKZKBk6hKd0M7wKk",
    type: "PATIENT",
    name: "jb belanger",
    email: "jbb@jbb.dev",
    preferred_language: "en",
    __typename: "ActivityObject",
  },
  is_user_activity: true,
  object: {
    id: "iPyqvjlkDeu1u6VmkfrmI",
    type: "MESSAGE",
    name: "here's a message",
    email: null,
    preferred_language: null,
    __typename: "ActivityObject",
  },
  pathway_definition_id: "1CnTTHNYM1Q3",
  reference_id: "PathwayNavigationNode/290403391",
  reference_type: "NAVIGATION",
  resolution: null,
  session_id: null,
  status: "ACTIVE",
  tenant_id: "_v0nvLX5zCNd",
  sub_activities: [
    {
      id: "0ICPXVnnpr8iBV9HDr6WV",
      action: "ACTIVATE",
      object: null,
      __typename: "SubActivity",
    },
    {
      id: "u7j16piYFemGzT8vBg7VU",
      action: "SEND",
      object: null,
      __typename: "SubActivity",
    },
  ],
  inputs: {
    __typename: "MessageActivityInput",
    type: "MESSAGE",
    message: {
      id: "iPyqvjlkDeu1u6VmkfrmI",
      subject: "here's a message",
      body: '<h1 class="slate-h1">heading 1</h1><h2 class="slate-h2">heading 2</h2><h3 class="slate-h3">heading 3</h3><p class="slate-p">Something <strong class="slate-bold">bold </strong>something <em class="slate-italic">italic</em> something <u class="slate-underline">underlined</u>. oh, and don\'t forget to <s class="slate-strikethrough">cross something out</s>. finally, let\'s use a <a rel="noreferrer" target="_blank" href="https://awellhealth.com">link</a></p><ul class="slate-ul"><li class="slate-li"><div style="position:relative">bullet 1</div></li><li class="slate-li"><div style="position:relative">bullet 2</div></li></ul><p class="slate-p"></p><ol class="slate-ol"><li class="slate-li"><div style="position:relative">number 1</div></li><li class="slate-li"><div style="position:relative">number 2</div></li></ol><p class="slate-p"></p><div class="slate-img"><div><figure class="slate-ImageElement-figure"><div class="slate-ImageElement-resizable" style="position:relative;user-select:auto;width:100%;height:100%;max-width:100%;min-width:92px;box-sizing:border-box;flex-shrink:0"><img alt="" src="https://res.cloudinary.com/da7x4rzl4/image/upload/v1752192989/DEV SANDBOX - Awell Studio - TextEditor - Image upload/mjqpsbmxexbm38pbzkpd.jpg" class="slate-ImageElement-img"><div><div style="position:absolute;user-select:none;width:10px;height:100%;top:0px;left:0;cursor:col-resize"><div class="slate-ImageElement-handleLeft"></div></div><div style="position:absolute;user-select:none;width:10px;height:100%;top:0px;right:0;cursor:col-resize"><div class="slate-ImageElement-handleRight"></div></div></div></div></figure></div></div><p class="slate-p">let\'s forget about the attachment and video for now.</p>',
      format: "HTML",
      attachments: null,
      __typename: "ActivityMessage",
    },
  },
  outputs: null,
  __typename: "Activity",
};

const meta: Meta<typeof Message> = {
  title: "Activities/Message",
  component: Message,
  parameters: {
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
type Story = StoryObj<typeof Message>;

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
    activity: createMessageActivity({
      inputs: {
        __typename: "MessageActivityInput",
        type: "MESSAGE",
        message: messageActivity.inputs.message,
      },
    }),
    eventHandlers: createEventHandlers("BasicMessage"),
  },
};

export const HTMLWithAttachments: Story = {
  args: {
    activity: createMessageActivity({
      id: "msg-2",
      status: "ACTIVE",
      date: "2024-01-15T14:45:00Z",
      inputs: {
        type: "MESSAGE",
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
    } as any),
    eventHandlers: createEventHandlers("HTMLWithAttachments"),
  },
};

export const MarkdownMessage: Story = {
  args: {
    activity: createMessageActivity({
      id: "msg-3",
      status: "ACTIVE",
      date: "2024-01-16T09:15:00Z",
      inputs: {
        type: "MESSAGE",
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
    } as any),
    eventHandlers: createEventHandlers("MarkdownMessage"),
  },
};

export const CompletedMessage: Story = {
  args: {
    activity: createMessageActivity({
      id: "msg-4",
      status: "ACTIVE",
      date: "2024-01-14T16:20:00Z",
      inputs: {
        type: "MESSAGE",
        message: {
          id: "msg-4",
          subject: "Appointment Confirmation",
          body: "Your appointment has been confirmed for January 20th at 2:00 PM. Please arrive 15 minutes early.",
          format: "HTML",
        },
      },
    } as any),
    eventHandlers: createEventHandlers("CompletedMessage"),
  },
};

export const ErrorHandling: Story = {
  args: {
    activity: createMessageActivity({
      id: "msg-5",
      status: "ACTIVE",
      date: "2024-01-15T11:00:00Z",
      inputs: {
        type: "MESSAGE",
        message: {
          id: "msg-5",
          subject: "Test Error Handling",
          body: "This message will simulate an error when marking as read. Check the console to see the typed error event.",
          format: "HTML",
        },
      },
    } as any),
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
    activity: createMessageActivity({
      id: "msg-6",
      status: "ACTIVE",
      date: "2024-01-15T13:30:00Z",
      inputs: {
        type: "MESSAGE",
        message: {
          id: "msg-6",
          subject: "Disabled Message",
          body: "This message is in disabled state - the Mark as Read button should not be clickable.",
          format: "HTML",
        },
      },
    } as any),
    disabled: true,
    eventHandlers: createEventHandlers("DisabledState"),
  },
};

export const NoMessageContent: Story = {
  args: {
    activity: createMessageActivity({
      id: "msg-7",
      status: "ACTIVE",
      date: "2024-01-15T15:00:00Z",
      inputs: {
        type: "MESSAGE",
      },
    } as any),
    eventHandlers: createEventHandlers("NoMessageContent"),
  },
};

export const SlateFormatMessage: Story = {
  args: {
    activity: createMessageActivity({
      id: "msg-8",
      status: "ACTIVE",
      date: "2024-01-16T10:00:00Z",
      inputs: {
        type: "MESSAGE",
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
    } as any),
    eventHandlers: createEventHandlers("SlateFormat"),
  },
};
