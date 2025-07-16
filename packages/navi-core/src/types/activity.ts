// Import GraphQL generated types
// Generated from backend schema via 'pnpm codegen'
import type {
  ActivityInputType,
  ActivityStatus,
  Activity as GraphQLActivity,
  ChecklistActivityInput,
  ExtensionActivityInput,
  DynamicFormActivityInput,
  MessageActivityInput,
  FormActivityInput,
  CalculationActivityInput,
  ClinicalNoteActivityInput,
  ActivityObject,
  ActivityResolution,
  SubActivity,
  CompletionContextGraphQl,
  ActivityObjectType,
} from "../generated/graphql.js";

/**
 * Discriminated Union for Activity Inputs
 * Allows TypeScript to properly narrow types based on the 'type' field
 */
export type ActivityInput =
  | (FormActivityInput & { type: "FORM" })
  | (DynamicFormActivityInput & { type: "DYNAMIC_FORM" })
  | (MessageActivityInput & { type: "MESSAGE" })
  | (ChecklistActivityInput & { type: "CHECKLIST" })
  | (ExtensionActivityInput & { type: "EXTENSION" })
  | (CalculationActivityInput & { type: "CALCULATION" })
  | (ClinicalNoteActivityInput & { type: "CLINICAL_NOTE" });

/**
 * Activity Input Types - Re-exported from GraphQL schema
 * These represent the types of activities that can be interacted with
 */
export type { ActivityInputType };

/**
 * Core Activity Interface
 * This represents the minimal activity structure used throughout navi
 */
export interface ActivityType extends GraphQLActivity {
  id: string;
  status: ActivityStatus;
  inputs?: ActivityInput;
  careflow_id: string;
  object: ActivityObject;
  indirect_object?: ActivityObject | null;
  resolution?: ActivityResolution;
  sub_activities: SubActivity[];
  date: string;
  completion_context?: CompletionContextGraphQl | null;
  stakeholders?: ActivityObject[];
}

export type { ActivityObject, SubActivity, ActivityObjectType };
