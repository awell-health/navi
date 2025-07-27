# PRD: Question Visibility Rules

## Problem Statement

Forms currently display all questions regardless of user responses, leading to:

- **Poor UX**: Users see irrelevant questions
- **Data pollution**: Hidden logic still submits data
- **Inflexible workflows**: No conditional question flows

## Goals

**Primary**: Implement conditional question visibility based on form state and rules  
**Secondary**: Ensure clean data submission (hidden = no submit)  
**Tertiary**: Maintain performance and accessibility standards

## Requirements

### Functional Requirements

**FR1: Rule Evaluation**

- Parse and evaluate `question.rule` field from GraphQL schema
- Support rule types: `field_value`, `calculation`, `boolean_logic`
- Real-time evaluation on form data changes

**FR2: Question Visibility Control**

- Hide/show questions based on rule evaluation results
- Smooth transitions (fade in/out, slide)
- Maintain form layout stability

**FR3: Data Management**

- Hidden questions MUST NOT submit their values
- Hidden questions MUST NOT be validated
- Clear hidden question data when becoming invisible
- Preserve data when question becomes visible again (within session)

**FR4: Form Flow Integration**

- Integrate with existing `unified-form-renderer.tsx`
- Work with pagination (`use-form-navigation.ts`)
- Emit appropriate activity events for visibility changes

### Non-Functional Requirements

**NFR1: Performance**

- Rule evaluation < 50ms per question
- No visible lag during real-time updates
- Efficient re-render patterns

**NFR2: Accessibility**

- Screen reader announcements for visibility changes
- Focus management when questions disappear
- ARIA attributes for hidden content

**NFR3: Developer Experience**

- Clean API for rule service
- TypeScript support for all rule types
- Storybook examples for testing

## Technical Approach

### Architecture

```
unified-form-renderer
├── use-question-visibility (new hook)
│   ├── rule-service (new service)
│   └── visibility-manager (new utility)
├── question-renderer (modified)
└── existing hooks (form-setup, navigation, events)
```

### Core Components

**1. Rule Service**

```typescript
interface RuleService {
  evaluateRule(rule: Rule, formData: FormData): boolean;
  getAffectedQuestions(questionId: string, questions: Question[]): string[];
}
```

**2. Visibility Hook**

```typescript
interface UseQuestionVisibility {
  visibleQuestions: Set<string>;
  isQuestionVisible(questionId: string): boolean;
  getVisibilityMap(): Record<string, boolean>;
}
```

**3. Enhanced Form Data**

- Filter submission data to exclude hidden questions
- Filter validation to exclude hidden questions
- Track visibility state history
- Handle cascade effects (question A affects B affects C)
- **Constraint**: Questions can only reference questions that appear before them

### Integration Points

**Existing Architecture**:

- `use-form-setup.ts`: Initialize visibility state
- `use-form-events.ts`: Emit visibility change events
- `question-renderer.tsx`: Apply visibility styling
- `use-form-navigation.ts`: Handle page visibility logic
- Form validation: Filter out hidden questions from validation rules
- Form submission: Filter out hidden questions from submitted data

**New Events**:

- `activity-question-hidden`
- `activity-question-shown`
- `activity-visibility-change`

## Implementation Strategy

### Phase 1: Core Rule Engine

- [ ] Create `rule-service.ts` with basic evaluation
- [ ] Support `field_value` rules (80% of use cases)
- [ ] Unit tests for rule evaluation

### Phase 2: Visibility Integration

- [ ] Create `use-question-visibility.ts` hook
- [ ] Integrate with `question-renderer.tsx`
- [ ] Handle data filtering on submission
- [ ] Handle validation filtering for hidden questions

### Phase 3: Advanced Rules & Polish

- [ ] Support `calculation` and `boolean_logic` rules
- [ ] Add smooth animations
- [ ] Accessibility improvements
- [ ] Performance optimizations

## Success Criteria

### User Experience

- [ ] Questions hide/show smoothly without layout shifts
- [ ] Form feels responsive during rule evaluation
- [ ] No irrelevant questions displayed to users

### Technical Quality

- [ ] Hidden questions never submit data
- [ ] Hidden questions never trigger validation errors
- [ ] Rule evaluation handles edge cases gracefully
- [ ] Maintains existing form performance benchmarks
- [ ] Full TypeScript coverage for rule types

### Integration Quality

- [ ] Works seamlessly with existing form architecture
- [ ] Activity events properly emitted for visibility changes
- [ ] Storybook stories demonstrate all rule types
- [ ] Cross-browser compatibility maintained

## Edge Cases & Considerations

**Forward-Only References**

- Questions can only reference questions that appear before them
- Ensures no circular dependencies by design
- Simplifies evaluation order (top-down processing)

**Performance with Many Rules**

- 50+ questions with complex interdependencies
- Solution: Memoization and selective re-evaluation

**Data Persistence**

- User fills field, field becomes hidden, then visible again
- Solution: Session-scoped data preservation

**Page Navigation**

- Entire page becomes hidden due to rules
- Solution: Auto-advance to next visible page

## Risk Mitigation

**High Risk**: Rule evaluation performance

- Mitigation: Benchmark early, optimize evaluation order

**Medium Risk**: Complex rule debugging

- Mitigation: Developer tools for rule tracing

**Low Risk**: Accessibility regression

- Mitigation: Automated a11y testing integration

## Definition of Done

- [ ] All functional requirements implemented and tested
- [ ] Performance benchmarks met (< 50ms rule evaluation)
- [ ] Accessibility audit passed
- [ ] Documentation updated (both dev and user-facing)
- [ ] Storybook stories cover all rule scenarios
- [ ] Integration tests pass for form submission filtering
- [ ] Code review approved by team leads

---

**Next Steps**: Begin Phase 1 implementation with `rule-service.ts` focusing on `field_value` rule evaluation.
