import type { StorybookConfig } from "@storybook/nextjs-vite";

const config: StorybookConfig = {
  stories: [
    "../src/**/*.mdx",
    "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)",
    "../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)",
  ],
  addons: [
    "@storybook/addon-onboarding",
    "@chromatic-com/storybook",
    "@storybook/addon-vitest",
    "@storybook/addon-docs",
  ],
  framework: {
    name: "@storybook/nextjs-vite",
    options: {},
  },
  viteFinal: async (config) => {
    const tailwindPostcss = await import("@tailwindcss/postcss");

    // Ensure PostCSS processes Tailwind CSS v4
    if (config.css) {
      config.css.postcss = {
        plugins: [tailwindPostcss.default],
      };
    } else {
      config.css = {
        postcss: {
          plugins: [tailwindPostcss.default],
        },
      };
    }
    return config;
  },
  staticDirs: ["../public"],
};
export default config;
