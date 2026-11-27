// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createFakeSupabase } from "@/shared/api/index.test-utils";

import type { NewPantheonInput, PantheonInput } from "../model/schema";

vi.mock("server-only", () => ({}));

/** 캐시를 얼마나 오래 잡았는지 봅니다. */
const cacheLife = vi.fn();
vi.mock("next/cache", () => ({ cacheLife, cacheTag: () => {} }));

/** Supabase `pantheons` 테이블을 메모리 가짜로 흉내 냅니다. */
const fake = createFakeSupabase();
vi.mock("@/shared/api/supabase.server", () => ({ getSupabase: () => fake.client }));

const { pantheonRepository } = await import("./table");
const { getPantheon, getPantheons } = await import("./queries");
const { createPantheon, deletePantheon, updatePantheon } = await import("./mutations");
const { MOCK_PANTHEONS } = await import("./mock-data");

const fields: PantheonInput = {
  name: "시험 신화",
  nameEn: "Test mythology",
  region: "어딘가",
  continent: "oceania",
  earliestSource: "시험 문헌",
  eraLabel: "기원전 9999년",
  eraYear: -9999,
  summary: "한 줄 소개",
  description: ["첫 문단"],
  coverExhibitId: "test-cover",
};
const input: NewPantheonInput = { slug: "test-pantheon", ...fields };

beforeEach(async () => {
  fake.reset();
  cacheLife.mockReset();
  for (const pantheon of MOCK_PANTHEONS) await pantheonRepository.insert(pantheon);
});

describe("신화 계열 조회", () => {
  it("가장 이른 문헌의 시기 순으로 돌려주고, 행 ↔ 모델 왕복해도 같습니다", async () => {
    expect(fake.rows("pantheons")[0]).toHaveProperty("era_year");
    const pantheons = await getPantheons();
    const years = pantheons.map((pantheon) => pantheon.eraYear);
    expect(years).toEqual([...years].sort((a, b) => a - b));
    expect(pantheons).toHaveLength(MOCK_PANTHEONS.length);
    for (const pantheon of MOCK_PANTHEONS) expect(pantheons).toContainEqual(pantheon);
    expect(cacheLife).toHaveBeenCalledWith("hours");
  });

  it("slug로 하나를 찾고, 없는 slug는 null입니다", async () => {
    expect(await getPantheon(MOCK_PANTHEONS[0].slug)).toEqual(MOCK_PANTHEONS[0]);
    expect(await getPantheon("none")).toBeNull();
  });

  it("Supabase를 읽지 못하면 시드로 대신하고 캐시를 짧게 잡습니다", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    fake.fail("select", { message: "timeout" });
    expect(await getPantheons()).toHaveLength(MOCK_PANTHEONS.length);
    expect(pantheonRepository.servingFallback()).toBe(true);
    // 키로 찾는 읽기(어드민 수정 화면)도 시드로 대신합니다.
    expect(await pantheonRepository.find(MOCK_PANTHEONS[0].slug)).toEqual(MOCK_PANTHEONS[0]);
    expect(cacheLife).toHaveBeenCalledWith("minutes");
  });
});

describe("신화 계열 저장", () => {
  it("만들면 가장 이른 계열로 맨 앞에 오고, 같은 slug는 duplicate입니다", async () => {
    expect(await createPantheon(input)).toEqual(input);
    expect((await getPantheons())[0]).toEqual(input);
    expect(await createPantheon(input)).toBe("duplicate");
  });

  it("고쳐도 slug는 그대로이고, 없는 계열은 null입니다", async () => {
    const current = MOCK_PANTHEONS[0];
    const updated = await updatePantheon(current.slug, fields);
    expect(updated).toEqual({ ...fields, slug: current.slug });
    expect(await getPantheon(current.slug)).toEqual(updated);
    expect(await updatePantheon("none", fields)).toBeNull();
  });

  it("지운 계열은 다시 찾을 수 없습니다", async () => {
    const { slug } = MOCK_PANTHEONS[0];
    expect(await deletePantheon(slug)).toBe(true);
    expect(await getPantheon(slug)).toBeNull();
    expect(await deletePantheon(slug)).toBe(false);
  });
});
