import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import React from "react";
import { YesNoQuestion, createYesNoValidationRules } from "./yes-no-question";
import { FormFixture } from "./form-fixture";
import type { Question } from "@/lib/awell-client/generated/graphql";

const meta: Meta<typeof YesNoQuestion> = {
  title: "Activities/Form/Questions/YesNoQuestion",
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
    __typename: "QuestionConfig",
  },
  rule: null,
  __typename: "Question",
};

const requiredQuestion: Question = {
  ...baseQuestion,
  title: "Do you agree? (required)",
  is_required: true,
};

export const Default: Story = {
  render: () => (
    <FormFixture question={baseQuestion}>
      {({ field, fieldState }) => (
        <YesNoQuestion
          question={baseQuestion}
          field={field}
          fieldState={fieldState}
        />
      )}
    </FormFixture>
  ),
};

export const Required: Story = {
  render: () => (
    <FormFixture
      question={requiredQuestion}
      validationRules={createYesNoValidationRules(requiredQuestion)}
    >
      {({ field, fieldState }) => (
        <YesNoQuestion
          question={requiredQuestion}
          field={field}
          fieldState={fieldState}
        />
      )}
    </FormFixture>
  ),
};

export const Disabled: Story = {
  render: () => (
    <FormFixture question={baseQuestion}>
      {({ field, fieldState }) => (
        <YesNoQuestion
          question={baseQuestion}
          field={field}
          fieldState={fieldState}
          disabled
        />
      )}
    </FormFixture>
  ),
};
