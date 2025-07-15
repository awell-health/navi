# Accessibility Requirements (WCAG 2.1 AA)

## 1. Component Library
* Leverage **Radix UI primitives via shadcn/ui** for focus-trap, ARIA roles, keyboard nav.

## 2. Activity Loading
* When swapping activities:
  * Move focus to top `<h1>` of new activity.
  * Announce region change via `aria-live="polite"` landmark.

## 3. Contrast & Theming
* Primary text/background contrast ≥ 4.5:1 regardless of theme colours.
* Colour token linter runs in CI.

## 4. Automated & Manual Testing
* `@axe-core/react` automated tests in CI.
* Quarterly manual audit with screen-reader (NVDA, VoiceOver) and keyboard-only navigation.