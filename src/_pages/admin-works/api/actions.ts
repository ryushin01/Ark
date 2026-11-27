"use server";

import { getFigures } from "@/entities/figure/index.server";
import {
  createWork,
  deleteWork,
  getWork,
  updateWork,
  WORK_TAG,
  workInputSchema,
} from "@/entities/work/index.server";
import { removeStoredImage } from "@/shared/api/index.server";
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
  "title",
  "titleOriginal",
  "medium",
  "year",
  "creator",
  "summary",
  "status",
] as const;

const LIST = "/admin/works";

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
    return fieldError(
      values,
      "공개하려면 신화와의 관계를 설명하는 소개가 필요합니다.",
      "summary",
      "공개할 작품은 소개를 입력해 주세요. 확인 중이면 비공개로 두세요.",
    );
  }

  if (originalSlug) {
    if (!(await updateWork(originalSlug, input))) {
      return formError(values, "이미 삭제된 작품입니다.");
    }
  } else if ((await createWork(input)) === "duplicate") {
    return duplicateKeyError(values, "같은 주소 이름을 쓰는 작품이 이미 있습니다.", input.slug);
  }

  finishAdminAction(WORK_TAG, LIST, "saved", input.slug);
}

export async function deleteWorkAction(slug: string): Promise<FormState> {
  const denied = await checkWritePermission();
  if (denied) return denied;
  const work = await getWork(slug);
  // 그림 파일은 DB에서 작품을 지운 뒤에 지웁니다(지우기가 실패하면 그림이 그대로 보이게).
  if (await deleteWork(slug)) {
    for (const image of work?.images ?? []) await removeStoredImage(image.src);
  }
  finishAdminAction(WORK_TAG, LIST, "deleted", slug);
}
