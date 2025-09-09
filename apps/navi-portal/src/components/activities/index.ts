import { Checklist } from "./checklist/checklist-activity";
import { Form } from "./form/form-activity";
import { ConversationalForm } from "./form/conversational-form-activity";
import { Message } from "./message/message-activity";
import { Extension } from "./extension/extension-activity";

// Export unified form components for advanced usage
export { UnifiedFormRenderer } from "./form/unified-form";
export type {
  FormRenderConfig,
  FormData,
  UnifiedFormRendererProps,
} from "./form/unified-form";

export const Activities = {
  Checklist,
  Form,
  ConversationalForm,
  Message,
  Extension,
};

// Export individual components for direct usage
export { Form as TraditionalForm } from "./form/form-activity";
export { ConversationalForm } from "./form/conversational-form-activity";
export type { FormActivityProps } from "./form/form-activity";
export type { ConversationalFormProps } from "./form/conversational-form-activity";
