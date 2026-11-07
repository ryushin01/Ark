"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";

import { getExhibit } from "@/entities/exhibit/index.server";
import {
  PANTHEON_TAG,
  pantheonInputSchema,
  updatePantheon,
} from "@/entities/pantheon/index.server";
import { checkWritePermission } from "@/shared/auth/index.server";
import { type FormState, readForm, toFieldErrors, withValues } from "@/shared/lib";

const FIELDS = [
  "name",
  "nameEn",
  "region",
  "earliestSource",
  "eraLabel",
  "eraYear",
  "summary",
  "description",
  "coverExhibitId",
] as const;

/** 신화 계열 저장. 계열은 고치기만 하고, 새로 만들거나 지우지 않습니다. */
export async function savePantheonAction(
  slug: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const values = readForm(formData, FIELDS);
  const denied = await checkWritePermission();
  if (denied) return withValues(denied, values);

  const parsed = pantheonInputSchema.safeParse(values);
  if (!parsed.success) return withValues(toFieldErrors(parsed.error), values);

  if (!(await getExhibit(parsed.data.coverExhibitId))) {
    return withValues(
      {
        status: "error",
        message: "없는 자료입니다.",
        fieldErrors: { coverExhibitId: ["대표 자료를 다시 골라 주세요."] },
      },
      values,
    );
  }
  if (!(await updatePantheon(slug, parsed.data))) {
    return withValues({ status: "error", message: "없는 신화 계열입니다." }, values);
  }

  updateTag(PANTHEON_TAG);
  redirect(`/admin/pantheons?saved=${encodeURIComponent(slug)}`);
}
