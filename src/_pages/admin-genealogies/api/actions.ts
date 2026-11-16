"use server";

import { getFigures } from "@/entities/figure/index.server";
import {
  GENEALOGY_TAG,
  genealogyInputSchema,
  saveGenealogy,
  slugsIn,
} from "@/entities/genealogy/index.server";
import { getPantheon } from "@/entities/pantheon/index.server";
import { checkWritePermission } from "@/shared/auth/index.server";
import {
  fieldError,
  formError,
  type FormState,
  readForm,
  toFieldErrors,
  withValues,
} from "@/shared/lib";
import { finishAdminAction } from "@/shared/lib/index.server";

const FIELDS = ["source", "roots"] as const;

/** 계보 저장. 없으면 만들고, 있으면 고칩니다. 계보 속 신 주소는 Ark에 있어야 합니다. */
export async function saveGenealogyAction(
  pantheonSlug: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const values = readForm(formData, FIELDS);
  const denied = await checkWritePermission();
  if (denied) return withValues(denied, values);

  if (!(await getPantheon(pantheonSlug))) return formError(values, "없는 신화 계열입니다.");

  const parsed = genealogyInputSchema.safeParse(values);
  if (!parsed.success) return withValues(toFieldErrors(parsed.error), values);

  const known = new Set((await getFigures()).map((figure) => figure.slug));
  const unknown = [...new Set(slugsIn(parsed.data.roots))].filter((slug) => !known.has(slug));
  if (unknown.length > 0) {
    return fieldError(
      values,
      "Ark에 없는 신·인물 주소가 있습니다.",
      "roots",
      `없는 주소: ${unknown.join(", ")}`,
    );
  }

  await saveGenealogy({ pantheonSlug, ...parsed.data });
  finishAdminAction(GENEALOGY_TAG, "/admin/genealogies", "saved", pantheonSlug);
}
