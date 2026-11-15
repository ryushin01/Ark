import type { Preview } from "@storybook/nextjs-vite";

import "../src/_app/styles/globals.css";

const preview: Preview = {
  parameters: {
    nextjs: { appDirectory: true },
    layout: "padded",
    // 접근성 위반(axe)이 있으면 스토리 테스트를 실패시킵니다.
    a11y: { test: "error" },
    backgrounds: { disable: true },
  },
  decorators: [
    (Story, context) => (
      <div className={context.parameters.theme === "dark" ? "theme-dark" : undefined}>
        <Story />
      </div>
    ),
  ],
};

export default preview;
