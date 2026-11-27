// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createFakeSupabase } from "@/shared/api/index.test-utils";

import type { RelicInput } from "../model/schema";

vi.mock("server-only", () => ({}));

/** 캐시를 얼마나 오래 잡았는지 봅니다. */
const cacheLife = vi.fn();
vi.mock("next/cache", () => ({ cacheLife, cacheTag: () => {} }));

/** Supabase `relics` 테이블을 메모리 가짜로 흉내 냅니다. */
const fake = createFakeSupabase();
vi.mock("@/shared/api/supabase.server", () => ({ getSupabase: () => fake.client }));

const { relicRepository } = await import("./table");
const { getRelic, getRelics } = await import("./queries");
const { createRelic, deleteRelic, updateRelic } = await import("./mutations");
const { MOCK_RELICS } = await import("./mock-data");

const input: RelicInput = {
  slug: "test-relic",
  name: "시험 망치",
  nameEn: "Test hammer",
  kind: "weapon",
  figureSlugs: ["thor"],
  origin: "난쟁이가 벼렸습니다.",
  power: "던지면 돌아옵니다.",
  price: null,
  source: "시험 문헌",
  exhibitId: null,
  order: 1,
};

beforeEach(async () => {
  fake.reset();
  cacheLife.mockReset();
  for (const relic of MOCK_RELICS) await relicRepository.insert(relic);
});

describe("유물 조회", () => {
  it("전시 순서대로 돌려주고, 행 ↔ 모델 왕복해도 같습니다", async () => {
    expect(fake.rows("relics")[0]).toHaveProperty("figure_slugs");
    // 저장소가 순서를 뒤섞어 돌려줘도 order로 다시 정렬합니다.
    fake.rows("relics").reverse();
    expect(await getRelics()).toEqual(MOCK_RELICS);
    expect(cacheLife).toHaveBeenCalledWith("hours");
  });

  it("slug로 하나를 찾고, 없는 slug는 null입니다", async () => {
    expect(await getRelic(MOCK_RELICS[0].slug)).toEqual(MOCK_RELICS[0]);
    expect(await getRelic("none")).toBeNull();
  });

  it("Supabase를 읽지 못하면 시드로 대신하고 캐시를 짧게 잡습니다", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    fake.fail("select", { message: "timeout" });
    expect(await getRelics()).toEqual(MOCK_RELICS);
    expect(relicRepository.servingFallback()).toBe(true);
    // 키로 찾는 읽기(어드민 수정 화면)도 시드로 대신합니다.
    expect(await relicRepository.find(MOCK_RELICS[0].slug)).toEqual(MOCK_RELICS[0]);
    expect(cacheLife).toHaveBeenCalledWith("minutes");
  });
});

describe("유물 저장", () => {
  it("만들고, 같은 slug는 duplicate입니다", async () => {
    expect(await createRelic(input)).toEqual(input);
    expect(await getRelic("test-relic")).toEqual(input);
    expect(await createRelic(input)).toBe("duplicate");
  });

  it("고쳐도 주소 이름(slug)은 바뀌지 않고, 없는 유물은 null입니다", async () => {
    const { slug } = MOCK_RELICS[0];
    const updated = await updateRelic(slug, { ...input, slug: "changed" });
    expect(updated).toEqual({ ...input, slug });
    expect(await getRelic(slug)).toEqual(updated);
    expect(await getRelic("changed")).toBeNull();
    expect(await updateRelic("none", input)).toBeNull();
  });

  it("지운 유물은 다시 찾을 수 없습니다", async () => {
    const { slug } = MOCK_RELICS[0];
    expect(await deleteRelic(slug)).toBe(true);
    expect(await getRelic(slug)).toBeNull();
    expect(await deleteRelic(slug)).toBe(false);
  });
});
