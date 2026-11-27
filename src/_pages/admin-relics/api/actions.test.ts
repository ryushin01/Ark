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

const { saveRelicAction, deleteRelicAction } = await import("./actions");
const { getRelic, RELIC_TAG } = await import("@/entities/relic/index.server");

const valid = {
  slug: "test-spear",
  name: "시험 창",
  nameEn: "Test Spear",
  kind: "weapon",
  origin: "대장장이가 만들었습니다.",
  power: "반드시 맞힙니다.",
  price: "",
  source: "시험 문헌",
  exhibitId: "none",
  order: "50",
  figureSlugs: ["odin"],
};

beforeEach(async () => {
  resetMockTables();
  jar.clear();
  updateTag.mockReset();
  await signInAs(jar, "admin");
});

describe("saveRelicAction", () => {
  it("데모 계정은 저장하지 않고 입력값을 그대로 돌려줍니다", async () => {
    jar.clear();
    await signInAs(jar, "demo");
    const state = await saveRelicAction(null, INITIAL_FORM_STATE, formDataOf(valid));
    expect(state.message).toContain("데모 계정은 둘러보기만");
    expect(state.values).toMatchObject({ name: "시험 창", figureSlugs: ["odin"] });
  });

  it("잘못된 입력은 칸별 오류와 입력값을 돌려줍니다", async () => {
    const state = await saveRelicAction(
      null,
      INITIAL_FORM_STATE,
      formDataOf({ ...valid, name: "", order: "0" }),
    );
    expect(Object.keys(state.fieldErrors ?? {}).sort()).toEqual(["name", "order"]);
    expect(state.values).toMatchObject({ order: "0" });
  });

  it("Ark에 없는 인물만 고르면 인물 칸에 오류를 보여 줍니다", async () => {
    const state = await saveRelicAction(
      null,
      INITIAL_FORM_STATE,
      formDataOf({ ...valid, figureSlugs: ["nobody"] }),
    );
    expect(state.fieldErrors).toEqual({
      figureSlugs: ["지닌 이나 관련 인물을 하나 이상 골라 주세요."],
    });
  });

  it("없는 소장 자료를 그림으로 고르면 오류를 보여 줍니다", async () => {
    const state = await saveRelicAction(
      null,
      INITIAL_FORM_STATE,
      formDataOf({ ...valid, exhibitId: "no-such-exhibit" }),
    );
    expect(state.message).toBe("그림으로 쓸 소장 자료를 찾지 못했습니다.");
    expect(state.fieldErrors?.exhibitId).toEqual(["목록에 있는 소장 자료를 고르거나 비워 두세요."]);
  });

  it("새로 만들면 없는 인물을 빼고 저장한 뒤 목록 주소(?saved=)로 이동합니다", async () => {
    await expect(
      saveRelicAction(
        null,
        INITIAL_FORM_STATE,
        formDataOf({ ...valid, figureSlugs: ["nobody", "odin"], exhibitId: "odin-sleipnir" }),
      ),
    ).rejects.toMatchObject({ url: "/admin/relics?saved=test-spear" });
    expect(updateTag).toHaveBeenCalledWith(RELIC_TAG);
    expect(await getRelic("test-spear")).toMatchObject({
      figureSlugs: ["odin"],
      exhibitId: "odin-sleipnir",
      price: null,
    });
  });

  it("이미 있는 주소 이름이면 중복 오류를 돌려줍니다", async () => {
    const state = await saveRelicAction(
      null,
      INITIAL_FORM_STATE,
      formDataOf({ ...valid, slug: "mjolnir" }),
    );
    expect(state.message).toBe("같은 주소 이름을 쓰는 유물이 이미 있습니다.");
  });

  it("고칠 때는 원래 인물 순서(대표 주인 먼저)를 지키고 새로 고른 이를 뒤에 붙입니다", async () => {
    const before = await getRelic("mjolnir");
    expect(before?.figureSlugs.slice(0, 2)).toEqual(["thor", "loki"]);
    await expect(
      saveRelicAction(
        "mjolnir",
        INITIAL_FORM_STATE,
        formDataOf({ ...valid, slug: "", figureSlugs: ["odin", "loki", "thor"] }),
      ),
    ).rejects.toMatchObject({ url: "/admin/relics?saved=mjolnir" });
    expect((await getRelic("mjolnir"))?.figureSlugs).toEqual(["thor", "loki", "odin"]);
  });

  it("사라진 유물을 고치면 알립니다", async () => {
    const state = await saveRelicAction("gone-relic", INITIAL_FORM_STATE, formDataOf(valid));
    expect(state).toMatchObject({ status: "error", message: "이미 삭제된 유물입니다." });
  });
});

describe("deleteRelicAction", () => {
  it("데모 계정은 삭제할 수 없습니다", async () => {
    jar.clear();
    await signInAs(jar, "demo");
    expect((await deleteRelicAction("mjolnir")).message).toContain("데모 계정");
    expect(await getRelic("mjolnir")).not.toBeNull();
  });

  it("지우고 목록 주소(?deleted=)로 이동합니다", async () => {
    await expect(deleteRelicAction("mjolnir")).rejects.toMatchObject({
      url: "/admin/relics?deleted=mjolnir",
    });
    expect(await getRelic("mjolnir")).toBeNull();
  });
});
