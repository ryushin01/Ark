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
          // .env.local의 Supabase 접속 정보를 비워, 테스트가 실제 데이터베이스를 건드리지 않게 합니다.
          env: { SUPABASE_URL: "", SUPABASE_SECRET_KEY: "" },
          setupFiles: ["./vitest.setup.ts"],
          include: ["src/**/*.test.{ts,tsx}"],
          restoreMocks: true,
        },
      },
      /*
       * 스토리 테스트 (pnpm test:storybook)
       * 모든 스토리를 실제 브라우저(Chromium)에서 렌더링하고, play 함수와 접근성 검사(axe)를 실행합니다.
       * Storybook 설정(.storybook/preview.tsx, 애드온)은 addon-vitest가 자동으로 적용합니다.
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
        },
      },
    ],
  },
});
