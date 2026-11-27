import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import react from "@vitejs/plugin-react";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

/** 로직 계층: 화면이 아니라 데이터·규칙을 다루는 곳. 단위 테스트로 80% 이상을 지킵니다. */
const LOGIC = 80;

export default defineConfig({
  test: {
    /*
     * 커버리지 (pnpm test:coverage). 단위 테스트(unit)만 잽니다.
     * - 로직 계층(shared/lib, 슬라이스의 model·api)은 80%를 기준으로 합니다.
     * - 전체는 도입할 때 잰 값을 기준선으로 걸어, 테스트를 지우거나 테스트 없는 코드를 늘려 내려가지 않게 합니다.
     *   값이 오르면 기준선도 올립니다(내리지 않음).
     */
    coverage: {
      provider: "v8",
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/**/*.{test,stories}.{ts,tsx}",
        "src/**/*.test-utils.ts",
        // 생성한 DB 타입과 손으로 적은 시드 데이터는 실행할 로직이 없습니다.
        "src/shared/api/database.types.ts",
        "src/**/api/mock-data.ts",
        "src/**/api/mock/**",
        // 층·슬라이스의 공개 API(다시 내보내기만 하는 파일). 로직이 든 세그먼트 index(예: shared/lib/monitoring)는 잽니다.
        "src/*/index*.ts",
        "src/*/*/index*.ts",
      ],
      reporter: ["text-summary", "json-summary", "html"],
      thresholds: {
        // 전체 기준선(1.8.5에서 잰 값의 소수점 아래 버림: 줄 56.7%, 문 56.4%, 함수 47.5%, 분기 45.1%)
        lines: 56,
        statements: 56,
        functions: 47,
        branches: 45,
        "src/shared/lib/**": { lines: LOGIC, statements: LOGIC, functions: LOGIC, branches: LOGIC },
        "src/{_pages,widgets,features,entities}/**/model/**": {
          lines: LOGIC,
          statements: LOGIC,
          functions: LOGIC,
          branches: LOGIC,
        },
        "src/{_pages,widgets,features,entities,shared}/**/api/**": {
          lines: LOGIC,
          statements: LOGIC,
          functions: LOGIC,
          branches: LOGIC,
        },
      },
    },
    projects: [
      /*
       * 단위·통합 테스트 (pnpm test)
       * 기본은 브라우저 환경(jsdom)입니다. 서버 코드는 파일 맨 위에 `// @vitest-environment node`를 적습니다.
       */
      {
        // tsconfig의 경로 별칭(@/…)은 Vite 기본 기능으로 풉니다.
        resolve: { tsconfigPaths: true },
        plugins: [react()],
        test: {
          name: "unit",
          environment: "jsdom",
          // .env.local의 Supabase 접속 정보를 비워, 테스트가 실제 데이터베이스를 건드리지 않게 합니다.
          env: { SUPABASE_URL: "", SUPABASE_SECRET_KEY: "" },
          setupFiles: ["./vitest.setup.ts"],
          include: ["src/**/*.test.{ts,tsx}", "scripts/**/*.test.ts"],
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
