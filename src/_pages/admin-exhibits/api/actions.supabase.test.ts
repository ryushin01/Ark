// @vitest-environment node
import sharp from "sharp";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createFakeSupabase, FAKE_STORAGE_URL } from "@/shared/api/index.test-utils";
import {
  createCookieJar,
  formDataOf,
  resetMockTables,
  signInAs,
} from "@/shared/auth/index.test-utils";
import { INITIAL_FORM_STATE } from "@/shared/lib";

vi.mock("server-only", () => ({}));

const jar = createCookieJar();
vi.mock("next/cache", () => ({ updateTag: () => {}, cacheTag: () => {}, cacheLife: () => {} }));
vi.mock("next/headers", () => ({ cookies: async () => jar, headers: async () => new Headers() }));
vi.mock("next/server", () => ({ connection: async () => {} }));
vi.mock("next/navigation", async () => ({
  redirect: (await import("@/shared/auth/index.test-utils")).redirectTo,
}));

/**
 * Supabase를 연결한 상황(DB 테이블 + Storage)을 메모리 가짜 클라이언트로 흉내 냅니다.
 * 이미지 올리기·지우기(uploadImage·removeStoredImage)는 실제 코드를 그대로 씁니다.
 */
const fake = createFakeSupabase({ exhibits: "id" });
vi.mock("@/shared/api/supabase.server", () => ({
  getSupabase: () => fake.client,
  isSupabaseEnabled: () => true,
}));
/** 신 확인은 이 시험의 관심사가 아니므로 제우스만 있다고 둡니다. */
vi.mock("@/entities/figure/index.server", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/entities/figure/index.server")>()),
  getFigure: async (slug: string) => (slug === "zeus" ? { slug } : null),
}));

const { saveExhibitAction } = await import("./actions");
const { createExhibit, deleteExhibit, getExhibit, exhibitInputSchema } =
  await import("@/entities/exhibit/index.server");

const OLD_PATH = "exhibits/zeus-statue-1.jpg";
const fields = {
  id: "zeus-statue",
  figureSlug: "zeus",
  title: "제우스 조각",
  kind: "sculpture",
  dateLabel: "",
  holder: "",
  note: "",
  alt: "왕좌에 앉은 제우스 대리석 조각",
  artist: "",
  license: "Public domain",
  licenseUrl: "",
  sourceUrl: "https://commons.wikimedia.org/wiki/File:Zeus.jpg",
};

/** 실제로 읽을 수 있는 PNG 이미지 파일 */
async function pngFile() {
  const buffer = await sharp({
    create: { width: 20, height: 30, channels: 3, background: { r: 200, g: 120, b: 40 } },
  })
    .png()
    .toBuffer();
  return new File([new Uint8Array(buffer)], "zeus.png", { type: "image/png" });
}

/** 옛 그림 파일이 Storage에 있는 자료 하나를 넣어 둡니다. */
async function seedExhibit() {
  fake.files("images").add(OLD_PATH);
  await createExhibit("zeus-statue", exhibitInputSchema.parse(fields), {
    src: `${FAKE_STORAGE_URL}/images/${OLD_PATH}`,
    width: 800,
    height: 1200,
  });
}

beforeEach(async () => {
  fake.reset();
  resetMockTables();
  jar.clear();
  await signInAs(jar, "admin");
  await seedExhibit();
});
afterEach(() => {
  vi.restoreAllMocks();
});

describe("saveExhibitAction (Supabase 연결, 고치기)", () => {
  it("새 그림으로 바꾸면 DB를 고친 뒤 옛 그림 파일만 지웁니다", async () => {
    await expect(
      saveExhibitAction(
        "zeus-statue",
        INITIAL_FORM_STATE,
        formDataOf({ ...fields, image: await pngFile() }),
      ),
    ).rejects.toMatchObject({ url: "/admin/exhibits?saved=zeus-statue" });
    const [stored] = [...fake.files("images")];
    expect(fake.files("images").size).toBe(1);
    expect(stored).toMatch(/^exhibits\/zeus-statue-\d+\.jpg$/);
    expect(stored).not.toBe(OLD_PATH);
    expect((await getExhibit("zeus-statue"))?.image.src).toBe(
      `${FAKE_STORAGE_URL}/images/${stored}`,
    );
  });

  it("올리는 사이 자료가 지워지면 방금 올린 그림을 지우고 삭제 안내를 보여 줍니다", async () => {
    const bucket = fake.client.storage.from("images");
    vi.spyOn(fake.client.storage, "from").mockReturnValue({
      ...bucket,
      upload: async (...args) => {
        const result = await bucket.upload(...args);
        await deleteExhibit("zeus-statue");
        return result;
      },
    });
    const state = await saveExhibitAction(
      "zeus-statue",
      INITIAL_FORM_STATE,
      formDataOf({ ...fields, image: await pngFile() }),
    );
    expect(state).toMatchObject({ status: "error", message: "이미 삭제된 자료입니다." });
    // 옛 그림은 자료를 지운 쪽이 정리하므로 그대로 두고, 방금 올린 그림만 남지 않아야 합니다.
    expect([...fake.files("images")]).toEqual([OLD_PATH]);
  });

  it("DB 갱신이 실패하면 방금 올린 그림만 지우고 옛 그림은 남긴 채 오류를 그대로 냅니다", async () => {
    fake.fail("update", { message: "고칠 수 없음" });
    await expect(
      saveExhibitAction(
        "zeus-statue",
        INITIAL_FORM_STATE,
        formDataOf({ ...fields, image: await pngFile() }),
      ),
    ).rejects.toThrow(/고칠 수 없음/);
    expect([...fake.files("images")]).toEqual([OLD_PATH]);
    expect((await getExhibit("zeus-statue"))?.image.src).toBe(
      `${FAKE_STORAGE_URL}/images/${OLD_PATH}`,
    );
  });

  it("정리 삭제마저 실패해도 원래 안내를 보여 주고 서버 로그에 남깁니다", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    fake.fail("remove", { message: "Storage 응답 없음" });
    await deleteExhibit("zeus-statue");
    const state = await saveExhibitAction(
      "zeus-statue",
      INITIAL_FORM_STATE,
      formDataOf({ ...fields, image: await pngFile() }),
    );
    expect(state).toMatchObject({ status: "error", message: "이미 삭제된 자료입니다." });
    expect(error).toHaveBeenCalledWith(
      expect.stringMatching(/exhibits\/zeus-statue-\d+\.jpg.*Storage 응답 없음/),
    );
  });
});

describe("saveExhibitAction (Supabase 연결, 새 자료)", () => {
  it("DB 저장이 실패하면 방금 올린 그림을 지우고 오류를 그대로 냅니다", async () => {
    fake.fail("insert", { message: "권한 없음" });
    await expect(
      saveExhibitAction(
        null,
        INITIAL_FORM_STATE,
        formDataOf({ ...fields, id: "zeus-bust", image: await pngFile() }),
      ),
    ).rejects.toThrow(/권한 없음/);
    expect([...fake.files("images")]).toEqual([OLD_PATH]);
  });
});
