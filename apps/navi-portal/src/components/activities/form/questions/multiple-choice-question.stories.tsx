import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import React from "react";
import { useForm, Controller } from "react-hook-form";
import { MultipleChoiceQuestion } from "./multiple-choice-question";
import type { Question } from "@/lib/awell-client/generated/graphql";
import { Typography } from "@/components/ui/typography";

const meta: Meta<typeof MultipleChoiceQuestion> = {
  title: "Components/Form Questions/MultipleChoiceQuestion",
  component: MultipleChoiceQuestion,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Radio button selection for single choice questions using react-hook-form",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof MultipleChoiceQuestion>;

const baseQuestion: Question = {
  id: "test-multiple-choice",
  key: "testMultipleChoice",
  title: "Single select (string)",
  definition_id: "singleSelectString",
  question_type: "MULTIPLE_CHOICE",
  user_question_type: "MULTIPLE_CHOICE",
  data_point_value_type: "STRING",
  is_required: false,
  options: [
    {
      id: "u9qpd6kPr83f",
      label: "Option 1",
      value: "option_1",
      __typename: "QuestionOption"
    },
    {
      id: "yRy_LwI1refh",
      label: "Option 2",
      value: "option_2",
      __typename: "QuestionOption"
    },
    {
      id: "OOCTmiXXvjpN",
      label: "Option 3",
      value: "option_3",
      __typename: "QuestionOption"
    }
  ],
  config: {
    recode_enabled: false,
    use_select: false,
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
          <MultipleChoiceQuestion
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
        title: "Single select (required)",
        is_required: true,
      }}
    />
  ),
};

export const NumberValues: Story = {
  render: () => (
    <FormWrapper
      question={{
        ...baseQuestion,
        title: "Single select (number)",
        data_point_value_type: "NUMBER",
        options: [
          {
            id: "zOTvuy0usHkb",
            label: "Option 1",
            value: "0",
            __typename: "QuestionOption"
          },
          {
            id: "q6jRNHKATieI",
            label: "Option 2", 
            value: "1",
            __typename: "QuestionOption"
          },
          {
            id: "vvMBtwpHl0o5",
            label: "Option 3",
            value: "2",
            __typename: "QuestionOption"
          }
        ]
      }}
    />
  ),
};

export const Disabled: Story = {
  render: () => {
    const { control } = useForm({
      defaultValues: { testMultipleChoice: "option_2" },
    });

    return (
      <div className="w-96">
        <Controller
          name="testMultipleChoice"
          control={control}
          render={({ field, fieldState }) => (
            <MultipleChoiceQuestion
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
      defaultValues: { testMultipleChoice: "" },
      mode: "onChange",
    });

    return (
      <div className="w-96">
        <Controller
          name="testMultipleChoice"
          control={control}
          rules={{
            required: "Please select an option",
          }}
          render={({ field, fieldState }) => (
            <MultipleChoiceQuestion
              question={{
                ...baseQuestion,
                title: "Single select (required)",
                is_required: true,
              }}
              field={field}
              fieldState={fieldState}
            />
          )}
        />
        <Typography.Small className="text-muted-foreground mt-4">
          This field is required - try submitting without selecting an option.
        </Typography.Small>
      </div>
    );
  },
};