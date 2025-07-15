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
  id: Scalars['ID']['output'];
  key: Scalars['String']['output'];
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
  value_type?: Maybe<Scalars['String']['output']>;
};

export type Checklist = {
  items: Array<Scalars['String']['output']>;
  title: Scalars['String']['output'];
};

export type ChecklistActivityInput = ActivityInput & {
  checklist?: Maybe<Checklist>;
  type: ActivityInputType;
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

export type CreateActivityInput = {
  careflow_id: Scalars['String']['input'];
  input_data?: InputMaybe<Scalars['String']['input']>;
  input_type?: InputMaybe<ActivityInputType>;
  pathway_definition_id: Scalars['String']['input'];
  reference_id: Scalars['String']['input'];
  session_id?: InputMaybe<Scalars['String']['input']>;
  tenant_id: Scalars['String']['input'];
};

export type DynamicForm = {
  key: Scalars['String']['output'];
  questions: Array<DynamicQuestion>;
  title: Scalars['String']['output'];
  trademark?: Maybe<Scalars['String']['output']>;
};

export type DynamicFormActivityInput = ActivityInput & {
  dynamicForm?: Maybe<DynamicForm>;
  type: ActivityInputType;
};

export type DynamicFormActivityOutput = ActivityOutput & {
  response?: Maybe<Scalars['JSON']['output']>;
  type: ActivityOutputType;
};

export type DynamicQuestion = {
  id: Scalars['ID']['output'];
  key: Scalars['String']['output'];
  options?: Maybe<Array<QuestionOption>>;
  questionType: QuestionType;
  required?: Maybe<Scalars['Boolean']['output']>;
  title: Scalars['String']['output'];
};

export type ExtensionActivityInput = ActivityInput & {
  fields?: Maybe<Scalars['JSON']['output']>;
  type: ActivityInputType;
};

export type ExtensionActivityOutput = ActivityOutput & {
  results?: Maybe<Scalars['JSON']['output']>;
  type: ActivityOutputType;
};

export type FormActivityInput = ActivityInput & {
  form?: Maybe<ActivityForm>;
  type: ActivityInputType;
};

export type FormActivityOutput = ActivityOutput & {
  response?: Maybe<Scalars['JSON']['output']>;
  type: ActivityOutputType;
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

export type Mutation = {
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

export type PaginationInput = {
  count?: Scalars['Float']['input'];
  offset?: Scalars['Float']['input'];
};

export type Query = {
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
  definition_id?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  key: Scalars['String']['output'];
  options?: Maybe<Array<QuestionOption>>;
  placeholder?: Maybe<Scalars['String']['output']>;
  questionType: QuestionType;
  required?: Maybe<Scalars['Boolean']['output']>;
  title: Scalars['String']['output'];
  userQuestionType: UserQuestionType;
};

export type QuestionOption = {
  id: Scalars['String']['output'];
  label: Scalars['String']['output'];
  value: Scalars['String']['output'];
};

export type QuestionType =
  | 'INPUT'
  | 'MULTIPLE_CHOICE'
  | 'NO_INPUT';

export type SortingInput = {
  direction?: Scalars['String']['input'];
  field?: Scalars['String']['input'];
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
