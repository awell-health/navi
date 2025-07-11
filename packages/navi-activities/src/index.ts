// Activity-level components (main external API)
export { MessageActivity } from './activity-types/message/message-activity';
export { ChecklistActivity } from './activity-types/checklist/checklist-activity';
export { FormActivity } from './activity-types/form/form-activity';

// Activity event system hooks
export { useActivityEvents } from './hooks/use-activity-events';

// Shared components
export { SlateViewer } from './components/slate-viewer';

// UI Components (shadcn/ui)
export { 
  Input, 
  Checkbox, 
  RadioGroup, 
  RadioGroupItem, 
  Textarea, 
  Label, 
  Button 
} from './components/ui';

// Utility functions
export { cn } from './lib/utils';

// Re-export types from navi-core for convenience
export type {
  ActivityEvent,
  ActivityEventHandlers,
  BaseActivityProps,
  FormFieldEvent,
  FormFieldEventHandlers,
  QuestionField,
  FormActivityData,
  MessageActivityData,
  ChecklistActivityData,
  ValidationResult,
  FormValidationState,
} from '@awell-health/navi-core';