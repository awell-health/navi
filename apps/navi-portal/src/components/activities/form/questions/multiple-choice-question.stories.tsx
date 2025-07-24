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
          "Multiple choice question component that renders as radio buttons by default, or as a Select dropdown when `question.config.use_select` is true. Uses react-hook-form Controller pattern and includes validation utilities.",
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
  title: "What is your preferred contact method?",
  definition_id: "contactMethod",
  question_type: "INPUT",
  user_question_type: "MULTIPLE_CHOICE",
  data_point_value_type: "STRING",
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
      label: "Mail",
      value: "mail",
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
        <MultipleChoiceQuestion
          question={baseQuestion}
          field={field}
          fieldState={fieldState}
        />
      )}
    </FormFixture>
  ),
};

export const AsSelectDropdown: Story = {
  render: () => {
    const question = {
      ...baseQuestion,
      title: "Select your preferred contact method",
      config: {
        ...baseQuestion.config,
        use_select: true, // This triggers Select dropdown instead of radio buttons
        mandatory: false,
      },
    };

    return (
      <FormFixture question={question}>
        {({ field, fieldState }) => (
          <MultipleChoiceQuestion
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
      title: "What is your preferred contact method? (required)",
      is_required: true,
    };

    return (
      <FormFixture
        question={question}
        validationRules={createMultipleChoiceValidationRules(question)}
      >
        {({ field, fieldState }) => (
          <MultipleChoiceQuestion
            question={question}
            field={field}
            fieldState={fieldState}
          />
        )}
      </FormFixture>
    );
  },
};

export const RequiredAsSelect: Story = {
  render: () => {
    const question = {
      ...baseQuestion,
      title: "Select your preferred contact method (required)",
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
        validationRules={createMultipleChoiceValidationRules(question)}
      >
        {({ field, fieldState }) => (
          <MultipleChoiceQuestion
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
      title: "Choose your communication preference (required)",
      is_required: true,
    };

    return (
      <FormFixture
        question={question}
        validationRules={createMultipleChoiceValidationRules(question)}
      >
        {({ field, fieldState }) => (
          <MultipleChoiceQuestion
            question={question}
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
    const question = {
      ...baseQuestion,
      title: "Rate your experience (1-5)",
      options: [
        {
          id: "1",
          label: "1 - Very Poor",
          value: "1",
          __typename: "QuestionOption" as const,
        },
        {
          id: "2",
          label: "2 - Poor",
          value: "2",
          __typename: "QuestionOption" as const,
        },
        {
          id: "3",
          label: "3 - Average",
          value: "3",
          __typename: "QuestionOption" as const,
        },
        {
          id: "4",
          label: "4 - Good",
          value: "4",
          __typename: "QuestionOption" as const,
        },
        {
          id: "5",
          label: "5 - Excellent",
          value: "5",
          __typename: "QuestionOption" as const,
        },
      ],
    };

    return (
      <FormFixture question={question}>
        {({ field, fieldState }) => (
          <MultipleChoiceQuestion
            question={question}
            field={field}
            fieldState={fieldState}
          />
        )}
      </FormFixture>
    );
  },
};

export const NumberValuesAsSelect: Story = {
  render: () => {
    const question = {
      ...baseQuestion,
      title: "Rate your experience (1-5)",
      options: [
        {
          id: "1",
          label: "1 - Very Poor",
          value: "1",
          __typename: "QuestionOption" as const,
        },
        {
          id: "2",
          label: "2 - Poor",
          value: "2",
          __typename: "QuestionOption" as const,
        },
        {
          id: "3",
          label: "3 - Average",
          value: "3",
          __typename: "QuestionOption" as const,
        },
        {
          id: "4",
          label: "4 - Good",
          value: "4",
          __typename: "QuestionOption" as const,
        },
        {
          id: "5",
          label: "5 - Excellent",
          value: "5",
          __typename: "QuestionOption" as const,
        },
      ],
      config: {
        ...baseQuestion.config,
        use_select: true,
        mandatory: false,
      },
    };

    return (
      <FormFixture question={question}>
        {({ field, fieldState }) => (
          <MultipleChoiceQuestion
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
      title: "Contact method (readonly)",
    };

    return (
      <FormFixture question={question}>
        {({ field, fieldState }) => {
          // Set a default value for disabled state
          if (!field.value) {
            field.onChange("email");
          }
          return (
            <MultipleChoiceQuestion
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
      title: "Contact method (readonly)",
      config: {
        ...baseQuestion.config,
        use_select: true,
        mandatory: false,
      },
    };

    return (
      <FormFixture question={question}>
        {({ field, fieldState }) => {
          // Set a default value for disabled state
          if (!field.value) {
            field.onChange("email");
          }
          return (
            <MultipleChoiceQuestion
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
