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
vi.mock("next/cache", () => ({ updateTag, cacheTag: () => {}, cacheLife: () => {} }));
vi.mock("next/headers", () => ({ cookies: async () => jar, headers: async () => new Headers() }));
vi.mock("next/server", () => ({ connection: async () => {} }));
vi.mock("next/navigation", async () => ({
  redirect: (await import("@/shared/auth/index.test-utils")).redirectTo,
}));

/** Supabase Storage 대신 올린 결과를 정해 줍니다. 파일 검사(checkImageFile)는 실제 것을 씁니다. */
const uploadImage = vi.fn<UploadImage>();
const removeStoredImage = vi.fn<(src: string) => Promise<void>>();
vi.mock("@/shared/api/index.server", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/shared/api/index.server")>()),
  uploadImage,
  removeStoredImage,
}));

const { saveExhibitAction, deleteExhibitAction } = await import("./actions");
const { createExhibit, getExhibit, EXHIBIT_TAG, exhibitInputSchema } =
  await import("@/entities/exhibit/index.server");

const STORED = "https://db.example/storage/v1/object/public/images/exhibits/new.jpg";

const fields = {
  id: "test-exhibit",
  figureSlug: "zeus",
  title: "시험 자료",
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
const jpeg = () => new File([new Uint8Array(16)], "zeus.jpg", { type: "image/jpeg" });

beforeEach(async () => {
  resetMockTables();
  jar.clear();
  updateTag.mockReset();
  uploadImage.mockReset();
  uploadImage.mockResolvedValue({ ok: true, image: { src: STORED, width: 800, height: 1200 } });
  removeStoredImage.mockReset();
  removeStoredImage.mockResolvedValue();
  await signInAs(jar, "admin");
});

describe("saveExhibitAction (새 자료)", () => {
  it("데모 계정은 저장하지 않고 입력값을 그대로 돌려줍니다", async () => {
    jar.clear();
    await signInAs(jar, "demo");
    const state = await saveExhibitAction(
      null,
      INITIAL_FORM_STATE,
      formDataOf({ ...fields, image: jpeg() }),
    );
    expect(state.message).toContain("데모 계정은 둘러보기만");
    expect(state.values).toMatchObject({ id: "test-exhibit" });
    expect(uploadImage).not.toHaveBeenCalled();
  });

  it("id 형식과 이미지 파일이 틀리면 두 칸 모두 오류를 보여 줍니다", async () => {
    const state = await saveExhibitAction(
      null,
      INITIAL_FORM_STATE,
      formDataOf({ ...fields, id: "Bad Id" }),
    );
    expect(state.message).toBe("입력값을 확인해 주세요. 고칠 칸이 2개 있습니다.");
    expect(state.fieldErrors?.id?.[0]).toContain("자료 id는 영문 소문자");
    expect(state.fieldErrors?.image).toEqual(["이미지 파일을 골라 주세요."]);
  });

  it("스키마 오류와 id·이미지 오류를 함께 모아 돌려줍니다", async () => {
    const state = await saveExhibitAction(
      null,
      INITIAL_FORM_STATE,
      formDataOf({ ...fields, id: "Bad Id", title: "", image: new File(["x"], "a.gif") }),
    );
    expect(Object.keys(state.fieldErrors ?? {}).sort()).toEqual(["id", "image", "title"]);
    expect(state.fieldErrors?.image).toEqual(["JPG, PNG, WebP 이미지만 올릴 수 있습니다."]);
    expect(state.values).toMatchObject({ title: "" });
  });

  it("없는 신을 고르면 신 칸에 오류를 보여 줍니다", async () => {
    const state = await saveExhibitAction(
      null,
      INITIAL_FORM_STATE,
      formDataOf({ ...fields, figureSlug: "nobody", image: jpeg() }),
    );
    expect(state.message).toBe("없는 신입니다.");
    expect(state.fieldErrors).toEqual({ figureSlug: ["신을 다시 골라 주세요."] });
  });

  it("이미 있는 id면 올리기 전에 중복 오류를 돌려줍니다", async () => {
    const state = await saveExhibitAction(
      null,
      INITIAL_FORM_STATE,
      formDataOf({ ...fields, id: "weighing-heart", image: jpeg() }),
    );
    expect(state.message).toBe("같은 id의 자료가 이미 있습니다.");
    expect(state.fieldErrors?.id?.[0]).toContain("다른 id를 입력해 주세요.");
    expect(uploadImage).not.toHaveBeenCalled();
  });

  it("이미지를 올리지 못하면 이미지 칸에 그 이유를 보여 줍니다", async () => {
    uploadImage.mockResolvedValue({ ok: false, message: "이미지를 올리지 못했습니다: 가득 참" });
    const state = await saveExhibitAction(
      null,
      INITIAL_FORM_STATE,
      formDataOf({ ...fields, image: jpeg() }),
    );
    expect(state.fieldErrors).toEqual({ image: ["이미지를 올리지 못했습니다: 가득 참"] });
    expect(await getExhibit("test-exhibit")).toBeNull();
  });

  it("저장하면 올린 이미지로 자료를 만들고 목록 주소(?saved=)로 이동합니다", async () => {
    await expect(
      saveExhibitAction(null, INITIAL_FORM_STATE, formDataOf({ ...fields, image: jpeg() })),
    ).rejects.toMatchObject({ url: "/admin/exhibits?saved=test-exhibit" });
    expect(uploadImage).toHaveBeenCalledWith(
      expect.any(File),
      expect.stringMatching(/^exhibits\/test-exhibit-\d+\.jpg$/),
    );
    expect(updateTag).toHaveBeenCalledWith(EXHIBIT_TAG);
    expect(await getExhibit("test-exhibit")).toMatchObject({
      title: "시험 자료",
      image: { src: STORED, alt: fields.alt, credit: { license: "Public domain" } },
    });
  });

  it("올리는 사이 같은 id가 생기면 올린 이미지를 지우고 중복 오류를 돌려줍니다", async () => {
    const input = exhibitInputSchema.parse(fields);
    uploadImage.mockImplementation(async () => {
      await createExhibit("test-exhibit", input, { src: "/images/other.jpg", width: 1, height: 1 });
      return { ok: true, image: { src: STORED, width: 800, height: 1200 } };
    });
    const state = await saveExhibitAction(
      null,
      INITIAL_FORM_STATE,
      formDataOf({ ...fields, image: jpeg() }),
    );
    expect(state.message).toBe("같은 id의 자료가 이미 있습니다.");
    expect(removeStoredImage).toHaveBeenCalledWith(STORED);
  });
});

describe("saveExhibitAction (고치기)", () => {
  it("이미지를 고르지 않으면 설명만 고치고 이미지는 그대로 둡니다", async () => {
    const before = await getExhibit("weighing-heart");
    await expect(
      saveExhibitAction(
        "weighing-heart",
        INITIAL_FORM_STATE,
        formDataOf({ ...fields, id: "", figureSlug: before?.figureSlug ?? "", title: "고친 제목" }),
      ),
    ).rejects.toMatchObject({ url: "/admin/exhibits?saved=weighing-heart" });
    const after = await getExhibit("weighing-heart");
    expect(after?.title).toBe("고친 제목");
    expect(after?.image.src).toBe(before?.image.src);
    expect(uploadImage).not.toHaveBeenCalled();
    expect(removeStoredImage).not.toHaveBeenCalled();
  });

  it("새 이미지를 고르면 바꾸고 이전 이미지를 지웁니다", async () => {
    const before = await getExhibit("weighing-heart");
    await expect(
      saveExhibitAction(
        "weighing-heart",
        INITIAL_FORM_STATE,
        formDataOf({ ...fields, figureSlug: before?.figureSlug ?? "", image: jpeg() }),
      ),
    ).rejects.toMatchObject({ url: "/admin/exhibits?saved=weighing-heart" });
    expect((await getExhibit("weighing-heart"))?.image.src).toBe(STORED);
    expect(removeStoredImage).toHaveBeenCalledWith(before?.image.src);
  });

  it("사라진 자료를 고치면 알립니다", async () => {
    const state = await saveExhibitAction("gone-exhibit", INITIAL_FORM_STATE, formDataOf(fields));
    expect(state).toMatchObject({ status: "error", message: "이미 삭제된 자료입니다." });
  });
});

describe("deleteExhibitAction", () => {
  it("데모 계정은 삭제할 수 없습니다", async () => {
    jar.clear();
    await signInAs(jar, "demo");
    expect((await deleteExhibitAction("zeus-otricoli")).message).toContain("데모 계정");
  });

  it("계열의 대표 자료면 삭제를 거부합니다", async () => {
    const state = await deleteExhibitAction("weighing-heart");
    expect(state).toEqual({
      status: "error",
      message: "이집트 신화의 대표 자료라서 삭제할 수 없습니다. 먼저 대표 자료를 바꿔 주세요.",
    });
    expect(await getExhibit("weighing-heart")).not.toBeNull();
  });

  it("지우면 이미지도 지우고 목록 주소(?deleted=)로 이동합니다", async () => {
    const before = await getExhibit("zeus-otricoli");
    await expect(deleteExhibitAction("zeus-otricoli")).rejects.toMatchObject({
      url: "/admin/exhibits?deleted=zeus-otricoli",
    });
    expect(await getExhibit("zeus-otricoli")).toBeNull();
    expect(removeStoredImage).toHaveBeenCalledWith(before?.image.src);
  });

  it("이미 없는 자료는 이미지를 지우지 않고 목록으로 돌아갑니다", async () => {
    await expect(deleteExhibitAction("gone-exhibit")).rejects.toMatchObject({
      url: "/admin/exhibits?deleted=gone-exhibit",
    });
    expect(removeStoredImage).not.toHaveBeenCalled();
  });
});
