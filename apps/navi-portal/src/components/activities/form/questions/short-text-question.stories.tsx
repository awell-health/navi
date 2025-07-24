import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import React from "react";
import { useForm, Controller } from "react-hook-form";
import { ShortTextQuestion } from "./short-text-question";
import type { Question } from "@/lib/awell-client/generated/graphql";
import { Typography } from "@/components/ui/typography";

const meta: Meta<typeof ShortTextQuestion> = {
  title: "Components/Form Questions/ShortTextQuestion",
  component: ShortTextQuestion,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Single line text input using react-hook-form (no validation)",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ShortTextQuestion>;

const baseQuestion: Question = {
  id: "test-short-text",
  key: "testShortText",
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
      pattern: "^.{3,}$",
      helper_text: "Please enter more than 3 characters",
    },
  },
  rule: null,
};

// Simple wrapper for form context
function FormWrapper({ question }: { question: Question }) {
  const { control } = useForm({
    defaultValues: {
      [question.key]: "",
    },
  });

  return (
    <div className="w-96">
      <Controller
        name={question.key}
        control={control}
        render={({ field, fieldState }) => (
          <ShortTextQuestion
            question={question}
            field={field}
            fieldState={fieldState}
          />
        )}
      />
    </div>
  );
}

export const Default: Story = {
  render: () => <FormWrapper question={baseQuestion} />,
};

export const WithHelperText: Story = {
  render: () => (
    <FormWrapper
      question={{
        ...baseQuestion,
        config: {
          ...baseQuestion.config,
          mandatory: false,
          input_validation: {
            mode: "simple",
            pattern: null,
            helper_text: "Please enter your full first name",
            simpleConfig: null,
          },
        },
      }}
    />
  ),
};

export const Disabled: Story = {
  render: () => {
    const { control } = useForm({
      defaultValues: { testShortText: "Disabled value" },
    });

    return (
      <div className="w-96">
        <Controller
          name="testShortText"
          control={control}
          render={({ field, fieldState }) => (
            <div className="space-y-2">
              <ShortTextQuestion
                question={baseQuestion}
                field={field}
                fieldState={fieldState}
                disabled
              />
            </div>
          )}
        />
      </div>
    );
  },
};

export const WithValidation: Story = {
  render: () => {
    const { control } = useForm({
      defaultValues: { testShortText: "" },
      mode: "onChange", // Validate on change to see errors immediately
    });

    return (
      <div className="w-96">
        <Controller
          name="testShortText"
          control={control}
          rules={{
            required: "This field is required",
            ...(baseQuestion.config?.input_validation?.pattern && {
              pattern: RegExp(baseQuestion.config?.input_validation?.pattern),
            }),
          }}
          render={({ field, fieldState }) => (
            <ShortTextQuestion
              question={{
                ...baseQuestion,
                title: "Name (required, min 3 chars)",
                is_required: true,
              }}
              field={field}
              fieldState={fieldState}
            />
          )}
        />
        <Typography.Small className="text-muted-foreground mt-4">
          Try typing less than 3 characters or clearing the field to see
          validation errors.
        </Typography.Small>
      </div>
    );
  },
};
