# Navi Activities Form Components Implementation Plan

## 🏗️ **Architectural Overview**

### Multi-Package Architecture

```
packages/navi-core/              # 🎯 SHARED FOUNDATION
├── src/
│   ├── types/
│   │   ├── activity.ts          # Activity, Question interfaces
│   │   ├── events.ts           # Unified Activity event system
│   │   └── index.ts
│   └── index.ts

packages/navi-activities/        # 🎨 ACTIVITY COMPONENTS
├── src/
│   ├── activity-types/
│   │   ├── form/
│   │   │   ├── question-types/  # Internal field components
│   │   │   ├── form-activity.tsx    # Activity-level component
│   │   │   └── index.ts
│   │   ├── message/
│   │   │   ├── message-activity.tsx # Activity-level component
│   │   │   └── index.ts
│   │   ├── checklist/
│   │   │   ├── checklist-activity.tsx # Activity-level component
│   │   │   └── index.ts
│   │   └── index.ts
│   ├── components/             # Shared UI components
│   ├── hooks/                  # Activity-specific hooks
│   └── index.ts
```

### Event Flow Architecture

```
Question Field → [Internal Events] → Form Activity → [Unified Events] → Consumer
     ↓                                      ↓                             ↓
Individual field        Activity aggregates/transforms        navi-portal
interactions           field events into activity events      navi.js etc.
```

## 📁 Detailed Package Structure

### navi-core (Shared Foundation)

```
packages/navi-core/
├── src/
│   ├── types/
│   │   ├── activity.ts          # Activity, Question, ActivityForm interfaces
│   │   ├── events.ts           # ActivityEvent, ActivityEventHandlers
│   │   ├── validation.ts       # Validation interfaces
│   │   └── index.ts
│   ├── utils/
│   │   ├── validation.ts       # Shared validation logic
│   │   └── index.ts
│   └── index.ts
```

### navi-activities (Components)

```
packages/navi-activities/
├── src/
│   ├── activity-types/
│   │   ├── form/
│   │   │   ├── question-types/
│   │   │   │   ├── multiple-choice.tsx
│   │   │   │   ├── multiple-select.tsx
│   │   │   │   ├── short-text.tsx
│   │   │   │   ├── long-text.tsx
│   │   │   │   ├── number.tsx
│   │   │   │   ├── yes-no.tsx
│   │   │   │   ├── date.tsx
│   │   │   │   ├── slider.tsx
│   │   │   │   ├── description.tsx
│   │   │   │   ├── email.tsx
│   │   │   │   ├── telephone.tsx
│   │   │   │   ├── file.tsx
│   │   │   │   ├── image.tsx
│   │   │   │   ├── signature.tsx
│   │   │   │   ├── icd10-classification.tsx
│   │   │   │   └── multiple-choice-grid.tsx
│   │   │   ├── form-activity.tsx    # 🎯 Activity-level component
│   │   │   ├── form-field.tsx      # Field wrapper
│   │   │   └── index.ts
│   │   ├── message/
│   │   │   ├── message-activity.tsx # 🎯 Activity-level component
│   │   │   └── index.ts
│   │   ├── checklist/
│   │   │   ├── checklist-activity.tsx # 🎯 Activity-level component
│   │   │   └── index.ts
│   │   └── index.ts
│   ├── components/
│   │   ├── slate-viewer.tsx       # Moved from portal
│   │   ├── form-label.tsx        # Reusable label component
│   │   ├── form-error.tsx        # Error display component
│   │   └── index.ts
│   ├── hooks/
│   │   ├── use-activity-events.tsx # Activity event management
│   │   ├── use-form-field.tsx     # Internal field logic
│   │   └── index.ts
│   └── index.ts
├── stories/                       # Storybook stories
│   ├── activity-types/
│   │   ├── form-activity.stories.tsx      # Activity-level stories
│   │   ├── message-activity.stories.tsx
│   │   ├── checklist-activity.stories.tsx
│   │   └── question-types/               # Internal component stories
│   │       ├── multiple-choice.stories.tsx
│   │       └── [... all question types]
│   ├── events.stories.tsx         # Activity event demonstration
│   └── theming.stories.tsx        # Theming demonstration
└── package.json
```

## 🎨 Branding Integration

### Current System Analysis ✅ COMPLETE

Based on `apps/navi-portal/src/app/layout.tsx` and `/lib/branding/types.ts`:

- ✅ **CSS Injection System**: Already handles dynamic theming via `getBrandingAction()` and `themeCSS`
- ✅ **Theme Provider**: Lives in layout, not component-level
- ✅ **Comprehensive Coverage**: Existing `OrgBranding` interface covers ALL needed properties:
  - Core palette (primary, secondary, background, error, success)
  - Typography (font families, weights, sizes, line heights)
  - Input-specific tokens (inputBackground, inputBorder, inputRadius)
  - Control tokens (controlBorder, controlCheckedBg, controlRadius)
  - Spacing system (space1-4) and shadows
  - **shadcn/ui compatibility** via `ThemeTokens` interface

### Integration Strategy

```typescript
// Components will use existing CSS custom properties:
// --primary, --input, --border, --radius, --space-2, etc.
// No additional theming types needed - existing system is complete!
```

**Ready to Use:**

- ✅ **No Extensions Needed**: Current `OrgBranding` interface is comprehensive
- ✅ **shadcn Compatible**: Existing `ThemeTokens` maps to shadcn CSS variables
- ✅ **Form Ready**: Input, control, and spacing tokens already defined

## 🔌 Unified Activity Event System

### Core Architecture (navi-core/src/types/events.ts)

```typescript
// 🎯 ACTIVITY-LEVEL EVENTS (External API)
export interface ActivityEvent<T = any> {
  type:
    | "activity-ready"
    | "activity-progress"
    | "activity-complete"
    | "activity-error"
    | "activity-focus"
    | "activity-blur";
  activityId: string;
  activityType: "FORM" | "MESSAGE" | "CHECKLIST";
  data?: T;
  timestamp: number;
}

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

// 🔧 INTERNAL FIELD EVENTS (navi-activities only)
interface FormFieldEvent<T = any> {
  type:
    | "field-ready"
    | "field-focus"
    | "field-blur"
    | "field-change"
    | "field-validation";
  fieldId: string;
  questionKey: string;
  data?: T;
  timestamp: number;
}
```

### Implementation Layers

#### Layer 1: Question Components (Internal)

```typescript
// question-types/short-text.tsx
export function ShortTextQuestion({ onFieldEvent, ... }) {
  const handleChange = (value: string) => {
    // Internal field event
    onFieldEvent?.({
      type: 'field-change',
      fieldId: question.id,
      questionKey: question.key,
      data: { value, isValid: validateText(value) },
      timestamp: Date.now()
    });
  };
}
```

#### Layer 2: Form Activity (Aggregation)

```typescript
// activity-types/form/form-activity.tsx
export function FormActivity({ eventHandlers, ... }) {
  const handleFieldEvent = (fieldEvent: FormFieldEvent) => {
    // Aggregate field events into activity events
    if (fieldEvent.type === 'field-change') {
      const progress = calculateFormProgress();
      eventHandlers?.onActivityProgress?.({
        type: 'activity-progress',
        activityId: activity.id,
        activityType: 'FORM',
        data: { progress: progress.completed, total: progress.total },
        timestamp: Date.now()
      });
    }
  };
}
```

#### Layer 3: Consumer (navi-portal, navi.js)

```typescript
// Same API for ALL activity types
<FormActivity
  eventHandlers={{
    onActivityReady: (e) => console.log('Form ready'),
    onActivityProgress: (e) => console.log(`Progress: ${e.data.progress}/${e.data.total}`),
    onActivityComplete: (e) => submitForm(e.data.submissionData)
  }}
/>

<MessageActivity
  eventHandlers={{
    onActivityReady: (e) => console.log('Message ready'),
    onActivityComplete: (e) => markAsRead(e.activityId)
  }}
/>

<ChecklistActivity
  eventHandlers={{
    onActivityReady: (e) => console.log('Checklist ready'),
    onActivityProgress: (e) => console.log(`${e.data.progress} items checked`),
    onActivityComplete: (e) => submitChecklist(e.data.submissionData)
  }}
/>
```

## 📝 Activity Component Specifications

### Base Activity Interface (navi-core/src/types/activity.ts)

```typescript
// Unified interface for ALL activity types
interface BaseActivityProps {
  activity: Activity; // From GraphQL schema
  disabled?: boolean;
  className?: string;

  // 🎯 Unified event handlers for all activity types
  eventHandlers?: ActivityEventHandlers;
}

// Specific activity props extend the base
interface FormActivityProps extends BaseActivityProps {
  activity: Activity & { inputs: FormActivityInput };
}

interface MessageActivityProps extends BaseActivityProps {
  activity: Activity & { inputs: MessageActivityInput };
}

interface ChecklistActivityProps extends BaseActivityProps {
  activity: Activity & { inputs: ChecklistActivityInput };
}
```

### Activity-Level Components (External API)

#### 1. **FormActivity** (form-activity.tsx)

- **Purpose**: Manages form lifecycle, aggregates field events → activity events
- **Props**: `FormActivityProps` with `ActivityEventHandlers`
- **Events**: `onActivityReady`, `onActivityProgress`, `onActivityComplete`
- **Responsibilities**:
  - Render question components internally
  - Track form progress (X of Y questions answered)
  - Aggregate field validations
  - Emit unified activity events

#### 2. **MessageActivity** (message-activity.tsx)

- **Purpose**: Displays message content, tracks read status
- **Props**: `MessageActivityProps` with `ActivityEventHandlers`
- **Events**: `onActivityReady`, `onActivityComplete` (when marked as read)
- **Responsibilities**:
  - Render message body (HTML/Markdown/Plain text)
  - Handle attachments
  - Track interaction time

#### 3. **ChecklistActivity** (checklist-activity.tsx)

- **Purpose**: Manages checklist completion, tracks progress
- **Props**: `ChecklistActivityProps` with `ActivityEventHandlers`
- **Events**: `onActivityReady`, `onActivityProgress`, `onActivityComplete`
- **Responsibilities**:
  - Render checklist items
  - Track completion progress (X of Y items checked)
  - Handle checklist submission

### Internal Question Components (Implementation Details)

#### 1. **MULTIPLE_CHOICE** (multiple-choice.tsx)

- **Base**: shadcn RadioGroup
- **Data**: Uses `question.options` array
- **Events**: `onChange` when selection changes
- **Accessibility**: Full keyboard navigation, aria-labelledby

#### 2. **MULTIPLE_SELECT** (multiple-select.tsx)

- **Base**: shadcn Checkbox group
- **Data**: Uses `question.options` array
- **Events**: `onChange` with array of selected values
- **Accessibility**: Fieldset with legend, proper checkboxes

#### 3. **SHORT_TEXT** (short-text.tsx)

- **Base**: shadcn Input
- **Data**: Uses `question.placeholder`
- **Events**: `onChange`, `onFocus`, `onBlur`
- **Validation**: Built-in text validation

#### 4. **LONG_TEXT** (long-text.tsx)

- **Base**: shadcn Textarea
- **Data**: Uses `question.placeholder`
- **Events**: `onChange`, `onFocus`, `onBlur`
- **Features**: Auto-resize, character count

#### 5. **NUMBER** (number.tsx)

- **Base**: shadcn Input type="number"
- **Events**: `onChange` with number validation
- **Validation**: Min/max from question config (requires discovery)

#### 6. **YES_NO** (yes-no.tsx)

- **Base**: shadcn Switch or RadioGroup
- **Events**: `onChange` with boolean value
- **Accessibility**: Clear yes/no labeling

#### 7. **DATE** (date.tsx)

- **Base**: shadcn Calendar/DatePicker
- **Events**: `onChange` with Date object
- **Validation**: Date range validation (requires discovery)

#### 8. **SLIDER** (slider.tsx)

- **Base**: shadcn Slider
- **Events**: `onChange` with numeric value
- **Features**: Min/max/step from question config
- **Accessibility**: Proper ARIA attributes

#### 9. **DESCRIPTION** (description.tsx)

- **Base**: Custom component using SlateViewer
- **Data**: Renders `question.title` as rich content
- **Events**: `onReady` only (no user interaction)
- **Features**: Support Slate JSON format from examples

#### 10. **EMAIL** (email.tsx)

- **Base**: shadcn Input type="email"
- **Events**: `onChange`, `onBlur` with validation
- **Validation**: Email format validation

#### 11. **TELEPHONE** (telephone.tsx)

- **Base**: shadcn Input with phone formatting
- **Events**: `onChange` with formatted phone
- **Validation**: Phone format validation (US/European from examples)

#### 12. **FILE** (file.tsx)

- **Base**: shadcn custom file upload
- **Events**: `onChange` with file metadata
- **Features**: File type restrictions (CSV from examples)
- **Discovery Needed**: Upload service integration

#### 13. **IMAGE** (image.tsx)

- **Base**: shadcn custom image upload
- **Events**: `onChange` with image metadata
- **Features**: Image preview, resize capabilities
- **Discovery Needed**: Image processing pipeline

#### 14. **SIGNATURE** (signature.tsx)

- **Base**: Custom canvas component
- **Events**: `onChange` with signature data
- **Features**: Touch/mouse drawing, clear functionality
- **Discovery Needed**: Signature data format

#### 15. **ICD10_CLASSIFICATION** (icd10-classification.tsx)

- **Base**: shadcn Combobox with search
- **Events**: `onChange` with ICD10 code
- **Discovery Needed**: ICD10 data source/API integration

#### 16. **MULTIPLE_CHOICE_GRID** (multiple-choice-grid.tsx)

- **Base**: Custom grid layout with shadcn RadioGroups
- **Events**: `onChange` with grid responses
- **Discovery Needed**: Grid structure definition

## ♿ Accessibility Implementation

### Requirements (from `06-accessibility.md`)

1. **Focus Management**: Move focus to new activity h1, aria-live announcements
2. **Keyboard Navigation**: Full keyboard support for all components
3. **ARIA Labels**: Proper labeling and descriptions
4. **Contrast**: 4.5:1 minimum contrast ratios
5. **Screen Reader**: Proper announcements and structure

### Implementation Strategy

```typescript
// Each component will:
1. Use shadcn primitives (built on Radix UI) for base accessibility
2. Add proper ARIA attributes
3. Handle focus management internally
4. Announce validation errors via aria-live
5. Support high contrast mode
```

### Testing

- `@axe-core/react` automated tests in Storybook
- Manual testing with screen readers
- Keyboard-only navigation testing

## 📚 Storybook Stories

### Story Structure

```
stories/
├── question-types/
│   ├── multiple-choice.stories.tsx    # All variants, states, themes
│   ├── short-text.stories.tsx         # Validation states, events
│   └── [... each question type]
├── theming.stories.tsx                # Theme demonstration
├── events.stories.tsx                 # Event system demonstration
└── accessibility.stories.tsx          # A11y testing scenarios
```

### Story Features

- **All States**: Default, focused, error, disabled, loading
- **Theme Variants**: Default theme + 2-3 custom themes
- **Event Logging**: Show event emission in Storybook actions
- **Validation Scenarios**: Valid, invalid, required field states
- **Accessibility Testing**: Built-in axe testing

## 🔧 Implementation Phases

### Phase 1: Foundation & Architecture

**navi-core Setup:**

- [ ] Create shared types in `navi-core/src/types/`
  - [ ] `activity.ts` - Activity, Question, Form interfaces
  - [ ] `events.ts` - ActivityEvent, ActivityEventHandlers
  - [ ] `validation.ts` - Shared validation interfaces
- [ ] Set up navi-core build & export system
- [ ] Update package dependencies (navi-activities imports navi-core)

**navi-activities Structure:**

- [ ] Set up package structure
- [ ] Move SlateViewer to shared components
- [ ] Create base activity hook (`use-activity-events.tsx`)
- [ ] Set up Storybook with activity-level focus

### Phase 2: Activity-Level Components (External API)

**Priority: Unified event system working end-to-end**

- [ ] **MessageActivity** (simplest - no form complexity)
  - [ ] Basic message display with SlateViewer
  - [ ] Activity events: ready, complete (mark as read)
  - [ ] Storybook stories demonstrating events
- [ ] **ChecklistActivity** (medium complexity)
  - [ ] Checklist rendering with progress tracking
  - [ ] Activity events: ready, progress, complete
  - [ ] Progress calculation (X of Y items checked)
- [ ] **FormActivity** (most complex - field aggregation)
  - [ ] Basic form shell with simple text inputs
  - [ ] Field event → activity event aggregation
  - [ ] Form progress tracking (X of Y questions answered)

### Phase 3: Form Question Components (Internal)

**Core Input Types:**

- [ ] SHORT_TEXT, LONG_TEXT, NUMBER (simple inputs)
- [ ] MULTIPLE_CHOICE, MULTIPLE_SELECT (option-based)
- [ ] YES_NO, DATE (specialized inputs)
- [ ] DESCRIPTION (display-only with SlateViewer)

**Integration:**

- [ ] FormActivity uses question components
- [ ] Field events properly aggregate to activity events
- [ ] Form validation and progress tracking working

### Phase 4: Advanced Question Types

**Validated Inputs:**

- [ ] EMAIL, TELEPHONE (format validation)
- [ ] SLIDER (range input with constraints)

**Upload Components:**

- [ ] FILE, IMAGE (upload with preview)
- [ ] Integration with upload service (discovery needed)

### Phase 5: Complex Components & Polish

**Complex Question Types:**

- [ ] SIGNATURE (canvas-based drawing)
- [ ] ICD10_CLASSIFICATION (search/API integration)
- [ ] MULTIPLE_CHOICE_GRID (complex layout)

**Final Polish:**

- [ ] Complete all Storybook stories (activity + question level)
- [ ] Activity event logging/debugging stories
- [ ] Accessibility audit and fixes
- [ ] Performance optimization
- [ ] Documentation completion

## 🚨 Discovery Required

### High Priority

1. **File Upload Service**: Where do files get uploaded? AWS S3? Local server?
2. **ICD10 Data Source**: API endpoint or static data for classifications?
3. **Signature Format**: What format should signature data be stored in?

### Medium Priority

1. **Phone Validation**: Specific regex patterns for US/European formats?
2. **Date Constraints**: Min/max date validation rules from question config?
3. **Number Validation**: Min/max/step values from question configuration?
4. **Grid Structure**: How is MULTIPLE_CHOICE_GRID laid out?

### Questions for Stakeholders

1. Should validation be real-time or on blur/submit?
2. Are there specific error message formats required?
3. Should components support internationalization?
4. Are there performance requirements for large forms?

## 📦 Dependencies

### New Dependencies Needed

```json
{
  "react-signature-canvas": "^1.0.6", // For signature component
  "react-phone-number-input": "^3.3.0", // For telephone formatting
  "date-fns": "^2.30.0", // For date utilities
  "@radix-ui/react-slider": "^1.1.0" // If not in shadcn
}
```

### Storybook Addons

```json
{
  "@storybook/addon-a11y": "^7.6.0", // Accessibility testing
  "@storybook/addon-events": "^7.6.0" // Event demonstration
}
```

## 🎯 Success Criteria

### 🎯 **Primary Objectives**

1. ✅ **Unified Activity Event System**: All activity types (Form, Message, Checklist) use identical external API
2. ✅ **Multi-Package Architecture**: Shared types in navi-core, components in navi-activities
3. ✅ **Activity-Level Components**: FormActivity, MessageActivity, ChecklistActivity as main exports
4. ✅ **Event Aggregation**: Form activity properly aggregates field events → activity events
5. ✅ **Existing Integration**: Components work with current Activity/Question GraphQL schema

### 🎨 **Implementation Quality**

6. ✅ **All 16 question types** implemented with shadcn components (internal to FormActivity)
7. ✅ **Full accessibility compliance** (WCAG 2.1 AA) using Radix UI primitives
8. ✅ **Existing branding integration** using current CSS custom properties system
9. ✅ **Zero accessibility violations** in automated testing

### 📚 **Documentation & Testing**

10. ✅ **Activity-focused Storybook**: Stories demonstrate activity events, not just individual components
11. ✅ **Event System Demo**: Clear examples of event flow from field → activity → consumer
12. ✅ **Unified API Demo**: Same event handlers work across all activity types
13. ✅ **Theme Variants**: Activity components work with different branding themes

### 🔌 **Consumer Integration**

14. ✅ **Drop-in Replacement**: Can replace existing activity components in navi-portal
15. ✅ **Cross-Package Usage**: navi.js and navi-react can import and use activity components
16. ✅ **Event Compatibility**: Events match Stripe Elements pattern for familiarity

---

**Next Steps**: Review this corrected plan, provide guidance on discovery items, then proceed with Phase 1 (navi-core foundation).
