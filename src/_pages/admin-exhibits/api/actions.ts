"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";

import {
  createExhibit,
  deleteExhibit,
  EXHIBIT_TAG,
  exhibitInputSchema,
  getExhibit,
  updateExhibit,
} from "@/entities/exhibit/index.server";
import { getFigure } from "@/entities/figure/index.server";
import { getPantheons } from "@/entities/pantheon/index.server";
import { checkImageFile, removeStoredImage, uploadImage } from "@/shared/api/index.server";
import { checkWritePermission } from "@/shared/auth/index.server";
import { type FormState, readForm, SLUG_PATTERN, toFieldErrors, withValues } from "@/shared/lib";

const FIELDS = [
  "id",
  "figureSlug",
  "title",
  "kind",
  "dateLabel",
  "holder",
  "note",
  "alt",
  "artist",
  "license",
  "licenseUrl",
  "sourceUrl",
] as const;

/**
 * 자료 저장. originalId가 있으면 고치고(이미지 파일은 고를 때만 바꿈), 없으면 이미지와 함께 새로 만듭니다.
 */
export async function saveExhibitAction(
  originalId: string | null,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const values = readForm(formData, FIELDS);
  const denied = await checkWritePermission();
  if (denied) return withValues(denied, values);

  const id = originalId ?? String(values.id).trim();
  const file = formData.get("image");
  const hasFile = file instanceof File && file.size > 0;
  const fieldErrors: Record<string, string[]> = {};

  if (!originalId && !SLUG_PATTERN.test(id)) {
    fieldErrors.id = [
      "자료 id는 영문 소문자, 숫자, 하이픈(-)으로 입력해 주세요. 예) hermes-statue",
    ];
  }
  if (!originalId || hasFile) {
    const problem = checkImageFile(file);
    if (problem) fieldErrors.image = [problem];
  }

  const parsed = exhibitInputSchema.safeParse(values);
  if (!parsed.success) {
    const state = toFieldErrors(parsed.error);
    return withValues({ ...state, fieldErrors: { ...fieldErrors, ...state.fieldErrors } }, values);
  }
  if (Object.keys(fieldErrors).length > 0) {
    return withValues(
      {
        status: "error",
        message: `입력값을 확인해 주세요. 고칠 칸이 ${Object.keys(fieldErrors).length}개 있습니다.`,
        fieldErrors,
      },
      values,
    );
  }
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
  if (!originalId && (await getExhibit(id))) {
    return withValues(
      {
        status: "error",
        message: "같은 id의 자료가 이미 있습니다.",
        fieldErrors: { id: [`'${id}'은(는) 이미 쓰고 있습니다.`] },
      },
      values,
    );
  }

  let uploaded: Awaited<ReturnType<typeof uploadImage>> | null = null;
  if (hasFile) {
    uploaded = await uploadImage(file as File, `exhibits/${id}-${Date.now()}.jpg`);
    if (!uploaded.ok) {
      return withValues(
        { status: "error", message: uploaded.message, fieldErrors: { image: [uploaded.message] } },
        values,
      );
    }
  }

  if (originalId) {
    const before = await getExhibit(originalId);
    const saved = await updateExhibit(
      originalId,
      parsed.data,
      uploaded?.ok ? uploaded.image : undefined,
    );
    if (!saved) return withValues({ status: "error", message: "이미 삭제된 자료입니다." }, values);
    if (uploaded?.ok && before) await removeStoredImage(before.image.src);
  } else if (uploaded?.ok) {
    if ((await createExhibit(id, parsed.data, uploaded.image)) === "duplicate") {
      await removeStoredImage(uploaded.image.src);
      return withValues({ status: "error", message: "같은 id의 자료가 이미 있습니다." }, values);
    }
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

  const exhibit = await getExhibit(id);
  await deleteExhibit(id);
  if (exhibit) await removeStoredImage(exhibit.image.src);
  updateTag(EXHIBIT_TAG);
  redirect(`/admin/exhibits?deleted=${encodeURIComponent(id)}`);
}
