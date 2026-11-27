// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  createCookieJar,
  formDataOf,
  resetMockTables,
  signInAs,
} from "@/shared/auth/index.test-utils";
import { INITIAL_FORM_STATE } from "@/shared/lib";

type UploadImage = (typeof import("@/shared/api/index.server"))["uploadImage"];

vi.mock("server-only", () => ({}));

const jar = createCookieJar();
const updateTag = vi.fn();
const refresh = vi.fn();
vi.mock("next/cache", () => ({ updateTag, refresh, cacheTag: () => {}, cacheLife: () => {} }));
vi.mock("next/headers", () => ({ cookies: async () => jar, headers: async () => new Headers() }));
vi.mock("next/server", () => ({ connection: async () => {} }));

/** Supabase Storage 대신 올린 결과를 정해 줍니다. 파일 검사(checkImageFile)는 실제 것을 씁니다. */
const uploadImage = vi.fn<UploadImage>();
const removeStoredImage = vi.fn<(src: string) => Promise<boolean>>();
vi.mock("@/shared/api/index.server", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/shared/api/index.server")>()),
  uploadImage,
  removeStoredImage,
}));

const { addWorkImageAction, removeWorkImageAction } = await import("./image-actions");
const { deleteWork, getWork, WORK_TAG } = await import("@/entities/work/index.server");

const STORED = "https://db.example/storage/v1/object/public/images/works/ff.jpg";
const info = {
  alt: "검을 든 주인공이 그려진 표지",
  artist: "",
  license: "© 1987 Square",
  sourceUrl: "https://example.com/ff",
};
const jpeg = () => new File([new Uint8Array(16)], "ff.jpg", { type: "image/jpeg" });

beforeEach(async () => {
  resetMockTables();
  jar.clear();
  updateTag.mockReset();
  refresh.mockReset();
  uploadImage.mockReset();
  uploadImage.mockResolvedValue({ ok: true, image: { src: STORED, width: 600, height: 900 } });
  removeStoredImage.mockReset();
  removeStoredImage.mockResolvedValue(true);
  await signInAs(jar, "admin");
});

describe("addWorkImageAction", () => {
  it("데모 계정은 올리지 않고 입력값을 그대로 돌려줍니다", async () => {
    jar.clear();
    await signInAs(jar, "demo");
    const state = await addWorkImageAction(
      "final-fantasy",
      INITIAL_FORM_STATE,
      formDataOf({ ...info, image: jpeg() }),
    );
    expect(state.message).toContain("데모 계정은 둘러보기만");
    expect(state.values).toEqual(info);
    expect(uploadImage).not.toHaveBeenCalled();
  });

  it("권리 표기·출처·파일이 빠지면 칸마다 오류를 보여 줍니다", async () => {
    const state = await addWorkImageAction(
      "final-fantasy",
      INITIAL_FORM_STATE,
      formDataOf({ alt: "짧음", artist: "", license: "", sourceUrl: "주소 아님" }),
    );
    expect(Object.keys(state.fieldErrors ?? {}).sort()).toEqual([
      "alt",
      "image",
      "license",
      "sourceUrl",
    ]);
    expect(state.fieldErrors?.image).toEqual(["이미지 파일을 골라 주세요."]);
  });

  it("정보는 맞고 파일만 틀려도 파일 칸에 오류를 보여 줍니다", async () => {
    const state = await addWorkImageAction(
      "final-fantasy",
      INITIAL_FORM_STATE,
      formDataOf({ ...info, image: new File(["x"], "a.txt", { type: "text/plain" }) }),
    );
    expect(state.fieldErrors).toEqual({ image: ["JPG, PNG, WebP 이미지만 올릴 수 있습니다."] });
  });

  it("사라진 작품이면 알립니다", async () => {
    const state = await addWorkImageAction(
      "gone-work",
      INITIAL_FORM_STATE,
      formDataOf({ ...info, image: jpeg() }),
    );
    expect(state).toEqual({ status: "error", message: "이미 삭제된 작품입니다." });
  });

  it("올리는 사이 작품이 지워지면 방금 올린 이미지를 지우고 삭제 안내를 보여 줍니다", async () => {
    uploadImage.mockImplementation(async () => {
      await deleteWork("final-fantasy");
      return { ok: true, image: { src: STORED, width: 600, height: 900 } };
    });
    const state = await addWorkImageAction(
      "final-fantasy",
      INITIAL_FORM_STATE,
      formDataOf({ ...info, image: jpeg() }),
    );
    expect(state).toEqual({ status: "error", message: "이미 삭제된 작품입니다." });
    expect(removeStoredImage).toHaveBeenCalledWith(STORED);
    expect(updateTag).not.toHaveBeenCalled();
  });

  it("올리지 못하면 파일 칸에 그 이유를 보여 줍니다", async () => {
    uploadImage.mockResolvedValue({ ok: false, message: "이미지를 읽지 못했습니다." });
    const state = await addWorkImageAction(
      "final-fantasy",
      INITIAL_FORM_STATE,
      formDataOf({ ...info, image: jpeg() }),
    );
    expect(state.fieldErrors).toEqual({ image: ["이미지를 읽지 못했습니다."] });
  });

  it("올리면 권리 표기와 함께 이미지를 붙이고 같은 화면을 새로 그립니다", async () => {
    const state = await addWorkImageAction(
      "final-fantasy",
      INITIAL_FORM_STATE,
      formDataOf({ ...info, image: jpeg() }),
    );
    expect(state).toMatchObject({ status: "success", message: "이미지를 추가했습니다." });
    expect((await getWork("final-fantasy"))?.images.at(-1)).toEqual({
      src: STORED,
      width: 600,
      height: 900,
      alt: info.alt,
      credit: { artist: null, license: info.license, licenseUrl: null, sourceUrl: info.sourceUrl },
    });
    expect(updateTag).toHaveBeenCalledWith(WORK_TAG);
    expect(refresh).toHaveBeenCalled();
  });
});

describe("removeWorkImageAction", () => {
  it("데모 계정은 지울 수 없습니다", async () => {
    jar.clear();
    await signInAs(jar, "demo");
    expect((await removeWorkImageAction("final-fantasy", STORED)).message).toContain("데모 계정");
  });

  it("사라진 작품이면 알립니다", async () => {
    expect(await removeWorkImageAction("gone-work", STORED)).toEqual({
      status: "error",
      message: "이미 삭제된 작품입니다.",
    });
  });

  it("목록에서 빼고 Storage 파일도 지웁니다", async () => {
    await addWorkImageAction(
      "final-fantasy",
      INITIAL_FORM_STATE,
      formDataOf({ ...info, image: jpeg() }),
    );
    const state = await removeWorkImageAction("final-fantasy", STORED);
    expect(state).toEqual({ status: "success", message: "이미지를 삭제했습니다." });
    expect((await getWork("final-fantasy"))?.images.some((image) => image.src === STORED)).toBe(
      false,
    );
    expect(removeStoredImage).toHaveBeenCalledWith(STORED);
    expect(refresh).toHaveBeenCalled();
  });
});
