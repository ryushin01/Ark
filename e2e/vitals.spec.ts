import { expect, type Page, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import path from "node:path";
import { z } from "zod";

/**
 * Web Vitals 검사 (pnpm test:vitals)
 * 무거운 화면에서 실제 브라우저로 LCP·CLS·INP를 재고 "좋음" 기준을 넘지 않는지 봅니다.
 * 기준은 web.dev의 좋음 기준이며 lighthouserc.json의 LCP·CLS 기준과 같습니다(LCP 2.5초, CLS 0.1, INP 0.2초).
 * 측정은 앱이 이미 쓰는 web-vitals 라이브러리를 화면에 넣어(addInitScript) 합니다.
 */
declare global {
  interface Window {
    /** web-vitals.iife.js가 넣는 전역 */
    webVitals: typeof import("web-vitals");
    /** 화면에서 잰 값 */
    __vitals: Record<string, number>;
  }
}

const BUDGET = { LCP: 2500, CLS: 0.1, INP: 200 };

const metricsSchema = z.object({
  LCP: z.number().optional(),
  CLS: z.number().optional(),
  INP: z.number().optional(),
});

/** 앱이 쓰는 web-vitals의 IIFE 빌드. 초기화 스크립트는 함수 안에서 돌아 `var`가 전역이 되지 않으므로 직접 넣습니다. */
const WEB_VITALS = `${readFileSync(
  path.join(process.cwd(), "node_modules/web-vitals/dist/web-vitals.iife.js"),
  "utf8",
)}\nwindow.webVitals = webVitals;`;

test.beforeEach(async ({ page }) => {
  await page.addInitScript({ content: WEB_VITALS });
  await page.addInitScript(() => {
    window.__vitals = {};
    const save = (metric: { name: string; value: number }) => {
      window.__vitals[metric.name] = metric.value;
    };
    const vitals = window.webVitals;
    vitals.onLCP(save, { reportAllChanges: true });
    vitals.onCLS(save, { reportAllChanges: true });
    vitals.onINP(save, { reportAllChanges: true, durationThreshold: 0 });
  });
});

async function readVitals(page: Page) {
  // 화면을 떠나는 것처럼 숨겨, 모아 둔 값을 모두 보고하게 합니다.
  await page.evaluate(() => {
    Object.defineProperty(document, "visibilityState", { value: "hidden", configurable: true });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  return metricsSchema.parse(await page.evaluate(() => window.__vitals));
}

function expectWithinBudget(metrics: z.infer<typeof metricsSchema>) {
  expect(metrics.LCP, "LCP를 재지 못했습니다").toBeDefined();
  expect(metrics.LCP ?? Infinity).toBeLessThanOrEqual(BUDGET.LCP);
  expect(metrics.CLS ?? 0).toBeLessThanOrEqual(BUDGET.CLS);
  expect(metrics.INP, "INP를 재지 못했습니다(상호작용 없음)").toBeDefined();
  expect(metrics.INP ?? Infinity).toBeLessThanOrEqual(BUDGET.INP);
}

const SCENARIOS: { name: string; path: string; interact: (page: Page) => Promise<void> }[] = [
  {
    name: "홈 악보 무대: 대륙 필터",
    path: "/",
    interact: async (page) => {
      await page
        .getByRole("group", { name: "대륙으로 거르기" })
        .getByRole("button", { name: /^유럽/ })
        .click();
    },
  },
  {
    name: "신 찾기: 검색",
    path: "/figures",
    interact: async (page) => {
      // 실제 입력처럼 키를 눌러야, 입력 바로 뒤의 결과 목록 변화가 CLS에서 빠집니다(사용자 입력 뒤 0.5초).
      // 한글은 Playwright가 키 이벤트 없이 글자만 넣으므로(insertText) 영문 이름으로 찾습니다.
      await page
        .getByRole("searchbox", { name: "이름·별칭·영역·유물로 찾기" })
        .pressSequentially("Odin");
    },
  },
  {
    name: "비밀 전시실: 전시 목록 열기",
    path: "/vault",
    interact: async (page) => {
      await page.getByRole("button", { name: "전시 목록" }).click();
    },
  },
  {
    name: "인물 상세: 화면 설정",
    path: "/figures/odin",
    interact: async (page) => {
      await page.getByRole("button", { name: "주석" }).click();
    },
  },
];

for (const { name, path: url, interact } of SCENARIOS) {
  test(`${name}(${url}): LCP·CLS·INP가 좋음 기준 안입니다`, async ({ page }) => {
    await page.goto(url);
    await page.waitForLoadState("networkidle");
    await interact(page);
    await page.waitForTimeout(500);
    const metrics = await readVitals(page);
    test.info().annotations.push({ type: "web-vitals", description: JSON.stringify(metrics) });
    expectWithinBudget(metrics);
  });
}
