export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
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
  activities: Array<Activity>;
  code: Scalars['String']['output'];
  message?: Maybe<Scalars['String']['output']>;
  success: Scalars['Boolean']['output'];
  totalCount?: Maybe<Scalars['Float']['output']>;
};

export type Activity = {
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
  attachments?: Maybe<Array<MessageAttachment>>;
  body: Scalars['String']['output'];
  format?: Maybe<MessageFormat>;
  id: Scalars['ID']['output'];
  subject: Scalars['String']['output'];
};

export type ActivityObject = {
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
  fields?: Maybe<Array<CalculationField>>;
  type: ActivityInputType;
};

export type CalculationActivityOutput = ActivityOutput & {
  results?: Maybe<Scalars['JSON']['output']>;
  type: ActivityOutputType;
};

export type CalculationField = {
  id: Scalars['ID']['output'];
  key: Scalars['String']['output'];
  label: Scalars['String']['output'];
  value: Scalars['JSON']['output'];
};

export type CareFlow = {
  id: Scalars['String']['output'];
  release_id: Scalars['String']['output'];
};

export type Checklist = {
  items: Array<Scalars['String']['output']>;
  title: Scalars['String']['output'];
};

export type ChecklistActivityInput = ActivityInput & {
  checklist?: Maybe<Checklist>;
  type: ActivityInputType;
};

export type ChoiceRangeConfig = {
  enabled?: Maybe<Scalars['Boolean']['output']>;
  max?: Maybe<Scalars['Float']['output']>;
  min?: Maybe<Scalars['Float']['output']>;
};

export type ClinicalNote = {
  context: Array<GeneratedClinicalNoteContextField>;
  id: Scalars['ID']['output'];
  narratives: Array<GeneratedClinicalNoteNarrative>;
};

export type ClinicalNoteActivityInput = ActivityInput & {
  clinicalNote?: Maybe<ClinicalNote>;
  type: ActivityInputType;
};

export type CompleteActivityInput = {
  activity_id: Scalars['ID']['input'];
  completion_context: CompletionContextInput;
  form_response?: InputMaybe<Array<FormResponseInput>>;
  input_data?: InputMaybe<Scalars['JSON']['input']>;
  input_type: ActivityInputType;
};

export type CompleteActivityPayload = {
  activity?: Maybe<Activity>;
  code: Scalars['String']['output'];
  data?: Maybe<Scalars['JSON']['output']>;
  message?: Maybe<Scalars['String']['output']>;
  success: Scalars['Boolean']['output'];
};

export type CompletionContextGraphQl = {
  completed_at: Scalars['String']['output'];
  navi_session_id?: Maybe<Scalars['String']['output']>;
  user_email?: Maybe<Scalars['String']['output']>;
  user_id?: Maybe<Scalars['String']['output']>;
  user_name?: Maybe<Scalars['String']['output']>;
  user_type: CompletionContextUserType;
};

export type CompletionContextInput = {
  completed_at: Scalars['String']['input'];
  navi_session_id: Scalars['String']['input'];
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
  id: Scalars['ID']['output'];
  operand: ConditionOperand;
  operator: ConditionOperator;
  reference: Scalars['String']['output'];
  reference_key?: Maybe<Scalars['String']['output']>;
};

export type ConditionInput = {
  id: Scalars['String']['input'];
  operand: ConditionOperandInput;
  operator: ConditionOperator;
  reference: Scalars['String']['input'];
};

export type ConditionOperand = {
  type: ConditionOperandType;
  value: Scalars['String']['output'];
};

export type ConditionOperandInput = {
  type: Scalars['String']['input'];
  value: Scalars['String']['input'];
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

export type DataPointInputGraphQl = {
  data_point_definition_id: Scalars['String']['input'];
  value: Scalars['String']['input'];
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
  allowed_dates?: Maybe<AllowedDatesOptions>;
  include_date_of_response?: Maybe<Scalars['Boolean']['output']>;
};

export type DynamicForm = {
  key: Scalars['String']['output'];
  questions: Array<DynamicQuestion>;
  title: Scalars['String']['output'];
  trademark?: Maybe<Scalars['String']['output']>;
};

export type DynamicFormActivityInput = ActivityInput & {
  dynamic_form?: Maybe<DynamicForm>;
  type: ActivityInputType;
};

export type DynamicFormActivityOutput = ActivityOutput & {
  response?: Maybe<Scalars['JSON']['output']>;
  type: ActivityOutputType;
};

export type DynamicQuestion = {
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

export type EvaluateFormRulesInput = {
  question_responses: Array<QuestionResponseInput>;
  rules: Array<RuleInput>;
};

export type EvaluateFormRulesPayload = {
  code: Scalars['String']['output'];
  message?: Maybe<Scalars['String']['output']>;
  results?: Maybe<Array<Scalars['Boolean']['output']>>;
  success: Scalars['Boolean']['output'];
};

export type ExclusiveOptionConfig = {
  enabled?: Maybe<Scalars['Boolean']['output']>;
  option_id?: Maybe<Scalars['String']['output']>;
};

export type ExtensionActivityInput = ActivityInput & {
  fields?: Maybe<Scalars['JSON']['output']>;
  type: ActivityInputType;
};

export type ExtensionActivityOutput = ActivityOutput & {
  results?: Maybe<Scalars['JSON']['output']>;
  type: ActivityOutputType;
};

export type FileStorageQuestionConfig = {
  accepted_file_types?: Maybe<Array<Scalars['String']['output']>>;
  file_storage_config_slug?: Maybe<Scalars['String']['output']>;
};

export type FormActivityInput = ActivityInput & {
  form?: Maybe<ActivityForm>;
  type: ActivityInputType;
};

export type FormActivityOutput = ActivityOutput & {
  response?: Maybe<Scalars['JSON']['output']>;
  type: ActivityOutputType;
};

export type FormResponseInput = {
  question_id: Scalars['String']['input'];
  value: Scalars['String']['input'];
};

export type GeneratedClinicalNoteContextField = {
  key: Scalars['String']['output'];
  value: Scalars['String']['output'];
};

export type GeneratedClinicalNoteNarrative = {
  body: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  key: Scalars['String']['output'];
  title: Scalars['String']['output'];
};

export type InputValidationAllowed = {
  letters?: Maybe<Scalars['Boolean']['output']>;
  numbers?: Maybe<Scalars['Boolean']['output']>;
  special?: Maybe<Scalars['Boolean']['output']>;
  whitespace?: Maybe<Scalars['Boolean']['output']>;
};

export type InputValidationConfig = {
  helper_text?: Maybe<Scalars['String']['output']>;
  mode?: Maybe<Scalars['String']['output']>;
  pattern?: Maybe<Scalars['String']['output']>;
  simpleConfig?: Maybe<InputValidationSimpleConfig>;
};

export type InputValidationSimpleConfig = {
  allowed?: Maybe<InputValidationAllowed>;
  exactLength?: Maybe<Scalars['Float']['output']>;
};

export type MessageActivityInput = ActivityInput & {
  message?: Maybe<ActivityMessage>;
  type: ActivityInputType;
};

export type MessageAttachment = {
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
  exclusive_option?: Maybe<ExclusiveOptionConfig>;
  range?: Maybe<ChoiceRangeConfig>;
};

export type Mutation = {
  /** Complete an activity with form responses, checklist items, or other input data. Handles different activity types including forms, checklists, clinical notes, and calculations. */
  completeActivity: CompleteActivityPayload;
  /** Evaluate form rules against question responses to determine which rules are satisfied. Returns an array of boolean results indicating rule satisfaction status. */
  evaluateFormRules: EvaluateFormRulesPayload;
  /** Find an existing patient by ID or identifier, or create a new patient if none exists. Uses the same patient finding logic as enrollment triggers. */
  patientMatch: PatientMatchPayload;
  /** Start a new care flow for a patient with optional baseline data points. Creates a new care flow instance and returns the care flow details and stakeholders. */
  startCareFlow: StartCareFlowPayload;
};


export type MutationCompleteActivityArgs = {
  input: CompleteActivityInput;
};


export type MutationEvaluateFormRulesArgs = {
  input: EvaluateFormRulesInput;
};


export type MutationPatientMatchArgs = {
  input: PatientMatchInput;
};


export type MutationStartCareFlowArgs = {
  input: StartCareFlowInput;
};

export type NumberConfig = {
  range?: Maybe<RangeConfig>;
};

export type PaginationInput = {
  count?: Scalars['Float']['input'];
  offset?: Scalars['Float']['input'];
};

export type PatientIdentifier = {
  system: Scalars['String']['output'];
  value: Scalars['String']['output'];
};

export type PatientIdentifierInput = {
  system: Scalars['String']['input'];
  value: Scalars['String']['input'];
};

export type PatientMatchInput = {
  allow_anonymous_creation?: InputMaybe<Scalars['Boolean']['input']>;
  patient_id?: InputMaybe<Scalars['String']['input']>;
  patient_identifier?: InputMaybe<PatientIdentifierInput>;
};

export type PatientMatchPayload = {
  code: Scalars['String']['output'];
  message?: Maybe<Scalars['String']['output']>;
  patient_id?: Maybe<Scalars['String']['output']>;
  patient_identifier?: Maybe<PatientIdentifier>;
  success: Scalars['Boolean']['output'];
};

export type PhoneConfig = {
  available_countries?: Maybe<Array<Scalars['String']['output']>>;
  default_country?: Maybe<Scalars['String']['output']>;
};

export type Query = {
  /** Retrieve activities with filtering, pagination, and sorting from the local navi database. Supports filtering by pathway_id, track_id, and includes total count for pagination. */
  activities: ActivitiesPayload;
  /** Retrieve a single activity by its ID from the local navi database. Returns activity details including inputs, outputs, and metadata. */
  activity: ActivityPayload;
  /** Retrieve all activities for a specific pathway from the local navi database. Includes pagination and sorting capabilities, focused on pathway-specific activity retrieval. */
  pathwayActivities: ActivitiesPayload;
};


export type QueryActivitiesArgs = {
  careflow_id: Scalars['String']['input'];
  pagination?: InputMaybe<PaginationInput>;
  sorting?: InputMaybe<SortingInput>;
  track_id?: InputMaybe<Scalars['String']['input']>;
};


export type QueryActivityArgs = {
  id: Scalars['ID']['input'];
};


export type QueryPathwayActivitiesArgs = {
  careflow_id: Scalars['String']['input'];
  pagination?: InputMaybe<PaginationInput>;
  sorting?: InputMaybe<SortingInput>;
  track_id?: InputMaybe<Scalars['String']['input']>;
};

export type Question = {
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
  user_question_type: UserQuestionType;
};

export type QuestionConfig = {
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
  id: Scalars['String']['output'];
  label: Scalars['String']['output'];
  value?: Maybe<Scalars['String']['output']>;
  value_string?: Maybe<Scalars['String']['output']>;
};

export type QuestionResponseInput = {
  question_id: Scalars['String']['input'];
  value: Scalars['String']['input'];
  value_type: Scalars['String']['input'];
};

export type QuestionType =
  | 'INPUT'
  | 'MULTIPLE_CHOICE'
  | 'NO_INPUT';

export type RangeConfig = {
  enabled?: Maybe<Scalars['Boolean']['output']>;
  max?: Maybe<Scalars['Float']['output']>;
  min?: Maybe<Scalars['Float']['output']>;
};

export type Rule = {
  boolean_operator: BooleanOperator;
  conditions: Array<Condition>;
  id: Scalars['ID']['output'];
};

export type RuleInput = {
  boolean_operator: Scalars['String']['input'];
  conditions: Array<ConditionInput>;
  id: Scalars['String']['input'];
};

export type SliderConfig = {
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

export type Stakeholder = {
  clinical_app_role: StakeholderClinicalAppRole;
  definition_id: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  label: StakeholderLabel;
  release_id: Scalars['String']['output'];
  version: Scalars['Float']['output'];
};

export type StakeholderClinicalAppRole =
  | 'CAREGIVER'
  | 'PATIENT'
  | 'PHYSICIAN';

export type StakeholderLabel = {
  en: Scalars['String']['output'];
};

export type StartCareFlowInput = {
  careflow_definition_id: Scalars['String']['input'];
  data_points?: InputMaybe<Array<DataPointInputGraphQl>>;
  patient_id: Scalars['String']['input'];
  release_id?: InputMaybe<Scalars['String']['input']>;
  session_id?: InputMaybe<Scalars['String']['input']>;
};

export type StartCareFlowPayload = {
  careflow: CareFlow;
  code: Scalars['String']['output'];
  message?: Maybe<Scalars['String']['output']>;
  stakeholders: Array<Stakeholder>;
  success: Scalars['Boolean']['output'];
};

export type SubActivity = {
  action: ActivityAction;
  id: Scalars['ID']['output'];
  object?: Maybe<ActivityObject>;
};

export type Subscription = {
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
