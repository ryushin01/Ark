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

const { saveGenealogyAction } = await import("./actions");
const { getGenealogy, GENEALOGY_TAG } = await import("@/entities/genealogy/index.server");

const roots = JSON.stringify([
  {
    name: "제우스",
    nameEn: "Zeus",
    slug: "zeus",
    unions: [{ partner: { name: "헤라", nameEn: "Hera" }, children: [] }],
  },
]);

beforeEach(async () => {
  resetMockTables();
  jar.clear();
  updateTag.mockReset();
  await signInAs(jar, "admin");
});

describe("saveGenealogyAction", () => {
  it("데모 계정은 저장하지 않고 입력값을 그대로 돌려줍니다", async () => {
    jar.clear();
    await signInAs(jar, "demo");
    const state = await saveGenealogyAction(
      "greek",
      INITIAL_FORM_STATE,
      formDataOf({ source: "시험 문헌", roots }),
    );
    expect(state.message).toContain("데모 계정은 둘러보기만");
    expect(state.values).toEqual({ source: "시험 문헌", roots });
  });

  it("없는 신화 계열이면 폼 오류를 돌려줍니다", async () => {
    const state = await saveGenealogyAction(
      "atlantis",
      INITIAL_FORM_STATE,
      formDataOf({ source: "시험 문헌", roots }),
    );
    expect(state).toMatchObject({ status: "error", message: "없는 신화 계열입니다." });
  });

  it("JSON 형식이 틀리면 계보 칸에 오류를 보여 줍니다", async () => {
    const state = await saveGenealogyAction(
      "greek",
      INITIAL_FORM_STATE,
      formDataOf({ source: "", roots: "[{" }),
    );
    expect(state.fieldErrors?.source).toEqual(["따른 문헌을 입력해 주세요."]);
    expect(state.fieldErrors?.roots?.[0]).toContain("JSON 형식이 올바르지 않습니다.");
  });

  it("Ark에 없는 신 주소가 있으면 그 주소를 알려 줍니다", async () => {
    const unknown = JSON.stringify([
      { name: "가짜", nameEn: "Fake", slug: "fake-god" },
      { name: "가짜", nameEn: "Fake", slug: "fake-god" },
    ]);
    const state = await saveGenealogyAction(
      "greek",
      INITIAL_FORM_STATE,
      formDataOf({ source: "시험 문헌", roots: unknown }),
    );
    expect(state.message).toBe("Ark에 없는 신·인물 주소가 있습니다.");
    expect(state.fieldErrors).toEqual({ roots: ["없는 주소: fake-god"] });
  });

  it("저장하면 캐시를 갱신하고 목록 주소(?saved=)로 이동합니다", async () => {
    await expect(
      saveGenealogyAction("greek", INITIAL_FORM_STATE, formDataOf({ source: "시험 문헌", roots })),
    ).rejects.toMatchObject({ url: "/admin/genealogies?saved=greek" });
    expect(updateTag).toHaveBeenCalledWith(GENEALOGY_TAG);
    expect(await getGenealogy("greek")).toMatchObject({
      pantheonSlug: "greek",
      source: "시험 문헌",
      roots: [{ name: "제우스", slug: "zeus" }],
    });
  });
});
