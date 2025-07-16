import {
  ActivityInputType,
  ActivityResolution,
  ActivityStatus,
  ChecklistActivityInput,
  CompletionContextGraphQl,
  DynamicFormActivityInput,
  ExtensionActivityInput,
  FormActivityInput,
  MessageActivityInput,
} from "./generated/graphql";
import {
  ActivityInput,
  ActivityType as GraphQLActivity,
  ActivityObject,
  SubActivity,
} from "./types/activity";
import { ActivityEventHandlers } from "./types/activity-event";

export interface ActivityStrategy {
  get id(): string;
  get inputs(): ActivityInput;
  get status(): ActivityStatus;
  get completion_context(): CompletionContextGraphQl | null;
  get stakeholder(): ActivityObject | null;
  get sub_activities(): SubActivity[];
  get date(): string;
  get resolution(): ActivityResolution | null;
  get indirect_object(): ActivityObject | null;
  get type(): ActivityInputType;
}

// TODO: Make this abstract and implement the methods
export class Activity implements ActivityStrategy {
  constructor(protected readonly activity: GraphQLActivity) {}

  get id(): string {
    return this.activity.id;
  }

  get type(): ActivityInputType {
    if (this.activity.inputs?.type) {
      return this.activity.inputs?.type as ActivityInputType;
    }
    if (this.activity.object.type === "PLUGIN_ACTION") {
      return "EXTENSION";
    }
    console.log("🔍 Activity type:", this.activity.object.type);
    throw new Error("Activity type not found");
  }

  get status(): ActivityStatus {
    return this.activity.status;
  }

  get inputs(): ActivityInput {
    return this.activity.inputs as ActivityInput;
  }

  get completion_context(): CompletionContextGraphQl | null {
    return this.activity.completion_context || null;
  }

  get stakeholder(): ActivityObject | null {
    return this.activity.stakeholders && this.activity.stakeholders.length > 0
      ? this.activity.stakeholders[0]
      : null;
  }

  get sub_activities(): SubActivity[] {
    return this.activity.sub_activities;
  }

  get date(): string {
    return this.activity.date;
  }

  get resolution(): ActivityResolution | null {
    return this.activity.resolution || null;
  }

  get indirect_object(): ActivityObject | null {
    return this.activity.indirect_object || null;
  }
}

export class ChecklistActivity extends Activity {
  get inputs(): ChecklistActivityInput {
    return this.activity.inputs as ChecklistActivityInput;
  }

  get type(): ActivityInputType {
    return "CHECKLIST";
  }
}

export class FormActivity extends Activity {
  get inputs(): FormActivityInput {
    return this.activity.inputs as FormActivityInput;
  }

  get type(): ActivityInputType {
    return "FORM";
  }
}

export class MessageActivity extends Activity {
  get inputs(): MessageActivityInput {
    return this.activity.inputs as MessageActivityInput;
  }

  get type(): ActivityInputType {
    return "MESSAGE";
  }
}

export class ExtensionActivity extends Activity {
  get inputs(): { type: "EXTENSION"; fields: Record<string, any> } {
    return {
      type: "EXTENSION",
      fields: (this.activity.inputs as ExtensionActivityInput).fields as Record<
        string,
        any
      >,
    };
  }

  get type(): ActivityInputType {
    return "EXTENSION";
  }
}

export class DynamicFormActivity extends Activity {
  get inputs(): DynamicFormActivityInput {
    return this.activity.inputs as DynamicFormActivityInput;
  }

  get type(): ActivityInputType {
    return "DYNAMIC_FORM";
  }
}

export class ActivityFactory {
  static create(activity: GraphQLActivity) {
    switch (activity.inputs?.type) {
      case "CHECKLIST":
        return new ChecklistActivity(activity);
      case "FORM":
        return new FormActivity(activity);
      case "DYNAMIC_FORM":
        return new DynamicFormActivity(activity);
      case "MESSAGE":
        return new MessageActivity(activity);
      case "EXTENSION":
        return new ExtensionActivity(activity);
      default:
        return new Activity(activity);
    }
  }
}

/**
 * Base Activity Component Props
 * All activity types extend this
 */
export interface BaseActivityProps {
  activity: Activity;
  disabled?: boolean;
  className?: string;
  eventHandlers?: ActivityEventHandlers;
}
