import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import React from "react";
import { NumberQuestion, createNumberValidationRules } from "./number-question";
import { FormFixture } from "./form-fixture";
import type { Question } from "@/lib/awell-client/generated/graphql";

const meta: Meta<typeof NumberQuestion> = {
  title: "Activities/Form/Questions/NumberQuestion",
  component: NumberQuestion,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Base question configuration
const baseQuestion: Question = {
  id: "test-number",
  key: "number_field",
  title: "Enter a number",
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
    __typename: "QuestionConfig",
  },
  rule: null,
  __typename: "Question",
};

// Question with range constraint
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
        __typename: "RangeConfig",
      },
      __typename: "NumberConfig",
    },
  },
};

// Question with negative range
const negativeRangeQuestion: Question = {
  ...baseQuestion,
  title: "Temperature change (-20 to 50°C)",
  config: {
    ...baseQuestion.config!,
    number: {
      range: {
        enabled: true,
        min: -20,
        max: 50,
        __typename: "RangeConfig",
      },
      __typename: "NumberConfig",
    },
  },
};

export const Default: Story = {
  render: () => (
    <FormFixture question={baseQuestion}>
      {({ field, fieldState }) => (
        <NumberQuestion
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
    const question = { ...baseQuestion, is_required: true };
    return (
      <FormFixture
        question={question}
        validationRules={createNumberValidationRules(question)}
      >
        {({ field, fieldState }) => (
          <NumberQuestion
            question={question}
            field={field}
            fieldState={fieldState}
          />
        )}
      </FormFixture>
    );
  },
};

export const WithRange: Story = {
  render: () => (
    <FormFixture
      question={rangeQuestion}
      validationRules={createNumberValidationRules(rangeQuestion)}
    >
      {({ field, fieldState }) => (
        <NumberQuestion
          question={rangeQuestion}
          field={field}
          fieldState={fieldState}
        />
      )}
    </FormFixture>
  ),
};

export const WithNegativeRange: Story = {
  render: () => (
    <FormFixture
      question={negativeRangeQuestion}
      validationRules={createNumberValidationRules(negativeRangeQuestion)}
    >
      {({ field, fieldState }) => (
        <NumberQuestion
          question={negativeRangeQuestion}
          field={field}
          fieldState={fieldState}
        />
      )}
    </FormFixture>
  ),
};

export const WithValidation: Story = {
  render: () => {
    const question = {
      ...rangeQuestion,
      title: "Number with validation (1-10, required)",
      is_required: true,
    };
    return (
      <FormFixture
        question={question}
        validationRules={createNumberValidationRules(question)}
      >
        {({ field, fieldState }) => (
          <NumberQuestion
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
        <NumberQuestion
          question={baseQuestion}
          field={field}
          fieldState={fieldState}
          disabled={true}
        />
      )}
    </FormFixture>
  ),
};
