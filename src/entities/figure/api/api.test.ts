// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createFakeSupabase } from "@/shared/api/index.test-utils";

import type { FigureInput } from "../model/schema";

vi.mock("server-only", () => ({}));

/** 캐시를 얼마나 오래 잡았는지 봅니다. */
const cacheLife = vi.fn();
vi.mock("next/cache", () => ({ cacheLife, cacheTag: () => {} }));

/** Supabase `figures` 테이블을 메모리 가짜로 흉내 냅니다. */
const fake = createFakeSupabase();
vi.mock("@/shared/api/supabase.server", () => ({ getSupabase: () => fake.client }));

const { figureRepository } = await import("./table");
const { getFigure, getFigures, getFiguresByPantheon } = await import("./queries");
const { createFigure, deleteFigure, updateFigure } = await import("./mutations");
const { MOCK_FIGURES } = await import("./mock-data");

const input: FigureInput = {
  slug: "new-hero",
  pantheonSlug: "greek",
  kind: "monster",
  grade: "divine",
  name: "새 괴수",
  nameEn: "New Beast",
  epithet: "시험용 괴수",
  domains: ["바다", "폭풍"],
  summary: "한 줄 소개",
  description: ["첫 문단", "둘째 문단"],
  order: 99,
};

beforeEach(async () => {
  fake.reset();
  cacheLife.mockReset();
  for (const figure of MOCK_FIGURES) await figureRepository.insert(figure);
});

describe("신·인물 조회", () => {
  it("Supabase 행을 모델로 바꿔 돌려주고, 왕복해도 같습니다", async () => {
    expect(fake.rows("figures")[0]).toHaveProperty("sort_order");
    expect(await getFigures()).toEqual(MOCK_FIGURES);
    expect(cacheLife).toHaveBeenCalledWith("hours");
  });

  it("계열에 속한 신·인물만 정해 둔 순서대로 돌려줍니다", async () => {
    // 저장소가 순서를 뒤섞어 돌려줘도 order로 다시 정렬합니다.
    fake.rows("figures").reverse();
    const greek = await getFiguresByPantheon("greek");
    expect(greek.length).toBeGreaterThan(1);
    expect(greek.every((figure) => figure.pantheonSlug === "greek")).toBe(true);
    const orders = greek.map((figure) => figure.order);
    expect(orders).toEqual([...orders].sort((a, b) => a - b));
    expect(await getFiguresByPantheon("none")).toEqual([]);
  });

  it("slug로 하나를 찾고, 없는 slug는 null입니다", async () => {
    expect(await getFigure(MOCK_FIGURES[0].slug)).toEqual(MOCK_FIGURES[0]);
    expect(await getFigure("none")).toBeNull();
  });

  it("Supabase를 읽지 못하면 시드로 대신하고 캐시를 짧게 잡습니다", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    fake.fail("select", { message: "timeout" });
    expect(await getFigures()).toEqual(MOCK_FIGURES);
    expect(figureRepository.servingFallback()).toBe(true);
    // 키로 찾는 읽기(어드민 수정 화면)도 시드로 대신합니다.
    expect(await figureRepository.find(MOCK_FIGURES[0].slug)).toEqual(MOCK_FIGURES[0]);
    expect(cacheLife).toHaveBeenCalledWith("minutes");
  });
});

describe("신·인물 저장", () => {
  it("만들고, 같은 slug는 duplicate입니다", async () => {
    expect(await createFigure(input)).toEqual(input);
    expect(await figureRepository.find("new-hero")).toEqual(input);
    expect(await createFigure(input)).toBe("duplicate");
  });

  it("고쳐도 주소 이름(slug)은 바뀌지 않습니다", async () => {
    const { slug } = MOCK_FIGURES[0];
    const updated = await updateFigure(slug, { ...input, slug: "changed" });
    expect(updated).toEqual({ ...input, slug });
    expect(await figureRepository.find(slug)).toEqual({ ...input, slug });
    expect(await figureRepository.find("changed")).toBeNull();
    expect(await updateFigure("none", input)).toBeNull();
  });

  it("지운 신·인물은 다시 찾을 수 없습니다", async () => {
    const { slug } = MOCK_FIGURES[0];
    expect(await deleteFigure(slug)).toBe(true);
    expect(await getFigure(slug)).toBeNull();
    expect(await deleteFigure(slug)).toBe(false);
  });
});
