"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";

import { getFigures } from "@/entities/figure/index.server";
import {
  createWork,
  deleteWork,
  updateWork,
  WORK_TAG,
  workInputSchema,
} from "@/entities/work/index.server";
import { checkWritePermission } from "@/shared/auth/index.server";
import { type FormState, readForm, toFieldErrors, withValues } from "@/shared/lib";

const FIELDS = [
  "slug",
  "title",
  "titleOriginal",
  "medium",
  "year",
  "creator",
  "summary",
  "status",
] as const;

/** 영향받은 작품 저장. originalSlug가 있으면 수정, 없으면 새로 만듭니다. */
export async function saveWorkAction(
  originalSlug: string | null,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const values = readForm(formData, FIELDS, ["figureSlugs"]);
  const denied = await checkWritePermission();
  if (denied) return withValues(denied, values);

  const parsed = workInputSchema.safeParse({ ...values, slug: originalSlug ?? values.slug });
  if (!parsed.success) return withValues(toFieldErrors(parsed.error), values);
  const input = parsed.data;

  const known = new Set((await getFigures()).map((figure) => figure.slug));
  input.figureSlugs = input.figureSlugs.filter((slug) => known.has(slug));

  if (input.status === "published" && !input.summary) {
    return withValues(
      {
        status: "error",
        message: "공개하려면 신화와의 관계를 설명하는 소개가 필요합니다.",
        fieldErrors: {
          summary: ["공개할 작품은 소개를 입력해 주세요. 확인 중이면 비공개로 두세요."],
        },
      },
      values,
    );
  }

  if (originalSlug) {
    if (!(await updateWork(originalSlug, input))) {
      return withValues({ status: "error", message: "이미 삭제된 작품입니다." }, values);
    }
  } else if ((await createWork(input)) === "duplicate") {
    return withValues(
      {
        status: "error",
        message: "같은 주소 이름을 쓰는 작품이 이미 있습니다.",
        fieldErrors: { slug: [`'${input.slug}'은(는) 이미 쓰고 있습니다.`] },
      },
      values,
    );
  }

  updateTag(WORK_TAG);
  redirect(`/admin/works?saved=${encodeURIComponent(input.slug)}`);
}

export async function deleteWorkAction(slug: string): Promise<FormState> {
  const denied = await checkWritePermission();
  if (denied) return denied;
  await deleteWork(slug);
  updateTag(WORK_TAG);
  redirect(`/admin/works?deleted=${encodeURIComponent(slug)}`);
}
