"use server";

import { refresh, updateTag } from "next/cache";
import { z } from "zod";

import { getWork, setWorkImages, WORK_TAG } from "@/entities/work/index.server";
import { checkImageFile, removeStoredImage, uploadImage } from "@/shared/api/index.server";
import { checkWritePermission } from "@/shared/auth/index.server";
import { type FormState, readForm, toFieldErrors, withValues } from "@/shared/lib";

const imageInfoSchema = z.object({
  alt: z
    .string()
    .trim()
    .min(5, "대체 텍스트는 이미지가 무엇을 보여 주는지 5자 이상으로 설명해 주세요."),
  artist: z
    .string()
    .trim()
    .transform((value) => value || null),
  license: z.string().trim().min(1, "권리 표기를 입력해 주세요. 예) © 2004 TYPE-MOON"),
  sourceUrl: z.url("출처 주소를 https://로 시작하는 주소로 입력해 주세요."),
});

/**
 * 작품 이미지 추가
 * 작품 일러스트는 저작권자가 있으므로 권리 표기와 출처를 반드시 함께 받습니다.
 * 아카이브는 기능 플래그로 숨겨져 있어, 플래그를 켜기 전까지 공개 화면에 나오지 않습니다.
 */
export async function addWorkImageAction(
  slug: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const values = readForm(formData, ["alt", "artist", "license", "sourceUrl"]);
  const denied = await checkWritePermission();
  if (denied) return withValues(denied, values);

  const file = formData.get("image");
  const fileProblem = checkImageFile(file);
  const parsed = imageInfoSchema.safeParse(values);
  if (!parsed.success || fileProblem) {
    const state = parsed.success
      ? { status: "error" as const, fieldErrors: {} }
      : toFieldErrors(parsed.error);
    const fieldErrors = { ...state.fieldErrors, ...(fileProblem ? { image: [fileProblem] } : {}) };
    return withValues(
      {
        status: "error",
        message: `입력값을 확인해 주세요. 고칠 칸이 ${Object.keys(fieldErrors).length}개 있습니다.`,
        fieldErrors,
      },
      values,
    );
  }

  const work = await getWork(slug);
  if (!work) return { status: "error", message: "이미 삭제된 작품입니다." };

  const uploaded = await uploadImage(file as File, `works/${slug}-${Date.now()}.jpg`);
  if (!uploaded.ok) {
    return withValues(
      { status: "error", message: uploaded.message, fieldErrors: { image: [uploaded.message] } },
      values,
    );
  }

  const { alt, artist, license, sourceUrl } = parsed.data;
  await setWorkImages(slug, [
    ...work.images,
    { ...uploaded.image, alt, credit: { artist, license, licenseUrl: null, sourceUrl } },
  ]);
  updateTag(WORK_TAG);
  // 같은 화면에 머무르므로, 이미지 목록이 새 데이터로 다시 그려지게 합니다.
  refresh();
  return { status: "success", message: "이미지를 추가했습니다.", submittedAt: Date.now() };
}

/** 작품 이미지 삭제 (Storage 파일도 지웁니다) */
export async function removeWorkImageAction(slug: string, src: string): Promise<FormState> {
  const denied = await checkWritePermission();
  if (denied) return denied;
  const work = await getWork(slug);
  if (!work) return { status: "error", message: "이미 삭제된 작품입니다." };
  await setWorkImages(
    slug,
    work.images.filter((image) => image.src !== src),
  );
  await removeStoredImage(src);
  updateTag(WORK_TAG);
  refresh();
  return { status: "success", message: "이미지를 삭제했습니다." };
}
