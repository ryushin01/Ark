import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";

/** 메모리 저장소를 함께 쓰므로 어드민 테스트는 순서대로 실행합니다. */
test.describe.configure({ mode: "serial" });
test.use({ reducedMotion: "reduce" });

async function login(page: Page, mode: "admin" | "demo") {
  await page.goto("/admin/login");
  if (mode === "demo") {
    await page.getByRole("button", { name: "데모 계정으로 둘러보기" }).click();
  } else {
    await page.getByLabel("관리자 비밀번호").fill("e2e-password");
    await page.getByRole("button", { name: "로그인" }).click();
  }
  await expect(page.getByRole("heading", { level: 1, name: "대시보드" })).toBeVisible();
}

test("로그인하지 않으면 로그인 화면으로 보냅니다", async ({ page }) => {
  await page.goto("/admin/figures");
  await expect(page).toHaveURL(/\/admin\/login\?next=%2Fadmin%2Ffigures/);
  await expect(page.getByRole("heading", { level: 1, name: "Ark 관리자" })).toBeVisible();
});

test("비밀번호가 틀리면 칸 옆에 오류를 알려 줍니다", async ({ page }) => {
  await page.goto("/admin/login");
  await page.getByLabel("관리자 비밀번호").fill("wrong");
  await page.getByRole("button", { name: "로그인" }).click();
  await expect(
    page.getByRole("alert").filter({ hasText: "4번 더 틀리면 15분 동안 잠깁니다" }),
  ).toBeVisible();
  await expect(page.getByLabel("관리자 비밀번호")).toHaveAttribute("aria-invalid", "true");
});

test("데모 계정은 둘러볼 수 있지만 저장은 막힙니다", async ({ page }) => {
  await login(page, "demo");
  await expect(page.getByText("데모 · 읽기 전용")).toBeVisible();
  await page
    .getByRole("navigation", { name: "관리 메뉴" })
    .getByRole("link", { name: "신·인물" })
    .click();
  await page.getByRole("link", { name: "제우스 고치기" }).click();
  await page.getByLabel(/^별칭/).fill("데모가 바꾼 별칭");
  await page.getByRole("button", { name: "저장" }).click();
  await expect(
    page.getByRole("alert").filter({ hasText: "데모 계정은 둘러보기만 할 수 있어" }),
  ).toBeVisible();
  // 입력한 값은 그대로 남아 있습니다.
  await expect(page.getByLabel(/^별칭/)).toHaveValue("데모가 바꾼 별칭");

  await page.goto("/figures/zeus");
  await expect(page.getByText("하늘과 번개의 신")).toBeVisible();
});

test("관리자는 신을 만들고, 공개 사이트에서 확인한 뒤 지울 수 있습니다", async ({ page }) => {
  await login(page, "admin");
  await page.goto("/admin/figures/new");

  // 빈 칸으로 제출하면 칸마다 오류를 알려 줍니다.
  await page.getByRole("button", { name: "만들기" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "고칠 칸이" })).toBeVisible();
  await expect(page.getByLabel(/^이름/)).toHaveAttribute("aria-invalid", "true");

  await page.getByLabel(/^이름/).fill("헤르메스");
  await page.getByLabel(/^영문 이름/).fill("Hermes");
  await page.getByLabel(/^주소 이름/).fill("hermes-e2e");
  await page.getByRole("combobox", { name: /신화 계열/ }).click();
  await page.getByRole("option", { name: "그리스 신화" }).click();
  await page.getByLabel(/^별칭/).fill("전령의 신");
  await page.getByLabel(/^계열 안 순서/).fill("6");
  await page.getByLabel(/^관장하는 영역/).fill("전령, 여행, 상업");
  await page.getByLabel(/^한 줄 소개/).fill("날개 달린 신발을 신은 신들의 전령입니다.");
  await page.getByLabel(/^소개/).fill("헤르메스는 제우스와 마이아의 아들입니다.");
  await page.getByRole("button", { name: "만들기" }).click();

  await expect(page).toHaveURL(/\/admin\/figures\?saved=hermes-e2e/);
  await expect(page.getByRole("status").filter({ hasText: "저장했습니다" })).toBeVisible();

  // 공개 페이지는 미리 그려 둔 페이지라, 저장 뒤 첫 요청은 이전 내용이고 곧 새 내용으로 바뀝니다.
  await expect(async () => {
    await page.goto("/pantheons/greek");
    await expect(page.getByRole("link", { name: /^헤르메스/ })).toBeVisible({ timeout: 1000 });
  }).toPass();
  await expect(async () => {
    await page.goto("/figures/hermes-e2e");
    await expect(page.getByRole("heading", { level: 1, name: "헤르메스" })).toBeVisible({
      timeout: 1000,
    });
  }).toPass();

  await page.goto("/admin/figures/hermes-e2e");
  await page.getByRole("button", { name: "삭제" }).click();
  await page.getByRole("alertdialog").getByRole("button", { name: "삭제" }).click();
  await expect(page).toHaveURL(/\/admin\/figures\?deleted=hermes-e2e/);
  await expect(async () => {
    expect((await page.goto("/figures/hermes-e2e"))?.status()).toBe(404);
  }).toPass();
});

test("로그인하면 원래 보려던 어드민 화면으로 돌아갑니다", async ({ page }) => {
  await page.goto("/admin/works?saved=x");
  await expect(page).toHaveURL(/\/admin\/login\?next=/);
  await page.getByRole("button", { name: "데모 계정으로 둘러보기" }).click();
  await expect(page).toHaveURL("/admin/works?saved=x");
  await expect(page.getByRole("heading", { level: 1, name: "영향 작품" })).toBeVisible();
});

test("관리자는 신화 계열을 만들고 지울 수 있습니다. 신이 있는 계열은 지울 수 없습니다", async ({
  page,
}) => {
  await login(page, "admin");
  await page.goto("/admin/pantheons/new");
  await page.getByLabel(/^이름/).fill("켈트 신화");
  await page.getByLabel(/^영문 이름/).fill("Celtic");
  await page.getByLabel(/^주소 이름/).fill("celtic-e2e");
  await page.getByLabel(/^지역/).fill("아일랜드·브리튼");
  await page.getByLabel(/^가장 이른 문헌/).fill("「쿨리의 소 습격」");
  await page.getByLabel(/^시기 표기/).fill("12세기");
  await page.getByLabel(/^정렬용 연도/).fill("1100");
  await page.getByRole("combobox", { name: /대표 자료/ }).click();
  await page.getByRole("option", { name: "가네샤" }).click();
  await page.getByLabel(/^한 줄 소개/).fill("영웅 쿠훌린의 이야기가 전하는 신화입니다.");
  await page.getByLabel(/^소개/).fill("켈트 신화는 아일랜드의 중세 필사본으로 전합니다.");
  await page.getByRole("button", { name: "만들기" }).click();
  await expect(page).toHaveURL(/\/admin\/pantheons\?saved=celtic-e2e/);

  await expect(async () => {
    await page.goto("/");
    await expect(page.locator("#pantheons ol > li")).toHaveCount(13, { timeout: 1000 });
  }).toPass();

  await page.goto("/admin/pantheons/celtic-e2e");
  await page.getByRole("button", { name: "삭제" }).click();
  await page.getByRole("alertdialog").getByRole("button", { name: "삭제" }).click();
  await expect(page).toHaveURL(/\/admin\/pantheons\?deleted=celtic-e2e/);

  await page.goto("/admin/pantheons/greek");
  await page.getByRole("button", { name: "삭제" }).click();
  await page.getByRole("alertdialog").getByRole("button", { name: "삭제" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "신 13명이 있어" })).toBeVisible();
});

test("자료가 연결된 신은 지울 수 없습니다", async ({ page }) => {
  await login(page, "admin");
  await page.goto("/admin/figures/odin");
  await page.getByRole("button", { name: "삭제" }).click();
  await page.getByRole("alertdialog").getByRole("button", { name: "삭제" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "연결된 자료 3점" })).toBeVisible();
});

for (const path of [
  "/admin/login",
  "/admin",
  "/admin/figures",
  "/admin/figures/zeus",
  "/admin/works/new",
]) {
  test(`${path}: 접근성 위반이 없습니다 (axe)`, async ({ page }) => {
    if (path !== "/admin/login") await login(page, "demo");
    await page.goto(path);
    // 세션을 읽는 동안 로딩 표시가 먼저 나오므로, 화면 제목이 뜬 뒤에 검사합니다.
    await page.getByRole("heading", { level: 1 }).waitFor();
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(results.violations.map((violation) => `${violation.id}: ${violation.help}`)).toEqual([]);
  });
}

test("로그아웃하면 다시 로그인해야 합니다", async ({ page }) => {
  await login(page, "demo");
  await page.getByRole("button", { name: "로그아웃" }).click();
  await expect(page).toHaveURL("/admin/login");
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/login/);
});

// 같은 곳의 로그인을 잠그므로 반드시 마지막에 둡니다.
test("비밀번호를 5번 틀리면 맞는 비밀번호로도 15분 동안 로그인할 수 없습니다", async ({ page }) => {
  await page.goto("/admin/login");
  const password = page.getByLabel("관리자 비밀번호");
  // 제출이 끝나면 폼이 비워지므로, 매번 남은 횟수 안내가 바뀐 것을 확인한 뒤 다음 값을 입력합니다.
  for (let attempt = 1; attempt <= 5; attempt += 1) {
    await password.fill(`wrong-${attempt}`);
    await page.getByRole("button", { name: "로그인", exact: true }).click();
    const notice = attempt < 5 ? `${5 - attempt}번 더 틀리면` : "5번 틀려 15분 동안";
    await expect(page.getByRole("alert").filter({ hasText: notice })).toBeVisible();
  }
  await password.fill("e2e-password");
  await page.getByRole("button", { name: "로그인", exact: true }).click();
  await expect(
    page.getByRole("alert").filter({ hasText: "15분 동안 로그인할 수 없습니다" }),
  ).toBeVisible();
  await expect(page).toHaveURL(/\/admin\/login/);
});
