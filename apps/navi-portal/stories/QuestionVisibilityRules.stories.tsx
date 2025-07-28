import type { Meta, StoryObj } from "@storybook/react";
import { UnifiedFormRenderer } from "@/components/activities/form/unified-form/unified-form-renderer";
import { createFormActivity } from "./storybook-helpers";
import type { UnifiedFormConfig } from "@/components/activities/form/unified-form/types";

const meta: Meta<typeof UnifiedFormRenderer> = {
  title: "Forms/Question Visibility Rules",
  component: UnifiedFormRenderer,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof meta>;

// Mock form activity with questions that have visibility rules
const formActivityWithRules = createFormActivity({
  inputs: {
    __typename: "FormActivityInput",
    form: {
      id: "visibility-demo-form",
      key: "visibility-demo-form",
      title: "Question Visibility Rules Demo",
      questions: [
        {
          id: "q1",
          key: "q1",
          title: "Do you have symptoms?",
          dataPointValueType: "BOOLEAN",
          user_question_type: "YES_NO",
          questionType: "YES_NO",
          rule: null, // No rule - always visible
        },
        {
          id: "q2", 
          key: "q2",
          title: "What symptoms do you have?",
          dataPointValueType: "STRING",
          user_question_type: "SHORT_TEXT", 
          questionType: "SHORT_TEXT",
          rule: {
            id: "rule-q2",
            boolean_operator: "and",
            conditions: [
              {
                id: "cond-q2",
                reference: "q1", // References previous question
                operator: "eq",
                operand: {
                  value: "true",
                  type: "boolean",
                },
              },
            ],
          },
        },
        {
          id: "q3",
          key: "q3", 
          title: "How long have you had symptoms?",
          dataPointValueType: "STRING",
          user_question_type: "SHORT_TEXT",
          questionType: "SHORT_TEXT", 
          rule: {
            id: "rule-q3",
            boolean_operator: "and",
            conditions: [
              {
                id: "cond-q3",
                reference: "q1", // Also references first question
                operator: "eq",
                operand: {
                  value: "true", 
                  type: "boolean",
                },
              },
            ],
          },
        },
        {
          id: "q4",
          key: "q4",
          title: "Any additional notes?", 
          dataPointValueType: "STRING",
          user_question_type: "LONG_TEXT",
          questionType: "LONG_TEXT",
          rule: null, // No rule - always visible
        },
      ],
    },
  },
});

const defaultConfig: UnifiedFormConfig = {
  mode: "traditional",
  showProgress: true,
  navigationText: {
    next: "Next",
    previous: "Previous", 
    submit: "Submit",
  },
};

export const ConditionalQuestions: Story = {
  args: {
    activity: formActivityWithRules,
    config: defaultConfig,
    disabled: false,
    eventHandlers: {
      "activity-question-shown": (event) => {
        console.log("Question shown:", event);
      },
      "activity-question-hidden": (event) => {
        console.log("Question hidden:", event);
      },
      "activity-data-change": (event) => {
        console.log("Data changed:", event);
      },
    },
    onSubmit: (activityId, data) => {
      console.log("Form submitted:", { activityId, data });
      alert(`Form submitted! Data: ${JSON.stringify(data, null, 2)}`);
    },
  },
  parameters: {
    docs: {
      description: {
        story: `
This story demonstrates question visibility rules in action:

1. **Question 1** ("Do you have symptoms?") - Always visible (no rule)
2. **Question 2** ("What symptoms do you have?") - Only visible when Q1 = "Yes" 
3. **Question 3** ("How long have you had symptoms?") - Only visible when Q1 = "Yes"
4. **Question 4** ("Any additional notes?") - Always visible (no rule)

**Test Instructions:**
- Initially, only Questions 1 and 4 should be visible
- Answer "Yes" to Question 1 → Questions 2 and 3 should appear
- Answer "No" to Question 1 → Questions 2 and 3 should disappear
- Check the browser console for visibility change events
- Submit the form to see that only visible question data is included

**Key Features Demonstrated:**
- Forward-only rule references (DAG property)
- Real-time rule evaluation
- Smooth show/hide transitions
- Data filtering (hidden questions don't submit)
- Activity event emission
- Graceful error handling
        `,
      },
    },
  },
};

// Demo with multiple rule types
const formActivityWithComplexRules = createFormActivity({
  inputs: {
    __typename: "FormActivityInput",
    form: {
      id: "complex-rules-form",
      key: "complex-rules-form", 
      title: "Complex Visibility Rules Demo",
      questions: [
        {
          id: "age",
          key: "age",
          title: "What is your age?",
          dataPointValueType: "NUMBER",
          user_question_type: "NUMBER",
          questionType: "NUMBER",
          rule: null,
        },
        {
          id: "adult_question",
          key: "adult_question",
          title: "Are you employed?",
          dataPointValueType: "BOOLEAN", 
          user_question_type: "YES_NO",
          questionType: "YES_NO",
          rule: {
            id: "rule-adult",
            boolean_operator: "and",
            conditions: [
              {
                id: "cond-adult",
                reference: "age",
                operator: "gte", // Greater than or equal
                operand: {
                  value: "18",
                  type: "number",
                },
              },
            ],
          },
        },
        {
          id: "minor_question", 
          key: "minor_question",
          title: "What grade are you in?",
          dataPointValueType: "STRING",
          user_question_type: "SHORT_TEXT",
          questionType: "SHORT_TEXT",
          rule: {
            id: "rule-minor",
            boolean_operator: "and", 
            conditions: [
              {
                id: "cond-minor",
                reference: "age",
                operator: "lt", // Less than
                operand: {
                  value: "18",
                  type: "number",
                },
              },
            ],
          },
        },
      ],
    },
  },
});

export const AgeBasedQuestions: Story = {
  args: {
    activity: formActivityWithComplexRules,
    config: defaultConfig,
    disabled: false,
    eventHandlers: {
      "activity-question-shown": (event) => {
        console.log("Question shown:", event);
      },
      "activity-question-hidden": (event) => {
        console.log("Question hidden:", event);
      },
    },
    onSubmit: (activityId, data) => {
      console.log("Form submitted:", { activityId, data });
      alert(`Form submitted! Data: ${JSON.stringify(data, null, 2)}`);
    },
  },
  parameters: {
    docs: {
      description: {
        story: `
This story demonstrates numeric comparison rules:

1. **Age Question** - Always visible
2. **Employment Question** - Only visible when age >= 18
3. **Grade Question** - Only visible when age < 18

**Test Instructions:**
- Enter an age < 18 → Only "Grade" question appears
- Enter an age >= 18 → Only "Employment" question appears
- Try edge cases like exactly 18

**Features Demonstrated:**
- Numeric comparison operators (gte, lt)
- Mutually exclusive question visibility
- Real-time re-evaluation on input change
        `,
      },
    },
  },
};

// Demo with conversational mode
export const ConversationalWithRules: Story = {
  args: {
    activity: formActivityWithRules,
    config: {
      mode: "conversational",
      showProgress: true,
    },
    disabled: false,
    onSubmit: (activityId, data) => {
      console.log("Conversational form submitted:", { activityId, data });
      alert(`Conversational form submitted! Data: ${JSON.stringify(data, null, 2)}`);
    },
  },
  parameters: {
    docs: {
      description: {
        story: `
Same visibility rules as the first story, but in **conversational mode**.

This demonstrates that question visibility rules work seamlessly across different form rendering modes.
        `,
      },
    },
  },
};