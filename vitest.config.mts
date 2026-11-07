import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import react from "@vitejs/plugin-react";
import { playwright } from "@vitest/browser-playwright";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    projects: [
      /*
       * 단위·통합 테스트 (pnpm test)
       * 기본은 브라우저 환경(jsdom)입니다. 서버 코드는 파일 맨 위에 `// @vitest-environment node`를 적습니다.
       */
      {
        plugins: [tsconfigPaths(), react()],
        test: {
          name: "unit",
          environment: "jsdom",
          setupFiles: ["./vitest.setup.ts"],
          include: ["src/**/*.test.{ts,tsx}"],
          restoreMocks: true,
        },
      },
      /*
       * 스토리 테스트 (pnpm test:storybook)
       * 모든 스토리를 실제 브라우저(Chromium)에서 렌더링하고, play 함수와 접근성 검사(axe)를 실행합니다.
       */
      {
        plugins: [storybookTest({ configDir: ".storybook" })],
        test: {
          name: "storybook",
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: [{ browser: "chromium" }],
          },
          setupFiles: ["./.storybook/vitest.setup.ts"],
        },
      },
    ],
  },
});
