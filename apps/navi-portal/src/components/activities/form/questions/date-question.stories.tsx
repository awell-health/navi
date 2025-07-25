import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import React from "react";
import { DateQuestion, createDateValidationRules } from "./date-question";
import { FormFixture } from "./form.fixture";
import type { Question } from "@/lib/awell-client/generated/graphql";

const meta: Meta<typeof DateQuestion> = {
  title: "Activities/Form/Questions/DateQuestion",
  component: DateQuestion,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Base question configuration
const baseQuestion: Question = {
  id: "test-date",
  key: "date_field",
  title: "Select a date",
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
    __typename: "QuestionConfig",
  },
  rule: null,
  __typename: "Question",
};

// Question with future date constraint
const futureQuestion: Question = {
  ...baseQuestion,
  title: "Future date only",
  config: {
    ...baseQuestion.config!,
    date_validation: {
      allowed_dates: "FUTURE",
      include_date_of_response: false,
      __typename: "DateConfig",
    },
  },
};

// Question with past date constraint
const pastQuestion: Question = {
  ...baseQuestion,
  title: "Past date only",
  config: {
    ...baseQuestion.config!,
    date_validation: {
      allowed_dates: "PAST",
      include_date_of_response: true,
      __typename: "DateConfig",
    },
  },
};

export const Default: Story = {
  render: () => (
    <FormFixture question={baseQuestion}>
      {({ field, fieldState }) => (
        <DateQuestion
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
        validationRules={createDateValidationRules(question)}
      >
        {({ field, fieldState }) => (
          <DateQuestion
            question={question}
            field={field}
            fieldState={fieldState}
          />
        )}
      </FormFixture>
    );
  },
};

export const FutureDatesOnly: Story = {
  render: () => (
    <FormFixture
      question={futureQuestion}
      validationRules={createDateValidationRules(futureQuestion)}
    >
      {({ field, fieldState }) => (
        <DateQuestion
          question={futureQuestion}
          field={field}
          fieldState={fieldState}
        />
      )}
    </FormFixture>
  ),
};

export const PastDatesOnly: Story = {
  render: () => (
    <FormFixture
      question={pastQuestion}
      validationRules={createDateValidationRules(pastQuestion)}
    >
      {({ field, fieldState }) => (
        <DateQuestion
          question={pastQuestion}
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
      ...futureQuestion,
      title: "Future date (required)",
      is_required: true,
    };
    return (
      <FormFixture
        question={question}
        validationRules={createDateValidationRules(question)}
      >
        {({ field, fieldState }) => (
          <DateQuestion
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
        <DateQuestion
          question={baseQuestion}
          field={field}
          fieldState={fieldState}
          disabled={true}
        />
      )}
    </FormFixture>
  ),
};
