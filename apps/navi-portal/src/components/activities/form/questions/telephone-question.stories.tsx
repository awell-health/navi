import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import React from "react";
import { useForm, Controller } from "react-hook-form";
import { TelephoneQuestion } from "./telephone-question";
import type { Question } from "@/lib/awell-client/generated/graphql";
import { Typography } from "@/components/ui/typography";

const meta: Meta<typeof TelephoneQuestion> = {
  title: "Components/Form Questions/TelephoneQuestion",
  component: TelephoneQuestion,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Phone number input with country configuration and validation using react-hook-form",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof TelephoneQuestion>;

const baseQuestion: Question = {
  id: "test-telephone",
  key: "testTelephone",
  title: "Question that collects a phone number",
  definition_id: "phoneNumber",
  question_type: "INPUT",
  user_question_type: "TELEPHONE",
  data_point_value_type: "TELEPHONE",
  is_required: false,
  options: [],
  config: {
    recode_enabled: false,
    use_select: null,
    mandatory: false,
    slider: null,
    phone: {
      default_country: "GB",
      available_countries: [],
      __typename: "PhoneConfig"
    },
    number: null,
    multiple_select: null,
    date_validation: null,
    file_storage: null,
    input_validation: null,
    __typename: "QuestionConfig"
  },
  rule: null,
  __typename: "Question"
};

const usQuestion: Question = {
  ...baseQuestion,
  title: "US Phone number",
  config: {
    ...baseQuestion.config!,
    phone: {
      default_country: "US",
      available_countries: ["US"],
      __typename: "PhoneConfig"
    }
  }
};

const europeanQuestion: Question = {
  ...baseQuestion,
  title: "European phone number",
  config: {
    ...baseQuestion.config!,
    phone: {
      default_country: "GB",
      available_countries: ["BE", "FR", "DE", "PT", "ES", "GB", "CH"],
      __typename: "PhoneConfig"
    }
  }
};

// Simple wrapper for form context
function FormWrapper({ question }: { question: Question }) {
  const { control } = useForm({
    defaultValues: {
      [question.key]: "",
    },
  });

  return (
    <div className="w-96">
      <Controller
        name={question.key}
        control={control}
        render={({ field, fieldState }) => (
          <TelephoneQuestion
            question={question}
            field={field}
            fieldState={fieldState}
          />
        )}
      />
    </div>
  );
}

export const Default: Story = {
  render: () => <FormWrapper question={baseQuestion} />,
};

export const USPhoneNumber: Story = {
  render: () => <FormWrapper question={usQuestion} />,
};

export const EuropeanPhoneNumber: Story = {
  render: () => <FormWrapper question={europeanQuestion} />,
};

export const Required: Story = {
  render: () => (
    <FormWrapper
      question={{
        ...usQuestion,
        title: "Your phone number (required)",
        is_required: true,
      }}
    />
  ),
};

export const Disabled: Story = {
  render: () => {
    const { control } = useForm({
      defaultValues: { testTelephone: "+1 (555) 123-4567" },
    });

    return (
      <div className="w-96">
        <Controller
          name="testTelephone"
          control={control}
          render={({ field, fieldState }) => (
            <TelephoneQuestion
              question={usQuestion}
              field={field}
              fieldState={fieldState}
              disabled
            />
          )}
        />
      </div>
    );
  },
};

export const WithValidation: Story = {
  render: () => {
    const { control } = useForm({
      defaultValues: { testTelephone: "" },
      mode: "onChange",
    });

    return (
      <div className="w-96">
        <Controller
          name="testTelephone"
          control={control}
          rules={{
            required: "Phone number is required",
            pattern: {
              value: /^[\+]?[1-9][\d]{0,15}$/,
              message: "Please enter a valid phone number"
            }
          }}
          render={({ field, fieldState }) => (
            <TelephoneQuestion
              question={{
                ...usQuestion,
                title: "Your contact number (required)",
                is_required: true,
              }}
              field={field}
              fieldState={fieldState}
            />
          )}
        />
        <Typography.Small className="text-muted-foreground mt-4">
          This field is required and validates the phone number format.
        </Typography.Small>
      </div>
    );
  },
};