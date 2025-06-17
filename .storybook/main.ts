import type { StorybookConfig } from "@storybook/experimental-nextjs-vite";

const config: StorybookConfig = {
  "stories": [
    "../src/**/*.mdx",
    "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  "addons": [
    "@storybook/addon-essentials",
    "@storybook/addon-onboarding",
    "@chromatic-com/storybook",
    "@storybook/experimental-addon-test"
  ],
  "framework": {
    "name": "@storybook/experimental-nextjs-vite",
    "options": {}
  },
  "viteFinal": async (config) => {
    const tailwindPostcss = await import("@tailwindcss/postcss");
    
    // Ensure PostCSS processes Tailwind CSS v4
    if (config.css) {
      config.css.postcss = {
        plugins: [tailwindPostcss.default]
      };
    } else {
      config.css = {
        postcss: {
          plugins: [tailwindPostcss.default]
        }
      };
    }
    return config;
  },
  "staticDirs": [
    "../public"
  ]
};
export default config;