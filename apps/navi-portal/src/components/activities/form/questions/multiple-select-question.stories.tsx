import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import React from "react";
import { useForm, Controller } from "react-hook-form";
import { MultipleSelectQuestion } from "./multiple-select-question";
import type { Question } from "@/lib/awell-client/generated/graphql";
import { Typography } from "@/components/ui/typography";

const meta: Meta<typeof MultipleSelectQuestion> = {
  title: "Components/Form Questions/MultipleSelectQuestion",
  component: MultipleSelectQuestion,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Checkbox selection for multiple choice questions using react-hook-form",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof MultipleSelectQuestion>;

const baseQuestion: Question = {
  id: "test-multiple-select",
  key: "testMultipleSelect",
  title: "Multiple select (string)",
  definition_id: "multipleSelectString",
  question_type: "MULTIPLE_CHOICE",
  user_question_type: "MULTIPLE_SELECT",
  data_point_value_type: "STRINGS_ARRAY",
  is_required: false,
  options: [
    {
      id: "v3XJP3ZgMyc9",
      label: "Option 1",
      value: "some option",
      __typename: "QuestionOption"
    },
    {
      id: "JYHA_c6UFLJX",
      label: "Option 2",
      value: "3232",
      __typename: "QuestionOption"
    },
    {
      id: "xmXV065kgDEk",
      label: "Option 3",
      value: "another option",
      __typename: "QuestionOption"
    },
    {
      id: "eCrmxno3fpcy",
      label: "Option 4",
      value: "option 4",
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
      [question.key]: [],
    },
  });

  return (
    <div className="w-96">
      <Controller
        name={question.key}
        control={control}
        render={({ field, fieldState }) => (
          <MultipleSelectQuestion
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
        title: "Multiple select (required)",
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
        title: "Multiple select (number)",
        data_point_value_type: "NUMBERS_ARRAY",
        options: [
          {
            id: "NRhfKVrRJ1qQ",
            label: "Option 1",
            value: "0",
            __typename: "QuestionOption"
          },
          {
            id: "kbdbxrZP9-cY",
            label: "Option 2",
            value: "1",
            __typename: "QuestionOption"
          },
          {
            id: "7EFDVDtvyZ6h",
            label: "Option 3",
            value: "2",
            __typename: "QuestionOption"
          },
          {
            id: "CKqrKwhPbObE",
            label: "Option 4",
            value: "3",
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
      defaultValues: { testMultipleSelect: ["some option", "option 4"] },
    });

    return (
      <div className="w-96">
        <Controller
          name="testMultipleSelect"
          control={control}
          render={({ field, fieldState }) => (
            <MultipleSelectQuestion
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
      defaultValues: { testMultipleSelect: [] },
      mode: "onChange",
    });

    return (
      <div className="w-96">
        <Controller
          name="testMultipleSelect"
          control={control}
          rules={{
            required: "Please select at least one option",
            validate: (value) => 
              value.length > 0 || "At least one option must be selected"
          }}
          render={({ field, fieldState }) => (
            <MultipleSelectQuestion
              question={{
                ...baseQuestion,
                title: "Multiple select (required)",
                is_required: true,
              }}
              field={field}
              fieldState={fieldState}
            />
          )}
        />
        <Typography.Small className="text-muted-foreground mt-4">
          This field is required - select at least one option.
        </Typography.Small>
      </div>
    );
  },
};