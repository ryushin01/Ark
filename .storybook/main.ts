import type { StorybookConfig } from "@storybook/nextjs-vite";

/** Storybook 설정. 컴포넌트 옆의 *.stories.tsx를 모읍니다. */
const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(ts|tsx)"],
  addons: ["@storybook/addon-docs", "@storybook/addon-a11y", "@storybook/addon-vitest"],
  framework: { name: "@storybook/nextjs-vite", options: {} },
  core: { disableTelemetry: true },
};

export default config;
