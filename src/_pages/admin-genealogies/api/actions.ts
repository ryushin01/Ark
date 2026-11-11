"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";

import { getFigures } from "@/entities/figure/index.server";
import {
  GENEALOGY_TAG,
  genealogyInputSchema,
  saveGenealogy,
  slugsIn,
} from "@/entities/genealogy/index.server";
import { getPantheon } from "@/entities/pantheon/index.server";
import { checkWritePermission } from "@/shared/auth/index.server";
import { type FormState, readForm, toFieldErrors, withValues } from "@/shared/lib";

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

  if (!(await getPantheon(pantheonSlug))) {
    return withValues({ status: "error", message: "없는 신화 계열입니다." }, values);
  }

  const parsed = genealogyInputSchema.safeParse(values);
  if (!parsed.success) return withValues(toFieldErrors(parsed.error), values);

  const known = new Set((await getFigures()).map((figure) => figure.slug));
  const unknown = [...new Set(slugsIn(parsed.data.roots))].filter((slug) => !known.has(slug));
  if (unknown.length > 0) {
    return withValues(
      {
        status: "error",
        message: "Ark에 없는 신·인물 주소가 있습니다.",
        fieldErrors: { roots: [`없는 주소: ${unknown.join(", ")}`] },
      },
      values,
    );
  }

  await saveGenealogy({ pantheonSlug, ...parsed.data });
  updateTag(GENEALOGY_TAG);
  redirect(`/admin/genealogies?saved=${encodeURIComponent(pantheonSlug)}`);
}
