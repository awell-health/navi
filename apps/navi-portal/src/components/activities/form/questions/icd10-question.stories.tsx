import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import React from "react";
import { ICD10Question, createICD10ValidationRules } from "./icd10-question";
import { FormFixture } from "./form-fixture";
import type { Question } from "@/lib/awell-client/generated/graphql";

const meta: Meta<typeof ICD10Question> = {
  title: "Activities/Form/Questions/ICD10Question",
  component: ICD10Question,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Searchable ICD-10 classification component that queries the Clinical Tables NLM API for real-time code lookup. Uses react-hook-form Controller pattern and includes validation utilities.",
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
  title: "ICD-10 Classification",
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
    __typename: "QuestionConfig",
  },
  rule: null,
  __typename: "Question",
};

export const Default: Story = {
  render: () => (
    <FormFixture question={baseQuestion}>
      {({ field, fieldState }) => (
        <ICD10Question
          question={baseQuestion}
          field={field}
          fieldState={fieldState}
        />
      )}
    </FormFixture>
  ),
};

export const Required: Story = {
  render: () => {
    const question = {
      ...baseQuestion,
      title: "Primary diagnosis (required)",
      is_required: true,
    };

    return (
      <FormFixture
        question={question}
        validationRules={createICD10ValidationRules(question)}
      >
        {({ field, fieldState }) => (
          <ICD10Question
            question={question}
            field={field}
            fieldState={fieldState}
          />
        )}
      </FormFixture>
    );
  },
};
