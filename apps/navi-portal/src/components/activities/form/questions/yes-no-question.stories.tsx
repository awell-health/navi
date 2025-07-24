import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import React from "react";
import { useForm, Controller } from "react-hook-form";
import { YesNoQuestion } from "./yes-no-question";
import type { Question } from "@/lib/awell-client/generated/graphql";
import { Typography } from "@/components/ui/typography";

const meta: Meta<typeof YesNoQuestion> = {
  title: "Components/Form Questions/YesNoQuestion",
  component: YesNoQuestion,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Boolean yes/no selection using radio buttons with react-hook-form",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof YesNoQuestion>;

const baseQuestion: Question = {
  id: "test-yes-no",
  key: "testYesNo",
  title: "Yes or no? (boolean)",
  definition_id: "yesNoBoolean",
  question_type: "INPUT",
  user_question_type: "YES_NO",
  data_point_value_type: "BOOLEAN",
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
      [question.key]: undefined,
    },
  });

  return (
    <div className="w-96">
      <Controller
        name={question.key}
        control={control}
        render={({ field, fieldState }) => (
          <YesNoQuestion
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
        title: "Do you agree? (required)",
        is_required: true,
      }}
    />
  ),
};

export const Disabled: Story = {
  render: () => {
    const { control } = useForm({
      defaultValues: { testYesNo: true },
    });

    return (
      <div className="w-96">
        <Controller
          name="testYesNo"
          control={control}
          render={({ field, fieldState }) => (
            <YesNoQuestion
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
      defaultValues: { testYesNo: undefined },
      mode: "onChange",
    });

    return (
      <div className="w-96">
        <Controller
          name="testYesNo"
          control={control}
          rules={{
            required: "Please select yes or no",
          }}
          render={({ field, fieldState }) => (
            <YesNoQuestion
              question={{
                ...baseQuestion,
                title: "Do you agree to the terms? (required)",
                is_required: true,
              }}
              field={field}
              fieldState={fieldState}
            />
          )}
        />
        <Typography.Small className="text-muted-foreground mt-4">
          This field is required - you must select either yes or no.
        </Typography.Small>
      </div>
    );
  },
};