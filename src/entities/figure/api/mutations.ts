import { figureRepository } from "./table";

import type { FigureInput } from "../model/schema";
import type { Figure } from "../model/types";

import "server-only";

export async function createFigure(input: FigureInput): Promise<Figure | "duplicate"> {
  return figureRepository.insert(input);
}

/** 주소 이름(slug)은 바꾸지 않습니다. 자료·작품이 slug로 신을 가리키기 때문입니다. */
export async function updateFigure(slug: string, input: FigureInput): Promise<Figure | null> {
  return figureRepository.update(slug, { ...input, slug });
}

export async function deleteFigure(slug: string) {
  return figureRepository.remove(slug);
}
