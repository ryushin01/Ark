"use server";

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
import {
  checkImageFile,
  removeStoredImage,
  type StoredImage,
  uploadImage,
} from "@/shared/api/index.server";
import { checkWritePermission } from "@/shared/auth/index.server";
import {
  duplicateKeyError,
  fieldError,
  fieldErrorsState,
  formError,
  type FormState,
  readForm,
  SLUG_PATTERN,
  toFieldErrors,
  withValues,
} from "@/shared/lib";
import { finishAdminAction } from "@/shared/lib/index.server";

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

const LIST = "/admin/exhibits";

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
  if (Object.keys(fieldErrors).length > 0) return withValues(fieldErrorsState(fieldErrors), values);
  if (!(await getFigure(parsed.data.figureSlug))) {
    return fieldError(values, "없는 신입니다.", "figureSlug", "신을 다시 골라 주세요.");
  }
  if (!originalId && (await getExhibit(id))) {
    return duplicateKeyError(values, "같은 id의 자료가 이미 있습니다.", id, "id");
  }

  let image: StoredImage | undefined;
  if (hasFile) {
    const uploaded = await uploadImage(file as File, `exhibits/${id}-${Date.now()}.jpg`);
    if (!uploaded.ok) return fieldError(values, uploaded.message, "image", uploaded.message);
    image = uploaded.image;
  }
  /** DB에 저장하지 못하면 방금 올린 이미지를 지웁니다(보상 삭제). 지우지 못해도 로그만 남깁니다. */
  const discardUpload = async () => {
    if (image) await removeStoredImage(image.src);
  };

  if (originalId) {
    const before = await getExhibit(originalId);
    let saved: Awaited<ReturnType<typeof updateExhibit>>;
    try {
      saved = await updateExhibit(originalId, parsed.data, image);
    } catch (error) {
      await discardUpload();
      throw error;
    }
    if (!saved) {
      await discardUpload();
      return formError(values, "이미 삭제된 자료입니다.");
    }
    // 옛 그림은 DB가 새 그림을 가리키게 된 뒤에만 지웁니다.
    if (image && before && before.image.src !== image.src) {
      await removeStoredImage(before.image.src);
    }
  } else if (image) {
    let created: Awaited<ReturnType<typeof createExhibit>>;
    try {
      created = await createExhibit(id, parsed.data, image);
    } catch (error) {
      await discardUpload();
      throw error;
    }
    if (created === "duplicate") {
      await discardUpload();
      return duplicateKeyError(values, "같은 id의 자료가 이미 있습니다.", id, "id");
    }
  }

  finishAdminAction(EXHIBIT_TAG, LIST, "saved", id);
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
  finishAdminAction(EXHIBIT_TAG, LIST, "deleted", id);
}
