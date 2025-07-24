import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import React from "react";
import {
  MultipleChoiceQuestion,
  createMultipleChoiceValidationRules,
} from "./multiple-choice-question";
import { FormFixture } from "./form-fixture";
import type { Question } from "@/lib/awell-client/generated/graphql";

const meta: Meta<typeof MultipleChoiceQuestion> = {
  title: "Activities/Form/Questions/MultipleChoiceQuestion",
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
      __typename: "QuestionOption",
    },
    {
      id: "yRy_LwI1refh",
      label: "Option 2",
      value: "option_2",
      __typename: "QuestionOption",
    },
    {
      id: "OOCTmiXXvjpN",
      label: "Option 3",
      value: "option_3",
      __typename: "QuestionOption",
    },
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
    __typename: "QuestionConfig",
  },
  rule: null,
  __typename: "Question",
};

const requiredQuestion: Question = {
  ...baseQuestion,
  title: "Single select (required)",
  is_required: true,
};

export const Default: Story = {
  render: () => (
    <FormFixture question={baseQuestion}>
      {({ field, fieldState }) => (
        <MultipleChoiceQuestion
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
      validationRules={createMultipleChoiceValidationRules(requiredQuestion)}
    >
      {({ field, fieldState }) => (
        <MultipleChoiceQuestion
          question={requiredQuestion}
          field={field}
          fieldState={fieldState}
        />
      )}
    </FormFixture>
  ),
};

export const NumberValues: Story = {
  render: () => {
    const numberQuestion: Question = {
      ...baseQuestion,
      title: "Single select (number)",
      data_point_value_type: "NUMBER",
      options: [
        {
          id: "zOTvuy0usHkb",
          label: "Option 1",
          value: "0",
          __typename: "QuestionOption",
        },
        {
          id: "q6jRNHKATieI",
          label: "Option 2",
          value: "1",
          __typename: "QuestionOption",
        },
        {
          id: "vvMBtwpHl0o5",
          label: "Option 3",
          value: "2",
          __typename: "QuestionOption",
        },
      ],
    };

    return (
      <FormFixture question={numberQuestion}>
        {({ field, fieldState }) => (
          <MultipleChoiceQuestion
            question={numberQuestion}
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
        <MultipleChoiceQuestion
          question={baseQuestion}
          field={field}
          fieldState={fieldState}
          disabled
        />
      )}
    </FormFixture>
  ),
};
