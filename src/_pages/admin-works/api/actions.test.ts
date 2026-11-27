// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  createCookieJar,
  formDataOf,
  resetMockTables,
  signInAs,
} from "@/shared/auth/index.test-utils";
import { INITIAL_FORM_STATE } from "@/shared/lib";

vi.mock("server-only", () => ({}));

const jar = createCookieJar();
const updateTag = vi.fn();
vi.mock("next/cache", () => ({ updateTag, cacheTag: () => {}, cacheLife: () => {} }));
vi.mock("next/headers", () => ({ cookies: async () => jar, headers: async () => new Headers() }));
vi.mock("next/server", () => ({ connection: async () => {} }));
vi.mock("next/navigation", async () => ({
  redirect: (await import("@/shared/auth/index.test-utils")).redirectTo,
}));

const { saveWorkAction, deleteWorkAction } = await import("./actions");
const { getWork, WORK_TAG } = await import("@/entities/work/index.server");

const valid = {
  slug: "test-game",
  title: "시험 게임",
  titleOriginal: "Test Game",
  medium: "game",
  year: "2001",
  creator: "",
  summary: "오딘이 나옵니다.",
  status: "published",
  figureSlugs: ["odin"],
};

beforeEach(async () => {
  resetMockTables();
  jar.clear();
  updateTag.mockReset();
  await signInAs(jar, "admin");
});

describe("saveWorkAction", () => {
  it("데모 계정은 저장하지 않고 입력값을 그대로 돌려줍니다", async () => {
    jar.clear();
    await signInAs(jar, "demo");
    const state = await saveWorkAction(null, INITIAL_FORM_STATE, formDataOf(valid));
    expect(state.message).toContain("데모 계정은 둘러보기만");
    expect(state.values).toMatchObject({ title: "시험 게임" });
    expect(await getWork("test-game")).toBeNull();
  });

  it("잘못된 입력은 칸별 오류와 입력값을 돌려줍니다", async () => {
    const state = await saveWorkAction(
      null,
      INITIAL_FORM_STATE,
      formDataOf({ ...valid, title: "", year: "1800" }),
    );
    expect(state.fieldErrors?.title).toEqual(["작품 이름을 입력해 주세요."]);
    expect(state.fieldErrors?.year).toEqual(["발표 연도를 확인해 주세요."]);
    expect(state.values).toMatchObject({ year: "1800" });
  });

  it("공개할 작품에 소개가 없으면 소개 칸에 오류를 보여 줍니다", async () => {
    const state = await saveWorkAction(
      null,
      INITIAL_FORM_STATE,
      formDataOf({ ...valid, summary: "  " }),
    );
    expect(state.message).toBe("공개하려면 신화와의 관계를 설명하는 소개가 필요합니다.");
    expect(state.fieldErrors?.summary?.[0]).toContain("확인 중이면 비공개로 두세요.");
  });

  it("비공개 작품은 소개 없이 저장되고, 없는 인물은 빠집니다", async () => {
    await expect(
      saveWorkAction(
        null,
        INITIAL_FORM_STATE,
        formDataOf({ ...valid, summary: "", status: "draft", figureSlugs: ["odin", "nobody"] }),
      ),
    ).rejects.toMatchObject({ url: "/admin/works?saved=test-game" });
    expect(updateTag).toHaveBeenCalledWith(WORK_TAG);
    expect(await getWork("test-game")).toMatchObject({
      status: "draft",
      summary: null,
      year: 2001,
      figureSlugs: ["odin"],
    });
  });

  it("이미 있는 주소 이름이면 중복 오류를 돌려줍니다", async () => {
    const state = await saveWorkAction(
      null,
      INITIAL_FORM_STATE,
      formDataOf({ ...valid, slug: "final-fantasy" }),
    );
    expect(state.message).toBe("같은 주소 이름을 쓰는 작품이 이미 있습니다.");
  });

  it("고치면 원래 주소로 저장하고, 사라진 작품이면 알립니다", async () => {
    await expect(
      saveWorkAction(
        "final-fantasy",
        INITIAL_FORM_STATE,
        formDataOf({ ...valid, slug: "", title: "고친 파이널 판타지" }),
      ),
    ).rejects.toMatchObject({ url: "/admin/works?saved=final-fantasy" });
    expect((await getWork("final-fantasy"))?.title).toBe("고친 파이널 판타지");

    const state = await saveWorkAction("gone-work", INITIAL_FORM_STATE, formDataOf(valid));
    expect(state).toMatchObject({ status: "error", message: "이미 삭제된 작품입니다." });
  });
});

describe("deleteWorkAction", () => {
  it("데모 계정은 삭제할 수 없습니다", async () => {
    jar.clear();
    await signInAs(jar, "demo");
    expect((await deleteWorkAction("final-fantasy")).message).toContain("데모 계정");
  });

  it("지우고 목록 주소(?deleted=)로 이동합니다", async () => {
    await expect(deleteWorkAction("final-fantasy")).rejects.toMatchObject({
      url: "/admin/works?deleted=final-fantasy",
    });
    expect(await getWork("final-fantasy")).toBeNull();
  });
});
