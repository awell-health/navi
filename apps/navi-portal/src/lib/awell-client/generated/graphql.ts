import { gql } from '@apollo/client';
import * as ApolloReactCommon from '@apollo/client';
import * as ApolloReactHooks from '@apollo/client';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
const defaultOptions = {} as const;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** The `JSON` scalar type represents JSON values as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
  JSON: { input: unknown; output: unknown; }
};

export type ActivitiesPayload = {
  __typename?: 'ActivitiesPayload';
  activities: Array<Activity>;
  code: Scalars['String']['output'];
  message?: Maybe<Scalars['String']['output']>;
  success: Scalars['Boolean']['output'];
  totalCount?: Maybe<Scalars['Float']['output']>;
};

export type Activity = {
  __typename?: 'Activity';
  action: ActivityAction;
  careflow_id: Scalars['String']['output'];
  completion_context?: Maybe<CompletionContextGraphQl>;
  container_name?: Maybe<Scalars['String']['output']>;
  date: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  indirect_object?: Maybe<ActivityObject>;
  inputs?: Maybe<ActivityInput>;
  is_user_activity: Scalars['Boolean']['output'];
  object: ActivityObject;
  outputs?: Maybe<ActivityOutput>;
  pathway_definition_id: Scalars['String']['output'];
  reference_id: Scalars['String']['output'];
  reference_type: ActivityReferenceType;
  resolution?: Maybe<ActivityResolution>;
  session_id?: Maybe<Scalars['String']['output']>;
  stakeholders?: Maybe<Array<ActivityObject>>;
  status: ActivityStatus;
  sub_activities: Array<SubActivity>;
  tenant_id: Scalars['String']['output'];
};

export type ActivityAction =
  | 'ACTIVATE'
  | 'ADDED'
  | 'ASSIGNED'
  | 'COMPLETE'
  | 'COMPUTED'
  | 'DELEGATED'
  | 'DELIVER'
  | 'DISCARDED'
  | 'EXPIRED'
  | 'FAILED'
  | 'FAILED_TO_SEND'
  | 'GENERATED'
  | 'IS_WAITING_ON'
  | 'POSTPONED'
  | 'PROCESSED'
  | 'READ'
  | 'REMIND'
  | 'REPORTED'
  | 'SCHEDULED'
  | 'SEND'
  | 'SKIPPED'
  | 'STOPPED'
  | 'SUBMITTED';

export type ActivityForm = {
  __typename?: 'ActivityForm';
  id: Scalars['String']['output'];
  key: Scalars['String']['output'];
  metadata?: Maybe<Scalars['String']['output']>;
  questions: Array<Question>;
  title: Scalars['String']['output'];
  trademark?: Maybe<Scalars['String']['output']>;
};

export type ActivityInput = {
  type: ActivityInputType;
};

export type ActivityInputType =
  | 'CALCULATION'
  | 'CHECKLIST'
  | 'CLINICAL_NOTE'
  | 'DYNAMIC_FORM'
  | 'EXTENSION'
  | 'FORM'
  | 'MESSAGE';

export type ActivityMessage = {
  __typename?: 'ActivityMessage';
  attachments?: Maybe<Array<MessageAttachment>>;
  body: Scalars['String']['output'];
  format?: Maybe<MessageFormat>;
  id: Scalars['ID']['output'];
  subject: Scalars['String']['output'];
};

export type ActivityObject = {
  __typename?: 'ActivityObject';
  email?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  preferred_language?: Maybe<Scalars['String']['output']>;
  type: ActivityObjectType;
};

export type ActivityObjectType =
  | 'ACTION'
  | 'AGENT'
  | 'API_CALL'
  | 'CALCULATION'
  | 'CHECKLIST'
  | 'CLINICAL_NOTE'
  | 'DECISION'
  | 'EMR_REPORT'
  | 'EMR_REQUEST'
  | 'EVALUATED_RULE'
  | 'FORM'
  | 'MESSAGE'
  | 'PATHWAY'
  | 'PATIENT'
  | 'PLUGIN'
  | 'PLUGIN_ACTION'
  | 'REMINDER'
  | 'STAKEHOLDER'
  | 'STEP'
  | 'TIMER'
  | 'TRACK'
  | 'USER';

export type ActivityOutput = {
  type: ActivityOutputType;
};

export type ActivityOutputType =
  | 'CALCULATION'
  | 'DYNAMIC_FORM'
  | 'EXTENSION'
  | 'FORM';

export type ActivityPayload = {
  __typename?: 'ActivityPayload';
  activity?: Maybe<Activity>;
  code: Scalars['String']['output'];
  message?: Maybe<Scalars['String']['output']>;
  success: Scalars['Boolean']['output'];
};

export type ActivityReferenceType =
  | 'AGENT'
  | 'NAVIGATION'
  | 'ORCHESTRATION'
  | 'REMINDER';

export type ActivityResolution =
  | 'CANCELLED'
  | 'EXPIRED'
  | 'FAILURE'
  | 'SUCCESS';

export type ActivityStatus =
  | 'ACTIVE'
  | 'CANCELLED'
  | 'DONE'
  | 'FAILED'
  | 'POSTPONED'
  | 'SCHEDULED'
  | 'STOPPED';

export type AllowedDatesOptions =
  | 'ALL'
  | 'FUTURE'
  | 'PAST';

export type BooleanOperator =
  | 'AND'
  | 'OR';

export type CalculationActivityInput = ActivityInput & {
  __typename?: 'CalculationActivityInput';
  fields?: Maybe<Array<CalculationField>>;
  type: ActivityInputType;
};

export type CalculationActivityOutput = ActivityOutput & {
  __typename?: 'CalculationActivityOutput';
  results?: Maybe<Scalars['JSON']['output']>;
  type: ActivityOutputType;
};

export type CalculationField = {
  __typename?: 'CalculationField';
  id: Scalars['ID']['output'];
  key: Scalars['String']['output'];
  label: Scalars['String']['output'];
  value: Scalars['JSON']['output'];
};

export type Checklist = {
  __typename?: 'Checklist';
  items: Array<Scalars['String']['output']>;
  title: Scalars['String']['output'];
};

export type ChecklistActivityInput = ActivityInput & {
  __typename?: 'ChecklistActivityInput';
  checklist?: Maybe<Checklist>;
  type: ActivityInputType;
};

export type ChoiceRangeConfig = {
  __typename?: 'ChoiceRangeConfig';
  enabled?: Maybe<Scalars['Boolean']['output']>;
  max?: Maybe<Scalars['Float']['output']>;
  min?: Maybe<Scalars['Float']['output']>;
};

export type ClinicalNote = {
  __typename?: 'ClinicalNote';
  context: Array<GeneratedClinicalNoteContextField>;
  id: Scalars['ID']['output'];
  narratives: Array<GeneratedClinicalNoteNarrative>;
};

export type ClinicalNoteActivityInput = ActivityInput & {
  __typename?: 'ClinicalNoteActivityInput';
  clinicalNote?: Maybe<ClinicalNote>;
  type: ActivityInputType;
};

export type CompleteActivityInput = {
  activity_id: Scalars['ID']['input'];
  completion_context: CompletionContextInput;
  input_data?: InputMaybe<Scalars['JSON']['input']>;
  input_type: ActivityInputType;
};

export type CompleteActivityPayload = {
  __typename?: 'CompleteActivityPayload';
  activity?: Maybe<Activity>;
  code: Scalars['String']['output'];
  data?: Maybe<Scalars['JSON']['output']>;
  message?: Maybe<Scalars['String']['output']>;
  success: Scalars['Boolean']['output'];
};

export type CompletionContextGraphQl = {
  __typename?: 'CompletionContextGraphQL';
  completed_at: Scalars['String']['output'];
  user_email?: Maybe<Scalars['String']['output']>;
  user_id?: Maybe<Scalars['String']['output']>;
  user_name?: Maybe<Scalars['String']['output']>;
  user_type: CompletionContextUserType;
};

export type CompletionContextInput = {
  completed_at: Scalars['String']['input'];
  user_email?: InputMaybe<Scalars['String']['input']>;
  user_id?: InputMaybe<Scalars['String']['input']>;
  user_name?: InputMaybe<Scalars['String']['input']>;
  user_type: CompletionContextUserType;
};

export type CompletionContextUserType =
  | 'AGENT'
  | 'AUTHENTICATED_USER'
  | 'PATIENT'
  | 'SYSTEM'
  | 'UNAUTHENTICATED_USER';

export type Condition = {
  __typename?: 'Condition';
  id: Scalars['ID']['output'];
  operand: ConditionOperand;
  operator: ConditionOperator;
  reference: Scalars['String']['output'];
  reference_key: Scalars['String']['output'];
};

export type ConditionOperand = {
  __typename?: 'ConditionOperand';
  type: ConditionOperandType;
  value: Scalars['String']['output'];
};

export type ConditionOperandType =
  | 'BOOLEAN'
  | 'DATA_POINT'
  | 'DATA_SOURCE'
  | 'NUMBER'
  | 'NUMBERS_ARRAY'
  | 'STRING'
  | 'STRINGS_ARRAY';

export type ConditionOperator =
  | 'CONTAINS'
  | 'DOES_NOT_CONTAIN'
  | 'HAS_FILE_UPLOADED'
  | 'HAS_NO_FILE_UPLOADED'
  | 'IS_ANY_OF'
  | 'IS_EMPTY'
  | 'IS_EQUAL_TO'
  | 'IS_GREATER_THAN'
  | 'IS_GREATER_THAN_OR_EQUAL_TO'
  | 'IS_IN_RANGE'
  | 'IS_LESS_THAN'
  | 'IS_LESS_THAN_OR_EQUAL_TO'
  | 'IS_LESS_THAN_X_DAYS_AGO'
  | 'IS_MORE_THAN_X_DAYS_AGO'
  | 'IS_NONE_OF'
  | 'IS_NOT_EMPTY'
  | 'IS_NOT_EQUAL_TO'
  | 'IS_NOT_TRUE'
  | 'IS_TODAY'
  | 'IS_TRUE';

export type CreateActivityInput = {
  careflow_id: Scalars['String']['input'];
  input_data?: InputMaybe<Scalars['String']['input']>;
  input_type?: InputMaybe<ActivityInputType>;
  pathway_definition_id: Scalars['String']['input'];
  reference_id: Scalars['String']['input'];
  session_id?: InputMaybe<Scalars['String']['input']>;
  tenant_id: Scalars['String']['input'];
};

export type DataPointValueType =
  | 'ATTACHMENT'
  | 'ATTACHMENTS_ARRAY'
  | 'BOOLEAN'
  | 'DATE'
  | 'JSON'
  | 'NUMBER'
  | 'NUMBERS_ARRAY'
  | 'STRING'
  | 'STRINGS_ARRAY'
  | 'TELEPHONE';

export type DateConfig = {
  __typename?: 'DateConfig';
  allowed_dates?: Maybe<AllowedDatesOptions>;
  include_date_of_response?: Maybe<Scalars['Boolean']['output']>;
};

export type DynamicForm = {
  __typename?: 'DynamicForm';
  key: Scalars['String']['output'];
  questions: Array<DynamicQuestion>;
  title: Scalars['String']['output'];
  trademark?: Maybe<Scalars['String']['output']>;
};

export type DynamicFormActivityInput = ActivityInput & {
  __typename?: 'DynamicFormActivityInput';
  dynamic_form?: Maybe<DynamicForm>;
  type: ActivityInputType;
};

export type DynamicFormActivityOutput = ActivityOutput & {
  __typename?: 'DynamicFormActivityOutput';
  response?: Maybe<Scalars['JSON']['output']>;
  type: ActivityOutputType;
};

export type DynamicQuestion = {
  __typename?: 'DynamicQuestion';
  config?: Maybe<QuestionConfig>;
  data_point_value_type?: Maybe<DataPointValueType>;
  id: Scalars['ID']['output'];
  is_required: Scalars['Boolean']['output'];
  key: Scalars['String']['output'];
  options?: Maybe<Array<QuestionOption>>;
  question_type: QuestionType;
  title: Scalars['String']['output'];
  user_question_type?: Maybe<UserQuestionType>;
};

export type ExclusiveOptionConfig = {
  __typename?: 'ExclusiveOptionConfig';
  enabled?: Maybe<Scalars['Boolean']['output']>;
  option_id?: Maybe<Scalars['String']['output']>;
};

export type ExtensionActivityInput = ActivityInput & {
  __typename?: 'ExtensionActivityInput';
  fields?: Maybe<Scalars['JSON']['output']>;
  type: ActivityInputType;
};

export type ExtensionActivityOutput = ActivityOutput & {
  __typename?: 'ExtensionActivityOutput';
  results?: Maybe<Scalars['JSON']['output']>;
  type: ActivityOutputType;
};

export type FileStorageQuestionConfig = {
  __typename?: 'FileStorageQuestionConfig';
  accepted_file_types?: Maybe<Array<Scalars['String']['output']>>;
  file_storage_config_slug?: Maybe<Scalars['String']['output']>;
};

export type FormActivityInput = ActivityInput & {
  __typename?: 'FormActivityInput';
  form?: Maybe<ActivityForm>;
  type: ActivityInputType;
};

export type FormActivityOutput = ActivityOutput & {
  __typename?: 'FormActivityOutput';
  response?: Maybe<Scalars['JSON']['output']>;
  type: ActivityOutputType;
};

export type GeneratedClinicalNoteContextField = {
  __typename?: 'GeneratedClinicalNoteContextField';
  key: Scalars['String']['output'];
  value: Scalars['String']['output'];
};

export type GeneratedClinicalNoteNarrative = {
  __typename?: 'GeneratedClinicalNoteNarrative';
  body: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  key: Scalars['String']['output'];
  title: Scalars['String']['output'];
};

export type InputValidationAllowed = {
  __typename?: 'InputValidationAllowed';
  letters?: Maybe<Scalars['Boolean']['output']>;
  numbers?: Maybe<Scalars['Boolean']['output']>;
  special?: Maybe<Scalars['Boolean']['output']>;
  whitespace?: Maybe<Scalars['Boolean']['output']>;
};

export type InputValidationConfig = {
  __typename?: 'InputValidationConfig';
  helper_text?: Maybe<Scalars['String']['output']>;
  mode?: Maybe<Scalars['String']['output']>;
  pattern?: Maybe<Scalars['String']['output']>;
  simpleConfig?: Maybe<InputValidationSimpleConfig>;
};

export type InputValidationSimpleConfig = {
  __typename?: 'InputValidationSimpleConfig';
  allowed?: Maybe<InputValidationAllowed>;
  exactLength?: Maybe<Scalars['Float']['output']>;
};

export type MessageActivityInput = ActivityInput & {
  __typename?: 'MessageActivityInput';
  message?: Maybe<ActivityMessage>;
  type: ActivityInputType;
};

export type MessageAttachment = {
  __typename?: 'MessageAttachment';
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  type: Scalars['String']['output'];
  url: Scalars['String']['output'];
};

export type MessageFormat =
  | 'HTML'
  | 'MARKDOWN'
  | 'SLATE';

export type MultipleSelectConfig = {
  __typename?: 'MultipleSelectConfig';
  exclusive_option?: Maybe<ExclusiveOptionConfig>;
  range?: Maybe<ChoiceRangeConfig>;
};

export type Mutation = {
  __typename?: 'Mutation';
  completeActivity: CompleteActivityPayload;
  createActivity: ActivityPayload;
  updateActivity: ActivityPayload;
};


export type MutationCompleteActivityArgs = {
  input: CompleteActivityInput;
};


export type MutationCreateActivityArgs = {
  input: CreateActivityInput;
};


export type MutationUpdateActivityArgs = {
  input: UpdateActivityInput;
};

export type NumberConfig = {
  __typename?: 'NumberConfig';
  range?: Maybe<RangeConfig>;
};

export type PaginationInput = {
  count?: Scalars['Float']['input'];
  offset?: Scalars['Float']['input'];
};

export type PhoneConfig = {
  __typename?: 'PhoneConfig';
  available_countries?: Maybe<Array<Scalars['String']['output']>>;
  default_country?: Maybe<Scalars['String']['output']>;
};

export type Query = {
  __typename?: 'Query';
  activities: ActivitiesPayload;
  activity: ActivityPayload;
  pathwayActivities: ActivitiesPayload;
};


export type QueryActivitiesArgs = {
  pagination?: InputMaybe<PaginationInput>;
  pathway_id?: InputMaybe<Scalars['String']['input']>;
  sorting?: InputMaybe<SortingInput>;
  track_id?: InputMaybe<Scalars['String']['input']>;
};


export type QueryActivityArgs = {
  id: Scalars['ID']['input'];
};


export type QueryPathwayActivitiesArgs = {
  pagination?: InputMaybe<PaginationInput>;
  pathway_id?: InputMaybe<Scalars['String']['input']>;
  sorting?: InputMaybe<SortingInput>;
  track_id?: InputMaybe<Scalars['String']['input']>;
};

export type Question = {
  __typename?: 'Question';
  config?: Maybe<QuestionConfig>;
  data_point_value_type?: Maybe<DataPointValueType>;
  definition_id: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  is_required: Scalars['Boolean']['output'];
  key: Scalars['String']['output'];
  metadata?: Maybe<Scalars['String']['output']>;
  options?: Maybe<Array<QuestionOption>>;
  question_type?: Maybe<QuestionType>;
  rule?: Maybe<Rule>;
  title: Scalars['String']['output'];
  user_question_type?: Maybe<UserQuestionType>;
};

export type QuestionConfig = {
  __typename?: 'QuestionConfig';
  date_validation?: Maybe<DateConfig>;
  file_storage?: Maybe<FileStorageQuestionConfig>;
  input_validation?: Maybe<InputValidationConfig>;
  mandatory: Scalars['Boolean']['output'];
  multiple_select?: Maybe<MultipleSelectConfig>;
  number?: Maybe<NumberConfig>;
  phone?: Maybe<PhoneConfig>;
  recode_enabled?: Maybe<Scalars['Boolean']['output']>;
  slider?: Maybe<SliderConfig>;
  use_select?: Maybe<Scalars['Boolean']['output']>;
};

export type QuestionOption = {
  __typename?: 'QuestionOption';
  id: Scalars['String']['output'];
  label: Scalars['String']['output'];
  value?: Maybe<Scalars['String']['output']>;
  value_string?: Maybe<Scalars['String']['output']>;
};

export type QuestionType =
  | 'INPUT'
  | 'MULTIPLE_CHOICE'
  | 'NO_INPUT';

export type RangeConfig = {
  __typename?: 'RangeConfig';
  enabled?: Maybe<Scalars['Boolean']['output']>;
  max?: Maybe<Scalars['Float']['output']>;
  min?: Maybe<Scalars['Float']['output']>;
};

export type Rule = {
  __typename?: 'Rule';
  boolean_operator: BooleanOperator;
  conditions: Array<Condition>;
  id: Scalars['ID']['output'];
};

export type SliderConfig = {
  __typename?: 'SliderConfig';
  display_marks: Scalars['Boolean']['output'];
  is_value_tooltip_on: Scalars['Boolean']['output'];
  max: Scalars['Float']['output'];
  max_label: Scalars['String']['output'];
  min: Scalars['Float']['output'];
  min_label: Scalars['String']['output'];
  show_min_max_values: Scalars['Boolean']['output'];
  step_value: Scalars['Float']['output'];
};

export type SortingInput = {
  direction?: Scalars['String']['input'];
  field?: Scalars['String']['input'];
};

export type SubActivity = {
  __typename?: 'SubActivity';
  action: ActivityAction;
  id: Scalars['ID']['output'];
  object?: Maybe<ActivityObject>;
};

export type Subscription = {
  __typename?: 'Subscription';
  activityCompleted: Activity;
  activityCreated: Activity;
  activityExpired: Activity;
  activityUpdated: Activity;
  sessionActivityCompleted: Activity;
  sessionActivityCreated: Activity;
  sessionActivityExpired: Activity;
  sessionActivityUpdated: Activity;
};


export type SubscriptionActivityCompletedArgs = {
  careflow_id?: InputMaybe<Scalars['String']['input']>;
  only_patient_activities?: InputMaybe<Scalars['Boolean']['input']>;
};


export type SubscriptionActivityCreatedArgs = {
  careflow_id?: InputMaybe<Scalars['String']['input']>;
  only_patient_activities?: InputMaybe<Scalars['Boolean']['input']>;
};


export type SubscriptionActivityExpiredArgs = {
  careflow_id?: InputMaybe<Scalars['String']['input']>;
  only_patient_activities?: InputMaybe<Scalars['Boolean']['input']>;
};


export type SubscriptionActivityUpdatedArgs = {
  careflow_id?: InputMaybe<Scalars['String']['input']>;
  only_patient_activities?: InputMaybe<Scalars['Boolean']['input']>;
};


export type SubscriptionSessionActivityCompletedArgs = {
  only_stakeholder_activities?: InputMaybe<Scalars['Boolean']['input']>;
};


export type SubscriptionSessionActivityCreatedArgs = {
  only_stakeholder_activities?: InputMaybe<Scalars['Boolean']['input']>;
};


export type SubscriptionSessionActivityExpiredArgs = {
  only_stakeholder_activities?: InputMaybe<Scalars['Boolean']['input']>;
};


export type SubscriptionSessionActivityUpdatedArgs = {
  only_stakeholder_activities?: InputMaybe<Scalars['Boolean']['input']>;
};

export type UpdateActivityInput = {
  id: Scalars['ID']['input'];
  input_data?: InputMaybe<Scalars['String']['input']>;
  input_type?: InputMaybe<ActivityInputType>;
  output_data?: InputMaybe<Scalars['String']['input']>;
};

export type UserQuestionType =
  | 'DATE'
  | 'DESCRIPTION'
  | 'EMAIL'
  | 'FILE'
  | 'ICD10_CLASSIFICATION'
  | 'IMAGE'
  | 'LONG_TEXT'
  | 'MULTIPLE_CHOICE'
  | 'MULTIPLE_CHOICE_GRID'
  | 'MULTIPLE_SELECT'
  | 'NUMBER'
  | 'SHORT_TEXT'
  | 'SIGNATURE'
  | 'SLIDER'
  | 'TELEPHONE'
  | 'YES_NO';

export type CompleteActivityMutationVariables = Exact<{
  input: CompleteActivityInput;
}>;


export type CompleteActivityMutation = { __typename?: 'Mutation', completeActivity: { __typename?: 'CompleteActivityPayload', success: boolean, code: string, message?: string | null, data?: unknown | null, activity?: { __typename?: 'Activity', id: string, action: ActivityAction, careflow_id: string, container_name?: string | null, date: string, pathway_definition_id: string, reference_id: string, reference_type: ActivityReferenceType, resolution?: ActivityResolution | null, session_id?: string | null, status: ActivityStatus, tenant_id: string, is_user_activity: boolean, indirect_object?: { __typename?: 'ActivityObject', id: string, type: ActivityObjectType, name: string, email?: string | null, preferred_language?: string | null } | null, object: { __typename?: 'ActivityObject', id: string, type: ActivityObjectType, name: string, email?: string | null, preferred_language?: string | null }, sub_activities: Array<{ __typename?: 'SubActivity', id: string, action: ActivityAction, object?: { __typename?: 'ActivityObject', id: string, type: ActivityObjectType, name: string, email?: string | null, preferred_language?: string | null } | null }>, inputs?: { __typename: 'CalculationActivityInput', type: ActivityInputType, calculationFields?: Array<{ __typename?: 'CalculationField', id: string, key: string, label: string, value: unknown }> | null } | { __typename: 'ChecklistActivityInput', type: ActivityInputType, checklist?: { __typename?: 'Checklist', title: string, items: Array<string> } | null } | { __typename: 'ClinicalNoteActivityInput', type: ActivityInputType, clinicalNote?: { __typename?: 'ClinicalNote', id: string, narratives: Array<{ __typename?: 'GeneratedClinicalNoteNarrative', id: string, key: string, title: string, body: string }>, context: Array<{ __typename?: 'GeneratedClinicalNoteContextField', key: string, value: string }> } | null } | { __typename: 'DynamicFormActivityInput', type: ActivityInputType, dynamic_form?: { __typename?: 'DynamicForm', key: string, title: string, trademark?: string | null, questions: Array<{ __typename?: 'DynamicQuestion', id: string, key: string, title: string, question_type: QuestionType, user_question_type?: UserQuestionType | null, data_point_value_type?: DataPointValueType | null, is_required: boolean, options?: Array<{ __typename?: 'QuestionOption', id: string, label: string, value?: string | null }> | null, config?: { __typename?: 'QuestionConfig', recode_enabled?: boolean | null, use_select?: boolean | null, mandatory: boolean, slider?: { __typename?: 'SliderConfig', min: number, max: number, step_value: number, min_label: string, max_label: string, is_value_tooltip_on: boolean, display_marks: boolean, show_min_max_values: boolean } | null, phone?: { __typename?: 'PhoneConfig', default_country?: string | null, available_countries?: Array<string> | null } | null, number?: { __typename?: 'NumberConfig', range?: { __typename?: 'RangeConfig', enabled?: boolean | null, min?: number | null, max?: number | null } | null } | null, multiple_select?: { __typename?: 'MultipleSelectConfig', range?: { __typename?: 'ChoiceRangeConfig', enabled?: boolean | null, min?: number | null, max?: number | null } | null, exclusive_option?: { __typename?: 'ExclusiveOptionConfig', enabled?: boolean | null, option_id?: string | null } | null } | null, date_validation?: { __typename?: 'DateConfig', allowed_dates?: AllowedDatesOptions | null, include_date_of_response?: boolean | null } | null, file_storage?: { __typename?: 'FileStorageQuestionConfig', file_storage_config_slug?: string | null, accepted_file_types?: Array<string> | null } | null, input_validation?: { __typename?: 'InputValidationConfig', mode?: string | null, pattern?: string | null, helper_text?: string | null, simpleConfig?: { __typename?: 'InputValidationSimpleConfig', exactLength?: number | null, allowed?: { __typename?: 'InputValidationAllowed', letters?: boolean | null, numbers?: boolean | null, whitespace?: boolean | null, special?: boolean | null } | null } | null } | null } | null }> } | null } | { __typename: 'ExtensionActivityInput', type: ActivityInputType, extensionFields?: unknown | null } | { __typename: 'FormActivityInput', type: ActivityInputType, form?: { __typename?: 'ActivityForm', id: string, key: string, title: string, trademark?: string | null, questions: Array<{ __typename?: 'Question', id: string, key: string, title: string, definition_id: string, question_type?: QuestionType | null, user_question_type?: UserQuestionType | null, data_point_value_type?: DataPointValueType | null, is_required: boolean, options?: Array<{ __typename?: 'QuestionOption', id: string, label: string, value?: string | null }> | null, config?: { __typename?: 'QuestionConfig', recode_enabled?: boolean | null, use_select?: boolean | null, mandatory: boolean, slider?: { __typename?: 'SliderConfig', min: number, max: number, step_value: number, min_label: string, max_label: string, is_value_tooltip_on: boolean, display_marks: boolean, show_min_max_values: boolean } | null, phone?: { __typename?: 'PhoneConfig', default_country?: string | null, available_countries?: Array<string> | null } | null, number?: { __typename?: 'NumberConfig', range?: { __typename?: 'RangeConfig', enabled?: boolean | null, min?: number | null, max?: number | null } | null } | null, multiple_select?: { __typename?: 'MultipleSelectConfig', range?: { __typename?: 'ChoiceRangeConfig', enabled?: boolean | null, min?: number | null, max?: number | null } | null, exclusive_option?: { __typename?: 'ExclusiveOptionConfig', enabled?: boolean | null, option_id?: string | null } | null } | null, date_validation?: { __typename?: 'DateConfig', allowed_dates?: AllowedDatesOptions | null, include_date_of_response?: boolean | null } | null, file_storage?: { __typename?: 'FileStorageQuestionConfig', file_storage_config_slug?: string | null, accepted_file_types?: Array<string> | null } | null, input_validation?: { __typename?: 'InputValidationConfig', mode?: string | null, pattern?: string | null, helper_text?: string | null, simpleConfig?: { __typename?: 'InputValidationSimpleConfig', exactLength?: number | null, allowed?: { __typename?: 'InputValidationAllowed', letters?: boolean | null, numbers?: boolean | null, whitespace?: boolean | null, special?: boolean | null } | null } | null } | null } | null, rule?: { __typename?: 'Rule', id: string, boolean_operator: BooleanOperator, conditions: Array<{ __typename?: 'Condition', id: string, reference: string, reference_key: string, operator: ConditionOperator, operand: { __typename?: 'ConditionOperand', value: string, type: ConditionOperandType } }> } | null }> } | null } | { __typename: 'MessageActivityInput', type: ActivityInputType, message?: { __typename?: 'ActivityMessage', id: string, subject: string, body: string, format?: MessageFormat | null, attachments?: Array<{ __typename?: 'MessageAttachment', id: string, name: string, type: string, url: string }> | null } | null } | null, outputs?: { __typename: 'CalculationActivityOutput', type: ActivityOutputType, results?: unknown | null } | { __typename: 'DynamicFormActivityOutput', type: ActivityOutputType, response?: unknown | null } | { __typename: 'ExtensionActivityOutput', type: ActivityOutputType, results?: unknown | null } | { __typename: 'FormActivityOutput', type: ActivityOutputType, response?: unknown | null } | null } | null } };

export type GetActivityQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetActivityQuery = { __typename?: 'Query', activity: { __typename?: 'ActivityPayload', success: boolean, activity?: { __typename?: 'Activity', id: string, action: ActivityAction, careflow_id: string, container_name?: string | null, date: string, pathway_definition_id: string, reference_id: string, reference_type: ActivityReferenceType, resolution?: ActivityResolution | null, session_id?: string | null, status: ActivityStatus, tenant_id: string, is_user_activity: boolean, indirect_object?: { __typename?: 'ActivityObject', id: string, type: ActivityObjectType, name: string, email?: string | null, preferred_language?: string | null } | null, object: { __typename?: 'ActivityObject', id: string, type: ActivityObjectType, name: string, email?: string | null, preferred_language?: string | null }, sub_activities: Array<{ __typename?: 'SubActivity', id: string, action: ActivityAction, object?: { __typename?: 'ActivityObject', id: string, type: ActivityObjectType, name: string, email?: string | null, preferred_language?: string | null } | null }>, inputs?: { __typename: 'CalculationActivityInput', type: ActivityInputType, calculationFields?: Array<{ __typename?: 'CalculationField', id: string, key: string, label: string, value: unknown }> | null } | { __typename: 'ChecklistActivityInput', type: ActivityInputType, checklist?: { __typename?: 'Checklist', title: string, items: Array<string> } | null } | { __typename: 'ClinicalNoteActivityInput', type: ActivityInputType, clinicalNote?: { __typename?: 'ClinicalNote', id: string, narratives: Array<{ __typename?: 'GeneratedClinicalNoteNarrative', id: string, key: string, title: string, body: string }>, context: Array<{ __typename?: 'GeneratedClinicalNoteContextField', key: string, value: string }> } | null } | { __typename: 'DynamicFormActivityInput', type: ActivityInputType, dynamic_form?: { __typename?: 'DynamicForm', key: string, title: string, trademark?: string | null, questions: Array<{ __typename?: 'DynamicQuestion', id: string, key: string, title: string, question_type: QuestionType, user_question_type?: UserQuestionType | null, data_point_value_type?: DataPointValueType | null, is_required: boolean, options?: Array<{ __typename?: 'QuestionOption', id: string, label: string, value?: string | null }> | null, config?: { __typename?: 'QuestionConfig', recode_enabled?: boolean | null, use_select?: boolean | null, mandatory: boolean, slider?: { __typename?: 'SliderConfig', min: number, max: number, step_value: number, min_label: string, max_label: string, is_value_tooltip_on: boolean, display_marks: boolean, show_min_max_values: boolean } | null, phone?: { __typename?: 'PhoneConfig', default_country?: string | null, available_countries?: Array<string> | null } | null, number?: { __typename?: 'NumberConfig', range?: { __typename?: 'RangeConfig', enabled?: boolean | null, min?: number | null, max?: number | null } | null } | null, multiple_select?: { __typename?: 'MultipleSelectConfig', range?: { __typename?: 'ChoiceRangeConfig', enabled?: boolean | null, min?: number | null, max?: number | null } | null, exclusive_option?: { __typename?: 'ExclusiveOptionConfig', enabled?: boolean | null, option_id?: string | null } | null } | null, date_validation?: { __typename?: 'DateConfig', allowed_dates?: AllowedDatesOptions | null, include_date_of_response?: boolean | null } | null, file_storage?: { __typename?: 'FileStorageQuestionConfig', file_storage_config_slug?: string | null, accepted_file_types?: Array<string> | null } | null, input_validation?: { __typename?: 'InputValidationConfig', mode?: string | null, pattern?: string | null, helper_text?: string | null, simpleConfig?: { __typename?: 'InputValidationSimpleConfig', exactLength?: number | null, allowed?: { __typename?: 'InputValidationAllowed', letters?: boolean | null, numbers?: boolean | null, whitespace?: boolean | null, special?: boolean | null } | null } | null } | null } | null }> } | null } | { __typename: 'ExtensionActivityInput', type: ActivityInputType, extensionFields?: unknown | null } | { __typename: 'FormActivityInput', type: ActivityInputType, form?: { __typename?: 'ActivityForm', id: string, key: string, title: string, trademark?: string | null, questions: Array<{ __typename?: 'Question', id: string, key: string, title: string, definition_id: string, question_type?: QuestionType | null, user_question_type?: UserQuestionType | null, data_point_value_type?: DataPointValueType | null, is_required: boolean, options?: Array<{ __typename?: 'QuestionOption', id: string, label: string, value?: string | null }> | null, config?: { __typename?: 'QuestionConfig', recode_enabled?: boolean | null, use_select?: boolean | null, mandatory: boolean, slider?: { __typename?: 'SliderConfig', min: number, max: number, step_value: number, min_label: string, max_label: string, is_value_tooltip_on: boolean, display_marks: boolean, show_min_max_values: boolean } | null, phone?: { __typename?: 'PhoneConfig', default_country?: string | null, available_countries?: Array<string> | null } | null, number?: { __typename?: 'NumberConfig', range?: { __typename?: 'RangeConfig', enabled?: boolean | null, min?: number | null, max?: number | null } | null } | null, multiple_select?: { __typename?: 'MultipleSelectConfig', range?: { __typename?: 'ChoiceRangeConfig', enabled?: boolean | null, min?: number | null, max?: number | null } | null, exclusive_option?: { __typename?: 'ExclusiveOptionConfig', enabled?: boolean | null, option_id?: string | null } | null } | null, date_validation?: { __typename?: 'DateConfig', allowed_dates?: AllowedDatesOptions | null, include_date_of_response?: boolean | null } | null, file_storage?: { __typename?: 'FileStorageQuestionConfig', file_storage_config_slug?: string | null, accepted_file_types?: Array<string> | null } | null, input_validation?: { __typename?: 'InputValidationConfig', mode?: string | null, pattern?: string | null, helper_text?: string | null, simpleConfig?: { __typename?: 'InputValidationSimpleConfig', exactLength?: number | null, allowed?: { __typename?: 'InputValidationAllowed', letters?: boolean | null, numbers?: boolean | null, whitespace?: boolean | null, special?: boolean | null } | null } | null } | null } | null, rule?: { __typename?: 'Rule', id: string, boolean_operator: BooleanOperator, conditions: Array<{ __typename?: 'Condition', id: string, reference: string, reference_key: string, operator: ConditionOperator, operand: { __typename?: 'ConditionOperand', value: string, type: ConditionOperandType } }> } | null }> } | null } | { __typename: 'MessageActivityInput', type: ActivityInputType, message?: { __typename?: 'ActivityMessage', id: string, subject: string, body: string, format?: MessageFormat | null, attachments?: Array<{ __typename?: 'MessageAttachment', id: string, name: string, type: string, url: string }> | null } | null } | null, outputs?: { __typename: 'CalculationActivityOutput', type: ActivityOutputType, results?: unknown | null } | { __typename: 'DynamicFormActivityOutput', type: ActivityOutputType, response?: unknown | null } | { __typename: 'ExtensionActivityOutput', type: ActivityOutputType, results?: unknown | null } | { __typename: 'FormActivityOutput', type: ActivityOutputType, response?: unknown | null } | null } | null } };

export type OnActivityCompletedSubscriptionVariables = Exact<{
  careflow_id: Scalars['String']['input'];
}>;


export type OnActivityCompletedSubscription = { __typename?: 'Subscription', activityCompleted: { __typename?: 'Activity', id: string, action: ActivityAction, careflow_id: string, container_name?: string | null, date: string, pathway_definition_id: string, reference_id: string, reference_type: ActivityReferenceType, resolution?: ActivityResolution | null, session_id?: string | null, status: ActivityStatus, tenant_id: string, is_user_activity: boolean, indirect_object?: { __typename?: 'ActivityObject', id: string, type: ActivityObjectType, name: string, email?: string | null, preferred_language?: string | null } | null, object: { __typename?: 'ActivityObject', id: string, type: ActivityObjectType, name: string, email?: string | null, preferred_language?: string | null }, sub_activities: Array<{ __typename?: 'SubActivity', id: string, action: ActivityAction, object?: { __typename?: 'ActivityObject', id: string, type: ActivityObjectType, name: string, email?: string | null, preferred_language?: string | null } | null }>, inputs?: { __typename: 'CalculationActivityInput', type: ActivityInputType, calculationFields?: Array<{ __typename?: 'CalculationField', id: string, key: string, label: string, value: unknown }> | null } | { __typename: 'ChecklistActivityInput', type: ActivityInputType, checklist?: { __typename?: 'Checklist', title: string, items: Array<string> } | null } | { __typename: 'ClinicalNoteActivityInput', type: ActivityInputType, clinicalNote?: { __typename?: 'ClinicalNote', id: string, narratives: Array<{ __typename?: 'GeneratedClinicalNoteNarrative', id: string, key: string, title: string, body: string }>, context: Array<{ __typename?: 'GeneratedClinicalNoteContextField', key: string, value: string }> } | null } | { __typename: 'DynamicFormActivityInput', type: ActivityInputType, dynamic_form?: { __typename?: 'DynamicForm', key: string, title: string, trademark?: string | null, questions: Array<{ __typename?: 'DynamicQuestion', id: string, key: string, title: string, question_type: QuestionType, user_question_type?: UserQuestionType | null, data_point_value_type?: DataPointValueType | null, is_required: boolean, options?: Array<{ __typename?: 'QuestionOption', id: string, label: string, value?: string | null }> | null, config?: { __typename?: 'QuestionConfig', recode_enabled?: boolean | null, use_select?: boolean | null, mandatory: boolean, slider?: { __typename?: 'SliderConfig', min: number, max: number, step_value: number, min_label: string, max_label: string, is_value_tooltip_on: boolean, display_marks: boolean, show_min_max_values: boolean } | null, phone?: { __typename?: 'PhoneConfig', default_country?: string | null, available_countries?: Array<string> | null } | null, number?: { __typename?: 'NumberConfig', range?: { __typename?: 'RangeConfig', enabled?: boolean | null, min?: number | null, max?: number | null } | null } | null, multiple_select?: { __typename?: 'MultipleSelectConfig', range?: { __typename?: 'ChoiceRangeConfig', enabled?: boolean | null, min?: number | null, max?: number | null } | null, exclusive_option?: { __typename?: 'ExclusiveOptionConfig', enabled?: boolean | null, option_id?: string | null } | null } | null, date_validation?: { __typename?: 'DateConfig', allowed_dates?: AllowedDatesOptions | null, include_date_of_response?: boolean | null } | null, file_storage?: { __typename?: 'FileStorageQuestionConfig', file_storage_config_slug?: string | null, accepted_file_types?: Array<string> | null } | null, input_validation?: { __typename?: 'InputValidationConfig', mode?: string | null, pattern?: string | null, helper_text?: string | null, simpleConfig?: { __typename?: 'InputValidationSimpleConfig', exactLength?: number | null, allowed?: { __typename?: 'InputValidationAllowed', letters?: boolean | null, numbers?: boolean | null, whitespace?: boolean | null, special?: boolean | null } | null } | null } | null } | null }> } | null } | { __typename: 'ExtensionActivityInput', type: ActivityInputType, extensionFields?: unknown | null } | { __typename: 'FormActivityInput', type: ActivityInputType, form?: { __typename?: 'ActivityForm', id: string, key: string, title: string, trademark?: string | null, questions: Array<{ __typename?: 'Question', id: string, key: string, title: string, definition_id: string, question_type?: QuestionType | null, user_question_type?: UserQuestionType | null, data_point_value_type?: DataPointValueType | null, is_required: boolean, options?: Array<{ __typename?: 'QuestionOption', id: string, label: string, value?: string | null }> | null, config?: { __typename?: 'QuestionConfig', recode_enabled?: boolean | null, use_select?: boolean | null, mandatory: boolean, slider?: { __typename?: 'SliderConfig', min: number, max: number, step_value: number, min_label: string, max_label: string, is_value_tooltip_on: boolean, display_marks: boolean, show_min_max_values: boolean } | null, phone?: { __typename?: 'PhoneConfig', default_country?: string | null, available_countries?: Array<string> | null } | null, number?: { __typename?: 'NumberConfig', range?: { __typename?: 'RangeConfig', enabled?: boolean | null, min?: number | null, max?: number | null } | null } | null, multiple_select?: { __typename?: 'MultipleSelectConfig', range?: { __typename?: 'ChoiceRangeConfig', enabled?: boolean | null, min?: number | null, max?: number | null } | null, exclusive_option?: { __typename?: 'ExclusiveOptionConfig', enabled?: boolean | null, option_id?: string | null } | null } | null, date_validation?: { __typename?: 'DateConfig', allowed_dates?: AllowedDatesOptions | null, include_date_of_response?: boolean | null } | null, file_storage?: { __typename?: 'FileStorageQuestionConfig', file_storage_config_slug?: string | null, accepted_file_types?: Array<string> | null } | null, input_validation?: { __typename?: 'InputValidationConfig', mode?: string | null, pattern?: string | null, helper_text?: string | null, simpleConfig?: { __typename?: 'InputValidationSimpleConfig', exactLength?: number | null, allowed?: { __typename?: 'InputValidationAllowed', letters?: boolean | null, numbers?: boolean | null, whitespace?: boolean | null, special?: boolean | null } | null } | null } | null } | null, rule?: { __typename?: 'Rule', id: string, boolean_operator: BooleanOperator, conditions: Array<{ __typename?: 'Condition', id: string, reference: string, reference_key: string, operator: ConditionOperator, operand: { __typename?: 'ConditionOperand', value: string, type: ConditionOperandType } }> } | null }> } | null } | { __typename: 'MessageActivityInput', type: ActivityInputType, message?: { __typename?: 'ActivityMessage', id: string, subject: string, body: string, format?: MessageFormat | null, attachments?: Array<{ __typename?: 'MessageAttachment', id: string, name: string, type: string, url: string }> | null } | null } | null, outputs?: { __typename: 'CalculationActivityOutput', type: ActivityOutputType, results?: unknown | null } | { __typename: 'DynamicFormActivityOutput', type: ActivityOutputType, response?: unknown | null } | { __typename: 'ExtensionActivityOutput', type: ActivityOutputType, results?: unknown | null } | { __typename: 'FormActivityOutput', type: ActivityOutputType, response?: unknown | null } | null } };

export type OnActivityCreatedSubscriptionVariables = Exact<{
  careflow_id: Scalars['String']['input'];
}>;


export type OnActivityCreatedSubscription = { __typename?: 'Subscription', activityCreated: { __typename?: 'Activity', id: string, action: ActivityAction, careflow_id: string, container_name?: string | null, date: string, pathway_definition_id: string, reference_id: string, reference_type: ActivityReferenceType, resolution?: ActivityResolution | null, session_id?: string | null, status: ActivityStatus, tenant_id: string, is_user_activity: boolean, indirect_object?: { __typename?: 'ActivityObject', id: string, type: ActivityObjectType, name: string, email?: string | null, preferred_language?: string | null } | null, object: { __typename?: 'ActivityObject', id: string, type: ActivityObjectType, name: string, email?: string | null, preferred_language?: string | null }, sub_activities: Array<{ __typename?: 'SubActivity', id: string, action: ActivityAction, object?: { __typename?: 'ActivityObject', id: string, type: ActivityObjectType, name: string, email?: string | null, preferred_language?: string | null } | null }>, inputs?: { __typename: 'CalculationActivityInput', type: ActivityInputType, calculationFields?: Array<{ __typename?: 'CalculationField', id: string, key: string, label: string, value: unknown }> | null } | { __typename: 'ChecklistActivityInput', type: ActivityInputType, checklist?: { __typename?: 'Checklist', title: string, items: Array<string> } | null } | { __typename: 'ClinicalNoteActivityInput', type: ActivityInputType, clinicalNote?: { __typename?: 'ClinicalNote', id: string, narratives: Array<{ __typename?: 'GeneratedClinicalNoteNarrative', id: string, key: string, title: string, body: string }>, context: Array<{ __typename?: 'GeneratedClinicalNoteContextField', key: string, value: string }> } | null } | { __typename: 'DynamicFormActivityInput', type: ActivityInputType, dynamic_form?: { __typename?: 'DynamicForm', key: string, title: string, trademark?: string | null, questions: Array<{ __typename?: 'DynamicQuestion', id: string, key: string, title: string, question_type: QuestionType, user_question_type?: UserQuestionType | null, data_point_value_type?: DataPointValueType | null, is_required: boolean, options?: Array<{ __typename?: 'QuestionOption', id: string, label: string, value?: string | null }> | null, config?: { __typename?: 'QuestionConfig', recode_enabled?: boolean | null, use_select?: boolean | null, mandatory: boolean, slider?: { __typename?: 'SliderConfig', min: number, max: number, step_value: number, min_label: string, max_label: string, is_value_tooltip_on: boolean, display_marks: boolean, show_min_max_values: boolean } | null, phone?: { __typename?: 'PhoneConfig', default_country?: string | null, available_countries?: Array<string> | null } | null, number?: { __typename?: 'NumberConfig', range?: { __typename?: 'RangeConfig', enabled?: boolean | null, min?: number | null, max?: number | null } | null } | null, multiple_select?: { __typename?: 'MultipleSelectConfig', range?: { __typename?: 'ChoiceRangeConfig', enabled?: boolean | null, min?: number | null, max?: number | null } | null, exclusive_option?: { __typename?: 'ExclusiveOptionConfig', enabled?: boolean | null, option_id?: string | null } | null } | null, date_validation?: { __typename?: 'DateConfig', allowed_dates?: AllowedDatesOptions | null, include_date_of_response?: boolean | null } | null, file_storage?: { __typename?: 'FileStorageQuestionConfig', file_storage_config_slug?: string | null, accepted_file_types?: Array<string> | null } | null, input_validation?: { __typename?: 'InputValidationConfig', mode?: string | null, pattern?: string | null, helper_text?: string | null, simpleConfig?: { __typename?: 'InputValidationSimpleConfig', exactLength?: number | null, allowed?: { __typename?: 'InputValidationAllowed', letters?: boolean | null, numbers?: boolean | null, whitespace?: boolean | null, special?: boolean | null } | null } | null } | null } | null }> } | null } | { __typename: 'ExtensionActivityInput', type: ActivityInputType, extensionFields?: unknown | null } | { __typename: 'FormActivityInput', type: ActivityInputType, form?: { __typename?: 'ActivityForm', id: string, key: string, title: string, trademark?: string | null, questions: Array<{ __typename?: 'Question', id: string, key: string, title: string, definition_id: string, question_type?: QuestionType | null, user_question_type?: UserQuestionType | null, data_point_value_type?: DataPointValueType | null, is_required: boolean, options?: Array<{ __typename?: 'QuestionOption', id: string, label: string, value?: string | null }> | null, config?: { __typename?: 'QuestionConfig', recode_enabled?: boolean | null, use_select?: boolean | null, mandatory: boolean, slider?: { __typename?: 'SliderConfig', min: number, max: number, step_value: number, min_label: string, max_label: string, is_value_tooltip_on: boolean, display_marks: boolean, show_min_max_values: boolean } | null, phone?: { __typename?: 'PhoneConfig', default_country?: string | null, available_countries?: Array<string> | null } | null, number?: { __typename?: 'NumberConfig', range?: { __typename?: 'RangeConfig', enabled?: boolean | null, min?: number | null, max?: number | null } | null } | null, multiple_select?: { __typename?: 'MultipleSelectConfig', range?: { __typename?: 'ChoiceRangeConfig', enabled?: boolean | null, min?: number | null, max?: number | null } | null, exclusive_option?: { __typename?: 'ExclusiveOptionConfig', enabled?: boolean | null, option_id?: string | null } | null } | null, date_validation?: { __typename?: 'DateConfig', allowed_dates?: AllowedDatesOptions | null, include_date_of_response?: boolean | null } | null, file_storage?: { __typename?: 'FileStorageQuestionConfig', file_storage_config_slug?: string | null, accepted_file_types?: Array<string> | null } | null, input_validation?: { __typename?: 'InputValidationConfig', mode?: string | null, pattern?: string | null, helper_text?: string | null, simpleConfig?: { __typename?: 'InputValidationSimpleConfig', exactLength?: number | null, allowed?: { __typename?: 'InputValidationAllowed', letters?: boolean | null, numbers?: boolean | null, whitespace?: boolean | null, special?: boolean | null } | null } | null } | null } | null, rule?: { __typename?: 'Rule', id: string, boolean_operator: BooleanOperator, conditions: Array<{ __typename?: 'Condition', id: string, reference: string, reference_key: string, operator: ConditionOperator, operand: { __typename?: 'ConditionOperand', value: string, type: ConditionOperandType } }> } | null }> } | null } | { __typename: 'MessageActivityInput', type: ActivityInputType, message?: { __typename?: 'ActivityMessage', id: string, subject: string, body: string, format?: MessageFormat | null, attachments?: Array<{ __typename?: 'MessageAttachment', id: string, name: string, type: string, url: string }> | null } | null } | null, outputs?: { __typename: 'CalculationActivityOutput', type: ActivityOutputType, results?: unknown | null } | { __typename: 'DynamicFormActivityOutput', type: ActivityOutputType, response?: unknown | null } | { __typename: 'ExtensionActivityOutput', type: ActivityOutputType, results?: unknown | null } | { __typename: 'FormActivityOutput', type: ActivityOutputType, response?: unknown | null } | null } };

export type OnActivityExpiredSubscriptionVariables = Exact<{
  careflow_id: Scalars['String']['input'];
}>;


export type OnActivityExpiredSubscription = { __typename?: 'Subscription', activityExpired: { __typename?: 'Activity', id: string, action: ActivityAction, careflow_id: string, container_name?: string | null, date: string, pathway_definition_id: string, reference_id: string, reference_type: ActivityReferenceType, resolution?: ActivityResolution | null, session_id?: string | null, status: ActivityStatus, tenant_id: string, is_user_activity: boolean, indirect_object?: { __typename?: 'ActivityObject', id: string, type: ActivityObjectType, name: string, email?: string | null, preferred_language?: string | null } | null, object: { __typename?: 'ActivityObject', id: string, type: ActivityObjectType, name: string, email?: string | null, preferred_language?: string | null }, sub_activities: Array<{ __typename?: 'SubActivity', id: string, action: ActivityAction, object?: { __typename?: 'ActivityObject', id: string, type: ActivityObjectType, name: string, email?: string | null, preferred_language?: string | null } | null }>, inputs?: { __typename: 'CalculationActivityInput', type: ActivityInputType, calculationFields?: Array<{ __typename?: 'CalculationField', id: string, key: string, label: string, value: unknown }> | null } | { __typename: 'ChecklistActivityInput', type: ActivityInputType, checklist?: { __typename?: 'Checklist', title: string, items: Array<string> } | null } | { __typename: 'ClinicalNoteActivityInput', type: ActivityInputType, clinicalNote?: { __typename?: 'ClinicalNote', id: string, narratives: Array<{ __typename?: 'GeneratedClinicalNoteNarrative', id: string, key: string, title: string, body: string }>, context: Array<{ __typename?: 'GeneratedClinicalNoteContextField', key: string, value: string }> } | null } | { __typename: 'DynamicFormActivityInput', type: ActivityInputType, dynamic_form?: { __typename?: 'DynamicForm', key: string, title: string, trademark?: string | null, questions: Array<{ __typename?: 'DynamicQuestion', id: string, key: string, title: string, question_type: QuestionType, user_question_type?: UserQuestionType | null, data_point_value_type?: DataPointValueType | null, is_required: boolean, options?: Array<{ __typename?: 'QuestionOption', id: string, label: string, value?: string | null }> | null, config?: { __typename?: 'QuestionConfig', recode_enabled?: boolean | null, use_select?: boolean | null, mandatory: boolean, slider?: { __typename?: 'SliderConfig', min: number, max: number, step_value: number, min_label: string, max_label: string, is_value_tooltip_on: boolean, display_marks: boolean, show_min_max_values: boolean } | null, phone?: { __typename?: 'PhoneConfig', default_country?: string | null, available_countries?: Array<string> | null } | null, number?: { __typename?: 'NumberConfig', range?: { __typename?: 'RangeConfig', enabled?: boolean | null, min?: number | null, max?: number | null } | null } | null, multiple_select?: { __typename?: 'MultipleSelectConfig', range?: { __typename?: 'ChoiceRangeConfig', enabled?: boolean | null, min?: number | null, max?: number | null } | null, exclusive_option?: { __typename?: 'ExclusiveOptionConfig', enabled?: boolean | null, option_id?: string | null } | null } | null, date_validation?: { __typename?: 'DateConfig', allowed_dates?: AllowedDatesOptions | null, include_date_of_response?: boolean | null } | null, file_storage?: { __typename?: 'FileStorageQuestionConfig', file_storage_config_slug?: string | null, accepted_file_types?: Array<string> | null } | null, input_validation?: { __typename?: 'InputValidationConfig', mode?: string | null, pattern?: string | null, helper_text?: string | null, simpleConfig?: { __typename?: 'InputValidationSimpleConfig', exactLength?: number | null, allowed?: { __typename?: 'InputValidationAllowed', letters?: boolean | null, numbers?: boolean | null, whitespace?: boolean | null, special?: boolean | null } | null } | null } | null } | null }> } | null } | { __typename: 'ExtensionActivityInput', type: ActivityInputType, extensionFields?: unknown | null } | { __typename: 'FormActivityInput', type: ActivityInputType, form?: { __typename?: 'ActivityForm', id: string, key: string, title: string, trademark?: string | null, questions: Array<{ __typename?: 'Question', id: string, key: string, title: string, definition_id: string, question_type?: QuestionType | null, user_question_type?: UserQuestionType | null, data_point_value_type?: DataPointValueType | null, is_required: boolean, options?: Array<{ __typename?: 'QuestionOption', id: string, label: string, value?: string | null }> | null, config?: { __typename?: 'QuestionConfig', recode_enabled?: boolean | null, use_select?: boolean | null, mandatory: boolean, slider?: { __typename?: 'SliderConfig', min: number, max: number, step_value: number, min_label: string, max_label: string, is_value_tooltip_on: boolean, display_marks: boolean, show_min_max_values: boolean } | null, phone?: { __typename?: 'PhoneConfig', default_country?: string | null, available_countries?: Array<string> | null } | null, number?: { __typename?: 'NumberConfig', range?: { __typename?: 'RangeConfig', enabled?: boolean | null, min?: number | null, max?: number | null } | null } | null, multiple_select?: { __typename?: 'MultipleSelectConfig', range?: { __typename?: 'ChoiceRangeConfig', enabled?: boolean | null, min?: number | null, max?: number | null } | null, exclusive_option?: { __typename?: 'ExclusiveOptionConfig', enabled?: boolean | null, option_id?: string | null } | null } | null, date_validation?: { __typename?: 'DateConfig', allowed_dates?: AllowedDatesOptions | null, include_date_of_response?: boolean | null } | null, file_storage?: { __typename?: 'FileStorageQuestionConfig', file_storage_config_slug?: string | null, accepted_file_types?: Array<string> | null } | null, input_validation?: { __typename?: 'InputValidationConfig', mode?: string | null, pattern?: string | null, helper_text?: string | null, simpleConfig?: { __typename?: 'InputValidationSimpleConfig', exactLength?: number | null, allowed?: { __typename?: 'InputValidationAllowed', letters?: boolean | null, numbers?: boolean | null, whitespace?: boolean | null, special?: boolean | null } | null } | null } | null } | null, rule?: { __typename?: 'Rule', id: string, boolean_operator: BooleanOperator, conditions: Array<{ __typename?: 'Condition', id: string, reference: string, reference_key: string, operator: ConditionOperator, operand: { __typename?: 'ConditionOperand', value: string, type: ConditionOperandType } }> } | null }> } | null } | { __typename: 'MessageActivityInput', type: ActivityInputType, message?: { __typename?: 'ActivityMessage', id: string, subject: string, body: string, format?: MessageFormat | null, attachments?: Array<{ __typename?: 'MessageAttachment', id: string, name: string, type: string, url: string }> | null } | null } | null, outputs?: { __typename: 'CalculationActivityOutput', type: ActivityOutputType, results?: unknown | null } | { __typename: 'DynamicFormActivityOutput', type: ActivityOutputType, response?: unknown | null } | { __typename: 'ExtensionActivityOutput', type: ActivityOutputType, results?: unknown | null } | { __typename: 'FormActivityOutput', type: ActivityOutputType, response?: unknown | null } | null } };

export type OnActivityUpdatedSubscriptionVariables = Exact<{
  careflow_id: Scalars['String']['input'];
}>;


export type OnActivityUpdatedSubscription = { __typename?: 'Subscription', activityUpdated: { __typename?: 'Activity', id: string, action: ActivityAction, careflow_id: string, container_name?: string | null, date: string, pathway_definition_id: string, reference_id: string, reference_type: ActivityReferenceType, resolution?: ActivityResolution | null, session_id?: string | null, status: ActivityStatus, tenant_id: string, is_user_activity: boolean, indirect_object?: { __typename?: 'ActivityObject', id: string, type: ActivityObjectType, name: string, email?: string | null, preferred_language?: string | null } | null, object: { __typename?: 'ActivityObject', id: string, type: ActivityObjectType, name: string, email?: string | null, preferred_language?: string | null }, sub_activities: Array<{ __typename?: 'SubActivity', id: string, action: ActivityAction, object?: { __typename?: 'ActivityObject', id: string, type: ActivityObjectType, name: string, email?: string | null, preferred_language?: string | null } | null }>, inputs?: { __typename: 'CalculationActivityInput', type: ActivityInputType, calculationFields?: Array<{ __typename?: 'CalculationField', id: string, key: string, label: string, value: unknown }> | null } | { __typename: 'ChecklistActivityInput', type: ActivityInputType, checklist?: { __typename?: 'Checklist', title: string, items: Array<string> } | null } | { __typename: 'ClinicalNoteActivityInput', type: ActivityInputType, clinicalNote?: { __typename?: 'ClinicalNote', id: string, narratives: Array<{ __typename?: 'GeneratedClinicalNoteNarrative', id: string, key: string, title: string, body: string }>, context: Array<{ __typename?: 'GeneratedClinicalNoteContextField', key: string, value: string }> } | null } | { __typename: 'DynamicFormActivityInput', type: ActivityInputType, dynamic_form?: { __typename?: 'DynamicForm', key: string, title: string, trademark?: string | null, questions: Array<{ __typename?: 'DynamicQuestion', id: string, key: string, title: string, question_type: QuestionType, user_question_type?: UserQuestionType | null, data_point_value_type?: DataPointValueType | null, is_required: boolean, options?: Array<{ __typename?: 'QuestionOption', id: string, label: string, value?: string | null }> | null, config?: { __typename?: 'QuestionConfig', recode_enabled?: boolean | null, use_select?: boolean | null, mandatory: boolean, slider?: { __typename?: 'SliderConfig', min: number, max: number, step_value: number, min_label: string, max_label: string, is_value_tooltip_on: boolean, display_marks: boolean, show_min_max_values: boolean } | null, phone?: { __typename?: 'PhoneConfig', default_country?: string | null, available_countries?: Array<string> | null } | null, number?: { __typename?: 'NumberConfig', range?: { __typename?: 'RangeConfig', enabled?: boolean | null, min?: number | null, max?: number | null } | null } | null, multiple_select?: { __typename?: 'MultipleSelectConfig', range?: { __typename?: 'ChoiceRangeConfig', enabled?: boolean | null, min?: number | null, max?: number | null } | null, exclusive_option?: { __typename?: 'ExclusiveOptionConfig', enabled?: boolean | null, option_id?: string | null } | null } | null, date_validation?: { __typename?: 'DateConfig', allowed_dates?: AllowedDatesOptions | null, include_date_of_response?: boolean | null } | null, file_storage?: { __typename?: 'FileStorageQuestionConfig', file_storage_config_slug?: string | null, accepted_file_types?: Array<string> | null } | null, input_validation?: { __typename?: 'InputValidationConfig', mode?: string | null, pattern?: string | null, helper_text?: string | null, simpleConfig?: { __typename?: 'InputValidationSimpleConfig', exactLength?: number | null, allowed?: { __typename?: 'InputValidationAllowed', letters?: boolean | null, numbers?: boolean | null, whitespace?: boolean | null, special?: boolean | null } | null } | null } | null } | null }> } | null } | { __typename: 'ExtensionActivityInput', type: ActivityInputType, extensionFields?: unknown | null } | { __typename: 'FormActivityInput', type: ActivityInputType, form?: { __typename?: 'ActivityForm', id: string, key: string, title: string, trademark?: string | null, questions: Array<{ __typename?: 'Question', id: string, key: string, title: string, definition_id: string, question_type?: QuestionType | null, user_question_type?: UserQuestionType | null, data_point_value_type?: DataPointValueType | null, is_required: boolean, options?: Array<{ __typename?: 'QuestionOption', id: string, label: string, value?: string | null }> | null, config?: { __typename?: 'QuestionConfig', recode_enabled?: boolean | null, use_select?: boolean | null, mandatory: boolean, slider?: { __typename?: 'SliderConfig', min: number, max: number, step_value: number, min_label: string, max_label: string, is_value_tooltip_on: boolean, display_marks: boolean, show_min_max_values: boolean } | null, phone?: { __typename?: 'PhoneConfig', default_country?: string | null, available_countries?: Array<string> | null } | null, number?: { __typename?: 'NumberConfig', range?: { __typename?: 'RangeConfig', enabled?: boolean | null, min?: number | null, max?: number | null } | null } | null, multiple_select?: { __typename?: 'MultipleSelectConfig', range?: { __typename?: 'ChoiceRangeConfig', enabled?: boolean | null, min?: number | null, max?: number | null } | null, exclusive_option?: { __typename?: 'ExclusiveOptionConfig', enabled?: boolean | null, option_id?: string | null } | null } | null, date_validation?: { __typename?: 'DateConfig', allowed_dates?: AllowedDatesOptions | null, include_date_of_response?: boolean | null } | null, file_storage?: { __typename?: 'FileStorageQuestionConfig', file_storage_config_slug?: string | null, accepted_file_types?: Array<string> | null } | null, input_validation?: { __typename?: 'InputValidationConfig', mode?: string | null, pattern?: string | null, helper_text?: string | null, simpleConfig?: { __typename?: 'InputValidationSimpleConfig', exactLength?: number | null, allowed?: { __typename?: 'InputValidationAllowed', letters?: boolean | null, numbers?: boolean | null, whitespace?: boolean | null, special?: boolean | null } | null } | null } | null } | null, rule?: { __typename?: 'Rule', id: string, boolean_operator: BooleanOperator, conditions: Array<{ __typename?: 'Condition', id: string, reference: string, reference_key: string, operator: ConditionOperator, operand: { __typename?: 'ConditionOperand', value: string, type: ConditionOperandType } }> } | null }> } | null } | { __typename: 'MessageActivityInput', type: ActivityInputType, message?: { __typename?: 'ActivityMessage', id: string, subject: string, body: string, format?: MessageFormat | null, attachments?: Array<{ __typename?: 'MessageAttachment', id: string, name: string, type: string, url: string }> | null } | null } | null, outputs?: { __typename: 'CalculationActivityOutput', type: ActivityOutputType, results?: unknown | null } | { __typename: 'DynamicFormActivityOutput', type: ActivityOutputType, response?: unknown | null } | { __typename: 'ExtensionActivityOutput', type: ActivityOutputType, results?: unknown | null } | { __typename: 'FormActivityOutput', type: ActivityOutputType, response?: unknown | null } | null } };

export type PathwayActivitiesQueryVariables = Exact<{
  pathway_id: Scalars['String']['input'];
}>;


export type PathwayActivitiesQuery = { __typename?: 'Query', pathwayActivities: { __typename?: 'ActivitiesPayload', success: boolean, totalCount?: number | null, activities: Array<{ __typename?: 'Activity', id: string, action: ActivityAction, careflow_id: string, container_name?: string | null, date: string, pathway_definition_id: string, reference_id: string, reference_type: ActivityReferenceType, resolution?: ActivityResolution | null, session_id?: string | null, status: ActivityStatus, tenant_id: string, is_user_activity: boolean, indirect_object?: { __typename?: 'ActivityObject', id: string, type: ActivityObjectType, name: string, email?: string | null, preferred_language?: string | null } | null, object: { __typename?: 'ActivityObject', id: string, type: ActivityObjectType, name: string, email?: string | null, preferred_language?: string | null }, sub_activities: Array<{ __typename?: 'SubActivity', id: string, action: ActivityAction, object?: { __typename?: 'ActivityObject', id: string, type: ActivityObjectType, name: string, email?: string | null, preferred_language?: string | null } | null }>, inputs?: { __typename: 'CalculationActivityInput', type: ActivityInputType, calculationFields?: Array<{ __typename?: 'CalculationField', id: string, key: string, label: string, value: unknown }> | null } | { __typename: 'ChecklistActivityInput', type: ActivityInputType, checklist?: { __typename?: 'Checklist', title: string, items: Array<string> } | null } | { __typename: 'ClinicalNoteActivityInput', type: ActivityInputType, clinicalNote?: { __typename?: 'ClinicalNote', id: string, narratives: Array<{ __typename?: 'GeneratedClinicalNoteNarrative', id: string, key: string, title: string, body: string }>, context: Array<{ __typename?: 'GeneratedClinicalNoteContextField', key: string, value: string }> } | null } | { __typename: 'DynamicFormActivityInput', type: ActivityInputType, dynamic_form?: { __typename?: 'DynamicForm', key: string, title: string, trademark?: string | null, questions: Array<{ __typename?: 'DynamicQuestion', id: string, key: string, title: string, question_type: QuestionType, user_question_type?: UserQuestionType | null, data_point_value_type?: DataPointValueType | null, is_required: boolean, options?: Array<{ __typename?: 'QuestionOption', id: string, label: string, value?: string | null }> | null, config?: { __typename?: 'QuestionConfig', recode_enabled?: boolean | null, use_select?: boolean | null, mandatory: boolean, slider?: { __typename?: 'SliderConfig', min: number, max: number, step_value: number, min_label: string, max_label: string, is_value_tooltip_on: boolean, display_marks: boolean, show_min_max_values: boolean } | null, phone?: { __typename?: 'PhoneConfig', default_country?: string | null, available_countries?: Array<string> | null } | null, number?: { __typename?: 'NumberConfig', range?: { __typename?: 'RangeConfig', enabled?: boolean | null, min?: number | null, max?: number | null } | null } | null, multiple_select?: { __typename?: 'MultipleSelectConfig', range?: { __typename?: 'ChoiceRangeConfig', enabled?: boolean | null, min?: number | null, max?: number | null } | null, exclusive_option?: { __typename?: 'ExclusiveOptionConfig', enabled?: boolean | null, option_id?: string | null } | null } | null, date_validation?: { __typename?: 'DateConfig', allowed_dates?: AllowedDatesOptions | null, include_date_of_response?: boolean | null } | null, file_storage?: { __typename?: 'FileStorageQuestionConfig', file_storage_config_slug?: string | null, accepted_file_types?: Array<string> | null } | null, input_validation?: { __typename?: 'InputValidationConfig', mode?: string | null, pattern?: string | null, helper_text?: string | null, simpleConfig?: { __typename?: 'InputValidationSimpleConfig', exactLength?: number | null, allowed?: { __typename?: 'InputValidationAllowed', letters?: boolean | null, numbers?: boolean | null, whitespace?: boolean | null, special?: boolean | null } | null } | null } | null } | null }> } | null } | { __typename: 'ExtensionActivityInput', type: ActivityInputType, extensionFields?: unknown | null } | { __typename: 'FormActivityInput', type: ActivityInputType, form?: { __typename?: 'ActivityForm', id: string, key: string, title: string, trademark?: string | null, questions: Array<{ __typename?: 'Question', id: string, key: string, title: string, definition_id: string, question_type?: QuestionType | null, user_question_type?: UserQuestionType | null, data_point_value_type?: DataPointValueType | null, is_required: boolean, options?: Array<{ __typename?: 'QuestionOption', id: string, label: string, value?: string | null }> | null, config?: { __typename?: 'QuestionConfig', recode_enabled?: boolean | null, use_select?: boolean | null, mandatory: boolean, slider?: { __typename?: 'SliderConfig', min: number, max: number, step_value: number, min_label: string, max_label: string, is_value_tooltip_on: boolean, display_marks: boolean, show_min_max_values: boolean } | null, phone?: { __typename?: 'PhoneConfig', default_country?: string | null, available_countries?: Array<string> | null } | null, number?: { __typename?: 'NumberConfig', range?: { __typename?: 'RangeConfig', enabled?: boolean | null, min?: number | null, max?: number | null } | null } | null, multiple_select?: { __typename?: 'MultipleSelectConfig', range?: { __typename?: 'ChoiceRangeConfig', enabled?: boolean | null, min?: number | null, max?: number | null } | null, exclusive_option?: { __typename?: 'ExclusiveOptionConfig', enabled?: boolean | null, option_id?: string | null } | null } | null, date_validation?: { __typename?: 'DateConfig', allowed_dates?: AllowedDatesOptions | null, include_date_of_response?: boolean | null } | null, file_storage?: { __typename?: 'FileStorageQuestionConfig', file_storage_config_slug?: string | null, accepted_file_types?: Array<string> | null } | null, input_validation?: { __typename?: 'InputValidationConfig', mode?: string | null, pattern?: string | null, helper_text?: string | null, simpleConfig?: { __typename?: 'InputValidationSimpleConfig', exactLength?: number | null, allowed?: { __typename?: 'InputValidationAllowed', letters?: boolean | null, numbers?: boolean | null, whitespace?: boolean | null, special?: boolean | null } | null } | null } | null } | null, rule?: { __typename?: 'Rule', id: string, boolean_operator: BooleanOperator, conditions: Array<{ __typename?: 'Condition', id: string, reference: string, reference_key: string, operator: ConditionOperator, operand: { __typename?: 'ConditionOperand', value: string, type: ConditionOperandType } }> } | null }> } | null } | { __typename: 'MessageActivityInput', type: ActivityInputType, message?: { __typename?: 'ActivityMessage', id: string, subject: string, body: string, format?: MessageFormat | null, attachments?: Array<{ __typename?: 'MessageAttachment', id: string, name: string, type: string, url: string }> | null } | null } | null, outputs?: { __typename: 'CalculationActivityOutput', type: ActivityOutputType, results?: unknown | null } | { __typename: 'DynamicFormActivityOutput', type: ActivityOutputType, response?: unknown | null } | { __typename: 'ExtensionActivityOutput', type: ActivityOutputType, results?: unknown | null } | { __typename: 'FormActivityOutput', type: ActivityOutputType, response?: unknown | null } | null }> } };

export type ActivityFragment = { __typename?: 'Activity', id: string, action: ActivityAction, careflow_id: string, container_name?: string | null, date: string, pathway_definition_id: string, reference_id: string, reference_type: ActivityReferenceType, resolution?: ActivityResolution | null, session_id?: string | null, status: ActivityStatus, tenant_id: string, is_user_activity: boolean, indirect_object?: { __typename?: 'ActivityObject', id: string, type: ActivityObjectType, name: string, email?: string | null, preferred_language?: string | null } | null, object: { __typename?: 'ActivityObject', id: string, type: ActivityObjectType, name: string, email?: string | null, preferred_language?: string | null }, sub_activities: Array<{ __typename?: 'SubActivity', id: string, action: ActivityAction, object?: { __typename?: 'ActivityObject', id: string, type: ActivityObjectType, name: string, email?: string | null, preferred_language?: string | null } | null }>, inputs?: { __typename: 'CalculationActivityInput', type: ActivityInputType, calculationFields?: Array<{ __typename?: 'CalculationField', id: string, key: string, label: string, value: unknown }> | null } | { __typename: 'ChecklistActivityInput', type: ActivityInputType, checklist?: { __typename?: 'Checklist', title: string, items: Array<string> } | null } | { __typename: 'ClinicalNoteActivityInput', type: ActivityInputType, clinicalNote?: { __typename?: 'ClinicalNote', id: string, narratives: Array<{ __typename?: 'GeneratedClinicalNoteNarrative', id: string, key: string, title: string, body: string }>, context: Array<{ __typename?: 'GeneratedClinicalNoteContextField', key: string, value: string }> } | null } | { __typename: 'DynamicFormActivityInput', type: ActivityInputType, dynamic_form?: { __typename?: 'DynamicForm', key: string, title: string, trademark?: string | null, questions: Array<{ __typename?: 'DynamicQuestion', id: string, key: string, title: string, question_type: QuestionType, user_question_type?: UserQuestionType | null, data_point_value_type?: DataPointValueType | null, is_required: boolean, options?: Array<{ __typename?: 'QuestionOption', id: string, label: string, value?: string | null }> | null, config?: { __typename?: 'QuestionConfig', recode_enabled?: boolean | null, use_select?: boolean | null, mandatory: boolean, slider?: { __typename?: 'SliderConfig', min: number, max: number, step_value: number, min_label: string, max_label: string, is_value_tooltip_on: boolean, display_marks: boolean, show_min_max_values: boolean } | null, phone?: { __typename?: 'PhoneConfig', default_country?: string | null, available_countries?: Array<string> | null } | null, number?: { __typename?: 'NumberConfig', range?: { __typename?: 'RangeConfig', enabled?: boolean | null, min?: number | null, max?: number | null } | null } | null, multiple_select?: { __typename?: 'MultipleSelectConfig', range?: { __typename?: 'ChoiceRangeConfig', enabled?: boolean | null, min?: number | null, max?: number | null } | null, exclusive_option?: { __typename?: 'ExclusiveOptionConfig', enabled?: boolean | null, option_id?: string | null } | null } | null, date_validation?: { __typename?: 'DateConfig', allowed_dates?: AllowedDatesOptions | null, include_date_of_response?: boolean | null } | null, file_storage?: { __typename?: 'FileStorageQuestionConfig', file_storage_config_slug?: string | null, accepted_file_types?: Array<string> | null } | null, input_validation?: { __typename?: 'InputValidationConfig', mode?: string | null, pattern?: string | null, helper_text?: string | null, simpleConfig?: { __typename?: 'InputValidationSimpleConfig', exactLength?: number | null, allowed?: { __typename?: 'InputValidationAllowed', letters?: boolean | null, numbers?: boolean | null, whitespace?: boolean | null, special?: boolean | null } | null } | null } | null } | null }> } | null } | { __typename: 'ExtensionActivityInput', type: ActivityInputType, extensionFields?: unknown | null } | { __typename: 'FormActivityInput', type: ActivityInputType, form?: { __typename?: 'ActivityForm', id: string, key: string, title: string, trademark?: string | null, questions: Array<{ __typename?: 'Question', id: string, key: string, title: string, definition_id: string, question_type?: QuestionType | null, user_question_type?: UserQuestionType | null, data_point_value_type?: DataPointValueType | null, is_required: boolean, options?: Array<{ __typename?: 'QuestionOption', id: string, label: string, value?: string | null }> | null, config?: { __typename?: 'QuestionConfig', recode_enabled?: boolean | null, use_select?: boolean | null, mandatory: boolean, slider?: { __typename?: 'SliderConfig', min: number, max: number, step_value: number, min_label: string, max_label: string, is_value_tooltip_on: boolean, display_marks: boolean, show_min_max_values: boolean } | null, phone?: { __typename?: 'PhoneConfig', default_country?: string | null, available_countries?: Array<string> | null } | null, number?: { __typename?: 'NumberConfig', range?: { __typename?: 'RangeConfig', enabled?: boolean | null, min?: number | null, max?: number | null } | null } | null, multiple_select?: { __typename?: 'MultipleSelectConfig', range?: { __typename?: 'ChoiceRangeConfig', enabled?: boolean | null, min?: number | null, max?: number | null } | null, exclusive_option?: { __typename?: 'ExclusiveOptionConfig', enabled?: boolean | null, option_id?: string | null } | null } | null, date_validation?: { __typename?: 'DateConfig', allowed_dates?: AllowedDatesOptions | null, include_date_of_response?: boolean | null } | null, file_storage?: { __typename?: 'FileStorageQuestionConfig', file_storage_config_slug?: string | null, accepted_file_types?: Array<string> | null } | null, input_validation?: { __typename?: 'InputValidationConfig', mode?: string | null, pattern?: string | null, helper_text?: string | null, simpleConfig?: { __typename?: 'InputValidationSimpleConfig', exactLength?: number | null, allowed?: { __typename?: 'InputValidationAllowed', letters?: boolean | null, numbers?: boolean | null, whitespace?: boolean | null, special?: boolean | null } | null } | null } | null } | null, rule?: { __typename?: 'Rule', id: string, boolean_operator: BooleanOperator, conditions: Array<{ __typename?: 'Condition', id: string, reference: string, reference_key: string, operator: ConditionOperator, operand: { __typename?: 'ConditionOperand', value: string, type: ConditionOperandType } }> } | null }> } | null } | { __typename: 'MessageActivityInput', type: ActivityInputType, message?: { __typename?: 'ActivityMessage', id: string, subject: string, body: string, format?: MessageFormat | null, attachments?: Array<{ __typename?: 'MessageAttachment', id: string, name: string, type: string, url: string }> | null } | null } | null, outputs?: { __typename: 'CalculationActivityOutput', type: ActivityOutputType, results?: unknown | null } | { __typename: 'DynamicFormActivityOutput', type: ActivityOutputType, response?: unknown | null } | { __typename: 'ExtensionActivityOutput', type: ActivityOutputType, results?: unknown | null } | { __typename: 'FormActivityOutput', type: ActivityOutputType, response?: unknown | null } | null };

export type DynamicQuestionFragment = { __typename?: 'DynamicQuestion', id: string, key: string, title: string, question_type: QuestionType, user_question_type?: UserQuestionType | null, data_point_value_type?: DataPointValueType | null, is_required: boolean, options?: Array<{ __typename?: 'QuestionOption', id: string, label: string, value?: string | null }> | null, config?: { __typename?: 'QuestionConfig', recode_enabled?: boolean | null, use_select?: boolean | null, mandatory: boolean, slider?: { __typename?: 'SliderConfig', min: number, max: number, step_value: number, min_label: string, max_label: string, is_value_tooltip_on: boolean, display_marks: boolean, show_min_max_values: boolean } | null, phone?: { __typename?: 'PhoneConfig', default_country?: string | null, available_countries?: Array<string> | null } | null, number?: { __typename?: 'NumberConfig', range?: { __typename?: 'RangeConfig', enabled?: boolean | null, min?: number | null, max?: number | null } | null } | null, multiple_select?: { __typename?: 'MultipleSelectConfig', range?: { __typename?: 'ChoiceRangeConfig', enabled?: boolean | null, min?: number | null, max?: number | null } | null, exclusive_option?: { __typename?: 'ExclusiveOptionConfig', enabled?: boolean | null, option_id?: string | null } | null } | null, date_validation?: { __typename?: 'DateConfig', allowed_dates?: AllowedDatesOptions | null, include_date_of_response?: boolean | null } | null, file_storage?: { __typename?: 'FileStorageQuestionConfig', file_storage_config_slug?: string | null, accepted_file_types?: Array<string> | null } | null, input_validation?: { __typename?: 'InputValidationConfig', mode?: string | null, pattern?: string | null, helper_text?: string | null, simpleConfig?: { __typename?: 'InputValidationSimpleConfig', exactLength?: number | null, allowed?: { __typename?: 'InputValidationAllowed', letters?: boolean | null, numbers?: boolean | null, whitespace?: boolean | null, special?: boolean | null } | null } | null } | null } | null };

export type QuestionFragment = { __typename?: 'Question', id: string, key: string, title: string, definition_id: string, question_type?: QuestionType | null, user_question_type?: UserQuestionType | null, data_point_value_type?: DataPointValueType | null, is_required: boolean, options?: Array<{ __typename?: 'QuestionOption', id: string, label: string, value?: string | null }> | null, config?: { __typename?: 'QuestionConfig', recode_enabled?: boolean | null, use_select?: boolean | null, mandatory: boolean, slider?: { __typename?: 'SliderConfig', min: number, max: number, step_value: number, min_label: string, max_label: string, is_value_tooltip_on: boolean, display_marks: boolean, show_min_max_values: boolean } | null, phone?: { __typename?: 'PhoneConfig', default_country?: string | null, available_countries?: Array<string> | null } | null, number?: { __typename?: 'NumberConfig', range?: { __typename?: 'RangeConfig', enabled?: boolean | null, min?: number | null, max?: number | null } | null } | null, multiple_select?: { __typename?: 'MultipleSelectConfig', range?: { __typename?: 'ChoiceRangeConfig', enabled?: boolean | null, min?: number | null, max?: number | null } | null, exclusive_option?: { __typename?: 'ExclusiveOptionConfig', enabled?: boolean | null, option_id?: string | null } | null } | null, date_validation?: { __typename?: 'DateConfig', allowed_dates?: AllowedDatesOptions | null, include_date_of_response?: boolean | null } | null, file_storage?: { __typename?: 'FileStorageQuestionConfig', file_storage_config_slug?: string | null, accepted_file_types?: Array<string> | null } | null, input_validation?: { __typename?: 'InputValidationConfig', mode?: string | null, pattern?: string | null, helper_text?: string | null, simpleConfig?: { __typename?: 'InputValidationSimpleConfig', exactLength?: number | null, allowed?: { __typename?: 'InputValidationAllowed', letters?: boolean | null, numbers?: boolean | null, whitespace?: boolean | null, special?: boolean | null } | null } | null } | null } | null, rule?: { __typename?: 'Rule', id: string, boolean_operator: BooleanOperator, conditions: Array<{ __typename?: 'Condition', id: string, reference: string, reference_key: string, operator: ConditionOperator, operand: { __typename?: 'ConditionOperand', value: string, type: ConditionOperandType } }> } | null };

export const QuestionFragmentDoc = gql`
    fragment Question on Question {
  id
  key
  title
  definition_id
  question_type
  user_question_type
  data_point_value_type
  is_required
  options {
    id
    label
    value
  }
  config {
    recode_enabled
    use_select
    mandatory
    slider {
      min
      max
      step_value
      min_label
      max_label
      is_value_tooltip_on
      display_marks
      show_min_max_values
    }
    phone {
      default_country
      available_countries
    }
    number {
      range {
        enabled
        min
        max
      }
    }
    multiple_select {
      range {
        enabled
        min
        max
      }
      exclusive_option {
        enabled
        option_id
      }
    }
    date_validation {
      allowed_dates
      include_date_of_response
    }
    file_storage {
      file_storage_config_slug
      accepted_file_types
    }
    input_validation {
      mode
      pattern
      helper_text
      simpleConfig {
        exactLength
        allowed {
          letters
          numbers
          whitespace
          special
        }
      }
    }
  }
  rule {
    id
    boolean_operator
    conditions {
      id
      reference
      reference_key
      operator
      operand {
        value
        type
      }
    }
  }
}
    `;
export const DynamicQuestionFragmentDoc = gql`
    fragment DynamicQuestion on DynamicQuestion {
  id
  key
  title
  question_type
  user_question_type
  data_point_value_type
  is_required
  options {
    id
    label
    value
  }
  config {
    recode_enabled
    use_select
    mandatory
    slider {
      min
      max
      step_value
      min_label
      max_label
      is_value_tooltip_on
      display_marks
      show_min_max_values
    }
    phone {
      default_country
      available_countries
    }
    number {
      range {
        enabled
        min
        max
      }
    }
    multiple_select {
      range {
        enabled
        min
        max
      }
      exclusive_option {
        enabled
        option_id
      }
    }
    date_validation {
      allowed_dates
      include_date_of_response
    }
    file_storage {
      file_storage_config_slug
      accepted_file_types
    }
    input_validation {
      mode
      pattern
      helper_text
      simpleConfig {
        exactLength
        allowed {
          letters
          numbers
          whitespace
          special
        }
      }
    }
  }
}
    `;
export const ActivityFragmentDoc = gql`
    fragment Activity on Activity {
  id
  action
  careflow_id
  container_name
  date
  indirect_object {
    id
    type
    name
    email
    preferred_language
  }
  object {
    id
    type
    name
    email
    preferred_language
  }
  pathway_definition_id
  reference_id
  reference_type
  resolution
  session_id
  status
  tenant_id
  is_user_activity
  sub_activities {
    id
    action
    object {
      id
      type
      name
      email
      preferred_language
    }
  }
  inputs {
    __typename
    type
    ... on FormActivityInput {
      type
      form {
        id
        key
        title
        trademark
        questions {
          ...Question
        }
      }
    }
    ... on DynamicFormActivityInput {
      type
      dynamic_form {
        key
        title
        trademark
        questions {
          ...DynamicQuestion
        }
      }
    }
    ... on MessageActivityInput {
      type
      message {
        id
        subject
        body
        format
        attachments {
          id
          name
          type
          url
        }
      }
    }
    ... on CalculationActivityInput {
      type
      calculationFields: fields {
        id
        key
        label
        value
      }
    }
    ... on ExtensionActivityInput {
      type
      extensionFields: fields
    }
    ... on ChecklistActivityInput {
      type
      checklist {
        title
        items
      }
    }
    ... on ClinicalNoteActivityInput {
      type
      clinicalNote {
        id
        narratives {
          id
          key
          title
          body
        }
        context {
          key
          value
        }
      }
    }
  }
  outputs {
    __typename
    type
    ... on FormActivityOutput {
      type
      response
    }
    ... on DynamicFormActivityOutput {
      type
      response
    }
    ... on CalculationActivityOutput {
      type
      results
    }
    ... on ExtensionActivityOutput {
      type
      results
    }
  }
}
    ${QuestionFragmentDoc}
${DynamicQuestionFragmentDoc}`;
export const CompleteActivityDocument = gql`
    mutation CompleteActivity($input: CompleteActivityInput!) {
  completeActivity(input: $input) {
    success
    code
    message
    activity {
      ...Activity
    }
    data
  }
}
    ${ActivityFragmentDoc}`;
export type CompleteActivityMutationFn = ApolloReactCommon.MutationFunction<CompleteActivityMutation, CompleteActivityMutationVariables>;

/**
 * __useCompleteActivityMutation__
 *
 * To run a mutation, you first call `useCompleteActivityMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCompleteActivityMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [completeActivityMutation, { data, loading, error }] = useCompleteActivityMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCompleteActivityMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<CompleteActivityMutation, CompleteActivityMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<CompleteActivityMutation, CompleteActivityMutationVariables>(CompleteActivityDocument, options);
      }
export type CompleteActivityMutationHookResult = ReturnType<typeof useCompleteActivityMutation>;
export type CompleteActivityMutationResult = ApolloReactCommon.MutationResult<CompleteActivityMutation>;
export type CompleteActivityMutationOptions = ApolloReactCommon.BaseMutationOptions<CompleteActivityMutation, CompleteActivityMutationVariables>;
export const GetActivityDocument = gql`
    query GetActivity($id: ID!) {
  activity(id: $id) {
    success
    activity {
      ...Activity
    }
  }
}
    ${ActivityFragmentDoc}`;

/**
 * __useGetActivityQuery__
 *
 * To run a query within a React component, call `useGetActivityQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetActivityQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetActivityQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetActivityQuery(baseOptions: ApolloReactHooks.QueryHookOptions<GetActivityQuery, GetActivityQueryVariables> & ({ variables: GetActivityQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<GetActivityQuery, GetActivityQueryVariables>(GetActivityDocument, options);
      }
export function useGetActivityLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<GetActivityQuery, GetActivityQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<GetActivityQuery, GetActivityQueryVariables>(GetActivityDocument, options);
        }
export function useGetActivitySuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<GetActivityQuery, GetActivityQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<GetActivityQuery, GetActivityQueryVariables>(GetActivityDocument, options);
        }
export type GetActivityQueryHookResult = ReturnType<typeof useGetActivityQuery>;
export type GetActivityLazyQueryHookResult = ReturnType<typeof useGetActivityLazyQuery>;
export type GetActivitySuspenseQueryHookResult = ReturnType<typeof useGetActivitySuspenseQuery>;
export type GetActivityQueryResult = ApolloReactCommon.QueryResult<GetActivityQuery, GetActivityQueryVariables>;
export const OnActivityCompletedDocument = gql`
    subscription OnActivityCompleted($careflow_id: String!) {
  activityCompleted(careflow_id: $careflow_id) {
    ...Activity
  }
}
    ${ActivityFragmentDoc}`;

/**
 * __useOnActivityCompletedSubscription__
 *
 * To run a query within a React component, call `useOnActivityCompletedSubscription` and pass it any options that fit your needs.
 * When your component renders, `useOnActivityCompletedSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOnActivityCompletedSubscription({
 *   variables: {
 *      careflow_id: // value for 'careflow_id'
 *   },
 * });
 */
export function useOnActivityCompletedSubscription(baseOptions: ApolloReactHooks.SubscriptionHookOptions<OnActivityCompletedSubscription, OnActivityCompletedSubscriptionVariables> & ({ variables: OnActivityCompletedSubscriptionVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useSubscription<OnActivityCompletedSubscription, OnActivityCompletedSubscriptionVariables>(OnActivityCompletedDocument, options);
      }
export type OnActivityCompletedSubscriptionHookResult = ReturnType<typeof useOnActivityCompletedSubscription>;
export type OnActivityCompletedSubscriptionResult = ApolloReactCommon.SubscriptionResult<OnActivityCompletedSubscription>;
export const OnActivityCreatedDocument = gql`
    subscription OnActivityCreated($careflow_id: String!) {
  activityCreated(careflow_id: $careflow_id) {
    ...Activity
  }
}
    ${ActivityFragmentDoc}`;

/**
 * __useOnActivityCreatedSubscription__
 *
 * To run a query within a React component, call `useOnActivityCreatedSubscription` and pass it any options that fit your needs.
 * When your component renders, `useOnActivityCreatedSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOnActivityCreatedSubscription({
 *   variables: {
 *      careflow_id: // value for 'careflow_id'
 *   },
 * });
 */
export function useOnActivityCreatedSubscription(baseOptions: ApolloReactHooks.SubscriptionHookOptions<OnActivityCreatedSubscription, OnActivityCreatedSubscriptionVariables> & ({ variables: OnActivityCreatedSubscriptionVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useSubscription<OnActivityCreatedSubscription, OnActivityCreatedSubscriptionVariables>(OnActivityCreatedDocument, options);
      }
export type OnActivityCreatedSubscriptionHookResult = ReturnType<typeof useOnActivityCreatedSubscription>;
export type OnActivityCreatedSubscriptionResult = ApolloReactCommon.SubscriptionResult<OnActivityCreatedSubscription>;
export const OnActivityExpiredDocument = gql`
    subscription OnActivityExpired($careflow_id: String!) {
  activityExpired(careflow_id: $careflow_id) {
    ...Activity
  }
}
    ${ActivityFragmentDoc}`;

/**
 * __useOnActivityExpiredSubscription__
 *
 * To run a query within a React component, call `useOnActivityExpiredSubscription` and pass it any options that fit your needs.
 * When your component renders, `useOnActivityExpiredSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOnActivityExpiredSubscription({
 *   variables: {
 *      careflow_id: // value for 'careflow_id'
 *   },
 * });
 */
export function useOnActivityExpiredSubscription(baseOptions: ApolloReactHooks.SubscriptionHookOptions<OnActivityExpiredSubscription, OnActivityExpiredSubscriptionVariables> & ({ variables: OnActivityExpiredSubscriptionVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useSubscription<OnActivityExpiredSubscription, OnActivityExpiredSubscriptionVariables>(OnActivityExpiredDocument, options);
      }
export type OnActivityExpiredSubscriptionHookResult = ReturnType<typeof useOnActivityExpiredSubscription>;
export type OnActivityExpiredSubscriptionResult = ApolloReactCommon.SubscriptionResult<OnActivityExpiredSubscription>;
export const OnActivityUpdatedDocument = gql`
    subscription OnActivityUpdated($careflow_id: String!) {
  activityUpdated(careflow_id: $careflow_id) {
    ...Activity
  }
}
    ${ActivityFragmentDoc}`;

/**
 * __useOnActivityUpdatedSubscription__
 *
 * To run a query within a React component, call `useOnActivityUpdatedSubscription` and pass it any options that fit your needs.
 * When your component renders, `useOnActivityUpdatedSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOnActivityUpdatedSubscription({
 *   variables: {
 *      careflow_id: // value for 'careflow_id'
 *   },
 * });
 */
export function useOnActivityUpdatedSubscription(baseOptions: ApolloReactHooks.SubscriptionHookOptions<OnActivityUpdatedSubscription, OnActivityUpdatedSubscriptionVariables> & ({ variables: OnActivityUpdatedSubscriptionVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useSubscription<OnActivityUpdatedSubscription, OnActivityUpdatedSubscriptionVariables>(OnActivityUpdatedDocument, options);
      }
export type OnActivityUpdatedSubscriptionHookResult = ReturnType<typeof useOnActivityUpdatedSubscription>;
export type OnActivityUpdatedSubscriptionResult = ApolloReactCommon.SubscriptionResult<OnActivityUpdatedSubscription>;
export const PathwayActivitiesDocument = gql`
    query PathwayActivities($pathway_id: String!) {
  pathwayActivities(
    pathway_id: $pathway_id
    sorting: {field: "date", direction: "DESC"}
  ) {
    success
    activities {
      ...Activity
    }
    totalCount
  }
}
    ${ActivityFragmentDoc}`;

/**
 * __usePathwayActivitiesQuery__
 *
 * To run a query within a React component, call `usePathwayActivitiesQuery` and pass it any options that fit your needs.
 * When your component renders, `usePathwayActivitiesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = usePathwayActivitiesQuery({
 *   variables: {
 *      pathway_id: // value for 'pathway_id'
 *   },
 * });
 */
export function usePathwayActivitiesQuery(baseOptions: ApolloReactHooks.QueryHookOptions<PathwayActivitiesQuery, PathwayActivitiesQueryVariables> & ({ variables: PathwayActivitiesQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<PathwayActivitiesQuery, PathwayActivitiesQueryVariables>(PathwayActivitiesDocument, options);
      }
export function usePathwayActivitiesLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<PathwayActivitiesQuery, PathwayActivitiesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<PathwayActivitiesQuery, PathwayActivitiesQueryVariables>(PathwayActivitiesDocument, options);
        }
export function usePathwayActivitiesSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<PathwayActivitiesQuery, PathwayActivitiesQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<PathwayActivitiesQuery, PathwayActivitiesQueryVariables>(PathwayActivitiesDocument, options);
        }
export type PathwayActivitiesQueryHookResult = ReturnType<typeof usePathwayActivitiesQuery>;
export type PathwayActivitiesLazyQueryHookResult = ReturnType<typeof usePathwayActivitiesLazyQuery>;
export type PathwayActivitiesSuspenseQueryHookResult = ReturnType<typeof usePathwayActivitiesSuspenseQuery>;
export type PathwayActivitiesQueryResult = ApolloReactCommon.QueryResult<PathwayActivitiesQuery, PathwayActivitiesQueryVariables>;