// Authentication types
export interface AuthConfig {
  publishableKey: string;
  apiUrl?: string;
}

export interface AuthToken {
  token: string;
  expiresAt: number;
}

// Activity types
export interface Activity {
  id: string;
  type: string;
  status: 'active' | 'completed' | 'expired';
  data?: Record<string, any>;
}

// Flow types
export interface Flow {
  id: string;
  title: string;
  description?: string;
  status: 'active' | 'completed' | 'paused';
}

// Event types
export interface NaviEvent {
  type: string;
  data: Record<string, any>;
  timestamp: number;
}

// Configuration types
export interface NaviClientConfig {
  publishableKey: string;
  apiUrl?: string;
  debug?: boolean;
  timeout?: number;
}

// Error types
export class NaviError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'NaviError';
  }
}

export class NaviAuthError extends NaviError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 'AUTH_ERROR', details);
    this.name = 'NaviAuthError';
  }
}

export class NaviNetworkError extends NaviError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 'NETWORK_ERROR', details);
    this.name = 'NaviNetworkError';
  }
} 

export interface NaviConfig {
  publishableKey: string;
  baseUrl?: string;
}

export interface JWTPayload {
  sub: string; // careflow_id
  stakeholder_id: string; // patient_id
  tenant_id: string;
  org_id: string;
  environment: string;
  iss: string; // issuer
  exp: number; // expiration timestamp
  iat: number; // issued at timestamp
}

export interface AuthResult {
  jwt: string;
  payload: JWTPayload;
}

export interface BrandingConfig {
  primary?: string;
  secondary?: string;
  fontFamily?: string;
  logoUrl?: string;
}

/**
 * Activity-level events - External API (Stripe Elements pattern)
 * These are the events that consumers (navi-portal, navi.js, navi-react) will handle
 */
export interface ActivityEvent<T = any> {
  type:
    | "activity-ready"       // Activity is mounted and ready for interaction
    | "activity-progress"    // Progress has changed (forms/checklists)
    | "activity-complete"    // Activity has been completed/submitted
    | "activity-error"       // An error occurred at the activity level
    | "activity-focus"       // Activity gained focus
    | "activity-blur";       // Activity lost focus
  activityId: string;
  activityType: "FORM" | "MESSAGE" | "CHECKLIST";
  data?: T;
  timestamp: number;
}

/**
 * Activity event handlers - Similar to Stripe Elements API
 */
export interface ActivityEventHandlers {
  onActivityReady?: (event: ActivityEvent) => void;
  onActivityProgress?: (
    event: ActivityEvent<{ progress: number; total: number }>
  ) => void;
  onActivityComplete?: (event: ActivityEvent<{ submissionData: any }>) => void;
  onActivityError?: (
    event: ActivityEvent<{ error: string; field?: string }>
  ) => void;
  onActivityFocus?: (event: ActivityEvent) => void;
  onActivityBlur?: (event: ActivityEvent) => void;
}

/**
 * Base activity component props - All activity types extend this
 */
export interface BaseActivityProps {
  activity: {
    id: string;
    status: string;
    date: string;
    // Minimum required activity fields
  };
  disabled?: boolean;
  className?: string;
  eventHandlers?: ActivityEventHandlers;
}

/**
 * Internal field events (used within navi-activities only)
 * These aggregate up to activity events
 */
export interface FormFieldEvent<T = any> {
  type:
    | "field-ready"       // Field is ready for interaction
    | "field-focus"       // Field gained focus
    | "field-blur"        // Field lost focus  
    | "field-change"      // Field value changed
    | "field-validation"; // Field validation state changed
  fieldId: string;
  questionKey: string;
  data?: T;
  timestamp: number;
}

/**
 * Internal field event handlers
 */
export interface FormFieldEventHandlers {
  onFieldEvent?: (event: FormFieldEvent) => void;
}

/**
 * Question field configuration
 */
export interface QuestionField {
  id: string;
  key: string;
  title: string;
  questionType: string;
  userQuestionType: string;
  required?: boolean;
  placeholder?: string;
  options?: Array<{
    id: string;
    label: string;
    value: string;
  }>;
  // Additional question config will be added as we implement question types
}

/**
 * Form activity specific props
 */
export interface FormActivityData {
  id: string;
  title: string;
  questions: QuestionField[];
}

export interface MessageActivityData {
  id: string;
  subject: string;
  body: string;
  format?: "HTML" | "MARKDOWN" | "SLATE";
  attachments?: Array<{
    id: string;
    name: string;
    type: string;
    url: string;
  }>;
}

export interface ChecklistActivityData {
  title: string;
  items: string[];
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export interface FormValidationState {
  [fieldId: string]: ValidationResult;
} 