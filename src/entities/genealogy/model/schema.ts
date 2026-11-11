import { z } from "zod";

import type { GenealogyNode, GenealogyUnion } from "./types";

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const nodeSchema: z.ZodType<GenealogyNode> = z.lazy(() =>
  z.strictObject({
    name: z.string().trim().min(1, "이름(name)이 비어 있습니다."),
    nameEn: z.string().trim().min(1, "영문 이름(nameEn)이 비어 있습니다."),
    slug: z.string().regex(SLUG, "주소(slug)는 영문 소문자, 숫자, 하이픈만 씁니다.").optional(),
    note: z.string().trim().min(1).optional(),
    unions: z.array(unionSchema).optional(),
  }),
);

const unionSchema: z.ZodType<GenealogyUnion> = z.lazy(() =>
  z.strictObject({
    partner: nodeSchema.nullable(),
    children: z.array(nodeSchema),
    note: z.string().trim().min(1).optional(),
  }),
);

/** JSON 글을 읽어 계보 사람 목록으로 바꿉니다. 형식이 틀리면 어디가 틀렸는지 알려 줍니다. */
const rootsSchema = z.string().transform((text, context) => {
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch (error) {
    context.addIssue({
      code: "custom",
      message: `JSON 형식이 올바르지 않습니다. (${(error as Error).message})`,
    });
    return z.NEVER;
  }
  const parsed = z.array(nodeSchema).safeParse(value);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    context.addIssue({
      code: "custom",
      message: `${issue?.path.join(" › ") || "맨 위"}: ${issue?.message ?? "형식이 다릅니다."}`,
    });
    return z.NEVER;
  }
  return parsed.data;
});

/** 어드민에서 계보를 고칠 때의 입력값 */
export const genealogyInputSchema = z.object({
  source: z.string().trim().min(1, "따른 문헌을 입력해 주세요."),
  roots: rootsSchema,
});

export type GenealogyInput = z.infer<typeof genealogyInputSchema>;

/** 계보에 나오는 신·인물 주소 */
export function slugsIn(nodes: GenealogyNode[]): string[] {
  return nodes.flatMap((node) => [
    ...(node.slug ? [node.slug] : []),
    ...slugsIn(
      (node.unions ?? []).flatMap((union) => [
        ...(union.partner ? [union.partner] : []),
        ...union.children,
      ]),
    ),
  ]);
}
