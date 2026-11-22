import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";

import { MOCK_RELICS } from "../src/entities/relic/api/mock-data";

const AXE_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

const axeViolations = async (page: Page) =>
  (await new AxeBuilder({ page }).withTags(AXE_TAGS).analyze()).violations.map(
    (violation) => `${violation.id}: ${violation.help}`,
  );

/**
 * 화면 가운데에 가장 가까운 타일의 id. 가장자리 타일은 조금만 움직여도 반대쪽으로 감기므로 가운데 타일로 잽니다.
 * 가운데 한 점이 타일 사이 틈에 걸릴 수 있어(CI 글꼴·배치 차이), 점 대신 가운데에서 가장 가까운 타일을 고릅니다.
 */
const centerTileId = (page: Page) =>
  page.evaluate(() => {
    const cx = innerWidth / 2;
    const cy = innerHeight / 2;
    let best = { id: "", distance: Number.POSITIVE_INFINITY };
    for (const tile of document.querySelectorAll("li[id]")) {
      const rect = tile.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) continue;
      const distance = Math.hypot(rect.x + rect.width / 2 - cx, rect.y + rect.height / 2 - cy);
      if (distance < best.distance) best = { id: tile.id, distance };
    }
    return best.id;
  });

const boxOf = async (page: Page, id: string) =>
  (await page.locator(`[id="${id}"]`).boundingBox()) ?? { x: Number.NaN, y: Number.NaN };

test.describe("움직임을 끄면 정적인 목록", () => {
  test.use({ reducedMotion: "reduce" });

  test("메뉴의 '유물'로 비밀 전시실에 들어가, 전시 목록에서 유물 상세로 갑니다", async ({
    page,
  }) => {
    await page.goto("/figures");
    await page.getByRole("button", { name: "메뉴" }).filter({ visible: true }).first().click();
    await page.getByRole("dialog", { name: "메뉴" }).getByRole("link", { name: /유물/ }).click();
    await expect(page).toHaveURL("/vault");
    await expect(page.getByRole("heading", { level: 1, name: "비밀 전시실" })).toBeVisible();

    const canvas = page.getByRole("list", { name: `전시된 유물 ${MOCK_RELICS.length}점` });
    await expect(canvas.getByRole("link")).toHaveCount(MOCK_RELICS.length);

    await page.getByRole("button", { name: "전시 목록" }).click();
    const index = page.getByRole("dialog", { name: /전시 목록/ });
    await expect(index.getByRole("link")).toHaveCount(MOCK_RELICS.length);
    await index.getByRole("link", { name: /구사나기의 검/ }).click();
    await expect(page).toHaveURL("/vault/kusanagi");
    await expect(
      page.getByRole("heading", { level: 1, name: "구사나기의 검" }).filter({ visible: true }),
    ).toBeVisible();
  });

  test("전시 목록은 Esc로 닫히고 초점이 버튼으로 돌아옵니다", async ({ page }) => {
    await page.goto("/vault");
    const button = page.getByRole("button", { name: "전시 목록" });
    await button.click();
    await expect(page.getByRole("dialog", { name: /전시 목록/ })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog", { name: /전시 목록/ })).toBeHidden();
    await expect(button).toBeFocused();
  });

  test("유물 상세에서 기원·힘·대가·문헌을 읽고, 지닌 이와 다음 유물로 이어집니다", async ({
    page,
  }) => {
    await page.goto("/vault/gleipnir");
    await expect(page).toHaveTitle(/글레이프니르 — 비밀 전시실/);
    await expect(page.getByRole("heading", { level: 1, name: "글레이프니르" })).toBeVisible();
    for (const term of ["기원", "대가", "전하는 문헌", "지닌 이"]) {
      await expect(
        page.getByRole("term").filter({ hasText: new RegExp(`^${term}$`) }),
      ).toBeVisible();
    }
    await expect(page.getByText("힘", { exact: true })).toBeVisible();
    await expect(page.getByText(/티르가 오른손을/)).toBeVisible();

    const pager = page.getByRole("navigation", { name: "다른 유물" });
    await pager.getByRole("link", { name: /다음 유물/ }).click();
    await expect(page).toHaveURL("/vault/gram");

    await page.getByRole("link", { name: "시구르드" }).filter({ visible: true }).click();
    await expect(page).toHaveURL("/figures/sigurd");
  });

  test("상세의 '캔버스로 돌아가기'로 전시실로 돌아갑니다", async ({ page }) => {
    await page.goto("/vault/gram");
    await page.getByRole("link", { name: "캔버스로 돌아가기" }).click();
    await expect(page).toHaveURL("/vault");
  });

  test("그림이 전하지 않는 유물은 빈 진열 패널로 보입니다", async ({ page }) => {
    const empty = MOCK_RELICS.find((relic) => relic.exhibitId === null);
    expect(empty, "그림이 없는 유물이 하나는 있어야 이 화면을 검사할 수 있습니다").toBeDefined();
    await page.goto(`/vault/${empty!.slug}`);
    await expect(page.getByText("전하는 그림이 없는 유물")).toBeVisible();
  });

  test("신 상세의 '지닌 유물'에서 유물 상세로 갑니다", async ({ page }) => {
    await page.goto("/figures/thor");
    const relics = page.getByRole("region", { name: "지닌 유물" });
    await relics.getByRole("link", { name: "묠니르" }).click();
    await expect(page).toHaveURL("/vault/mjolnir");
    await expect(
      page.getByRole("heading", { level: 1, name: "묠니르" }).filter({ visible: true }),
    ).toBeVisible();
  });

  test("주소에 #이 붙은 채 열면 그 유물로 갑니다", async ({ page }) => {
    await page.goto("/vault#golden-bride");
    await expect(page.locator("#golden-bride")).toBeInViewport();
  });

  test("#이 붙은 전시실에서 더 내려가 유물에 갔다가 뒤로 오면, 보던 자리로 돌아옵니다", async ({
    page,
  }) => {
    await page.goto("/vault#kusanagi");
    await expect(page.locator("#kusanagi")).toBeInViewport();
    // 넘겨받기를 기다린 뒤 사용자가 직접 움직인 것처럼 휠로 # 대상 붙잡기를 멈춥니다.
    await expect.poll(() => page.evaluate(() => "__arkEarlyReveal" in window)).toBe(false);
    await page.mouse.wheel(0, 1);
    const target = page.locator("#ruyi-jingu-bang").getByRole("link");
    await target.scrollIntoViewIfNeeded();
    const y = await page.evaluate(() => Math.round(window.scrollY));
    await target.click();
    await expect(page).toHaveURL("/vault/ruyi-jingu-bang");
    await page.goBack();
    await expect(page).toHaveURL("/vault#kusanagi");
    await expect
      .poll(async () => Math.abs((await page.evaluate(() => window.scrollY)) - y))
      .toBeLessThan(5);
  });
});

test.describe("이야기 듣기", () => {
  test.use({ reducedMotion: "reduce" });

  test("재생 버튼으로 읽기와 일시 정지를 오가고, 진행을 알립니다", async ({ page }) => {
    // 가짜 음성 합성: 문장마다 시작·끝 이벤트를 바로 보냅니다(실제 목소리는 기기마다 달라 검사할 수 없음).
    await page.addInitScript(() => {
      type Fake = { onstart?: () => void; onend?: () => void };
      const queue: Fake[] = [];
      const synth = {
        speak: (utterance: Fake) => queue.push(utterance),
        cancel: () => (queue.length = 0),
        pause: () => {},
        resume: () => {},
        getVoices: () => [],
      };
      Object.defineProperty(window, "speechSynthesis", { value: synth });
      Object.defineProperty(window, "SpeechSynthesisUtterance", {
        value: function (this: Fake) {},
      });
      Object.defineProperty(window, "__speakNext", {
        value: () => {
          const next = queue.shift();
          next?.onstart?.();
          next?.onend?.();
          return queue.length;
        },
      });
    });
    await page.goto("/vault/mjolnir");
    const play = page.getByRole("button", { name: "이야기 읽어 주기" });
    await expect(play).toHaveAttribute("aria-pressed", "false");
    await play.click();
    await expect(play).toHaveAttribute("aria-pressed", "true");
    await expect(
      page.getByRole("status").filter({ hasText: "이야기를 읽고 있습니다" }),
    ).toBeAttached();

    await page.evaluate(() => Reflect.get(window, "__speakNext")());
    const bar = page.getByRole("progressbar", { name: "이야기 진행" });
    await expect
      .poll(async () => Number(await bar.getAttribute("aria-valuenow")))
      .toBeGreaterThan(0);

    await play.click();
    await expect(play).toHaveAttribute("aria-pressed", "false");
    await expect(page.getByRole("status").filter({ hasText: "잠시 멈췄습니다" })).toBeAttached();

    await play.click();
    while (await page.evaluate(() => Reflect.get(window, "__speakNext")()));
    await expect(bar).toHaveAttribute("aria-valuenow", "100");
    await expect(page.getByRole("status").filter({ hasText: "끝까지 읽었습니다" })).toBeAttached();
  });

  test("음성 합성을 지원하지 않으면 버튼 대신 안내를 보여 줍니다", async ({ page }) => {
    await page.addInitScript(() => {
      Reflect.deleteProperty(window, "speechSynthesis");
      Reflect.deleteProperty(window, "SpeechSynthesisUtterance");
    });
    await page.goto("/vault/mjolnir");
    await expect(page.getByText(/읽어 주기\(음성 합성\)를 지원하지 않습니다/)).toBeVisible();
    await expect(page.getByRole("button", { name: "이야기 읽어 주기" })).toHaveCount(0);
  });
});

test.describe("무한 캔버스", () => {
  test.use({ reducedMotion: "no-preference", viewport: { width: 1440, height: 900 } });

  test.beforeEach(async ({ page }) => {
    await page.goto("/vault");
    await expect.poll(() => page.evaluate(() => "__arkEarlyReveal" in window)).toBe(false);
  });

  test("첫 화면이 캔버스이고, 페이지는 스크롤되지 않으며 접근성 위반이 없습니다", async ({
    page,
  }) => {
    await expect(page.locator("#mjolnir")).toBeInViewport();
    expect(
      await page.evaluate(() => document.documentElement.scrollHeight <= window.innerHeight + 1),
    ).toBe(true);
    expect(await axeViolations(page)).toEqual([]);
  });

  test("휠·방향키·버튼으로 사방을 움직입니다", async ({ page }) => {
    const id = await centerTileId(page);
    const start = await boxOf(page, id);
    await page.mouse.move(720, 450);
    await page.mouse.wheel(0, 200);
    await expect.poll(async () => (await boxOf(page, id)).y).toBeLessThan(start.y - 100);

    const afterWheel = await boxOf(page, id);
    await page.getByRole("button", { name: "캔버스 오른쪽 보기" }).click();
    await expect.poll(async () => (await boxOf(page, id)).x).toBeLessThan(afterWheel.x - 50);

    const afterButton = await boxOf(page, id);
    await page.getByRole("button", { name: "캔버스 위쪽 보기" }).press("ArrowLeft");
    await expect.poll(async () => (await boxOf(page, id)).x).toBeGreaterThan(afterButton.x + 50);
  });

  test("끌면 움직이기만 하고, 그냥 누르면 유물 상세로 갑니다", async ({ page }) => {
    const id = await centerTileId(page);
    const start = await boxOf(page, id);
    await page.mouse.move(720, 450);
    await page.mouse.down();
    await page.mouse.move(560, 410, { steps: 8 });
    await page.mouse.up();
    await expect(page).toHaveURL("/vault");
    await expect.poll(async () => (await boxOf(page, id)).x).toBeLessThan(start.x - 100);

    // 틈에 걸리지 않도록 가운데 점 아래에 타일이 있을 때까지 기다린 뒤 누릅니다.
    const tileAtCenter = () =>
      page.evaluate(
        () => document.elementFromPoint(innerWidth / 2, innerHeight / 2)?.closest("li")?.id ?? "",
      );
    await expect.poll(tileAtCenter).not.toBe("");
    const target = await tileAtCenter();
    await page.mouse.click(720, 450);
    await expect(page).toHaveURL(`/vault/${target}`);
  });

  test("Tab으로 화면 밖 유물에 초점이 가면 그 유물이 화면 안으로 옵니다", async ({ page }) => {
    const far = page.locator(`#${MOCK_RELICS[MOCK_RELICS.length - 1].slug}`).getByRole("link");
    await far.focus();
    await expect(far).toBeInViewport({ ratio: 0.9 });
  });

  test("주소에 #이 붙은 채 열면 그 유물을 화면 가운데에 둡니다", async ({ page }) => {
    await page.goto("/vault#golden-bride");
    await expect(page.locator("#golden-bride")).toBeInViewport({ ratio: 0.9 });
  });

  test("유물 상세(넓은 화면)도 접근성 위반이 없습니다", async ({ page }) => {
    await page.goto(`/vault/${MOCK_RELICS[3].slug}`);
    expect(await axeViolations(page)).toEqual([]);
  });
});
