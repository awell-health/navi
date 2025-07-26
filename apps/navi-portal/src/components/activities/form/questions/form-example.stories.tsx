import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { DescriptionQuestion } from "./description-question";
import { ShortTextQuestion } from "./short-text-question";
import type { Question } from "@/lib/awell-client/generated/graphql";

const meta: Meta = {
  title: "Components/Form Questions/Activity Events Demo",
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Demonstrates activity events from @activity-event.ts using react-hook-form",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

// Sample questions for demo
const descriptionQuestion: Question = {
  id: "description-1",
  key: "welcomeDescription",
  title:
    '<h2 class="slate-h2">Activity Events Demo</h2><p class="slate-p">Fill out the form below and check the console for activity events.</p>',
  definition_id: "welcome",
  question_type: "NO_INPUT",
  user_question_type: "DESCRIPTION",
  data_point_value_type: null,
  is_required: false,
  options: [],
  config: null,
  rule: null,
};

const firstNameQuestion: Question = {
  id: "firstName",
  key: "firstName",
  title: "What is your first name?",
  definition_id: "firstName",
  question_type: "INPUT",
  user_question_type: "SHORT_TEXT",
  data_point_value_type: "STRING",
  is_required: false,
  options: [],
  config: {
    recode_enabled: false,
    use_select: null,
    mandatory: false,
    slider: null,
    phone: null,
    number: null,
    multiple_select: null,
    date_validation: null,
    file_storage: null,
    input_validation: {
      mode: "simple",
      pattern: null,
      helper_text: "Enter your first name",
      simpleConfig: null,
    },
  },
  rule: null,
};

const lastNameQuestion: Question = {
  id: "lastName",
  key: "lastName",
  title: "What is your last name?",
  definition_id: "lastName",
  question_type: "INPUT",
  user_question_type: "SHORT_TEXT",
  data_point_value_type: "STRING",
  is_required: false,
  options: [],
  config: {
    recode_enabled: false,
    use_select: null,
    mandatory: false,
    slider: null,
    phone: null,
    number: null,
    multiple_select: null,
    date_validation: null,
    file_storage: null,
    input_validation: {
      mode: "simple",
      pattern: null,
      helper_text: "Enter your last name",
      simpleConfig: null,
    },
  },
  rule: null,
};

const questions = [descriptionQuestion, firstNameQuestion, lastNameQuestion];

function ActivityEventsDemoComponent() {
  const initialValues = {
    firstName: "",
    lastName: "",
  };
  const {
    control,
    handleSubmit,
    formState: { isDirty },
    watch,
  } = useForm<{ firstName: string; lastName: string }>({
    mode: "onChange",
    defaultValues: initialValues,
  });

  // Simulate activity-ready event when component mounts
  useEffect(() => {
    console.log("🎯 Activity Event:", {
      type: "activity-ready",
      activityId: "demo-form",
      activityType: "FORM",
      timestamp: Date.now(),
    });
  }, []);

  // Watch for activity-data-change events
  useEffect(() => {
    const subscription = watch((data, { name, type }) => {
      if (
        name &&
        type === "change" &&
        (name === "firstName" || name === "lastName")
      ) {
        console.log("🎯 Activity Event:", {
          type: "activity-data-change",
          activityId: "demo-form",
          activityType: "FORM",
          data: {
            field: name,
            value: data[name],
            currentData: data,
          },
          timestamp: Date.now(),
        });

        // Calculate progress
        const answeredFields = Object.values(data).filter(
          (value) => value && value !== ""
        ).length;
        const totalFields = Object.keys(data).length;

        console.log("🎯 Activity Event:", {
          type: "activity-progress",
          activityId: "demo-form",
          activityType: "FORM",
          data: {
            progress: answeredFields,
            total: totalFields,
          },
          timestamp: Date.now(),
        });
      }
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  const handleFormFocus = () => {
    console.log("🎯 Activity Event:", {
      type: "activity-focus",
      activityId: "demo-form",
      activityType: "FORM",
      timestamp: Date.now(),
    });
  };

  const handleFormBlur = () => {
    console.log("🎯 Activity Event:", {
      type: "activity-blur",
      activityId: "demo-form",
      activityType: "FORM",
      timestamp: Date.now(),
    });
  };

  const onSubmit = (data: any) => {
    console.log("🎯 Activity Event:", {
      type: "activity-complete",
      activityId: "demo-form",
      activityType: "FORM",
      data: {
        submissionData: data,
      },
      timestamp: Date.now(),
    });
    alert(
      `Form submitted!\n\nCheck console for activity events.\n\nData: ${JSON.stringify(
        data,
        null,
        2
      )}`
    );
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <form
        onSubmit={handleSubmit(onSubmit)}
        onFocus={handleFormFocus}
        onBlur={handleFormBlur}
        className="space-y-6"
      >
        {questions.map((question) => {
          if (question.user_question_type === "DESCRIPTION") {
            return (
              <DescriptionQuestion key={question.id} question={question} />
            );
          }

          if (question.user_question_type === "SHORT_TEXT") {
            return (
              <Controller
                key={question.id}
                name={question.id as keyof typeof initialValues}
                control={control}
                render={({ field, fieldState }) => (
                  <ShortTextQuestion
                    question={question}
                    field={field}
                    fieldState={fieldState}
                  />
                )}
              />
            );
          }

          return null;
        })}

        <div className="flex justify-between items-center pt-4">
          <div className="text-sm text-muted-foreground">
            Form Status: {isDirty ? "📝 Modified" : "⚪ Pristine"}
          </div>
          <Button type="submit">Submit Form</Button>
        </div>
      </form>

      <div className="mt-8 p-4 bg-muted rounded-lg">
        <h3 className="font-medium mb-2">Activity Events (Check Console 👀)</h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>
            🟢 <code>activity-ready</code>: Form component mounted
          </li>
          <li>
            👆 <code>activity-focus</code>: Form receives focus
          </li>
          <li>
            👋 <code>activity-blur</code>: Form loses focus
          </li>
          <li>
            📝 <code>activity-data-change</code>: Any field value changes
          </li>
          <li>
            📊 <code>activity-progress</code>: Progress calculation
          </li>
          <li>
            ✅ <code>activity-complete</code>: Form submitted successfully
          </li>
        </ul>
        <div className="mt-2 text-xs text-muted-foreground">
          Open browser DevTools console to see events in real-time!
        </div>
      </div>
    </div>
  );
}

export const ActivityEventsDemo: Story = {
  render: () => <ActivityEventsDemoComponent />,
};
