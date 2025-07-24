import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import React from "react";
import {
  LongTextQuestion,
  createLongTextValidationRules,
} from "./long-text-question";
import { FormFixture } from "./form-fixture";
import type { Question } from "@/lib/awell-client/generated/graphql";

const meta: Meta<typeof LongTextQuestion> = {
  title: "Activities/Form/Questions/LongTextQuestion",
  component: LongTextQuestion,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Base question configuration
const baseQuestion: Question = {
  id: "test-long-text",
  key: "long_text_field",
  title: "Tell us more about yourself",
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
    __typename: "QuestionConfig",
  },
  rule: null,
  __typename: "Question",
};

export const Default: Story = {
  render: () => (
    <FormFixture question={baseQuestion}>
      {({ field, fieldState }) => (
        <LongTextQuestion
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
      title: "Tell us about yourself (required)",
      is_required: true,
    };
    return (
      <FormFixture
        question={question}
        validationRules={createLongTextValidationRules(question)}
      >
        {({ field, fieldState }) => (
          <LongTextQuestion
            question={question}
            field={field}
            fieldState={fieldState}
          />
        )}
      </FormFixture>
    );
  },
};

export const WithValidation: Story = {
  render: () => {
    const question = {
      ...baseQuestion,
      title: "Describe your experience (10-500 characters)",
      is_required: true,
    };
    const validationRules = {
      ...createLongTextValidationRules(question),
      minLength: {
        value: 10,
        message: "Please write at least 10 characters",
      },
      maxLength: {
        value: 500,
        message: "Please keep it under 500 characters",
      },
    };
    return (
      <FormFixture question={question} validationRules={validationRules}>
        {({ field, fieldState }) => (
          <LongTextQuestion
            question={question}
            field={field}
            fieldState={fieldState}
          />
        )}
      </FormFixture>
    );
  },
};

export const Disabled: Story = {
  render: () => (
    <FormFixture question={baseQuestion}>
      {({ field, fieldState }) => (
        <LongTextQuestion
          question={baseQuestion}
          field={field}
          fieldState={fieldState}
          disabled={true}
        />
      )}
    </FormFixture>
  ),
};
