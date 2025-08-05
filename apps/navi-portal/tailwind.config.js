/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}", "./stories/**/*.{ts,tsx}"],
  theme: {
    extend: {
      // Typography - Font sizes using CSS custom properties
      fontSize: {
        xs: [
          "var(--font-size-xs, 0.75rem)",
          { lineHeight: "var(--line-height-tight, 1.25)" },
        ],
        sm: [
          "var(--font-size-sm, 0.875rem)",
          { lineHeight: "var(--line-height-normal, 1.5)" },
        ],
        base: [
          "var(--font-size-base, 1rem)",
          { lineHeight: "var(--line-height-normal, 1.5)" },
        ],
        lg: [
          "var(--font-size-lg, 1.125rem)",
          { lineHeight: "var(--line-height-normal, 1.5)" },
        ],
        xl: [
          "var(--font-size-xl, 1.25rem)",
          { lineHeight: "var(--line-height-normal, 1.5)" },
        ],
        "2xl": [
          "var(--font-size-2xl, 1.5rem)",
          { lineHeight: "var(--line-height-tight, 1.25)" },
        ],
        "3xl": [
          "var(--font-size-3xl, 1.875rem)",
          { lineHeight: "var(--line-height-tight, 1.25)" },
        ],
        "4xl": [
          "var(--font-size-4xl, 2.25rem)",
          { lineHeight: "var(--line-height-tight, 1.25)" },
        ],
      },

      // Typography - Font families using CSS custom properties
      fontFamily: {
        body: ["var(--font-family-body, system-ui)", "sans-serif"],
        heading: ["var(--font-family-heading, system-ui)", "sans-serif"],
        mono: ["var(--font-family-mono, ui-monospace)", "monospace"],
      },

      // Border radius using CSS custom properties
      borderRadius: {
        sm: "var(--radius-sm, 0.125rem)",
        md: "var(--radius-md, 0.375rem)",
        lg: "var(--radius-lg, 0.5rem)",
        button: "var(--radius, var(--radius-md, 0.375rem))",
        input: "var(--input-radius, var(--radius-md, 0.375rem))",
        control: "var(--control-radius, 0.25rem)",
      },

      // Spacing for component-specific padding
      spacing: {
        "button-x": "var(--button-padding-x, 1rem)",
        "button-y": "var(--button-padding-y, 0.5rem)",
      },

      // Colors handled by @theme inline in globals.css
    },
  },
};
