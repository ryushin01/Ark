import { figureTable } from "./table";

import type { FigureInput } from "../model/schema";
import type { Figure } from "../model/types";

import "server-only";

export async function createFigure(input: FigureInput): Promise<Figure | "duplicate"> {
  if (figureTable.find((row) => row.slug === input.slug)) return "duplicate";
  return figureTable.insert(input);
}

/** 주소 이름(slug)은 바꾸지 않습니다. 자료·작품이 slug로 신을 가리키기 때문입니다. */
export async function updateFigure(slug: string, input: FigureInput): Promise<Figure | null> {
  return figureTable.update((row) => row.slug === slug, { ...input, slug }) ?? null;
}

export async function deleteFigure(slug: string) {
  return figureTable.remove((row) => row.slug === slug);
}
