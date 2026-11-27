"use server";

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
import {
  duplicateKeyError,
  fieldError,
  fieldErrorsState,
  formError,
  type FormState,
  readForm,
  toFieldErrors,
  withValues,
} from "@/shared/lib";
import { finishAdminAction } from "@/shared/lib/index.server";

import { orderLike } from "../model/order";

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

const LIST = "/admin/relics";

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
      fieldErrorsState({ figureSlugs: ["지닌 이나 관련 인물을 하나 이상 골라 주세요."] }),
      values,
    );
  }
  if (input.exhibitId && !exhibits.some((exhibit) => exhibit.id === input.exhibitId)) {
    return fieldError(
      values,
      "그림으로 쓸 소장 자료를 찾지 못했습니다.",
      "exhibitId",
      "목록에 있는 소장 자료를 고르거나 비워 두세요.",
    );
  }

  if (originalSlug) {
    if (!(await updateRelic(originalSlug, input))) {
      return formError(values, "이미 삭제된 유물입니다.");
    }
  } else if ((await createRelic(input)) === "duplicate") {
    return duplicateKeyError(values, "같은 주소 이름을 쓰는 유물이 이미 있습니다.", input.slug);
  }

  finishAdminAction(RELIC_TAG, LIST, "saved", input.slug);
}

export async function deleteRelicAction(slug: string): Promise<FormState> {
  const denied = await checkWritePermission();
  if (denied) return denied;
  await deleteRelic(slug);
  finishAdminAction(RELIC_TAG, LIST, "deleted", slug);
}
