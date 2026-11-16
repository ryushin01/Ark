"use server";

import { getExhibit } from "@/entities/exhibit/index.server";
import { getFiguresByPantheon } from "@/entities/figure/index.server";
import {
  createPantheon,
  deletePantheon,
  newPantheonInputSchema,
  PANTHEON_TAG,
  pantheonInputSchema,
  updatePantheon,
} from "@/entities/pantheon/index.server";
import { checkWritePermission } from "@/shared/auth/index.server";
import {
  duplicateKeyError,
  fieldError,
  formError,
  type FormState,
  readForm,
  toFieldErrors,
  withValues,
} from "@/shared/lib";
import { finishAdminAction } from "@/shared/lib/index.server";

const FIELDS = [
  "slug",
  "name",
  "nameEn",
  "region",
  "continent",
  "earliestSource",
  "eraLabel",
  "eraYear",
  "summary",
  "description",
  "coverExhibitId",
] as const;

const LIST = "/admin/pantheons";

/** 신화 계열 저장. originalSlug가 있으면 고치고, 없으면 새로 만듭니다. */
export async function savePantheonAction(
  originalSlug: string | null,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const values = readForm(formData, FIELDS);
  const denied = await checkWritePermission();
  if (denied) return withValues(denied, values);

  const parsed = originalSlug
    ? pantheonInputSchema.safeParse(values)
    : newPantheonInputSchema.safeParse(values);
  if (!parsed.success) return withValues(toFieldErrors(parsed.error), values);

  if (!(await getExhibit(parsed.data.coverExhibitId))) {
    return fieldError(
      values,
      "없는 자료입니다.",
      "coverExhibitId",
      "대표 자료를 다시 골라 주세요.",
    );
  }

  if (originalSlug) {
    if (!(await updatePantheon(originalSlug, parsed.data))) {
      return formError(values, "없는 신화 계열입니다.");
    }
    finishAdminAction(PANTHEON_TAG, LIST, "saved", originalSlug);
  }

  const input = newPantheonInputSchema.parse(values);
  if ((await createPantheon(input)) === "duplicate") {
    return duplicateKeyError(values, "같은 주소 이름을 쓰는 계열이 이미 있습니다.", input.slug);
  }
  finishAdminAction(PANTHEON_TAG, LIST, "saved", input.slug);
}

/** 신화 계열 삭제. 속한 신이 있으면 먼저 옮기거나 지워야 합니다. */
export async function deletePantheonAction(slug: string): Promise<FormState> {
  const denied = await checkWritePermission();
  if (denied) return denied;

  const figures = await getFiguresByPantheon(slug);
  if (figures.length > 0) {
    return {
      status: "error",
      message: `이 계열에 신 ${figures.length}명이 있어 삭제할 수 없습니다. 먼저 다른 계열로 옮기거나 지워 주세요.`,
    };
  }

  await deletePantheon(slug);
  finishAdminAction(PANTHEON_TAG, LIST, "deleted", slug);
}
