import { defineConfig, devices } from "@playwright/test";

/** 다른 작업이 4100을 쓰고 있으면 E2E_PORT로 바꿉니다. (여러 세션·프로젝트를 함께 돌릴 때) */
const PORT = Number(process.env.E2E_PORT) || 4100;
/** 오프라인 검사용 두 번째 서버: Supabase 주소는 있지만 닿지 않아 내장 데이터로 대신 보여 줍니다. */
const FALLBACK_PORT = PORT + 1;
process.env.OFFLINE_FALLBACK_URL = `http://localhost:${FALLBACK_PORT}`;

/**
 * E2E 테스트 (pnpm test:e2e)
 * 프로덕션 빌드를 실행해 검사하므로 먼저 pnpm build가 필요합니다.
 */
export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  // 시각 회귀 기준 이미지. 운영체제 이름을 붙이지 않습니다(기준은 Linux CI 하나, visual.spec.ts 참고).
  snapshotPathTemplate: "{testDir}/__screenshots__/{testFilePath}/{arg}{ext}",
  expect: {
    toHaveScreenshot: {
      animations: "disabled",
      caret: "hide",
      scale: "css",
      // 같은 Docker 이미지에서도 그림 디코딩·안티에일리어싱이 아주 조금 다를 수 있어 0.2%까지 허용합니다.
      maxDiffPixelRatio: 0.002,
    },
  },
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
      testIgnore: [
        /screenshots/,
        /admin\.spec/,
        /upload\.spec/,
        /offline\.spec/,
        /visual\.spec/,
        /vitals\.spec/,
      ],
    },
    // 어드민은 메모리 저장소의 데이터를 바꾸므로, 공개 사이트 검사가 끝난 뒤 따로 실행합니다.
    {
      name: "admin",
      use: { ...devices["Desktop Chrome"] },
      testMatch: /admin\.spec/,
      dependencies: ["chromium"],
    },
    // 외부 요청을 막고 비밀 값 없이 주요 화면이 뜨는지 (pnpm test:e2e:offline). 어드민 데이터를 바꾸지 않습니다.
    {
      name: "offline",
      use: { ...devices["Desktop Chrome"] },
      testMatch: /offline\.spec/,
    },
    // 시각 회귀 (pnpm test:visual). 기준 이미지가 Linux 것이라 CI는 Playwright Docker 이미지에서 돌립니다.
    {
      name: "visual",
      use: { ...devices["Desktop Chrome"] },
      testMatch: /visual\.spec/,
    },
    // Web Vitals (pnpm test:vitals). 측정이 흔들리지 않게 한 번에 하나씩 돌립니다.
    {
      name: "vitals",
      use: { ...devices["Desktop Chrome"] },
      testMatch: /vitals\.spec/,
      fullyParallel: false,
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
  webServer: [
    {
      command: `pnpm exec next start -p ${PORT}`,
      // E2E 전용 관리자 비밀번호와 세션 키 (실제 배포 값과 무관)
      // Supabase 접속 정보는 비워, 어드민 테스트가 실제 데이터베이스 대신 메모리 목업을 바꾸게 합니다.
      // README 스크린샷(pnpm screenshots)은 .env.local의 로컬 Supabase(pnpm db:start)를 그대로 씁니다.
      env: {
        ADMIN_PASSWORD: "e2e-password",
        ADMIN_SESSION_SECRET: "e2e-session-secret",
        ...(process.env.E2E_USE_LOCAL_SUPABASE
          ? {}
          : { SUPABASE_URL: "", SUPABASE_SECRET_KEY: "" }),
      },
      url: `http://localhost:${PORT}`,
      // 로컬 Supabase 모드는 환경 변수가 달라 늘 새 서버를 띄웁니다.
      reuseExistingServer: !process.env.CI && !process.env.E2E_USE_LOCAL_SUPABASE,
      timeout: 60_000,
    },
    {
      command: `pnpm exec next start -p ${FALLBACK_PORT}`,
      // .invalid 도메인은 어디에도 닿지 않습니다. (RFC 2606) 비밀 키도 가짜입니다.
      env: {
        ADMIN_PASSWORD: "",
        ADMIN_SESSION_SECRET: "e2e-session-secret",
        SUPABASE_URL: "https://supabase.invalid",
        SUPABASE_SECRET_KEY: "offline-e2e-fake-key",
      },
      url: `http://localhost:${FALLBACK_PORT}`,
      reuseExistingServer: false,
      timeout: 60_000,
    },
  ],
});
