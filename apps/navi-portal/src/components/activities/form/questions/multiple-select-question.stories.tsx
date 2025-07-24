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
          "Multiple select question component that renders as checkboxes by default, or as a responsive Select/Drawer when `question.config.use_select` is true. Uses react-hook-form Controller pattern and includes validation utilities.",
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
  title: "Which communication methods do you prefer?",
  definition_id: "communicationMethods",
  question_type: "INPUT",
  user_question_type: "MULTIPLE_CHOICE",
  data_point_value_type: "STRINGS_ARRAY",
  is_required: false,
  options: [
    {
      id: "option-1",
      label: "Email",
      value: "email",
      __typename: "QuestionOption",
    },
    {
      id: "option-2",
      label: "Phone",
      value: "phone",
      __typename: "QuestionOption",
    },
    {
      id: "option-3",
      label: "SMS/Text",
      value: "sms",
      __typename: "QuestionOption",
    },
    {
      id: "option-4",
      label: "Video Call",
      value: "video",
      __typename: "QuestionOption",
    },
    {
      id: "option-5",
      label: "In-Person",
      value: "in_person",
      __typename: "QuestionOption",
    },
  ],
  config: {
    recode_enabled: false,
    use_select: null,
    mandatory: false,
    slider: null,
    phone: null,
    number: null,
    multiple_select: {
      range: {
        enabled: false,
        min: null,
        max: null,
        __typename: "Range",
      },
      exclusive_option: {
        enabled: false,
        option_id: null,
        __typename: "ExclusiveOption",
      },
      __typename: "MultipleSelectConfig",
    },
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
        <MultipleSelectQuestion
          question={baseQuestion}
          field={field}
          fieldState={fieldState}
        />
      )}
    </FormFixture>
  ),
};

export const AsResponsiveSelect: Story = {
  render: () => {
    const question = {
      ...baseQuestion,
      title: "Select your preferred communication methods",
      config: {
        ...baseQuestion.config,
        use_select: true, // This triggers responsive Select/Drawer instead of checkboxes
        mandatory: false,
      },
    };

    return (
      <FormFixture question={question}>
        {({ field, fieldState }) => (
          <MultipleSelectQuestion
            question={question}
            field={field}
            fieldState={fieldState}
          />
        )}
      </FormFixture>
    );
  },
};

export const Required: Story = {
  render: () => {
    const question = {
      ...baseQuestion,
      title: "Which communication methods do you prefer? (required)",
      is_required: true,
    };

    return (
      <FormFixture
        question={question}
        validationRules={createMultipleSelectValidationRules(question)}
      >
        {({ field, fieldState }) => (
          <MultipleSelectQuestion
            question={question}
            field={field}
            fieldState={fieldState}
          />
        )}
      </FormFixture>
    );
  },
};

export const RequiredAsResponsiveSelect: Story = {
  render: () => {
    const question = {
      ...baseQuestion,
      title: "Select your preferred communication methods (required)",
      is_required: true,
      config: {
        ...baseQuestion.config,
        use_select: true,
        mandatory: false,
      },
    };

    return (
      <FormFixture
        question={question}
        validationRules={createMultipleSelectValidationRules(question)}
      >
        {({ field, fieldState }) => (
          <MultipleSelectQuestion
            question={question}
            field={field}
            fieldState={fieldState}
          />
        )}
      </FormFixture>
    );
  },
};

export const WithRangeValidation: Story = {
  render: () => {
    const question = {
      ...baseQuestion,
      title: "Choose 2-3 communication methods",
      is_required: true,
      config: {
        ...baseQuestion.config,
        multiple_select: {
          ...baseQuestion.config?.multiple_select,
          range: {
            enabled: true,
            min: 2,
            max: 3,
            __typename: "Range" as const,
          },
        },
      },
    };

    return (
      <FormFixture
        question={question}
        validationRules={createMultipleSelectValidationRules(question)}
      >
        {({ field, fieldState }) => (
          <MultipleSelectQuestion
            question={question}
            field={field}
            fieldState={fieldState}
          />
        )}
      </FormFixture>
    );
  },
};

export const WithRangeValidationAsSelect: Story = {
  render: () => {
    const question = {
      ...baseQuestion,
      title: "Select 2-3 communication methods",
      is_required: true,
      config: {
        ...baseQuestion.config,
        use_select: true,
        mandatory: false,
        multiple_select: {
          ...baseQuestion.config?.multiple_select,
          range: {
            enabled: true,
            min: 2,
            max: 3,
            __typename: "Range" as const,
          },
        },
      },
    };

    return (
      <FormFixture
        question={question}
        validationRules={createMultipleSelectValidationRules(question)}
      >
        {({ field, fieldState }) => (
          <MultipleSelectQuestion
            question={question}
            field={field}
            fieldState={fieldState}
          />
        )}
      </FormFixture>
    );
  },
};

export const WithExclusiveOption: Story = {
  render: () => {
    const question = {
      ...baseQuestion,
      title: "How would you like to be contacted?",
      options: [
        ...baseQuestion.options!,
        {
          id: "option-none",
          label: "None of the above",
          value: "none",
          __typename: "QuestionOption" as const,
        },
      ],
      config: {
        ...baseQuestion.config,
        multiple_select: {
          ...baseQuestion.config?.multiple_select,
          exclusive_option: {
            enabled: true,
            option_id: "option-none",
            __typename: "ExclusiveOption" as const,
          },
        },
      },
    };

    return (
      <FormFixture
        question={question}
        validationRules={createMultipleSelectValidationRules(question)}
      >
        {({ field, fieldState }) => (
          <MultipleSelectQuestion
            question={question}
            field={field}
            fieldState={fieldState}
          />
        )}
      </FormFixture>
    );
  },
};

export const WithExclusiveOptionAsSelect: Story = {
  render: () => {
    const question = {
      ...baseQuestion,
      title: "Select how you would like to be contacted",
      options: [
        ...baseQuestion.options!,
        {
          id: "option-none",
          label: "None of the above",
          value: "none",
          __typename: "QuestionOption" as const,
        },
      ],
      config: {
        ...baseQuestion.config,
        use_select: true,
        mandatory: false,
        multiple_select: {
          ...baseQuestion.config?.multiple_select,
          exclusive_option: {
            enabled: true,
            option_id: "option-none",
            __typename: "ExclusiveOption" as const,
          },
        },
      },
    };

    return (
      <FormFixture
        question={question}
        validationRules={createMultipleSelectValidationRules(question)}
      >
        {({ field, fieldState }) => (
          <MultipleSelectQuestion
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
  render: () => {
    const question = {
      ...baseQuestion,
      title: "Communication methods (readonly)",
    };

    return (
      <FormFixture question={question}>
        {({ field, fieldState }) => {
          // Set some default values for disabled state
          if (!field.value || field.value.length === 0) {
            field.onChange(["email", "phone"]);
          }
          return (
            <MultipleSelectQuestion
              question={question}
              field={field}
              fieldState={fieldState}
              disabled
            />
          );
        }}
      </FormFixture>
    );
  },
};

export const DisabledAsSelect: Story = {
  render: () => {
    const question = {
      ...baseQuestion,
      title: "Communication methods (readonly)",
      config: {
        ...baseQuestion.config,
        use_select: true,
        mandatory: false,
      },
    };

    return (
      <FormFixture question={question}>
        {({ field, fieldState }) => {
          // Set some default values for disabled state
          if (!field.value || field.value.length === 0) {
            field.onChange(["email", "phone"]);
          }
          return (
            <MultipleSelectQuestion
              question={question}
              field={field}
              fieldState={fieldState}
              disabled
            />
          );
        }}
      </FormFixture>
    );
  },
};
