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

const { saveFigureAction, deleteFigureAction } = await import("./actions");
const { getFigure, getFigures, FIGURE_TAG } = await import("@/entities/figure/index.server");
const { getExhibits } = await import("@/entities/exhibit/index.server");
const { getWorks } = await import("@/entities/work/index.server");

const valid = {
  slug: "new-god",
  pantheonSlug: "greek",
  kind: "god",
  grade: "none",
  name: "새 신",
  nameEn: "New God",
  epithet: "시험의 신",
  domains: "시험, 검사",
  summary: "테스트로 만든 신입니다.",
  description: "첫 문단\n\n둘째 문단",
  order: "99",
};

beforeEach(async () => {
  resetMockTables();
  jar.clear();
  updateTag.mockReset();
  await signInAs(jar, "admin");
});

describe("saveFigureAction", () => {
  it("데모 계정은 저장하지 않고 입력값을 그대로 돌려줍니다", async () => {
    jar.clear();
    await signInAs(jar, "demo");
    const state = await saveFigureAction(null, INITIAL_FORM_STATE, formDataOf(valid));
    expect(state.status).toBe("error");
    expect(state.message).toContain("데모 계정은 둘러보기만");
    expect(state.values).toMatchObject({ slug: "new-god", name: "새 신" });
    expect(await getFigure("new-god")).toBeNull();
  });

  it("로그인이 끝났으면 다시 로그인하라고 알립니다", async () => {
    jar.clear();
    const state = await saveFigureAction(null, INITIAL_FORM_STATE, formDataOf(valid));
    expect(state.message).toBe("로그인이 끝났습니다. 다시 로그인해 주세요.");
  });

  it("잘못된 입력은 칸별 오류와 입력값을 돌려줍니다", async () => {
    const state = await saveFigureAction(
      null,
      INITIAL_FORM_STATE,
      formDataOf({ ...valid, slug: "Bad Slug", name: "" }),
    );
    expect(state.status).toBe("error");
    expect(state.fieldErrors?.slug?.[0]).toContain("주소 이름은 영문 소문자");
    expect(state.fieldErrors?.name).toEqual(["이름을 입력해 주세요."]);
    expect(state.values).toMatchObject({ slug: "Bad Slug" });
  });

  it("없는 신화 계열을 고르면 계열 칸에 오류를 보여 줍니다", async () => {
    const state = await saveFigureAction(
      null,
      INITIAL_FORM_STATE,
      formDataOf({ ...valid, pantheonSlug: "atlantis" }),
    );
    expect(state.message).toBe("없는 신화 계열입니다.");
    expect(state.fieldErrors).toEqual({ pantheonSlug: ["신화 계열을 다시 골라 주세요."] });
  });

  it("새로 만들면 캐시를 갱신하고 목록 주소(?saved=)로 이동합니다", async () => {
    await expect(
      saveFigureAction(null, INITIAL_FORM_STATE, formDataOf(valid)),
    ).rejects.toMatchObject({ url: "/admin/figures?saved=new-god" });
    expect(updateTag).toHaveBeenCalledWith(FIGURE_TAG);
    expect(await getFigure("new-god")).toMatchObject({
      name: "새 신",
      domains: ["시험", "검사"],
      description: ["첫 문단", "둘째 문단"],
    });
  });

  it("이미 있는 주소 이름이면 중복 오류를 돌려줍니다", async () => {
    const state = await saveFigureAction(
      null,
      INITIAL_FORM_STATE,
      formDataOf({ ...valid, slug: "zeus" }),
    );
    expect(state.message).toBe("같은 주소 이름을 쓰는 신이 이미 있습니다.");
    expect(state.fieldErrors?.slug?.[0]).toContain("'zeus'은(는) 이미 쓰고 있습니다.");
  });

  it("고칠 때는 원래 주소 이름을 쓰고, 사라진 신이면 알립니다", async () => {
    await expect(
      saveFigureAction(
        "zeus",
        INITIAL_FORM_STATE,
        formDataOf({ ...valid, slug: "ignored", name: "고친 제우스" }),
      ),
    ).rejects.toMatchObject({ url: "/admin/figures?saved=zeus" });
    expect((await getFigure("zeus"))?.name).toBe("고친 제우스");
    expect(await getFigure("ignored")).toBeNull();

    const state = await saveFigureAction("gone-god", INITIAL_FORM_STATE, formDataOf(valid));
    expect(state).toMatchObject({ status: "error", message: "이미 삭제된 신입니다." });
  });
});

describe("deleteFigureAction", () => {
  it("데모 계정은 삭제할 수 없습니다", async () => {
    jar.clear();
    await signInAs(jar, "demo");
    expect((await deleteFigureAction("zeus")).message).toContain("데모 계정");
    expect(await getFigure("zeus")).not.toBeNull();
  });

  it("연결된 자료나 작품이 있으면 삭제를 거부합니다", async () => {
    const state = await deleteFigureAction("zeus");
    expect(state.status).toBe("error");
    expect(state.message).toMatch(/^연결된 자료 \d+점, 작품 \d+개가 있어 삭제할 수 없습니다/);
    expect(await getFigure("zeus")).not.toBeNull();

    // 작품에만 연결된 신도 막습니다.
    const exhibits = await getExhibits();
    const workOnly = (await getWorks())
      .flatMap((work) => work.figureSlugs)
      .find((slug) => !exhibits.some((exhibit) => exhibit.figureSlug === slug));
    if (workOnly) expect((await deleteFigureAction(workOnly)).status).toBe("error");
  });

  it("연결이 없으면 지우고 목록 주소(?deleted=)로 이동합니다", async () => {
    // 시드의 신은 모두 자료가 있으므로, 연결 없는 신을 새로 만들어 지웁니다.
    await expect(
      saveFigureAction(null, INITIAL_FORM_STATE, formDataOf(valid)),
    ).rejects.toMatchObject({ url: "/admin/figures?saved=new-god" });
    const before = (await getFigures()).length;
    await expect(deleteFigureAction("new-god")).rejects.toMatchObject({
      url: "/admin/figures?deleted=new-god",
    });
    expect(await getFigure("new-god")).toBeNull();
    expect(await getFigures()).toHaveLength(before - 1);
  });
});
