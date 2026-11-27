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

const { savePantheonAction, deletePantheonAction } = await import("./actions");
const { getPantheon, PANTHEON_TAG } = await import("@/entities/pantheon/index.server");

const valid = {
  slug: "celtic-test",
  name: "시험 신화",
  nameEn: "Test",
  region: "어딘가",
  continent: "europe",
  earliestSource: "시험 문헌",
  eraLabel: "기원전 1세기경",
  eraYear: "-100",
  summary: "테스트로 만든 계열입니다.",
  description: "첫 문단\n\n둘째 문단",
  coverExhibitId: "weighing-heart",
};

beforeEach(async () => {
  resetMockTables();
  jar.clear();
  updateTag.mockReset();
  await signInAs(jar, "admin");
});

describe("savePantheonAction", () => {
  it("데모 계정은 저장하지 않고 입력값을 그대로 돌려줍니다", async () => {
    jar.clear();
    await signInAs(jar, "demo");
    const state = await savePantheonAction(null, INITIAL_FORM_STATE, formDataOf(valid));
    expect(state.message).toContain("데모 계정은 둘러보기만");
    expect(state.values).toMatchObject({ name: "시험 신화" });
    expect(await getPantheon("celtic-test")).toBeNull();
  });

  it("새 계열은 주소 이름을, 고칠 때는 나머지 칸만 검사합니다", async () => {
    const created = await savePantheonAction(
      null,
      INITIAL_FORM_STATE,
      formDataOf({ ...valid, slug: "", eraYear: "옛날" }),
    );
    expect(Object.keys(created.fieldErrors ?? {}).sort()).toEqual(["eraYear", "slug"]);
    expect(created.message).toBe("입력값을 확인해 주세요. 고칠 칸이 2개 있습니다.");

    const updated = await savePantheonAction(
      "greek",
      INITIAL_FORM_STATE,
      formDataOf({ ...valid, slug: "", name: "" }),
    );
    expect(Object.keys(updated.fieldErrors ?? {})).toEqual(["name"]);
  });

  it("없는 대표 자료를 고르면 그 칸에 오류를 보여 줍니다", async () => {
    const state = await savePantheonAction(
      null,
      INITIAL_FORM_STATE,
      formDataOf({ ...valid, coverExhibitId: "no-such-exhibit" }),
    );
    expect(state.message).toBe("없는 자료입니다.");
    expect(state.fieldErrors).toEqual({ coverExhibitId: ["대표 자료를 다시 골라 주세요."] });
  });

  it("새로 만들면 캐시를 갱신하고 목록 주소(?saved=)로 이동합니다", async () => {
    await expect(
      savePantheonAction(null, INITIAL_FORM_STATE, formDataOf(valid)),
    ).rejects.toMatchObject({ url: "/admin/pantheons?saved=celtic-test" });
    expect(updateTag).toHaveBeenCalledWith(PANTHEON_TAG);
    expect(await getPantheon("celtic-test")).toMatchObject({
      name: "시험 신화",
      eraYear: -100,
      description: ["첫 문단", "둘째 문단"],
    });
  });

  it("이미 있는 주소 이름이면 중복 오류를 돌려줍니다", async () => {
    const state = await savePantheonAction(
      null,
      INITIAL_FORM_STATE,
      formDataOf({ ...valid, slug: "greek" }),
    );
    expect(state.message).toBe("같은 주소 이름을 쓰는 계열이 이미 있습니다.");
    expect(state.fieldErrors?.slug?.[0]).toContain("'greek'은(는) 이미 쓰고 있습니다.");
  });

  it("고치면 원래 주소로 저장하고, 없는 계열이면 알립니다", async () => {
    await expect(
      savePantheonAction(
        "greek",
        INITIAL_FORM_STATE,
        formDataOf({ ...valid, name: "고친 그리스 신화" }),
      ),
    ).rejects.toMatchObject({ url: "/admin/pantheons?saved=greek" });
    expect((await getPantheon("greek"))?.name).toBe("고친 그리스 신화");
    expect(await getPantheon("celtic-test")).toBeNull();

    const state = await savePantheonAction("atlantis", INITIAL_FORM_STATE, formDataOf(valid));
    expect(state).toMatchObject({ status: "error", message: "없는 신화 계열입니다." });
  });
});

describe("deletePantheonAction", () => {
  it("데모 계정은 삭제할 수 없습니다", async () => {
    jar.clear();
    await signInAs(jar, "demo");
    expect((await deletePantheonAction("greek")).message).toContain("데모 계정");
  });

  it("속한 신이 있으면 삭제를 거부합니다", async () => {
    const state = await deletePantheonAction("greek");
    expect(state.status).toBe("error");
    expect(state.message).toMatch(/^이 계열에 신 \d+명이 있어 삭제할 수 없습니다/);
    expect(await getPantheon("greek")).not.toBeNull();
  });

  it("속한 신이 없으면 지우고 목록 주소(?deleted=)로 이동합니다", async () => {
    await expect(
      savePantheonAction(null, INITIAL_FORM_STATE, formDataOf(valid)),
    ).rejects.toMatchObject({ url: "/admin/pantheons?saved=celtic-test" });
    await expect(deletePantheonAction("celtic-test")).rejects.toMatchObject({
      url: "/admin/pantheons?deleted=celtic-test",
    });
    expect(await getPantheon("celtic-test")).toBeNull();
  });
});
