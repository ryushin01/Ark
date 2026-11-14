"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";

import { getExhibits } from "@/entities/exhibit/index.server";
import { getFigures } from "@/entities/figure/index.server";
import {
  createRelic,
  deleteRelic,
  getRelic,
  RELIC_TAG,
  relicInputSchema,
  updateRelic,
} from "@/entities/relic/index.server";
import { checkWritePermission } from "@/shared/auth/index.server";
import { type FormState, readForm, toFieldErrors, withValues } from "@/shared/lib";

/** 원래 순서에 있던 것은 그 순서대로, 없던 것은 뒤에 고른 순서대로 */
function orderLike(selected: string[], original: string[]): string[] {
  const rank = (slug: string) => {
    const index = original.indexOf(slug);
    return index < 0 ? original.length : index;
  };
  return [...selected].sort((a, b) => rank(a) - rank(b));
}

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

  const [figures, exhibits, current] = await Promise.all([
    getFigures(),
    getExhibits(),
    originalSlug ? getRelic(originalSlug) : Promise.resolve(null),
  ]);
  const known = new Set(figures.map((figure) => figure.slug));
  // 체크박스는 화면 순서대로 실리므로, 고칠 때는 원래 순서(첫 번째가 대표 주인)를 지키고 새로 고른 이를 뒤에 붙입니다.
  input.figureSlugs = orderLike(
    input.figureSlugs.filter((slug) => known.has(slug)),
    current?.figureSlugs ?? [],
  );
  if (input.figureSlugs.length === 0) {
    return withValues(
      {
        status: "error",
        message: "입력값을 확인해 주세요. 고칠 칸이 1개 있습니다.",
        fieldErrors: { figureSlugs: ["지닌 이나 관련 인물을 하나 이상 골라 주세요."] },
      },
      values,
    );
  }
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
