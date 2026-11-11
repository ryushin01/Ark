import { createRepository } from "@/shared/api/index.server";

import { MOCK_GENEALOGIES } from "./mock-data";

import type { Genealogy, GenealogyNode } from "../model/types";

import "server-only";

/** 계보 저장소 (Supabase `genealogies` 또는 메모리 목업) */
export const genealogyRepository = createRepository<"genealogies", Genealogy>({
  table: "genealogies",
  keyColumn: "pantheon_slug",
  keyOf: (genealogy) => genealogy.pantheonSlug,
  seed: MOCK_GENEALOGIES,
  toRow: (genealogy) => ({
    pantheon_slug: genealogy.pantheonSlug,
    source: genealogy.source,
    roots: genealogy.roots,
  }),
  fromRow: (row) => ({
    pantheonSlug: row.pantheon_slug,
    source: row.source,
    roots: row.roots as GenealogyNode[],
  }),
});
