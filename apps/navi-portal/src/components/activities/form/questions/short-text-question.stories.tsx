import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import React from "react";
import {
  ShortTextQuestion,
  createShortTextValidationRules,
} from "./short-text-question";
import { FormFixture } from "./form.fixture";
import type { Question } from "@/lib/awell-client/generated/graphql";

const meta: Meta<typeof ShortTextQuestion> = {
  title: "Activities/Form/Questions/ShortTextQuestion",
  component: ShortTextQuestion,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Base question configuration
const baseQuestion: Question = {
  id: "test-short-text",
  key: "short_text_field",
  title: "What is your first name?",
  definition_id: "firstName",
  question_type: "INPUT",
  user_question_type: "SHORT_TEXT",
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

// Question with helper text
const questionWithHelperText: Question = {
  ...baseQuestion,
  title: "Enter your full name",
  config: {
    ...baseQuestion.config!,
    input_validation: {
      mode: "simple",
      pattern: null,
      helper_text: "Please enter your full first name",
      simpleConfig: null,
      __typename: "InputValidationConfig",
    },
  },
};

// Question with pattern validation
const questionWithPattern: Question = {
  ...baseQuestion,
  title: "Name (min 3 characters)",
  config: {
    ...baseQuestion.config!,
    input_validation: {
      mode: "simple",
      pattern: "^.{3,}$",
      helper_text: "Please enter at least 3 characters",
      simpleConfig: null,
      __typename: "InputValidationConfig",
    },
  },
};

export const Default: Story = {
  render: () => (
    <FormFixture question={baseQuestion}>
      {({ field, fieldState }) => (
        <ShortTextQuestion
          question={baseQuestion}
          field={field}
          fieldState={fieldState}
        />
      )}
    </FormFixture>
  ),
};

export const WithHelperText: Story = {
  render: () => (
    <FormFixture question={questionWithHelperText}>
      {({ field, fieldState }) => (
        <ShortTextQuestion
          question={questionWithHelperText}
          field={field}
          fieldState={fieldState}
        />
      )}
    </FormFixture>
  ),
};

export const Required: Story = {
  render: () => {
    const question = { ...baseQuestion, is_required: true };
    return (
      <FormFixture
        question={question}
        validationRules={createShortTextValidationRules(question)}
      >
        {({ field, fieldState }) => (
          <ShortTextQuestion
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
      ...questionWithPattern,
      title: "Name (required, min 3 chars)",
      is_required: true,
    };
    return (
      <FormFixture
        question={question}
        validationRules={createShortTextValidationRules(question)}
      >
        {({ field, fieldState }) => (
          <ShortTextQuestion
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
        <ShortTextQuestion
          question={baseQuestion}
          field={field}
          fieldState={fieldState}
          disabled={true}
        />
      )}
    </FormFixture>
  ),
};
