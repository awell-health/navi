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
  container_name?: Maybe<Scalars['String']['output']>;
  date: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  indirect_object?: Maybe<ActivityObject>;
  inputs?: Maybe<ActivityInput>;
  object: ActivityObject;
  outputs?: Maybe<ActivityOutput>;
  pathway_definition_id: Scalars['String']['output'];
  reference_id: Scalars['String']['output'];
  reference_type: ActivityReferenceType;
  resolution?: Maybe<ActivityResolution>;
  session_id?: Maybe<Scalars['String']['output']>;
  status: ActivityStatus;
  sub_activities: Array<SubActivity>;
  tenant_id: Scalars['String']['output'];
};

export enum ActivityAction {
  Activated = 'ACTIVATED',
  Assigned = 'ASSIGNED',
  Completed = 'COMPLETED',
  Computed = 'COMPUTED',
  Delegated = 'DELEGATED',
  Deleted = 'DELETED',
  Discarded = 'DISCARDED',
  Expired = 'EXPIRED',
  Failed = 'FAILED',
  Postponed = 'POSTPONED',
  Scheduled = 'SCHEDULED',
  Started = 'STARTED',
  Stopped = 'STOPPED'
}

export type ActivityForm = {
  __typename?: 'ActivityForm';
  id: Scalars['ID']['output'];
  key: Scalars['String']['output'];
  questions: Array<Question>;
  title: Scalars['String']['output'];
  trademark?: Maybe<Scalars['String']['output']>;
};

export type ActivityInput = {
  type: ActivityInputType;
};

export enum ActivityInputType {
  Calculation = 'CALCULATION',
  DynamicForm = 'DYNAMIC_FORM',
  Extension = 'EXTENSION',
  Form = 'FORM',
  Message = 'MESSAGE'
}

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

export enum ActivityObjectType {
  Agent = 'AGENT',
  Calculation = 'CALCULATION',
  Checklist = 'CHECKLIST',
  Form = 'FORM',
  Message = 'MESSAGE',
  Patient = 'PATIENT',
  Plugin = 'PLUGIN',
  PluginAction = 'PLUGIN_ACTION',
  Stakeholder = 'STAKEHOLDER',
  Timer = 'TIMER',
  User = 'USER'
}

export type ActivityOutput = {
  type: ActivityOutputType;
};

export enum ActivityOutputType {
  Calculation = 'CALCULATION',
  DynamicForm = 'DYNAMIC_FORM',
  Extension = 'EXTENSION',
  Form = 'FORM'
}

export type ActivityPayload = {
  __typename?: 'ActivityPayload';
  activity?: Maybe<Activity>;
  code: Scalars['String']['output'];
  message?: Maybe<Scalars['String']['output']>;
  success: Scalars['Boolean']['output'];
};

export enum ActivityReferenceType {
  Agent = 'AGENT',
  Navigation = 'NAVIGATION',
  Orchestration = 'ORCHESTRATION',
  Reminder = 'REMINDER'
}

export enum ActivityResolution {
  Cancelled = 'CANCELLED',
  Expired = 'EXPIRED',
  Failure = 'FAILURE',
  Success = 'SUCCESS'
}

export enum ActivityStatus {
  Active = 'ACTIVE',
  Cancelled = 'CANCELLED',
  Done = 'DONE',
  Failed = 'FAILED',
  Postponed = 'POSTPONED',
  Scheduled = 'SCHEDULED',
  Stopped = 'STOPPED'
}

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
  value_type?: Maybe<Scalars['String']['output']>;
};

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
  __typename?: 'DynamicForm';
  key: Scalars['String']['output'];
  questions: Array<DynamicQuestion>;
  title: Scalars['String']['output'];
  trademark?: Maybe<Scalars['String']['output']>;
};

export type DynamicFormActivityInput = ActivityInput & {
  __typename?: 'DynamicFormActivityInput';
  dynamicForm?: Maybe<DynamicForm>;
  type: ActivityInputType;
};

export type DynamicFormActivityOutput = ActivityOutput & {
  __typename?: 'DynamicFormActivityOutput';
  response?: Maybe<Scalars['JSON']['output']>;
  type: ActivityOutputType;
};

export type DynamicQuestion = {
  __typename?: 'DynamicQuestion';
  id: Scalars['ID']['output'];
  key: Scalars['String']['output'];
  options?: Maybe<Array<QuestionOption>>;
  questionType: QuestionType;
  required?: Maybe<Scalars['Boolean']['output']>;
  title: Scalars['String']['output'];
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

export enum MessageFormat {
  Html = 'HTML',
  Markdown = 'MARKDOWN',
  Slate = 'SLATE'
}

export type Mutation = {
  __typename?: 'Mutation';
  createActivity: ActivityPayload;
  updateActivity: ActivityPayload;
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
  definition_id?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  key: Scalars['String']['output'];
  options?: Maybe<Array<QuestionOption>>;
  placeholder?: Maybe<Scalars['String']['output']>;
  questionType: QuestionType;
  required?: Maybe<Scalars['Boolean']['output']>;
  title: Scalars['String']['output'];
};

export type QuestionOption = {
  __typename?: 'QuestionOption';
  id: Scalars['String']['output'];
  label: Scalars['String']['output'];
  value: Scalars['String']['output'];
};

export enum QuestionType {
  Address = 'ADDRESS',
  Date = 'DATE',
  Email = 'EMAIL',
  File = 'FILE',
  Input = 'INPUT',
  LongText = 'LONG_TEXT',
  MultipleChoice = 'MULTIPLE_CHOICE',
  MultipleSelect = 'MULTIPLE_SELECT',
  Number = 'NUMBER',
  Phone = 'PHONE',
  Signature = 'SIGNATURE',
  Slider = 'SLIDER',
  YesNo = 'YES_NO'
}

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

export type ActivityFragment = { __typename?: 'Activity', id: string, action: ActivityAction, careflow_id: string, container_name?: string | null, date: string, pathway_definition_id: string, reference_id: string, reference_type: ActivityReferenceType, resolution?: ActivityResolution | null, session_id?: string | null, status: ActivityStatus, tenant_id: string, indirect_object?: { __typename?: 'ActivityObject', id: string, type: ActivityObjectType, name: string, email?: string | null, preferred_language?: string | null } | null, object: { __typename?: 'ActivityObject', id: string, type: ActivityObjectType, name: string, email?: string | null, preferred_language?: string | null }, sub_activities: Array<{ __typename?: 'SubActivity', id: string, action: ActivityAction, object?: { __typename?: 'ActivityObject', id: string, type: ActivityObjectType, name: string, email?: string | null, preferred_language?: string | null } | null }>, inputs?: { __typename: 'CalculationActivityInput', type: ActivityInputType, calculationFields?: Array<{ __typename?: 'CalculationField', id: string, key: string, label: string, value: unknown, value_type?: string | null }> | null } | { __typename: 'DynamicFormActivityInput', type: ActivityInputType, dynamicForm?: { __typename?: 'DynamicForm', key: string, title: string, trademark?: string | null, questions: Array<{ __typename?: 'DynamicQuestion', id: string, key: string, title: string, questionType: QuestionType, required?: boolean | null, options?: Array<{ __typename?: 'QuestionOption', id: string, label: string, value: string }> | null }> } | null } | { __typename: 'ExtensionActivityInput', type: ActivityInputType, extensionFields?: unknown | null } | { __typename: 'FormActivityInput', type: ActivityInputType, form?: { __typename?: 'ActivityForm', id: string, key: string, title: string, trademark?: string | null, questions: Array<{ __typename?: 'Question', id: string, key: string, title: string, definition_id?: string | null, placeholder?: string | null, questionType: QuestionType, required?: boolean | null, options?: Array<{ __typename?: 'QuestionOption', id: string, label: string, value: string }> | null }> } | null } | { __typename: 'MessageActivityInput', type: ActivityInputType, message?: { __typename?: 'ActivityMessage', id: string, subject: string, body: string, format?: MessageFormat | null, attachments?: Array<{ __typename?: 'MessageAttachment', id: string, name: string, type: string, url: string }> | null } | null } | null, outputs?: { __typename: 'CalculationActivityOutput', type: ActivityOutputType, results?: unknown | null } | { __typename: 'DynamicFormActivityOutput', type: ActivityOutputType, response?: unknown | null } | { __typename: 'ExtensionActivityOutput', type: ActivityOutputType, results?: unknown | null } | { __typename: 'FormActivityOutput', type: ActivityOutputType, response?: unknown | null } | null };

export type DynamicQuestionFragment = { __typename?: 'DynamicQuestion', id: string, key: string, title: string, questionType: QuestionType, required?: boolean | null, options?: Array<{ __typename?: 'QuestionOption', id: string, label: string, value: string }> | null };

export type GetActivityQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetActivityQuery = { __typename?: 'Query', activity: { __typename?: 'ActivityPayload', success: boolean, activity?: { __typename?: 'Activity', id: string, action: ActivityAction, careflow_id: string, container_name?: string | null, date: string, pathway_definition_id: string, reference_id: string, reference_type: ActivityReferenceType, resolution?: ActivityResolution | null, session_id?: string | null, status: ActivityStatus, tenant_id: string, indirect_object?: { __typename?: 'ActivityObject', id: string, type: ActivityObjectType, name: string, email?: string | null, preferred_language?: string | null } | null, object: { __typename?: 'ActivityObject', id: string, type: ActivityObjectType, name: string, email?: string | null, preferred_language?: string | null }, sub_activities: Array<{ __typename?: 'SubActivity', id: string, action: ActivityAction, object?: { __typename?: 'ActivityObject', id: string, type: ActivityObjectType, name: string, email?: string | null, preferred_language?: string | null } | null }>, inputs?: { __typename: 'CalculationActivityInput', type: ActivityInputType, calculationFields?: Array<{ __typename?: 'CalculationField', id: string, key: string, label: string, value: unknown, value_type?: string | null }> | null } | { __typename: 'DynamicFormActivityInput', type: ActivityInputType, dynamicForm?: { __typename?: 'DynamicForm', key: string, title: string, trademark?: string | null, questions: Array<{ __typename?: 'DynamicQuestion', id: string, key: string, title: string, questionType: QuestionType, required?: boolean | null, options?: Array<{ __typename?: 'QuestionOption', id: string, label: string, value: string }> | null }> } | null } | { __typename: 'ExtensionActivityInput', type: ActivityInputType, extensionFields?: unknown | null } | { __typename: 'FormActivityInput', type: ActivityInputType, form?: { __typename?: 'ActivityForm', id: string, key: string, title: string, trademark?: string | null, questions: Array<{ __typename?: 'Question', id: string, key: string, title: string, definition_id?: string | null, placeholder?: string | null, questionType: QuestionType, required?: boolean | null, options?: Array<{ __typename?: 'QuestionOption', id: string, label: string, value: string }> | null }> } | null } | { __typename: 'MessageActivityInput', type: ActivityInputType, message?: { __typename?: 'ActivityMessage', id: string, subject: string, body: string, format?: MessageFormat | null, attachments?: Array<{ __typename?: 'MessageAttachment', id: string, name: string, type: string, url: string }> | null } | null } | null, outputs?: { __typename: 'CalculationActivityOutput', type: ActivityOutputType, results?: unknown | null } | { __typename: 'DynamicFormActivityOutput', type: ActivityOutputType, response?: unknown | null } | { __typename: 'ExtensionActivityOutput', type: ActivityOutputType, results?: unknown | null } | { __typename: 'FormActivityOutput', type: ActivityOutputType, response?: unknown | null } | null } | null } };

export type OnActivityCompletedSubscriptionVariables = Exact<{
  careflow_id: Scalars['String']['input'];
}>;


export type OnActivityCompletedSubscription = { __typename?: 'Subscription', activityCompleted: { __typename?: 'Activity', id: string, action: ActivityAction, careflow_id: string, container_name?: string | null, date: string, pathway_definition_id: string, reference_id: string, reference_type: ActivityReferenceType, resolution?: ActivityResolution | null, session_id?: string | null, status: ActivityStatus, tenant_id: string, indirect_object?: { __typename?: 'ActivityObject', id: string, type: ActivityObjectType, name: string, email?: string | null, preferred_language?: string | null } | null, object: { __typename?: 'ActivityObject', id: string, type: ActivityObjectType, name: string, email?: string | null, preferred_language?: string | null }, sub_activities: Array<{ __typename?: 'SubActivity', id: string, action: ActivityAction, object?: { __typename?: 'ActivityObject', id: string, type: ActivityObjectType, name: string, email?: string | null, preferred_language?: string | null } | null }>, inputs?: { __typename: 'CalculationActivityInput', type: ActivityInputType, calculationFields?: Array<{ __typename?: 'CalculationField', id: string, key: string, label: string, value: unknown, value_type?: string | null }> | null } | { __typename: 'DynamicFormActivityInput', type: ActivityInputType, dynamicForm?: { __typename?: 'DynamicForm', key: string, title: string, trademark?: string | null, questions: Array<{ __typename?: 'DynamicQuestion', id: string, key: string, title: string, questionType: QuestionType, required?: boolean | null, options?: Array<{ __typename?: 'QuestionOption', id: string, label: string, value: string }> | null }> } | null } | { __typename: 'ExtensionActivityInput', type: ActivityInputType, extensionFields?: unknown | null } | { __typename: 'FormActivityInput', type: ActivityInputType, form?: { __typename?: 'ActivityForm', id: string, key: string, title: string, trademark?: string | null, questions: Array<{ __typename?: 'Question', id: string, key: string, title: string, definition_id?: string | null, placeholder?: string | null, questionType: QuestionType, required?: boolean | null, options?: Array<{ __typename?: 'QuestionOption', id: string, label: string, value: string }> | null }> } | null } | { __typename: 'MessageActivityInput', type: ActivityInputType, message?: { __typename?: 'ActivityMessage', id: string, subject: string, body: string, format?: MessageFormat | null, attachments?: Array<{ __typename?: 'MessageAttachment', id: string, name: string, type: string, url: string }> | null } | null } | null, outputs?: { __typename: 'CalculationActivityOutput', type: ActivityOutputType, results?: unknown | null } | { __typename: 'DynamicFormActivityOutput', type: ActivityOutputType, response?: unknown | null } | { __typename: 'ExtensionActivityOutput', type: ActivityOutputType, results?: unknown | null } | { __typename: 'FormActivityOutput', type: ActivityOutputType, response?: unknown | null } | null } };

export type OnActivityCreatedSubscriptionVariables = Exact<{
  careflow_id: Scalars['String']['input'];
}>;


export type OnActivityCreatedSubscription = { __typename?: 'Subscription', activityCreated: { __typename?: 'Activity', id: string, action: ActivityAction, careflow_id: string, container_name?: string | null, date: string, pathway_definition_id: string, reference_id: string, reference_type: ActivityReferenceType, resolution?: ActivityResolution | null, session_id?: string | null, status: ActivityStatus, tenant_id: string, indirect_object?: { __typename?: 'ActivityObject', id: string, type: ActivityObjectType, name: string, email?: string | null, preferred_language?: string | null } | null, object: { __typename?: 'ActivityObject', id: string, type: ActivityObjectType, name: string, email?: string | null, preferred_language?: string | null }, sub_activities: Array<{ __typename?: 'SubActivity', id: string, action: ActivityAction, object?: { __typename?: 'ActivityObject', id: string, type: ActivityObjectType, name: string, email?: string | null, preferred_language?: string | null } | null }>, inputs?: { __typename: 'CalculationActivityInput', type: ActivityInputType, calculationFields?: Array<{ __typename?: 'CalculationField', id: string, key: string, label: string, value: unknown, value_type?: string | null }> | null } | { __typename: 'DynamicFormActivityInput', type: ActivityInputType, dynamicForm?: { __typename?: 'DynamicForm', key: string, title: string, trademark?: string | null, questions: Array<{ __typename?: 'DynamicQuestion', id: string, key: string, title: string, questionType: QuestionType, required?: boolean | null, options?: Array<{ __typename?: 'QuestionOption', id: string, label: string, value: string }> | null }> } | null } | { __typename: 'ExtensionActivityInput', type: ActivityInputType, extensionFields?: unknown | null } | { __typename: 'FormActivityInput', type: ActivityInputType, form?: { __typename?: 'ActivityForm', id: string, key: string, title: string, trademark?: string | null, questions: Array<{ __typename?: 'Question', id: string, key: string, title: string, definition_id?: string | null, placeholder?: string | null, questionType: QuestionType, required?: boolean | null, options?: Array<{ __typename?: 'QuestionOption', id: string, label: string, value: string }> | null }> } | null } | { __typename: 'MessageActivityInput', type: ActivityInputType, message?: { __typename?: 'ActivityMessage', id: string, subject: string, body: string, format?: MessageFormat | null, attachments?: Array<{ __typename?: 'MessageAttachment', id: string, name: string, type: string, url: string }> | null } | null } | null, outputs?: { __typename: 'CalculationActivityOutput', type: ActivityOutputType, results?: unknown | null } | { __typename: 'DynamicFormActivityOutput', type: ActivityOutputType, response?: unknown | null } | { __typename: 'ExtensionActivityOutput', type: ActivityOutputType, results?: unknown | null } | { __typename: 'FormActivityOutput', type: ActivityOutputType, response?: unknown | null } | null } };

export type OnActivityExpiredSubscriptionVariables = Exact<{
  careflow_id: Scalars['String']['input'];
}>;


export type OnActivityExpiredSubscription = { __typename?: 'Subscription', activityExpired: { __typename?: 'Activity', id: string, action: ActivityAction, careflow_id: string, container_name?: string | null, date: string, pathway_definition_id: string, reference_id: string, reference_type: ActivityReferenceType, resolution?: ActivityResolution | null, session_id?: string | null, status: ActivityStatus, tenant_id: string, indirect_object?: { __typename?: 'ActivityObject', id: string, type: ActivityObjectType, name: string, email?: string | null, preferred_language?: string | null } | null, object: { __typename?: 'ActivityObject', id: string, type: ActivityObjectType, name: string, email?: string | null, preferred_language?: string | null }, sub_activities: Array<{ __typename?: 'SubActivity', id: string, action: ActivityAction, object?: { __typename?: 'ActivityObject', id: string, type: ActivityObjectType, name: string, email?: string | null, preferred_language?: string | null } | null }>, inputs?: { __typename: 'CalculationActivityInput', type: ActivityInputType, calculationFields?: Array<{ __typename?: 'CalculationField', id: string, key: string, label: string, value: unknown, value_type?: string | null }> | null } | { __typename: 'DynamicFormActivityInput', type: ActivityInputType, dynamicForm?: { __typename?: 'DynamicForm', key: string, title: string, trademark?: string | null, questions: Array<{ __typename?: 'DynamicQuestion', id: string, key: string, title: string, questionType: QuestionType, required?: boolean | null, options?: Array<{ __typename?: 'QuestionOption', id: string, label: string, value: string }> | null }> } | null } | { __typename: 'ExtensionActivityInput', type: ActivityInputType, extensionFields?: unknown | null } | { __typename: 'FormActivityInput', type: ActivityInputType, form?: { __typename?: 'ActivityForm', id: string, key: string, title: string, trademark?: string | null, questions: Array<{ __typename?: 'Question', id: string, key: string, title: string, definition_id?: string | null, placeholder?: string | null, questionType: QuestionType, required?: boolean | null, options?: Array<{ __typename?: 'QuestionOption', id: string, label: string, value: string }> | null }> } | null } | { __typename: 'MessageActivityInput', type: ActivityInputType, message?: { __typename?: 'ActivityMessage', id: string, subject: string, body: string, format?: MessageFormat | null, attachments?: Array<{ __typename?: 'MessageAttachment', id: string, name: string, type: string, url: string }> | null } | null } | null, outputs?: { __typename: 'CalculationActivityOutput', type: ActivityOutputType, results?: unknown | null } | { __typename: 'DynamicFormActivityOutput', type: ActivityOutputType, response?: unknown | null } | { __typename: 'ExtensionActivityOutput', type: ActivityOutputType, results?: unknown | null } | { __typename: 'FormActivityOutput', type: ActivityOutputType, response?: unknown | null } | null } };

export type OnActivityUpdatedSubscriptionVariables = Exact<{
  careflow_id: Scalars['String']['input'];
}>;


export type OnActivityUpdatedSubscription = { __typename?: 'Subscription', activityUpdated: { __typename?: 'Activity', id: string, action: ActivityAction, careflow_id: string, container_name?: string | null, date: string, pathway_definition_id: string, reference_id: string, reference_type: ActivityReferenceType, resolution?: ActivityResolution | null, session_id?: string | null, status: ActivityStatus, tenant_id: string, indirect_object?: { __typename?: 'ActivityObject', id: string, type: ActivityObjectType, name: string, email?: string | null, preferred_language?: string | null } | null, object: { __typename?: 'ActivityObject', id: string, type: ActivityObjectType, name: string, email?: string | null, preferred_language?: string | null }, sub_activities: Array<{ __typename?: 'SubActivity', id: string, action: ActivityAction, object?: { __typename?: 'ActivityObject', id: string, type: ActivityObjectType, name: string, email?: string | null, preferred_language?: string | null } | null }>, inputs?: { __typename: 'CalculationActivityInput', type: ActivityInputType, calculationFields?: Array<{ __typename?: 'CalculationField', id: string, key: string, label: string, value: unknown, value_type?: string | null }> | null } | { __typename: 'DynamicFormActivityInput', type: ActivityInputType, dynamicForm?: { __typename?: 'DynamicForm', key: string, title: string, trademark?: string | null, questions: Array<{ __typename?: 'DynamicQuestion', id: string, key: string, title: string, questionType: QuestionType, required?: boolean | null, options?: Array<{ __typename?: 'QuestionOption', id: string, label: string, value: string }> | null }> } | null } | { __typename: 'ExtensionActivityInput', type: ActivityInputType, extensionFields?: unknown | null } | { __typename: 'FormActivityInput', type: ActivityInputType, form?: { __typename?: 'ActivityForm', id: string, key: string, title: string, trademark?: string | null, questions: Array<{ __typename?: 'Question', id: string, key: string, title: string, definition_id?: string | null, placeholder?: string | null, questionType: QuestionType, required?: boolean | null, options?: Array<{ __typename?: 'QuestionOption', id: string, label: string, value: string }> | null }> } | null } | { __typename: 'MessageActivityInput', type: ActivityInputType, message?: { __typename?: 'ActivityMessage', id: string, subject: string, body: string, format?: MessageFormat | null, attachments?: Array<{ __typename?: 'MessageAttachment', id: string, name: string, type: string, url: string }> | null } | null } | null, outputs?: { __typename: 'CalculationActivityOutput', type: ActivityOutputType, results?: unknown | null } | { __typename: 'DynamicFormActivityOutput', type: ActivityOutputType, response?: unknown | null } | { __typename: 'ExtensionActivityOutput', type: ActivityOutputType, results?: unknown | null } | { __typename: 'FormActivityOutput', type: ActivityOutputType, response?: unknown | null } | null } };

export type PathwayActivitiesQueryVariables = Exact<{
  pathway_id: Scalars['String']['input'];
}>;


export type PathwayActivitiesQuery = { __typename?: 'Query', pathwayActivities: { __typename?: 'ActivitiesPayload', success: boolean, totalCount?: number | null, activities: Array<{ __typename?: 'Activity', id: string, action: ActivityAction, careflow_id: string, container_name?: string | null, date: string, pathway_definition_id: string, reference_id: string, reference_type: ActivityReferenceType, resolution?: ActivityResolution | null, session_id?: string | null, status: ActivityStatus, tenant_id: string, indirect_object?: { __typename?: 'ActivityObject', id: string, type: ActivityObjectType, name: string, email?: string | null, preferred_language?: string | null } | null, object: { __typename?: 'ActivityObject', id: string, type: ActivityObjectType, name: string, email?: string | null, preferred_language?: string | null }, sub_activities: Array<{ __typename?: 'SubActivity', id: string, action: ActivityAction, object?: { __typename?: 'ActivityObject', id: string, type: ActivityObjectType, name: string, email?: string | null, preferred_language?: string | null } | null }>, inputs?: { __typename: 'CalculationActivityInput', type: ActivityInputType, calculationFields?: Array<{ __typename?: 'CalculationField', id: string, key: string, label: string, value: unknown, value_type?: string | null }> | null } | { __typename: 'DynamicFormActivityInput', type: ActivityInputType, dynamicForm?: { __typename?: 'DynamicForm', key: string, title: string, trademark?: string | null, questions: Array<{ __typename?: 'DynamicQuestion', id: string, key: string, title: string, questionType: QuestionType, required?: boolean | null, options?: Array<{ __typename?: 'QuestionOption', id: string, label: string, value: string }> | null }> } | null } | { __typename: 'ExtensionActivityInput', type: ActivityInputType, extensionFields?: unknown | null } | { __typename: 'FormActivityInput', type: ActivityInputType, form?: { __typename?: 'ActivityForm', id: string, key: string, title: string, trademark?: string | null, questions: Array<{ __typename?: 'Question', id: string, key: string, title: string, definition_id?: string | null, placeholder?: string | null, questionType: QuestionType, required?: boolean | null, options?: Array<{ __typename?: 'QuestionOption', id: string, label: string, value: string }> | null }> } | null } | { __typename: 'MessageActivityInput', type: ActivityInputType, message?: { __typename?: 'ActivityMessage', id: string, subject: string, body: string, format?: MessageFormat | null, attachments?: Array<{ __typename?: 'MessageAttachment', id: string, name: string, type: string, url: string }> | null } | null } | null, outputs?: { __typename: 'CalculationActivityOutput', type: ActivityOutputType, results?: unknown | null } | { __typename: 'DynamicFormActivityOutput', type: ActivityOutputType, response?: unknown | null } | { __typename: 'ExtensionActivityOutput', type: ActivityOutputType, results?: unknown | null } | { __typename: 'FormActivityOutput', type: ActivityOutputType, response?: unknown | null } | null }> } };

export type QuestionFragment = { __typename?: 'Question', id: string, key: string, title: string, definition_id?: string | null, placeholder?: string | null, questionType: QuestionType, required?: boolean | null, options?: Array<{ __typename?: 'QuestionOption', id: string, label: string, value: string }> | null };

export const QuestionFragmentDoc = gql`
    fragment Question on Question {
  id
  key
  title
  definition_id
  placeholder
  questionType
  required
  options {
    id
    label
    value
  }
}
    `;
export const DynamicQuestionFragmentDoc = gql`
    fragment DynamicQuestion on DynamicQuestion {
  id
  key
  title
  questionType
  required
  options {
    id
    label
    value
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
      dynamicForm {
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
        value_type
      }
    }
    ... on ExtensionActivityInput {
      type
      extensionFields: fields
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