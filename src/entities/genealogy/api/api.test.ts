// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createFakeSupabase } from "@/shared/api/index.test-utils";

import type { Genealogy } from "../model/types";

vi.mock("server-only", () => ({}));

/** 캐시를 얼마나 오래 잡았는지 봅니다. */
const cacheLife = vi.fn();
vi.mock("next/cache", () => ({ cacheLife, cacheTag: () => {} }));

/** Supabase `genealogies` 테이블을 메모리 가짜로 흉내 냅니다. */
const fake = createFakeSupabase({ genealogies: "pantheon_slug" });
vi.mock("@/shared/api/supabase.server", () => ({ getSupabase: () => fake.client }));

const { genealogyRepository } = await import("./table");
const { getGenealogies, getGenealogy } = await import("./queries");
const { saveGenealogy } = await import("./mutations");
const { MOCK_GENEALOGIES } = await import("./mock-data");

const celtic: Genealogy = {
  pantheonSlug: "test-celtic",
  source: "시험용 문헌",
  roots: [
    {
      name: "다누",
      nameEn: "Danu",
      unions: [{ partner: null, children: [{ name: "다그다", nameEn: "Dagda", slug: "dagda" }] }],
    },
  ],
};

beforeEach(async () => {
  fake.reset();
  cacheLife.mockReset();
  for (const genealogy of MOCK_GENEALOGIES) await genealogyRepository.insert(genealogy);
});

describe("계보 조회", () => {
  it("Supabase 행을 모델로 바꿔 돌려주고, 왕복해도 같습니다", async () => {
    expect(fake.rows("genealogies")[0]).toHaveProperty("pantheon_slug");
    expect(await getGenealogies()).toEqual(MOCK_GENEALOGIES);
    expect(cacheLife).toHaveBeenCalledWith("hours");
  });

  it("계열의 계보를 찾고, 없거나 사람이 없으면 null입니다", async () => {
    expect(await getGenealogy("greek")).toEqual(
      MOCK_GENEALOGIES.find((genealogy) => genealogy.pantheonSlug === "greek"),
    );
    expect(await getGenealogy("none")).toBeNull();
    await saveGenealogy({ pantheonSlug: "empty", source: "빈 계보", roots: [] });
    expect(await getGenealogy("empty")).toBeNull();
  });

  it("Supabase를 읽지 못하면 시드로 대신하고 캐시를 짧게 잡습니다", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    fake.fail("select", { message: "timeout" });
    expect(await getGenealogies()).toEqual(MOCK_GENEALOGIES);
    expect(genealogyRepository.servingFallback()).toBe(true);
    // 키로 찾는 읽기(어드민 수정 화면)도 시드로 대신합니다.
    expect(await genealogyRepository.find(MOCK_GENEALOGIES[0].pantheonSlug)).toEqual(
      MOCK_GENEALOGIES[0],
    );
    expect(cacheLife).toHaveBeenCalledWith("minutes");
  });
});

describe("계보 저장", () => {
  it("없으면 새로 만들고, 있으면 고칩니다", async () => {
    expect(await saveGenealogy(celtic)).toEqual(celtic);
    expect(await getGenealogy("test-celtic")).toEqual(celtic);

    const revised = { ...celtic, source: "고친 문헌" };
    expect(await saveGenealogy(revised)).toEqual(revised);
    expect(await getGenealogy("test-celtic")).toEqual(revised);
    expect(
      fake.rows("genealogies").filter((row) => row.pantheon_slug === "test-celtic"),
    ).toHaveLength(1);
  });
});
