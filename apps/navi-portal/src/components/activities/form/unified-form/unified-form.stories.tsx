import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import React from "react";
import { UnifiedFormRenderer } from "./unified-form-renderer";
import type { FormRenderConfig } from "./types";
import storybookActivities from "../../storybook-activities.json";
import type { FormActivity } from "@awell-health/navi-core";

const meta: Meta<typeof UnifiedFormRenderer> = {
  title: "Activities/Form/UnifiedFormRenderer",
  component: UnifiedFormRenderer,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "A unified form renderer that supports traditional (all questions on one page), conversational (one question per page), and custom page break configurations. Built with react-hook-form and the new question component architecture.",
      },
    },
  },
  tags: ["autodocs"],
  args: {
    disabled: false,
  },
};

export default meta;
type Story = StoryObj<typeof UnifiedFormRenderer>;

// Extract form activities from storybook data
const activities = storybookActivities.data.pathwayActivities.activities;

// Form with comprehensive validation and multiple question types
const comprehensiveFormActivity = activities.find(
  (activity: Record<string, unknown>) =>
    activity.inputs &&
    typeof activity.inputs === "object" &&
    activity.inputs !== null &&
    "__typename" in activity.inputs &&
    activity.inputs.__typename === "FormActivityInput" &&
    "form" in activity.inputs &&
    activity.inputs.form &&
    typeof activity.inputs.form === "object" &&
    activity.inputs.form !== null &&
    "title" in activity.inputs.form &&
    activity.inputs.form.title === "form with many input validations"
) as unknown as FormActivity;

// Form with all question types
const allQuestionTypesFormActivity = activities.find(
  (activity: Record<string, unknown>) =>
    activity.inputs &&
    typeof activity.inputs === "object" &&
    activity.inputs !== null &&
    "__typename" in activity.inputs &&
    activity.inputs.__typename === "FormActivityInput" &&
    "form" in activity.inputs &&
    activity.inputs.form &&
    typeof activity.inputs.form === "object" &&
    activity.inputs.form !== null &&
    "title" in activity.inputs.form &&
    activity.inputs.form.title === "Form with all question types"
) as unknown as FormActivity;

// Traditional form configuration
const traditionalConfig: FormRenderConfig = {
  mode: "traditional",
  showProgress: false,
};

// Conversational form configuration
const conversationalConfig: FormRenderConfig = {
  mode: "conversational",
  showProgress: true,
  navigationText: {
    next: "Continue",
    previous: "Back",
    submit: "Complete Form",
  },
};

// Custom page break configuration - group related questions together
const customConfig: FormRenderConfig = {
  mode: "custom",
  pageBreakAfterQuestions: [
    "lastName", // Name page
    "europeanPhoneNumber", // Contact page
    "pastDate", // Dates page
    "imageUpload", // Files page
  ],
  showProgress: true,
  navigationText: {
    next: "Next Section",
    previous: "Previous Section",
    submit: "Submit Form",
  },
};

const handleFormSubmit = (
  activityId: string,
  data: Record<string, unknown>
) => {
  console.log("🎯 Form submitted:", { activityId, data });
  alert(
    `Form submitted successfully!\n\nCheck console for details.\n\nActivity ID: ${activityId}`
  );
};

// Stories
export const Traditional: Story = {
  args: {
    activity: comprehensiveFormActivity,
    config: traditionalConfig,
    onSubmit: handleFormSubmit,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Traditional form mode shows all questions on a single page. Best for shorter forms or when users prefer to see everything at once.",
      },
    },
  },
};

export const Conversational: Story = {
  args: {
    activity: comprehensiveFormActivity,
    config: conversationalConfig,
    onSubmit: handleFormSubmit,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Conversational form mode shows one question per page, similar to Typeform. Great for longer forms and improving completion rates.",
      },
    },
  },
};

export const CustomPageBreaks: Story = {
  args: {
    activity: comprehensiveFormActivity,
    config: customConfig,
    onSubmit: handleFormSubmit,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Custom mode allows you to define exactly where page breaks occur. This example groups related questions into logical sections: Names, Contact Info, Dates, and File Uploads.",
      },
    },
  },
};

export const AllQuestionTypes: Story = {
  args: {
    activity: allQuestionTypesFormActivity,
    config: {
      mode: "conversational",
      showProgress: true,
      navigationText: {
        next: "Next Question",
        previous: "Previous Question",
        submit: "Complete",
      },
    },
    onSubmit: handleFormSubmit,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Demonstrates all available question types in conversational mode: description, multiple choice, multiple select, yes/no, slider, date, email, number, text, phone, and ICD-10.",
      },
    },
  },
};

export const WithActivityEvents: Story = {
  args: {
    activity: comprehensiveFormActivity,
    config: {
      mode: "traditional",
      showProgress: false,
    },
    onSubmit: handleFormSubmit,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Open your browser console to see activity events: activity-ready, activity-data-change, activity-progress, activity-focus, activity-blur, activity-complete.",
      },
    },
  },
  render: (args) => {
    return (
      <div className="space-y-4">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800 text-sm font-medium">
            🎯 Activity Events Demo
          </p>
          <p className="text-blue-600 text-xs mt-1">
            Open your browser console to see activity events as you interact
            with the form.
          </p>
        </div>
        <UnifiedFormRenderer {...args} />
      </div>
    );
  },
};
