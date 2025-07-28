const eslintConfig = [
  {
    // Global ignores for generated and build files
    ignores: [
      // Build/dist folders
      "**/dist/**",
      "**/build/**",
      "**/coverage/**",
      "**/.next/**",
      "**/.turbo/**",
      "**/node_modules/**",

      // Generated files
      "**/generated/**",
      "**/*.generated.ts",
      "**/*.generated.tsx",

      // Storybook
      "**/storybook-static/**",
      "**/*.stories.ts",
      "**/*.stories.tsx",

      // Config files
      "**/*.config.js",
      "**/*.config.mjs",
      "**/rollup.config.js",

      // Test files (can be linted by individual package configs)
      "**/*.test.ts",
      "**/*.test.tsx",

      // Other
      "**/*.d.ts",
      "**/types/**/*.d.ts",
    ],
  },
];

export default eslintConfig;
