import type { Meta, StoryObj } from "@storybook/react";
import { useForm, Controller } from "react-hook-form";
import { ShortTextQuestion, getShortTextValidationRules } from "./short-text-question";
import type { Question } from "@/lib/awell-client/generated/graphql";
import { Button } from "@/components/ui";

const meta: Meta<typeof ShortTextQuestion> = {
  title: "Form/Questions/ShortTextQuestion",
  component: ShortTextQuestion,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  argTypes: {
    disabled: {
      control: "boolean",
      description: "Whether the question is disabled",
    },
    className: {
      control: "text",
      description: "Additional CSS classes",
    },
  },
};

export default meta;
type Story = StoryObj<typeof ShortTextQuestion>;

// Base question from storybook-activities.json
const baseQuestion: Question = {
  id: "cMK8eVpxfEYp",
  key: "firstName",
  title: "What is your first name?",
  definition_id: "mEHObAXFI81q",
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
  },
  rule: null,
};

// Question with validation from storybook-activities.json
const validationQuestion: Question = {
  ...baseQuestion,
  id: "cMK8eVpxfEYp",
  key: "firstName",
  title: "What is your first name?",
  is_required: false,
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
    input_validation: {
      mode: "simple",
      pattern: "^[A-Za-z]{5}$",
      helper_text: "5 letters, please",
      simpleConfig: {
        exactLength: 5,
        allowed: {
          letters: true,
          numbers: false,
          whitespace: false,
          special: false,
        },
      },
    },
  }
};

// Helper component that wraps ShortTextQuestion with react-hook-form
function FormWrapper({ question, defaultValue = "", disabled = false }: { 
  question: Question; 
  defaultValue?: string; 
  disabled?: boolean; 
}) {
  const { control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      [question.key]: defaultValue,
    },
  });

  const onSubmit = (data: any) => {
    console.log("Form submitted:", data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="text-sm font-medium text-foreground">
          {question.title}
          {question.is_required && <span className="text-destructive ml-1">*</span>}
        </label>
        <div className="mt-2">
          <Controller
            name={question.key}
            control={control}
            rules={getShortTextValidationRules(question)}
            render={({ field }) => (
              <ShortTextQuestion
                question={question}
                field={field}
                disabled={disabled}
                error={errors[question.key]}
              />
            )}
          />
        </div>
      </div>
      <Button type="submit">Submit</Button>
    </form>
  );
}

export const Default: Story = {
  render: () => <FormWrapper question={baseQuestion} />,
};

export const WithDefaultValue: Story = {
  render: () => <FormWrapper question={baseQuestion} defaultValue="John" />,
};

export const Required: Story = {
  render: () => <FormWrapper question={{ ...baseQuestion, is_required: true }} />,
};

export const WithValidation: Story = {
  render: () => <FormWrapper question={validationQuestion} />,
};

export const WithValidationAndValue: Story = {
  render: () => <FormWrapper question={validationQuestion} defaultValue="abc" />,
};

export const Disabled: Story = {
  render: () => <FormWrapper question={baseQuestion} defaultValue="John" disabled={true} />,
};

export const InteractiveForm: Story = {
  render: () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Interactive Form Example</h3>
      <p className="text-sm text-muted-foreground">
        Try entering text and submitting the form. Validation rules are applied automatically.
      </p>
      <FormWrapper question={validationQuestion} />
    </div>
  ),
};