# @awell-health/navi-activities

React activity components for Navi healthcare applications with unified event system inspired by Stripe Elements.

## 🏗️ Architecture

This package provides three main activity types with identical external APIs:

- **FormActivity** - Interactive forms with 7+ question types
- **MessageActivity** - Rich content display (HTML/Markdown/Slate)  
- **ChecklistActivity** - Progress tracking and task completion

## 🎨 Design System

Built with professional UI components using:

- **shadcn/ui** - Accessible Radix UI primitives
- **Tailwind CSS** - Utility-first styling
- **CSS Variables** - Theme integration
- **WCAG 2.1 AA** - Accessibility compliance

## 📚 Storybook

Interactive component documentation and testing:

```bash
# Start Storybook
pnpm storybook

# Build Storybook
pnpm build-storybook
```

### Available Stories

#### UI Components
- **Button** - All variants, sizes, and states
- **Input** - Text, email, number, password inputs
- **Textarea** - Multi-line text input
- **Checkbox** - Single and grouped checkboxes
- **RadioGroup** - Mutually exclusive selections
- **Label** - Accessible form labels

#### Activity Components
- **FormActivity** - Healthcare intake forms, surveys
- **MessageActivity** - Welcome messages, instructions
- **ChecklistActivity** - Pre-surgery, discharge checklists

## 🚀 Usage Example

```tsx
import { FormActivity } from '@awell-health/navi-activities';

function MyForm() {
  return (
    <FormActivity
      data={{
        title: "Patient Intake",
        questions: [
          {
            id: 'name',
            type: 'SHORT_TEXT',
            title: 'Full Name',
            required: true
          }
        ]
      }}
      onReady={(event) => console.log('Form ready', event)}
      onComplete={(event) => console.log('Form complete', event)}
      onFocus={(event) => console.log('Field focused', event)}
      onBlur={(event) => console.log('Field blurred', event)}
    />
  );
}
```

## 🔧 Development

```bash
# Install dependencies
pnpm install

# Build package
pnpm build

# Run tests
pnpm test

# Start Storybook
pnpm storybook
```

## 📦 Built With

- **React 19** - Component library
- **TypeScript** - Type safety
- **Rollup** - Module bundling
- **Vite** - Development tools
- **Vitest** - Testing framework
- **ESM-first** - Modern module format

## 🎯 Status

- ✅ **Phase 1**: Foundation & Architecture (ESM, types, build)
- ✅ **Phase 2**: Activity Components (3 activity types)
- ✅ **Phase 3**: shadcn/ui Integration (professional components)
- ✅ **Phase 4**: Tailwind CSS Setup (theming, styling)
- ✅ **Phase 5**: Storybook Stories (UI component documentation)
- 🔄 **Next**: Activity component stories, advanced question types

## 🏥 Healthcare Focus

All components are designed for healthcare applications with:

- **HIPAA considerations** - Secure by design
- **Accessibility** - WCAG 2.1 AA compliance
- **Performance** - Optimized for patient-facing apps
- **Reliability** - Production-ready components