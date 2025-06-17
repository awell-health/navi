import type { Activity, Question } from '@/lib/awell-client/generated/graphql';
import type { ConversationalFormStep, FormField } from '@/components/ui/conversational-form';

/**
 * Map Awell question type to conversational form field type
 */
function mapQuestionType(awellQuestion: Question): string {
  switch (awellQuestion.userQuestionType) {
    case 'SHORT_TEXT':
      return 'text';
    case 'LONG_TEXT':
      return 'textarea';
    case 'NUMBER':
      return 'number';
    case 'DATE':
      return 'date';
    case 'MULTIPLE_CHOICE':
      // Determine if it's radio or select based on options
      if (awellQuestion.options && awellQuestion.options.length <= 3) {
        return 'radio';
      }
      return 'select';
    case 'YES_NO':
      return 'radio';
    default:
      return 'text';
  }
}

/**
 * Map Awell form question to conversational form field
 */
function mapFormQuestion(awellQuestion: Question): FormField {
  const fieldType = mapQuestionType(awellQuestion);

  // Add yes/no options for boolean questions
  if (awellQuestion.userQuestionType === 'YES_NO') {
    return {
      id: awellQuestion.id,
      type: 'radio',
      label: awellQuestion.title,
      description: awellQuestion.metadata ?? '',
      required: awellQuestion.questionConfig?.mandatory ?? false,
      options: [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' },
      ],
    };
  }

  // Handle validation for different field types
  const validation: FormField['validation'] = {};
  
  if (awellQuestion.questionConfig?.number?.range) {
    const range = awellQuestion.questionConfig?.number?.range;
    if (range?.min !== undefined && range.min !== null) validation.min = range.min;
    if (range?.max !== undefined && range.max !== null) validation.max = range.max;
  }

  return {
    id: awellQuestion.id,
    type: fieldType as 'number' | 'radio' | 'text' | 'email' | 'textarea' | 'select' | 'checkbox' | 'date',
    label: awellQuestion.title,
    description: awellQuestion.metadata ?? '',
    required: awellQuestion.questionConfig?.mandatory ?? false,
    options: awellQuestion.options?.map(option => ({
      value: option.value.toString(),
      label: option.label,
    })),
    validation: Object.keys(validation).length > 0 ? validation : undefined,
  };
}

/**
 * Convert Awell FormActivity to ConversationalFormStep
 */
export function mapFormActivityToSteps(formActivity: Activity & { form: Required<Activity['form']>}): ConversationalFormStep[] {
  // For simplicity, create one step with all questions
  // In production, you might want to group questions into logical steps
  const step: ConversationalFormStep = {
    id: formActivity.id,
    title: formActivity.form?.title ?? '',
    fields: formActivity.form?.questions.map(mapFormQuestion) ?? [],
  };

  return [step];
}
