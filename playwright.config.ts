import { defineConfig, devices } from "@playwright/test";

const PORT = 4100;

/**
 * E2E 테스트 (pnpm test:e2e)
 * 프로덕션 빌드를 실행해 검사하므로 먼저 pnpm build가 필요합니다.
 */
export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      testIgnore: [/screenshots/, /admin\.spec/, /upload\.spec/],
    },
    // 어드민은 메모리 저장소의 데이터를 바꾸므로, 공개 사이트 검사가 끝난 뒤 따로 실행합니다.
    {
      name: "admin",
      use: { ...devices["Desktop Chrome"] },
      testMatch: /admin\.spec/,
      dependencies: ["chromium"],
    },
    // 이미지 업로드 (pnpm test:e2e:local-db). 실제 Storage가 필요해 로컬 Supabase에서만 돌립니다.
    {
      name: "local-db",
      use: { ...devices["Desktop Chrome"] },
      testMatch: /upload\.spec/,
    },
    // README 스크린샷 촬영 (pnpm screenshots). 검사가 아니라서 평소 E2E에는 넣지 않습니다.
    {
      name: "screenshots",
      testMatch: "readme.screenshots.ts",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: `pnpm exec next start -p ${PORT}`,
    // E2E 전용 관리자 비밀번호와 세션 키 (실제 배포 값과 무관)
    // Supabase 접속 정보는 비워, 어드민 테스트가 실제 데이터베이스 대신 메모리 목업을 바꾸게 합니다.
    // README 스크린샷(pnpm screenshots)은 .env.local의 로컬 Supabase(pnpm db:start)를 그대로 씁니다.
    env: {
      ADMIN_PASSWORD: "e2e-password",
      ADMIN_SESSION_SECRET: "e2e-session-secret",
      ...(process.env.E2E_USE_LOCAL_SUPABASE ? {} : { SUPABASE_URL: "", SUPABASE_SECRET_KEY: "" }),
    },
    url: `http://localhost:${PORT}`,
    // 로컬 Supabase 모드는 환경 변수가 달라 늘 새 서버를 띄웁니다.
    reuseExistingServer: !process.env.CI && !process.env.E2E_USE_LOCAL_SUPABASE,
    timeout: 60_000,
  },
});
