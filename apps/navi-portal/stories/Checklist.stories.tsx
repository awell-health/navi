import { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Checklist } from "../src/components/activities/checklist/checklist-activity";
import {
  isActivityReadyEvent,
  isActivityCompleteEvent,
  isActivityErrorEvent,
  isActivityProgressEvent,
} from "../src/domains/communications/hooks/use-activity-events.client";
import { ActivityFactory } from "@awell-health/navi-core";

const meta: Meta<typeof Checklist> = {
  title: "Activities/Checklist",
  component: Checklist,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
The ChecklistActivity component displays a list of items that users can check off with progress tracking.
It supports completion tracking, progress events, and provides a unified event system.

## Typed Event System

This component uses a type-safe event system with proper type guards:
- \`ActivityReadyEvent\` - Emitted when component mounts
- \`ActivityProgressEvent\` - Emitted when items are checked/unchecked
- \`ActivityCompleteEvent\` - Emitted when checklist is completed
- \`ActivityErrorEvent\` - Emitted when an error occurs

Use type guards like \`isActivityCompleteEvent(event)\` for type-safe event handling.

## Features

- **Progress Tracking**: Visual progress indicator showing completion status
- **Individual Item Management**: Check/uncheck individual items
- **Completion Validation**: Requires all items to be checked before submission
- **Event-Driven**: Emits events for ready, progress, complete, and error states
- **Accessibility**: Full keyboard navigation and screen reader support
        `,
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    activity: {
      description: "Activity data including checklist items and metadata",
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
    onComplete: {
      description: "Callback when checklist is completed",
      action: "onComplete",
    },
    eventHandlers: {
      description: "Event handlers for activity events",
      control: "object",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Helper function to create event handlers for stories
const createEventHandlers = (storyName: string) => ({
  onActivityReady: (event: any) => {
    console.log(`[${storyName}] Activity Ready:`, event);
    if (isActivityReadyEvent(event)) {
      console.log(`[${storyName}] ✅ Activity ${event.activityId} is ready`);
    }
  },
  onActivityProgress: (event: any) => {
    console.log(`[${storyName}] Activity Progress:`, event);
    if (isActivityProgressEvent(event)) {
      console.log(
        `[${storyName}] 📊 Progress: ${event.data?.progress}/${event.data?.total}`
      );
    }
  },
  onActivityComplete: (event: any) => {
    console.log(`[${storyName}] Activity Complete:`, event);
    if (isActivityCompleteEvent(event)) {
      console.log(
        `[${storyName}] 🎉 Checklist completed:`,
        event.data?.submissionData
      );
    }
  },
  onActivityError: (event: any) => {
    console.log(`[${storyName}] Activity Error:`, event);
    if (isActivityErrorEvent(event)) {
      console.log(`[${storyName}] ❌ Error:`, event.data?.error);
    }
  },
});

export const BasicChecklist: Story = {
  args: {
    activity: ActivityFactory.create({
      id: "checklist-1",
      type: "CHECKLIST",
      status: "ACTIVE",
      date: "2024-01-15T10:30:00Z",
      inputs: {
        type: "CHECKLIST",
        checklist: {
          title: "Pre-Appointment Checklist",
          items: [
            "Review your current medications",
            "Prepare list of questions for your doctor",
            "Bring insurance card and photo ID",
            "Arrive 15 minutes early for check-in",
          ],
        },
      },
    } as any),
    disabled: false,
    className: "",
    onComplete: (activityId, data) => {
      console.log("Checklist completed:", { activityId, data });
    },
    eventHandlers: createEventHandlers("BasicChecklist"),
  },
};

export const LongChecklist: Story = {
  args: {
    activity: ActivityFactory.create({
      id: "checklist-2",
      type: "CHECKLIST",
      status: "ACTIVE",
      date: "2024-01-15T11:00:00Z",
      inputs: {
        type: "CHECKLIST",
        checklist: {
          title: "Comprehensive Health Assessment Checklist",
          items: [
            "Complete medical history questionnaire",
            "Review current medications and supplements",
            "List all allergies and adverse reactions",
            "Prepare questions about symptoms or concerns",
            "Bring insurance card and photo identification",
            "Collect recent lab results or medical records",
            "Note any family history of medical conditions",
            "Review and update emergency contact information",
            "Bring list of current healthcare providers",
            "Prepare information about lifestyle habits",
            "Note any recent changes in health status",
            "Bring comfortable clothing for examination",
            "Arrange transportation if sedation is involved",
            "Complete any required pre-visit forms",
            "Bring payment method for co-pay or deductible",
          ],
        },
      },
    } as any),
    disabled: false,
    className: "",
    onComplete: (activityId, data) => {
      console.log("Long checklist completed:", { activityId, data });
    },
    eventHandlers: createEventHandlers("LongChecklist"),
  },
};

export const ShortChecklist: Story = {
  args: {
    activity: ActivityFactory.create({
      id: "checklist-3",
      type: "CHECKLIST",
      status: "ACTIVE",
      date: "2024-01-15T11:15:00Z",
      inputs: {
        type: "CHECKLIST",
        checklist: {
          title: "Quick Safety Check",
          items: ["Wash hands thoroughly", "Wear mask if required"],
        },
      },
    } as any),
    disabled: false,
    className: "",
    onComplete: (activityId, data) => {
      console.log("Short checklist completed:", { activityId, data });
    },
    eventHandlers: createEventHandlers("ShortChecklist"),
  },
};

export const SingleItemChecklist: Story = {
  args: {
    activity: ActivityFactory.create({
      id: "checklist-4",
      type: "CHECKLIST",
      status: "ACTIVE",
      date: "2024-01-15T11:30:00Z",
      inputs: {
        type: "CHECKLIST",
        checklist: {
          title: "Consent Acknowledgment",
          items: ["I have read and understood the treatment consent form"],
        },
      },
    } as any),
    disabled: false,
    className: "",
    onComplete: (activityId, data) => {
      console.log("Single item checklist completed:", { activityId, data });
    },
    eventHandlers: createEventHandlers("SingleItemChecklist"),
  },
};

export const EmptyChecklist: Story = {
  args: {
    activity: ActivityFactory.create({
      id: "checklist-5",
      type: "CHECKLIST",
      status: "ACTIVE",
      date: "2024-01-15T11:45:00Z",
      inputs: {
        type: "CHECKLIST",
        checklist: {
          title: "Empty Checklist",
          items: [],
        },
      },
    } as any),
    disabled: false,
    className: "",
    onComplete: (activityId, data) => {
      console.log("Empty checklist completed:", { activityId, data });
    },
    eventHandlers: createEventHandlers("EmptyChecklist"),
  },
};

export const MedicalProcedureChecklist: Story = {
  args: {
    activity: ActivityFactory.create({
      id: "checklist-6",
      type: "CHECKLIST",
      status: "ACTIVE",
      date: "2024-01-15T12:00:00Z",
      inputs: {
        type: "CHECKLIST",
        checklist: {
          title: "Pre-Surgery Preparation",
          items: [
            "Fast for 8+ hours before procedure",
            "Remove all jewelry and metal objects",
            "Arrange ride home after procedure",
            "Take prescribed pre-procedure medications",
            "Complete pre-anesthesia questionnaire",
            "Confirm procedure time with hospital",
            "Bring advance directives if applicable",
            "Wear comfortable, loose-fitting clothes",
            "Leave valuables at home",
            "Confirm emergency contact information",
          ],
        },
      },
    } as any),
    disabled: false,
    className: "",
    onComplete: (activityId, data) => {
      console.log("Medical procedure checklist completed:", {
        activityId,
        data,
      });
    },
    eventHandlers: createEventHandlers("MedicalProcedureChecklist"),
  },
};

export const DisabledChecklist: Story = {
  args: {
    activity: ActivityFactory.create({
      id: "checklist-7",
      type: "CHECKLIST",
      status: "ACTIVE",
      date: "2024-01-15T12:15:00Z",
      inputs: {
        type: "CHECKLIST",
        checklist: {
          title: "Disabled Checklist Example",
          items: [
            "This checklist is disabled",
            "Items cannot be checked",
            "Submit button is disabled",
            "Used for read-only display",
          ],
        },
      },
    } as any),
    disabled: true,
    className: "",
    onComplete: (activityId, data) => {
      console.log("Disabled checklist completed:", { activityId, data });
    },
    eventHandlers: createEventHandlers("DisabledChecklist"),
  },
};

export const CustomStyledChecklist: Story = {
  args: {
    activity: ActivityFactory.create({
      id: "checklist-8",
      type: "CHECKLIST",
      status: "ACTIVE",
      date: "2024-01-15T12:30:00Z",
      inputs: {
        type: "CHECKLIST",
        checklist: {
          title: "Custom Styled Checklist",
          items: [
            "Custom styling applied via className",
            "Demonstrates theming capabilities",
            "Maintains accessibility standards",
            "Supports custom CSS classes",
          ],
        },
      },
    } as any),
    disabled: false,
    className: "border-2 border-blue-500 rounded-lg p-4",
    onComplete: (activityId, data) => {
      console.log("Custom styled checklist completed:", { activityId, data });
    },
    eventHandlers: createEventHandlers("CustomStyledChecklist"),
  },
};

export const MissingChecklistData: Story = {
  args: {
    activity: ActivityFactory.create({
      id: "checklist-9",
      type: "CHECKLIST",
      status: "ACTIVE",
      date: "2024-01-15T12:45:00Z",
      inputs: {
        type: "CHECKLIST",
        checklist: null,
      },
    } as any),
    disabled: false,
    className: "",
    onComplete: (activityId, data) => {
      console.log("Missing checklist data completed:", { activityId, data });
    },
    eventHandlers: createEventHandlers("MissingChecklistData"),
  },
};

export const EventHandlingDemo: Story = {
  args: {
    activity: ActivityFactory.create({
      id: "checklist-10",
      type: "CHECKLIST",
      status: "ACTIVE",
      date: "2024-01-15T13:00:00Z",
      inputs: {
        type: "CHECKLIST",
        checklist: {
          title: "Event Handling Demonstration",
          items: [
            "Check this item to see progress event",
            "Check this item to see another progress event",
            "Check this final item to see completion event",
          ],
        },
      },
    } as any),
    disabled: false,
    className: "",
    onComplete: (activityId, data) => {
      console.log("Event handling demo completed:", { activityId, data });
    },
    eventHandlers: {
      onActivityReady: (event) => {
        console.log("🚀 Activity Ready:", event);
      },
      onActivityProgress: (event) => {
        console.log("📊 Progress Update:", event);
        if (isActivityProgressEvent(event)) {
          const { progress, total } = event.data || {};
        }
      },
      onActivityComplete: (event) => {
        console.log("🎉 Checklist Complete:", event);
        if (isActivityCompleteEvent(event)) {
        }
      },
      onActivityError: (event) => {
        console.log("❌ Error:", event);
      },
    },
  },
};
