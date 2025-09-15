import type {
  Activity as GraphQLActivity,
  FormActivityInput,
  MessageActivityInput,
  ChecklistActivityInput,
  DynamicFormActivityInput,
  ExtensionActivityInput,
  CalculationActivityInput,
  ClinicalNoteActivityInput,
} from "../generated/graphql";
import type { ActivityEventHandlers } from "./activity-event";

/**
 * Base activity interface - uses GraphQL Activity directly
 */
export type ActivityData = GraphQLActivity;

/**
 * Strongly-typed activity interfaces that guarantee specific input types
 */
export interface FormActivityData extends ActivityData {
  inputs: FormActivityInput;
}

export interface MessageActivityData extends ActivityData {
  inputs: MessageActivityInput;
}

export interface ChecklistActivityData extends ActivityData {
  inputs: ChecklistActivityInput;
}

export interface DynamicFormActivityData extends ActivityData {
  inputs: DynamicFormActivityInput;
}

export interface ExtensionActivityData extends ActivityData {
  inputs: ExtensionActivityInput;
}

export interface CalculationActivityData extends ActivityData {
  inputs: CalculationActivityInput;
}

export interface ClinicalNoteActivityData extends ActivityData {
  inputs: ClinicalNoteActivityInput;
}

/**
 * Type guards to safely convert ActivityData to specific types
 */
export function isFormActivity(
  activity: ActivityData
): activity is FormActivityData {
  return (
    activity.inputs !== null &&
    activity.inputs !== undefined &&
    (activity.inputs as any).__typename === "FormActivityInput" &&
    (activity.inputs as FormActivityInput).form !== null &&
    (activity.inputs as FormActivityInput).form !== undefined
  );
}

export function isMessageActivity(
  activity: ActivityData
): activity is MessageActivityData {
  return (
    activity.inputs !== null &&
    activity.inputs !== undefined &&
    (activity.inputs as any).__typename === "MessageActivityInput"
  );
}

export function isChecklistActivity(
  activity: ActivityData
): activity is ChecklistActivityData {
  return (
    activity.inputs !== null &&
    activity.inputs !== undefined &&
    (activity.inputs as any).__typename === "ChecklistActivityInput"
  );
}

export function isDynamicFormActivity(
  activity: ActivityData
): activity is DynamicFormActivityData {
  return (
    activity.inputs !== null &&
    activity.inputs !== undefined &&
    (activity.inputs as any).__typename === "DynamicFormActivityInput"
  );
}

export function isExtensionActivity(
  activity: ActivityData
): activity is ExtensionActivityData {
  return (
    activity.inputs !== null &&
    activity.inputs !== undefined &&
    (activity.inputs as any).__typename === "ExtensionActivityInput"
  );
}

export function isCalculationActivity(
  activity: ActivityData
): activity is CalculationActivityData {
  return (
    activity.inputs !== null &&
    activity.inputs !== undefined &&
    (activity.inputs as any).__typename === "CalculationActivityInput"
  );
}

export function isClinicalNoteActivity(
  activity: ActivityData
): activity is ClinicalNoteActivityData {
  return (
    activity.inputs !== null &&
    activity.inputs !== undefined &&
    (activity.inputs as any).__typename === "ClinicalNoteActivityInput"
  );
}

/**
 * Safe assertion functions with helpful errors
 */
export function assertFormActivity(activity: ActivityData): FormActivityData {
  if (!isFormActivity(activity)) {
    throw new Error(
      `Expected form activity but got activity type: ${
        (activity.inputs as any)?.__typename || "unknown"
      }. Make sure this activity has form inputs.`
    );
  }
  return activity;
}

export function assertMessageActivity(
  activity: ActivityData
): MessageActivityData {
  if (!isMessageActivity(activity)) {
    throw new Error(
      `Expected message activity but got activity type: ${
        (activity.inputs as any)?.__typename || "unknown"
      }. Make sure this activity has message inputs.`
    );
  }
  return activity;
}

export function assertChecklistActivity(
  activity: ActivityData
): ChecklistActivityData {
  if (!isChecklistActivity(activity)) {
    throw new Error(
      `Expected checklist activity but got activity type: ${
        (activity.inputs as any)?.__typename || "unknown"
      }. Make sure this activity has checklist inputs.`
    );
  }
  return activity;
}

export function assertExtensionActivity(
  activity: ActivityData
): ExtensionActivityData {
  console.log("🔍 Asserting extension activity", activity);
  if (!isExtensionActivity(activity)) {
    throw new Error(
      `Expected extension activity but got activity type: ${
        (activity.inputs as any)?.__typename || "unknown"
      }. Make sure this activity has extension inputs.`
    );
  }
  return activity;
}

/**
 * Updated BaseActivityProps using ActivityData instead of Activity class
 */
export interface BaseActivityProps {
  activity: ActivityData;
  disabled?: boolean;
  className?: string;
  eventHandlers?: ActivityEventHandlers;
}

/**
 * Specific activity prop interfaces
 */
export interface FormActivityProps extends Omit<BaseActivityProps, "activity"> {
  activity: FormActivityData;
}

export interface MessageActivityProps
  extends Omit<BaseActivityProps, "activity"> {
  activity: MessageActivityData;
}

export interface ChecklistActivityProps
  extends Omit<BaseActivityProps, "activity"> {
  activity: ChecklistActivityData;
}
