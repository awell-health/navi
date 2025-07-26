import type {
  ChecklistActivityData,
  MessageActivityData,
  FormActivityData,
} from "@awell-health/navi-core";

/**
 * Helper to create checklist activity data for Storybook stories
 */
export function createChecklistActivity(
  overrides: Partial<ChecklistActivityData> = {}
): ChecklistActivityData {
  return {
    id: "checklist-story",
    action: "ASSIGNED",
    careflow_id: "story-careflow",
    container_name: "Story Checklist",
    date: new Date().toISOString(),
    indirect_object: null,
    object: {
      id: "checklist-object",
      type: "CHECKLIST",
      name: "Story Checklist",
      email: null,
      preferred_language: null,
    },
    pathway_definition_id: "story-pathway",
    reference_id: "story-ref",
    reference_type: "NAVIGATION",
    resolution: null,
    session_id: null,
    status: "ACTIVE",
    tenant_id: "story-tenant",
    is_user_activity: true,
    sub_activities: [],
    inputs: {
      __typename: "ChecklistActivityInput",
      type: "CHECKLIST",
      checklist: {
        title: "Story Checklist",
        items: ["Item 1", "Item 2", "Item 3"],
      },
    },
    outputs: null,
    ...overrides,
  } as ChecklistActivityData;
}

/**
 * Helper to create message activity data for Storybook stories
 */
export function createMessageActivity(
  overrides: Partial<MessageActivityData> = {}
): MessageActivityData {
  return {
    id: "message-story",
    action: "ASSIGNED",
    careflow_id: "story-careflow",
    container_name: "Story Message",
    date: new Date().toISOString(),
    indirect_object: null,
    object: {
      id: "message-object",
      type: "MESSAGE",
      name: "Story Message",
      email: null,
      preferred_language: null,
    },
    pathway_definition_id: "story-pathway",
    reference_id: "story-ref",
    reference_type: "NAVIGATION",
    resolution: null,
    session_id: null,
    status: "ACTIVE",
    tenant_id: "story-tenant",
    is_user_activity: true,
    sub_activities: [],
    inputs: {
      __typename: "MessageActivityInput",
      type: "MESSAGE",
      message: {
        id: "message-1",
        subject: "Story Message",
        body: "This is a story message body.",
        format: "HTML",
        attachments: null,
      },
    },
    outputs: null,
    ...overrides,
  } as MessageActivityData;
}

/**
 * Helper to create form activity data for Storybook stories
 */
export function createFormActivity(
  overrides: Partial<FormActivityData> = {}
): FormActivityData {
  return {
    id: "form-story",
    action: "ASSIGNED",
    careflow_id: "story-careflow",
    container_name: "Story Form",
    date: new Date().toISOString(),
    indirect_object: null,
    object: {
      id: "form-object",
      type: "FORM",
      name: "Story Form",
      email: null,
      preferred_language: null,
    },
    pathway_definition_id: "story-pathway",
    reference_id: "story-ref",
    reference_type: "NAVIGATION",
    resolution: null,
    session_id: null,
    status: "ACTIVE",
    tenant_id: "story-tenant",
    is_user_activity: true,
    sub_activities: [],
    inputs: {
      __typename: "FormActivityInput",
      type: "FORM",
      form: {
        id: "form-1",
        key: "storyForm",
        title: "Story Form",
        trademark: null,
        questions: [],
      },
    },
    outputs: null,
    ...overrides,
  } as FormActivityData;
}
