import sharp, { type OutputInfo } from "sharp";

import { getSupabase } from "./supabase.server";

import "server-only";

export const IMAGE_BUCKET = "images";
/** Vercel 함수의 요청 본문 한도(4.5MB) 안에 들어오도록 4MB로 제한합니다. */
export const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export type StoredImage = { src: string; width: number; height: number };

export type UploadResult = { ok: true; image: StoredImage } | { ok: false; message: string };

/** 폼에서 받은 파일이 올릴 수 있는 이미지인지 확인합니다. 문제가 없으면 null */
export function checkImageFile(file: unknown): string | null {
  if (!(file instanceof File) || file.size === 0) return "이미지 파일을 골라 주세요.";
  if (!ACCEPTED_TYPES.includes(file.type)) return "JPG, PNG, WebP 이미지만 올릴 수 있습니다.";
  if (file.size > MAX_IMAGE_BYTES) return "이미지는 4MB 이하로 올려 주세요.";
  return null;
}

/**
 * 이미지를 긴 변 1600px 이하 JPEG로 줄여 Supabase Storage에 올립니다.
 * path 예) exhibits/zeus-otricoli-1731000000000.jpg
 */
export async function uploadImage(file: File, path: string): Promise<UploadResult> {
  const supabase = getSupabase();
  if (!supabase) {
    return { ok: false, message: "이미지 업로드는 Supabase를 연결해야 쓸 수 있습니다." };
  }
  const problem = checkImageFile(file);
  if (problem) return { ok: false, message: problem };

  let output: { data: Buffer; info: OutputInfo };
  try {
    output = await sharp(Buffer.from(await file.arrayBuffer()))
      .rotate()
      .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 80, mozjpeg: true })
      .toBuffer({ resolveWithObject: true });
  } catch {
    return { ok: false, message: "이미지를 읽지 못했습니다. 다른 파일로 다시 시도해 주세요." };
  }

  const { error } = await supabase.storage
    .from(IMAGE_BUCKET)
    .upload(path, output.data, { contentType: "image/jpeg", upsert: false });
  if (error) return { ok: false, message: `이미지를 올리지 못했습니다: ${error.message}` };

  const { data } = supabase.storage.from(IMAGE_BUCKET).getPublicUrl(path);
  return {
    ok: true,
    image: { src: data.publicUrl, width: output.info.width, height: output.info.height },
  };
}

/** Storage에 올린 이미지면 지웁니다. 시드 이미지(/images/...)는 그대로 둡니다. */
export async function removeStoredImage(src: string) {
  const supabase = getSupabase();
  const marker = `/storage/v1/object/public/${IMAGE_BUCKET}/`;
  if (!supabase || !src.includes(marker)) return;
  await supabase.storage.from(IMAGE_BUCKET).remove([decodeURIComponent(src.split(marker)[1])]);
}
