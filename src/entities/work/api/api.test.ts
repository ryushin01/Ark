// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createFakeSupabase } from "@/shared/api/index.test-utils";

import type { WorkInput } from "../model/schema";

vi.mock("server-only", () => ({}));

/** 캐시를 얼마나 오래 잡았는지 봅니다. */
const cacheLife = vi.fn();
vi.mock("next/cache", () => ({ cacheLife, cacheTag: () => {} }));

/** Supabase `works` 테이블을 메모리 가짜로 흉내 냅니다. */
const fake = createFakeSupabase();
vi.mock("@/shared/api/supabase.server", () => ({ getSupabase: () => fake.client }));

const { workRepository } = await import("./table");
const { getPublishedWorks, getWork, getWorks, getWorksByFigure } = await import("./queries");
const { createWork, deleteWork, setWorkImages, updateWork } = await import("./mutations");
const { MOCK_WORKS } = await import("./mock-data");

const input: WorkInput = {
  slug: "test-work",
  title: "시험 작품",
  titleOriginal: "Test Work",
  medium: "novel",
  year: 2001,
  creator: null,
  summary: null,
  figureSlugs: ["odin"],
  status: "draft",
};
const image = {
  src: "/images/works/test.jpg",
  width: 640,
  height: 480,
  alt: "시험 작품의 표지",
  credit: {
    artist: null,
    license: "CC0",
    licenseUrl: null,
    sourceUrl: "https://example.com/test.jpg",
  },
};

beforeEach(async () => {
  fake.reset();
  cacheLife.mockReset();
  for (const work of MOCK_WORKS) await workRepository.insert(work);
});

describe("작품 조회", () => {
  it("비공개를 포함한 모든 작품을 돌려주고, 행 ↔ 모델 왕복해도 같습니다", async () => {
    expect(fake.rows("works")[0]).toHaveProperty("title_original");
    expect(await getWorks()).toEqual(MOCK_WORKS);
    expect(cacheLife).toHaveBeenCalledWith("hours");
  });

  it("공개 화면에는 공개 작품만, 신별로는 그 신이 나오는 공개 작품만 보여 줍니다", async () => {
    const published = await getPublishedWorks();
    expect(published.length).toBeGreaterThan(0);
    expect(published.length).toBeLessThan(MOCK_WORKS.length);
    expect(published.every((work) => work.status === "published")).toBe(true);

    await createWork(input);
    const odin = await getWorksByFigure("odin");
    expect(odin.length).toBeGreaterThan(0);
    expect(odin.every((work) => work.figureSlugs.includes("odin"))).toBe(true);
    expect(odin.map((work) => work.slug)).not.toContain("test-work");
  });

  it("slug로 하나를 찾고(비공개 포함), 없는 slug는 null입니다", async () => {
    await createWork(input);
    expect((await getWork("test-work"))?.status).toBe("draft");
    expect(await getWork("none")).toBeNull();
  });

  it("Supabase를 읽지 못하면 시드로 대신하고 캐시를 짧게 잡습니다", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    fake.fail("select", { message: "timeout" });
    expect(await getWorks()).toEqual(MOCK_WORKS);
    expect(workRepository.servingFallback()).toBe(true);
    // 키로 찾는 읽기(어드민 수정 화면)도 시드로 대신합니다.
    expect(await workRepository.find(MOCK_WORKS[0].slug)).toEqual(MOCK_WORKS[0]);
    expect(cacheLife).toHaveBeenCalledWith("minutes");
  });
});

describe("작품 저장", () => {
  it("이미지 없이 만들고, 같은 slug는 duplicate입니다", async () => {
    expect(await createWork(input)).toEqual({ ...input, images: [] });
    expect(await createWork(input)).toBe("duplicate");
  });

  it("고쳐도 slug와 이미지는 그대로이고, 없는 작품은 null입니다", async () => {
    await createWork(input);
    await setWorkImages("test-work", [image]);
    const updated = await updateWork("test-work", {
      ...input,
      slug: "changed",
      title: "고친 제목",
    });
    expect(updated).toEqual({ ...input, title: "고친 제목", images: [image] });
    expect(await getWork("test-work")).toEqual(updated);
    expect(await getWork("changed")).toBeNull();
    expect(await updateWork("none", input)).toBeNull();
  });

  it("이미지 목록을 바꾸고, 없는 작품은 null입니다", async () => {
    await createWork(input);
    expect((await setWorkImages("test-work", [image]))?.images).toEqual([image]);
    expect((await setWorkImages("test-work", []))?.images).toEqual([]);
    expect(await setWorkImages("none", [image])).toBeNull();
  });

  it("지운 작품은 다시 찾을 수 없습니다", async () => {
    const { slug } = MOCK_WORKS[0];
    expect(await deleteWork(slug)).toBe(true);
    expect(await getWork(slug)).toBeNull();
    expect(await deleteWork(slug)).toBe(false);
  });
});
