import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import React from "react";
import { EmailQuestion, createEmailValidationRules } from "./email-question";
import { FormFixture } from "./form-fixture";
import type { Question } from "@/lib/awell-client/generated/graphql";

const meta: Meta<typeof EmailQuestion> = {
  title: "Activities/Form/Questions/EmailQuestion",
  component: EmailQuestion,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Base question configuration
const baseQuestion: Question = {
  id: "test-email",
  key: "email_field",
  title: "Email address",
  definition_id: "emailField",
  question_type: "INPUT",
  user_question_type: "EMAIL",
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
        <EmailQuestion
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
      title: "Your email address (required)",
      is_required: true,
    };
    return (
      <FormFixture
        question={question}
        validationRules={createEmailValidationRules(question)}
      >
        {({ field, fieldState }) => (
          <EmailQuestion
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
      title: "Contact email (required)",
      is_required: true,
    };
    return (
      <FormFixture
        question={question}
        validationRules={createEmailValidationRules(question)}
      >
        {({ field, fieldState }) => (
          <EmailQuestion
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
        <EmailQuestion
          question={baseQuestion}
          field={field}
          fieldState={fieldState}
          disabled={true}
        />
      )}
    </FormFixture>
  ),
};
