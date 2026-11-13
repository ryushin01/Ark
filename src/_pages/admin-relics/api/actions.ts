"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";

import { getExhibits } from "@/entities/exhibit/index.server";
import { getFigures } from "@/entities/figure/index.server";
import {
  createRelic,
  deleteRelic,
  RELIC_TAG,
  relicInputSchema,
  updateRelic,
} from "@/entities/relic/index.server";
import { checkWritePermission } from "@/shared/auth/index.server";
import { type FormState, readForm, toFieldErrors, withValues } from "@/shared/lib";

const FIELDS = [
  "slug",
  "name",
  "nameEn",
  "kind",
  "origin",
  "power",
  "price",
  "source",
  "exhibitId",
  "order",
] as const;

/** 유물 저장. originalSlug가 있으면 수정, 없으면 새로 만듭니다. */
export async function saveRelicAction(
  originalSlug: string | null,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const values = readForm(formData, FIELDS, ["figureSlugs"]);
  const denied = await checkWritePermission();
  if (denied) return withValues(denied, values);

  const parsed = relicInputSchema.safeParse({ ...values, slug: originalSlug ?? values.slug });
  if (!parsed.success) return withValues(toFieldErrors(parsed.error), values);
  const input = parsed.data;

  const [figures, exhibits] = await Promise.all([getFigures(), getExhibits()]);
  const known = new Set(figures.map((figure) => figure.slug));
  input.figureSlugs = input.figureSlugs.filter((slug) => known.has(slug));
  if (input.exhibitId && !exhibits.some((exhibit) => exhibit.id === input.exhibitId)) {
    return withValues(
      {
        status: "error",
        message: "그림으로 쓸 소장 자료를 찾지 못했습니다.",
        fieldErrors: { exhibitId: ["목록에 있는 소장 자료를 고르거나 비워 두세요."] },
      },
      values,
    );
  }

  if (originalSlug) {
    if (!(await updateRelic(originalSlug, input))) {
      return withValues({ status: "error", message: "이미 삭제된 유물입니다." }, values);
    }
  } else if ((await createRelic(input)) === "duplicate") {
    return withValues(
      {
        status: "error",
        message: "같은 주소 이름을 쓰는 유물이 이미 있습니다.",
        fieldErrors: { slug: [`'${input.slug}'은(는) 이미 쓰고 있습니다.`] },
      },
      values,
    );
  }

  updateTag(RELIC_TAG);
  redirect(`/admin/relics?saved=${encodeURIComponent(input.slug)}`);
}

export async function deleteRelicAction(slug: string): Promise<FormState> {
  const denied = await checkWritePermission();
  if (denied) return denied;
  await deleteRelic(slug);
  updateTag(RELIC_TAG);
  redirect(`/admin/relics?deleted=${encodeURIComponent(slug)}`);
}
