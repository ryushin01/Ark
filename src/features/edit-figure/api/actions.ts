"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";

import { getExhibitsByFigure } from "@/entities/exhibit/index.server";
import {
  createFigure,
  deleteFigure,
  FIGURE_TAG,
  figureInputSchema,
  updateFigure,
} from "@/entities/figure/index.server";
import { getPantheon } from "@/entities/pantheon/index.server";
import { getWorks } from "@/entities/work/index.server";
import { checkWritePermission } from "@/shared/auth/index.server";
import { type FormState, readForm, toFieldErrors, withValues } from "@/shared/lib";

const FIELDS = [
  "slug",
  "pantheonSlug",
  "name",
  "nameEn",
  "epithet",
  "domains",
  "summary",
  "description",
  "order",
] as const;

/**
 * 신·인물 저장. originalSlug가 있으면 수정, 없으면 새로 만듭니다.
 * 저장하면 공개 화면의 캐시를 바로 갱신하고 목록으로 돌아갑니다.
 */
export async function saveFigureAction(
  originalSlug: string | null,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const values = readForm(formData, FIELDS);
  const denied = await checkWritePermission();
  if (denied) return withValues(denied, values);

  const parsed = figureInputSchema.safeParse({ ...values, slug: originalSlug ?? values.slug });
  if (!parsed.success) return withValues(toFieldErrors(parsed.error), values);
  const input = parsed.data;

  if (!(await getPantheon(input.pantheonSlug))) {
    return withValues(
      {
        status: "error",
        message: "없는 신화 계열입니다.",
        fieldErrors: { pantheonSlug: ["신화 계열을 다시 골라 주세요."] },
      },
      values,
    );
  }

  if (originalSlug) {
    if (!(await updateFigure(originalSlug, input))) {
      return withValues({ status: "error", message: "이미 삭제된 신입니다." }, values);
    }
  } else if ((await createFigure(input)) === "duplicate") {
    return withValues(
      {
        status: "error",
        message: "같은 주소 이름을 쓰는 신이 이미 있습니다.",
        fieldErrors: {
          slug: [`'${input.slug}'은(는) 이미 쓰고 있습니다. 다른 주소 이름을 입력해 주세요.`],
        },
      },
      values,
    );
  }

  updateTag(FIGURE_TAG);
  redirect(`/admin/figures?saved=${encodeURIComponent(input.slug)}`);
}

/** 신·인물 삭제. 연결된 자료나 작품이 있으면 먼저 정리해야 합니다. */
export async function deleteFigureAction(slug: string): Promise<FormState> {
  const denied = await checkWritePermission();
  if (denied) return denied;

  const [exhibits, works] = await Promise.all([getExhibitsByFigure(slug), getWorks()]);
  const linkedWorks = works.filter((work) => work.figureSlugs.includes(slug));
  if (exhibits.length > 0 || linkedWorks.length > 0) {
    return {
      status: "error",
      message: `연결된 자료 ${exhibits.length}점, 작품 ${linkedWorks.length}개가 있어 삭제할 수 없습니다. 먼저 연결을 정리해 주세요.`,
    };
  }

  await deleteFigure(slug);
  updateTag(FIGURE_TAG);
  redirect(`/admin/figures?deleted=${encodeURIComponent(slug)}`);
}
