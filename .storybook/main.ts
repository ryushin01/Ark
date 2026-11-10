import type { StorybookConfig } from "@storybook/nextjs-vite";

/** 앱과 함께 배포하는 빌드(pnpm build-storybook, pnpm build)인지. 환경 변수 대신 스크립트 이름으로 판단해 Windows에서도 동작합니다. */
const inApp = process.env.npm_lifecycle_event === "build-storybook";

/** Storybook 설정. 컴포넌트 옆의 *.stories.tsx를 모읍니다. */
const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(ts|tsx)"],
  addons: ["@storybook/addon-docs", "@storybook/addon-a11y", "@storybook/addon-vitest"],
  framework: { name: "@storybook/nextjs-vite", options: {} },
  core: { disableTelemetry: true },
  // 앱과 함께 배포할 때(pnpm build-storybook)는 public 폴더를 복사하지 않습니다.
  // 같은 주소에서 열리므로 /images 같은 정적 파일은 앱의 것을 그대로 씁니다.
  viteFinal: (viteConfig) => (inApp ? { ...viteConfig, publicDir: false } : viteConfig),
};

export default config;
