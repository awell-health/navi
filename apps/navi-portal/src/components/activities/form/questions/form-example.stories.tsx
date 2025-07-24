import type { Meta, StoryObj } from "@storybook/react";
import { useForm, Controller } from "react-hook-form";
import { DescriptionQuestion, ShortTextQuestion, getShortTextValidationRules } from "./index";
import type { Question } from "@/lib/awell-client/generated/graphql";
import { Button, Label } from "@/components/ui";

const meta: Meta = {
  title: "Form/Questions/Complete Form Example",
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

// Questions from storybook-activities.json
const descriptionQuestion: Question = {
  id: "desc1",
  key: "description",
  title: `
    <h2 class="slate-h2">User Information Form</h2>
    <p class="slate-p">Please provide your basic information below. Fields marked with an asterisk (*) are required.</p>
    <p class="slate-p"><strong class="slate-bold">Note:</strong> Your first name must be exactly 5 letters long.</p>
  `,
  definition_id: "desc1",
  question_type: "NO_INPUT",
  user_question_type: "DESCRIPTION",
  data_point_value_type: null,
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

const firstNameQuestion: Question = {
  id: "firstName",
  key: "firstName",
  title: "What is your first name?",
  definition_id: "firstName",
  question_type: "INPUT",
  user_question_type: "SHORT_TEXT",
  data_point_value_type: "STRING",
  is_required: true,
  options: [],
  config: {
    recode_enabled: false,
    use_select: null,
    mandatory: true,
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
  },
  rule: null,
};

const lastNameQuestion: Question = {
  id: "lastName",
  key: "lastName", 
  title: "What is your last name?",
  definition_id: "lastName",
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

function CompleteFormExample() {
  const { control, handleSubmit, formState: { errors, isValid }, watch } = useForm({
    mode: "onChange",
    defaultValues: {
      firstName: "",
      lastName: "",
    },
  });

  const watchedValues = watch();

  const onSubmit = (data: any) => {
    console.log("Form submitted:", data);
    alert(`Form submitted successfully!\n\nData: ${JSON.stringify(data, null, 2)}`);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Description */}
        <div>
          <DescriptionQuestion question={descriptionQuestion} />
        </div>

        {/* First Name with Validation */}
        <div className="space-y-3 p-6 bg-card border border-border rounded-lg">
          <Label className="text-base font-medium text-foreground">
            {firstNameQuestion.title}
            {firstNameQuestion.is_required && (
              <span className="text-destructive ml-1">*</span>
            )}
          </Label>
          <Controller
            name={firstNameQuestion.key}
            control={control}
            rules={getShortTextValidationRules(firstNameQuestion)}
            render={({ field }) => (
              <ShortTextQuestion
                question={firstNameQuestion}
                field={field}
                error={errors.firstName}
              />
            )}
          />
        </div>

        {/* Last Name */}
        <div className="space-y-3 p-6 bg-card border border-border rounded-lg">
          <Label className="text-base font-medium text-foreground">
            {lastNameQuestion.title}
            {lastNameQuestion.is_required && (
              <span className="text-destructive ml-1">*</span>
            )}
          </Label>
          <Controller
            name={lastNameQuestion.key}
            control={control}
            rules={getShortTextValidationRules(lastNameQuestion)}
            render={({ field }) => (
              <ShortTextQuestion
                question={lastNameQuestion}
                field={field}
                error={errors.lastName}
              />
            )}
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={!isValid} size="lg">
            Submit Form
          </Button>
        </div>
      </form>

      {/* Form State Display */}
      <div className="mt-8 p-4 bg-muted rounded-lg">
        <h3 className="font-medium mb-2">Form State:</h3>
        <div className="space-y-2 text-sm">
          <div>
            <strong>Values:</strong> {JSON.stringify(watchedValues, null, 2)}
          </div>
          <div>
            <strong>Errors:</strong> {Object.keys(errors).length > 0 ? JSON.stringify(errors, null, 2) : "None"}
          </div>
          <div>
            <strong>Valid:</strong> {isValid ? "Yes" : "No"}
          </div>
        </div>
      </div>
    </div>
  );
}

export const CompleteForm: Story = {
  render: () => <CompleteFormExample />,
};