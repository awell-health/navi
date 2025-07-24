import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import React from "react";
import { useForm, Controller } from "react-hook-form";
import { DateQuestion } from "./date-question";
import type { Question } from "@/lib/awell-client/generated/graphql";
import { Typography } from "@/components/ui/typography";

const meta: Meta<typeof DateQuestion> = {
  title: "Components/Form Questions/DateQuestion",
  component: DateQuestion,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Date picker with calendar popup and validation constraints using react-hook-form",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof DateQuestion>;

const baseQuestion: Question = {
  id: "test-date",
  key: "testDate",
  title: "Date",
  definition_id: "dateField",
  question_type: "INPUT",
  user_question_type: "DATE",
  data_point_value_type: "DATE",
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

const futureQuestion: Question = {
  ...baseQuestion,
  title: "A date in the future",
  config: {
    ...baseQuestion.config!,
    date_validation: {
      allowed_dates: "FUTURE",
      include_date_of_response: true,
      __typename: "DateConfig"
    }
  }
};

const pastQuestion: Question = {
  ...baseQuestion,
  title: "A date in the past",
  config: {
    ...baseQuestion.config!,
    date_validation: {
      allowed_dates: "PAST",
      include_date_of_response: false,
      __typename: "DateConfig"
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
          <DateQuestion
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

export const FutureOnly: Story = {
  render: () => <FormWrapper question={futureQuestion} />,
};

export const PastOnly: Story = {
  render: () => <FormWrapper question={pastQuestion} />,
};

export const Required: Story = {
  render: () => (
    <FormWrapper
      question={{
        ...baseQuestion,
        title: "Required date field",
        is_required: true,
      }}
    />
  ),
};

export const Disabled: Story = {
  render: () => {
    const { control } = useForm({
      defaultValues: { testDate: "2024-12-25" },
    });

    return (
      <div className="w-96">
        <Controller
          name="testDate"
          control={control}
          render={({ field, fieldState }) => (
            <DateQuestion
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
      defaultValues: { testDate: "" },
      mode: "onChange",
    });

    return (
      <div className="w-96">
        <Controller
          name="testDate"
          control={control}
          rules={{
            required: "Please select a date",
          }}
          render={({ field, fieldState }) => (
            <DateQuestion
              question={{
                ...futureQuestion,
                title: "Future date (required)",
                is_required: true,
              }}
              field={field}
              fieldState={fieldState}
            />
          )}
        />
        <Typography.Small className="text-muted-foreground mt-4">
          This field is required and only accepts future dates.
        </Typography.Small>
      </div>
    );
  },
};