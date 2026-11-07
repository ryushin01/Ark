"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";

import {
  deleteExhibit,
  EXHIBIT_TAG,
  exhibitInputSchema,
  updateExhibit,
} from "@/entities/exhibit/index.server";
import { getFigure } from "@/entities/figure/index.server";
import { getPantheons } from "@/entities/pantheon/index.server";
import { checkWritePermission } from "@/shared/auth/index.server";
import { type FormState, readForm, toFieldErrors, withValues } from "@/shared/lib";

const FIELDS = [
  "figureSlug",
  "title",
  "kind",
  "dateLabel",
  "holder",
  "note",
  "alt",
  "artist",
  "license",
  "sourceUrl",
] as const;

/** 자료의 설명과 출처를 고칩니다. */
export async function saveExhibitAction(
  id: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const values = readForm(formData, FIELDS);
  const denied = await checkWritePermission();
  if (denied) return withValues(denied, values);

  const parsed = exhibitInputSchema.safeParse(values);
  if (!parsed.success) return withValues(toFieldErrors(parsed.error), values);

  if (!(await getFigure(parsed.data.figureSlug))) {
    return withValues(
      {
        status: "error",
        message: "없는 신입니다.",
        fieldErrors: { figureSlug: ["신을 다시 골라 주세요."] },
      },
      values,
    );
  }
  if (!(await updateExhibit(id, parsed.data))) {
    return withValues({ status: "error", message: "이미 삭제된 자료입니다." }, values);
  }

  updateTag(EXHIBIT_TAG);
  redirect(`/admin/exhibits?saved=${encodeURIComponent(id)}`);
}

/** 자료 삭제. 계열의 대표 자료로 쓰고 있으면 먼저 바꿔야 합니다. */
export async function deleteExhibitAction(id: string): Promise<FormState> {
  const denied = await checkWritePermission();
  if (denied) return denied;

  const covers = (await getPantheons()).filter((pantheon) => pantheon.coverExhibitId === id);
  if (covers.length > 0) {
    return {
      status: "error",
      message: `${covers.map((pantheon) => pantheon.name).join(", ")}의 대표 자료라서 삭제할 수 없습니다. 먼저 대표 자료를 바꿔 주세요.`,
    };
  }

  await deleteExhibit(id);
  updateTag(EXHIBIT_TAG);
  redirect(`/admin/exhibits?deleted=${encodeURIComponent(id)}`);
}
