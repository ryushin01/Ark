// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createFakeSupabase } from "@/shared/api/index.test-utils";

import type { ExhibitInput } from "../model/schema";

vi.mock("server-only", () => ({}));

/** 캐시를 얼마나 오래 잡았는지 봅니다. */
const cacheLife = vi.fn();
vi.mock("next/cache", () => ({ cacheLife, cacheTag: () => {} }));

/** Supabase `exhibits` 테이블을 메모리 가짜로 흉내 냅니다. */
const fake = createFakeSupabase({ exhibits: "id" });
vi.mock("@/shared/api/supabase.server", () => ({ getSupabase: () => fake.client }));

const { exhibitRepository } = await import("./table");
const { getExhibit, getExhibits, getExhibitsByFigure } = await import("./queries");
const { createExhibit, deleteExhibit, updateExhibit } = await import("./mutations");
const { MOCK_EXHIBITS } = await import("./mock-data");

const input: ExhibitInput = {
  figureSlug: "zeus",
  title: "새 제우스 조각",
  kind: "sculpture",
  dateLabel: "기원전 2세기",
  holder: "어느 박물관",
  note: null,
  alt: "왕좌에 앉은 제우스 대리석 조각",
  artist: null,
  license: "Public domain",
  licenseUrl: null,
  sourceUrl: "https://commons.wikimedia.org/wiki/File:Zeus.jpg",
};
const file = { src: "/images/exhibits/new-zeus.jpg", width: 800, height: 1200 };

beforeEach(async () => {
  fake.reset();
  cacheLife.mockReset();
  for (const exhibit of MOCK_EXHIBITS) await exhibitRepository.insert(exhibit);
});

describe("자료 조회", () => {
  it("Supabase 행을 모델로 바꿔 돌려주고, 왕복해도 같습니다", async () => {
    expect(fake.rows("exhibits")[0]).toHaveProperty("figure_slug");
    expect(await getExhibits()).toEqual(MOCK_EXHIBITS);
    expect(cacheLife).toHaveBeenCalledWith("hours");
  });

  it("신마다 자료를 모으고, 하나를 id로 찾습니다. 없는 id는 null입니다", async () => {
    const odin = await getExhibitsByFigure("odin");
    expect(odin.length).toBeGreaterThan(0);
    expect(odin.every((exhibit) => exhibit.figureSlug === "odin")).toBe(true);
    const first = MOCK_EXHIBITS[0];
    expect(await getExhibit(first.id)).toEqual(first);
    expect(await getExhibit("none")).toBeNull();
  });

  it("Supabase를 읽지 못하면 시드로 대신하고 캐시를 짧게 잡습니다", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    fake.fail("select", { message: "timeout" });
    expect(await getExhibits()).toEqual(MOCK_EXHIBITS);
    expect(exhibitRepository.servingFallback()).toBe(true);
    // 키로 찾는 읽기(어드민 수정 화면)도 시드로 대신합니다.
    expect(await exhibitRepository.find(MOCK_EXHIBITS[0].id)).toEqual(MOCK_EXHIBITS[0]);
    expect(cacheLife).toHaveBeenCalledWith("minutes");
  });
});

describe("자료 저장", () => {
  it("입력값과 파일로 이미지·출처를 묶어 만들고, 같은 id는 duplicate입니다", async () => {
    const created = await createExhibit("new-zeus", input, file);
    expect(created).toEqual({
      id: "new-zeus",
      figureSlug: "zeus",
      title: "새 제우스 조각",
      kind: "sculpture",
      dateLabel: "기원전 2세기",
      holder: "어느 박물관",
      note: null,
      image: {
        ...file,
        alt: input.alt,
        credit: {
          artist: null,
          license: "Public domain",
          licenseUrl: null,
          sourceUrl: input.sourceUrl,
        },
      },
    });
    expect(await exhibitRepository.find("new-zeus")).toEqual(created);
    expect(await createExhibit("new-zeus", input, file)).toBe("duplicate");
  });

  it("고칠 때 새 파일이 없으면 이미지 파일은 그대로 두고 설명·출처만 바꿉니다", async () => {
    const current = MOCK_EXHIBITS[0];
    const updated = await updateExhibit(current.id, { ...input, title: "고친 이름" });
    expect(updated?.id).toBe(current.id);
    expect(updated?.title).toBe("고친 이름");
    expect(updated?.image.src).toBe(current.image.src);
    expect(updated?.image.alt).toBe(input.alt);
    expect(updated?.image.credit.license).toBe("Public domain");
    expect(await exhibitRepository.find(current.id)).toEqual(updated);
  });

  it("새 파일이 있으면 이미지를 바꾸고, 없는 자료는 null입니다", async () => {
    const current = MOCK_EXHIBITS[0];
    const updated = await updateExhibit(current.id, input, file);
    expect(updated?.image).toMatchObject(file);
    expect(await updateExhibit("none", input)).toBeNull();
  });

  it("지운 자료는 다시 찾을 수 없습니다", async () => {
    const { id } = MOCK_EXHIBITS[0];
    expect(await deleteExhibit(id)).toBe(true);
    expect(await getExhibit(id)).toBeNull();
    expect(await deleteExhibit(id)).toBe(false);
  });
});
