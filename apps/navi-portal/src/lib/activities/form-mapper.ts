import type {
  ActivityFragment,
  Question,
  ActivityForm,
} from "@/lib/awell-client/generated/graphql";
import type {
  ConversationalFormStep,
  FormField,
} from "@/components/ui/conversational-form";

/**
 * Map Awell question type to conversational form field type
 */
function mapQuestionType(awellQuestion: Question): string {
  switch (awellQuestion.questionType) {
    case "INPUT":
      return "text";
    case "LONG_TEXT":
      return "textarea";
    case "NUMBER":
      return "number";
    case "DATE":
      return "date";
    case "EMAIL":
      return "email";
    case "PHONE":
      return "text";
    case "MULTIPLE_CHOICE":
      // Determine if it's radio or select based on options
      if (awellQuestion.options && awellQuestion.options.length <= 3) {
        return "radio";
      }
      return "select";
    case "MULTIPLE_SELECT":
      return "checkbox";
    case "YES_NO":
      return "radio";
    case "SLIDER":
      return "number";
    case "ADDRESS":
      return "textarea";
    case "FILE":
      return "text"; // Fallback for now
    case "SIGNATURE":
      return "text"; // Fallback for now
    default:
      return "text";
  }
}

/**
 * Map Awell form question to conversational form field
 */
function mapFormQuestion(awellQuestion: Question): FormField {
  const fieldType = mapQuestionType(awellQuestion);

  // Add yes/no options for boolean questions
  if (awellQuestion.questionType === "YES_NO") {
    return {
      id: awellQuestion.id,
      type: "radio",
      label: awellQuestion.title,
      description: awellQuestion.placeholder || "",
      required: awellQuestion.required ?? false,
      options: [
        { value: "yes", label: "Yes" },
        { value: "no", label: "No" },
      ],
    };
  }

  return {
    id: awellQuestion.id,
    type: fieldType as
      | "number"
      | "radio"
      | "text"
      | "email"
      | "textarea"
      | "select"
      | "checkbox"
      | "date",
    label: awellQuestion.title,
    description: awellQuestion.placeholder || "",
    required: awellQuestion.required ?? false,
    options: awellQuestion.options?.map((option) => ({
      value: option.value.toString(),
      label: option.label,
    })),
  };
}

/**
 * Convert Awell FormActivity to ConversationalFormStep
 */
export function mapFormActivityToSteps(
  formActivity: ActivityFragment & { form: ActivityForm }
): ConversationalFormStep[] {
  // For simplicity, create one step with all questions
  // In production, you might want to group questions into logical steps
  const step: ConversationalFormStep = {
    id: formActivity.id,
    title: formActivity.form?.title ?? "",
    fields: formActivity.form?.questions.map(mapFormQuestion) ?? [],
  };

  return [step];
}
