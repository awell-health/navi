import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import React from "react";
import { useForm, Controller } from "react-hook-form";
import { EmailQuestion } from "./email-question";
import type { Question } from "@/lib/awell-client/generated/graphql";
import { Typography } from "@/components/ui/typography";

const meta: Meta<typeof EmailQuestion> = {
  title: "Components/Form Questions/EmailQuestion",
  component: EmailQuestion,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Email input field with very loose validation using react-hook-form",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof EmailQuestion>;

const baseQuestion: Question = {
  id: "test-email",
  key: "testEmail",
  title: "Email",
  definition_id: "emailField",
  question_type: "INPUT",
  user_question_type: "EMAIL",
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
          <EmailQuestion
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
        title: "Your email address (required)",
        is_required: true,
      }}
    />
  ),
};

export const Disabled: Story = {
  render: () => {
    const { control } = useForm({
      defaultValues: { testEmail: "user@example.com" },
    });

    return (
      <div className="w-96">
        <Controller
          name="testEmail"
          control={control}
          render={({ field, fieldState }) => (
            <EmailQuestion
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
      defaultValues: { testEmail: "" },
      mode: "onChange",
    });

    return (
      <div className="w-96">
        <Controller
          name="testEmail"
          control={control}
          rules={{
            required: "Email address is required",
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: "Please enter a valid email address"
            }
          }}
          render={({ field, fieldState }) => (
            <EmailQuestion
              question={{
                ...baseQuestion,
                title: "Contact email (required)",
                is_required: true,
              }}
              field={field}
              fieldState={fieldState}
            />
          )}
        />
        <Typography.Small className="text-muted-foreground mt-4">
          This field is required with very loose email validation.
        </Typography.Small>
      </div>
    );
  },
};