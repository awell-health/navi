import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import React from "react";
import { useForm, Controller } from "react-hook-form";
import { NumberQuestion } from "./number-question";
import type { Question } from "@/lib/awell-client/generated/graphql";
import { Typography } from "@/components/ui/typography";

const meta: Meta<typeof NumberQuestion> = {
  title: "Components/Form Questions/NumberQuestion",
  component: NumberQuestion,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Numeric input field with optional range validation using react-hook-form",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof NumberQuestion>;

const baseQuestion: Question = {
  id: "test-number",
  key: "testNumber",
  title: "Question that collects a numeric value",
  definition_id: "numericValue",
  question_type: "INPUT",
  user_question_type: "NUMBER",
  data_point_value_type: "NUMBER",
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

const rangeQuestion: Question = {
  ...baseQuestion,
  title: "A number between 1 and 10",
  config: {
    ...baseQuestion.config!,
    number: {
      range: {
        enabled: true,
        min: 1,
        max: 10,
        __typename: "RangeConfig"
      },
      __typename: "NumberConfig"
    }
  }
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
          <NumberQuestion
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

export const WithRange: Story = {
  render: () => <FormWrapper question={rangeQuestion} />,
};

export const Required: Story = {
  render: () => (
    <FormWrapper
      question={{
        ...baseQuestion,
        title: "Required number field",
        is_required: true,
      }}
    />
  ),
};

export const Disabled: Story = {
  render: () => {
    const { control } = useForm({
      defaultValues: { testNumber: 42 },
    });

    return (
      <div className="w-96">
        <Controller
          name="testNumber"
          control={control}
          render={({ field, fieldState }) => (
            <NumberQuestion
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
      defaultValues: { testNumber: "" },
      mode: "onChange",
    });

    return (
      <div className="w-96">
        <Controller
          name="testNumber"
          control={control}
          rules={{
            required: "This field is required",
            min: { value: 1, message: "Must be at least 1" },
            max: { value: 10, message: "Must be at most 10" }
          }}
          render={({ field, fieldState }) => (
            <NumberQuestion
              question={{
                ...rangeQuestion,
                title: "Number with validation (1-10)",
                is_required: true,
              }}
              field={field}
              fieldState={fieldState}
            />
          )}
        />
        <Typography.Small className="text-muted-foreground mt-4">
          Try entering a number outside the 1-10 range or leaving it empty.
        </Typography.Small>
      </div>
    );
  },
};