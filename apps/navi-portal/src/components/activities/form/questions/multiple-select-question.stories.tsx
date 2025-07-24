import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import React from "react";
import {
  MultipleSelectQuestion,
  createMultipleSelectValidationRules,
} from "./multiple-select-question";
import { FormFixture } from "./form-fixture";
import type { Question } from "@/lib/awell-client/generated/graphql";

const meta: Meta<typeof MultipleSelectQuestion> = {
  title: "Activities/Form/Questions/MultipleSelectQuestion",
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
      __typename: "QuestionOption",
    },
    {
      id: "JYHA_c6UFLJX",
      label: "Option 2",
      value: "3232",
      __typename: "QuestionOption",
    },
    {
      id: "xmXV065kgDEk",
      label: "Option 3",
      value: "another option",
      __typename: "QuestionOption",
    },
    {
      id: "eCrmxno3fpcy",
      label: "Option 4",
      value: "option 4",
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
  title: "Multiple select (required)",
  is_required: true,
};

const rangeQuestion: Question = {
  ...baseQuestion,
  title: "Multiple select (min 2, max 3 options)",
  is_required: true,
  config: {
    ...baseQuestion.config,
    mandatory: false,
    multiple_select: {
      range: {
        enabled: true,
        min: 2,
        max: 3,
        __typename: "ChoiceRangeConfig",
      },
      exclusive_option: null,
      __typename: "MultipleSelectConfig",
    },
  },
};

export const Default: Story = {
  render: () => (
    <FormFixture question={baseQuestion}>
      {({ field, fieldState }) => (
        <MultipleSelectQuestion
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
      validationRules={createMultipleSelectValidationRules(requiredQuestion)}
    >
      {({ field, fieldState }) => (
        <MultipleSelectQuestion
          question={requiredQuestion}
          field={field}
          fieldState={fieldState}
        />
      )}
    </FormFixture>
  ),
};

export const WithRangeValidation: Story = {
  render: () => (
    <FormFixture
      question={rangeQuestion}
      validationRules={createMultipleSelectValidationRules(rangeQuestion)}
    >
      {({ field, fieldState }) => (
        <MultipleSelectQuestion
          question={rangeQuestion}
          field={field}
          fieldState={fieldState}
        />
      )}
    </FormFixture>
  ),
};

export const WithExclusiveOption: Story = {
  render: () => {
    const exclusiveQuestion: Question = {
      ...baseQuestion,
      title: 'Select your preferences ("None of the above" is exclusive)',
      options: [
        {
          id: "option-1",
          label: "Option 1",
          value: "option_1",
          __typename: "QuestionOption",
        },
        {
          id: "option-2",
          label: "Option 2",
          value: "option_2",
          __typename: "QuestionOption",
        },
        {
          id: "option-3",
          label: "Option 3",
          value: "option_3",
          __typename: "QuestionOption",
        },
        {
          id: "none-option",
          label: "None of the above",
          value: "none",
          __typename: "QuestionOption",
        },
      ],
      config: {
        ...baseQuestion.config,
        mandatory: false,
        multiple_select: {
          range: null,
          exclusive_option: {
            enabled: true,
            option_id: "none-option",
            __typename: "ExclusiveOptionConfig",
          },
          __typename: "MultipleSelectConfig",
        },
      },
    };

    return (
      <FormFixture question={exclusiveQuestion}>
        {({ field, fieldState }) => (
          <MultipleSelectQuestion
            question={exclusiveQuestion}
            field={field}
            fieldState={fieldState}
          />
        )}
      </FormFixture>
    );
  },
};

export const NumberValues: Story = {
  render: () => {
    const numberQuestion: Question = {
      ...baseQuestion,
      title: "Multiple select (number)",
      data_point_value_type: "NUMBERS_ARRAY",
      options: [
        {
          id: "NRhfKVrRJ1qQ",
          label: "Option 1",
          value: "0",
          __typename: "QuestionOption",
        },
        {
          id: "kbdbxrZP9-cY",
          label: "Option 2",
          value: "1",
          __typename: "QuestionOption",
        },
        {
          id: "7EFDVDtvyZ6h",
          label: "Option 3",
          value: "2",
          __typename: "QuestionOption",
        },
        {
          id: "CKqrKwhPbObE",
          label: "Option 4",
          value: "3",
          __typename: "QuestionOption",
        },
      ],
    };

    return (
      <FormFixture question={numberQuestion}>
        {({ field, fieldState }) => (
          <MultipleSelectQuestion
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
        <MultipleSelectQuestion
          question={baseQuestion}
          field={field}
          fieldState={fieldState}
          disabled
        />
      )}
    </FormFixture>
  ),
};
