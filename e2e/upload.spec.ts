import { expect, type Page, test } from "@playwright/test";

/**
 * 이미지 업로드 (pnpm test:e2e:local-db)
 * 로컬 Supabase(DB·Storage)를 실제로 쓰므로, 실행 전에 db reset으로 시드 상태를 만듭니다.
 */
test.describe.configure({ mode: "serial" });
test.use({ reducedMotion: "reduce" });

const IMAGE = "public/images/exhibits/hero-lion.jpg";

async function loginAsAdmin(page: Page) {
  await page.goto("/admin/login");
  await page.getByLabel("관리자 비밀번호").fill("e2e-password");
  await page.getByRole("button", { name: "로그인", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1, name: "대시보드" })).toBeVisible();
  await expect(page.getByText("Supabase 데이터베이스에 저장하고")).toBeVisible();
}

test("새 자료를 이미지와 함께 만들면 공개 화면에 나오고, 지우면 사라집니다", async ({ page }) => {
  await loginAsAdmin(page);
  await page.goto("/admin/exhibits/new");
  await page.getByLabel(/^이미지/).setInputFiles(IMAGE);
  await page.getByLabel(/^자료 이름/).fill("업로드 확인 자료");
  await page.getByLabel(/^자료 id/).fill("upload-e2e");
  await page.getByRole("combobox", { name: /신·인물/ }).click();
  await page.getByRole("option", { name: "로키" }).click();
  await page.getByRole("combobox", { name: /분류/ }).click();
  await page.getByRole("option", { name: "부조" }).click();
  await page.getByLabel(/^대체 텍스트/).fill("사자를 끌어안은 영웅 부조 (업로드 확인)");
  await page.getByLabel(/^라이선스$|^라이선스 \*/).fill("Public domain");
  await page.getByLabel(/^원본 주소/).fill("https://commons.wikimedia.org/");
  await page.getByRole("button", { name: "만들기" }).click();
  await expect(page).toHaveURL(/\/admin\/exhibits\?saved=upload-e2e/);

  await expect(async () => {
    await page.goto("/figures/loki");
    const image = page.getByRole("img", { name: "사자를 끌어안은 영웅 부조 (업로드 확인)" });
    await expect(image).toBeAttached({ timeout: 1000 });
    expect(decodeURIComponent((await image.getAttribute("src")) ?? "")).toContain(
      "/storage/v1/object/public/images/exhibits/upload-e2e-",
    );
  }).toPass();

  await page.goto("/admin/exhibits/upload-e2e");
  await page.getByRole("button", { name: "삭제" }).click();
  await page.getByRole("alertdialog").getByRole("button", { name: "삭제" }).click();
  await expect(page).toHaveURL(/deleted=upload-e2e/);
});

test("작품 이미지를 추가하면 목록에 바로 나오고, 지우면 사라집니다", async ({ page }) => {
  await loginAsAdmin(page);
  await page.goto("/admin/works/fate-stay-night");
  await page.getByLabel(/^이미지 추가/).setInputFiles(IMAGE);
  await page.getByLabel(/^대체 텍스트/).fill("작품 이미지 업로드 확인");
  await page.getByLabel(/^권리 표기/).fill("Public domain");
  await page.getByLabel(/^출처 주소/).fill("https://commons.wikimedia.org/");
  await page.getByRole("button", { name: "이미지 추가", exact: true }).click();

  const image = page.getByRole("img", { name: "작품 이미지 업로드 확인" });
  await expect(image).toBeVisible();
  await page.getByRole("button", { name: "삭제" }).last().click();
  await page.getByRole("alertdialog").getByRole("button", { name: "삭제" }).click();
  await expect(image).toHaveCount(0);
});

test("4MB를 넘는 파일은 보내기 전에 막습니다", async ({ page }) => {
  await loginAsAdmin(page);
  await page.goto("/admin/exhibits/new");
  await page.getByLabel(/^이미지/).setInputFiles({
    name: "big.jpg",
    mimeType: "image/jpeg",
    buffer: Buffer.alloc(4 * 1024 * 1024 + 1),
  });
  await expect(page.getByText(/4MB 이하로 올려 주세요/)).toBeVisible();
});
