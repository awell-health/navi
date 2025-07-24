import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import React from "react";
import { useForm, Controller } from "react-hook-form";
import { LongTextQuestion } from "./long-text-question";
import type { Question } from "@/lib/awell-client/generated/graphql";
import { Typography } from "@/components/ui/typography";

const meta: Meta<typeof LongTextQuestion> = {
  title: "Components/Form Questions/LongTextQuestion",
  component: LongTextQuestion,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Multi-line textarea input for longer text responses using react-hook-form",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof LongTextQuestion>;

const baseQuestion: Question = {
  id: "test-long-text",
  key: "testLongText",
  title: "Question that collects a string but long-form (textarea)",
  definition_id: "longTextArea",
  question_type: "INPUT",
  user_question_type: "LONG_TEXT",
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
    input_validation: null,
    __typename: "QuestionConfig"
  },
  rule: null,
  __typename: "Question"
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
          <LongTextQuestion
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

export const Required: Story = {
  render: () => (
    <FormWrapper
      question={{
        ...baseQuestion,
        title: "Tell us about yourself (required)",
        is_required: true,
      }}
    />
  ),
};

export const Disabled: Story = {
  render: () => {
    const { control } = useForm({
      defaultValues: { 
        testLongText: "This is some pre-filled text that shows how the textarea looks when disabled. It can contain multiple lines and longer content."
      },
    });

    return (
      <div className="w-96">
        <Controller
          name="testLongText"
          control={control}
          render={({ field, fieldState }) => (
            <LongTextQuestion
              question={baseQuestion}
              field={field}
              fieldState={fieldState}
              disabled
            />
          )}
        />
      </div>
    );
  },
};

export const WithValidation: Story = {
  render: () => {
    const { control } = useForm({
      defaultValues: { testLongText: "" },
      mode: "onChange",
    });

    return (
      <div className="w-96">
        <Controller
          name="testLongText"
          control={control}
          rules={{
            required: "This field is required",
            minLength: {
              value: 10,
              message: "Please write at least 10 characters"
            },
            maxLength: {
              value: 500,
              message: "Please keep it under 500 characters"
            }
          }}
          render={({ field, fieldState }) => (
            <LongTextQuestion
              question={{
                ...baseQuestion,
                title: "Describe your experience (10-500 characters)",
                is_required: true,
              }}
              field={field}
              fieldState={fieldState}
            />
          )}
        />
        <Typography.Small className="text-muted-foreground mt-4">
          This field requires 10-500 characters. Try typing to see validation.
        </Typography.Small>
      </div>
    );
  },
};