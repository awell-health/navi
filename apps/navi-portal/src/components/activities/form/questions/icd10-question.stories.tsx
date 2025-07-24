import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import React from "react";
import { useForm, Controller } from "react-hook-form";
import { ICD10Question } from "./icd10-question";
import type { Question } from "@/lib/awell-client/generated/graphql";
import { Typography } from "@/components/ui/typography";

const meta: Meta<typeof ICD10Question> = {
  title: "Components/Form Questions/ICD10Question",
  component: ICD10Question,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Special select component for ICD-10 classification codes using react-hook-form",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ICD10Question>;

const baseQuestion: Question = {
  id: "test-icd10",
  key: "testICD10",
  title: "ICD",
  definition_id: "icdClassification",
  question_type: "INPUT",
  user_question_type: "ICD10_CLASSIFICATION",
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
          <ICD10Question
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
        title: "Primary diagnosis (required)",
        is_required: true,
      }}
    />
  ),
};

export const Disabled: Story = {
  render: () => {
    const { control } = useForm({
      defaultValues: { testICD10: "I10" },
    });

    return (
      <div className="w-96">
        <Controller
          name="testICD10"
          control={control}
          render={({ field, fieldState }) => (
            <ICD10Question
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
      defaultValues: { testICD10: "" },
      mode: "onChange",
    });

    return (
      <div className="w-96">
        <Controller
          name="testICD10"
          control={control}
          rules={{
            required: "Please select an ICD-10 code",
          }}
          render={({ field, fieldState }) => (
            <ICD10Question
              question={{
                ...baseQuestion,
                title: "Medical diagnosis code (required)",
                is_required: true,
              }}
              field={field}
              fieldState={fieldState}
            />
          )}
        />
        <Typography.Small className="text-muted-foreground mt-4">
          This field is required - please select an appropriate ICD-10 classification code.
        </Typography.Small>
      </div>
    );
  },
};