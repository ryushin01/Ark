"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button, Flex, Grid } from "@radix-ui/themes";

import {
  type Figure,
  FIGURE_KIND_LABEL,
  FIGURE_KINDS,
  MONSTER_GRADE_LABEL,
  MONSTER_GRADES,
} from "@/entities/figure";
import { type FormState, INITIAL_FORM_STATE } from "@/shared/lib";
import {
  ConfirmDeleteButton,
  FormStatus,
  SelectInput,
  TextAreaInput,
  TextInput,
} from "@/shared/ui/admin";

import { deleteFigureAction, saveFigureAction } from "../api/actions";

type FigureFormProps = {
  /** 고칠 신. 없으면 새로 만듭니다. */
  figure?: Figure;
  pantheons: { slug: string; name: string }[];
};

const toValues = (figure?: Figure): NonNullable<FormState["values"]> => ({
  slug: figure?.slug ?? "",
  pantheonSlug: figure?.pantheonSlug ?? "",
  name: figure?.name ?? "",
  nameEn: figure?.nameEn ?? "",
  epithet: figure?.epithet ?? "",
  kind: figure?.kind ?? "god",
  grade: figure?.grade ?? "none",
  domains: figure?.domains.join(", ") ?? "",
  summary: figure?.summary ?? "",
  description: figure?.description.join("\n\n") ?? "",
  order: String(figure?.order ?? 1),
});

/** 신·인물 만들기·고치기 폼 */
export function FigureForm({ figure, pantheons }: FigureFormProps) {
  const [state, action, isPending] = useActionState(
    saveFigureAction.bind(null, figure?.slug ?? null),
    INITIAL_FORM_STATE,
  );
  const values = state.values ?? toValues(figure);
  const field = (name: string) => ({
    name,
    defaultValue: String(values[name] ?? ""),
    error: state.fieldErrors?.[name]?.[0],
  });

  return (
    <Flex direction="column" gap="5">
      <FormStatus state={state} />
      <form action={action} noValidate>
        {/* 제출할 때마다 다시 그려, 돌려받은 값을 기본값으로 다시 채웁니다. */}
        <Flex key={state.submittedAt ?? "initial"} direction="column" gap="4">
          <Grid columns={{ initial: "1", sm: "2" }} gap="4">
            <TextInput {...field("name")} label="이름" required />
            <TextInput {...field("nameEn")} label="영문 이름" required lang="en" />
            <TextInput
              {...field("slug")}
              label="주소 이름"
              required
              readOnly={Boolean(figure)}
              autoComplete="off"
              hint={
                figure
                  ? "만든 뒤에는 바꿀 수 없습니다. 자료와 작품이 이 이름으로 신을 가리킵니다."
                  : "영문 소문자, 숫자, 하이픈(-). 예) hermes → /figures/hermes"
              }
            />
            <SelectInput
              {...field("pantheonSlug")}
              label="신화 계열"
              required
              placeholder="계열을 고르세요"
              options={pantheons.map(({ slug, name }) => ({ value: slug, label: name }))}
            />
            <SelectInput
              {...field("kind")}
              label="분류"
              required
              options={FIGURE_KINDS.map((kind) => ({
                value: kind,
                label: FIGURE_KIND_LABEL[kind],
              }))}
            />
            <SelectInput
              {...field("grade")}
              label="몬스터 등급"
              required
              hint="신수: 신에 육박하는 존재, 영수: 사람에 준하는 사고를 하거나 여러 문화권에서 추앙받는 존재, 몬스터: 그 밖의 하등한 존재"
              options={[
                { value: "none", label: "해당 없음 (몬스터가 아님)" },
                ...MONSTER_GRADES.map((grade) => ({
                  value: grade,
                  label: MONSTER_GRADE_LABEL[grade],
                })),
              ]}
            />
            <TextInput {...field("epithet")} label="별칭" required hint="예) 하늘과 번개의 신" />
            <TextInput
              {...field("order")}
              label="계열 안 순서"
              required
              type="number"
              inputMode="numeric"
              min={1}
              hint="1부터, 작은 수가 먼저 나옵니다."
            />
          </Grid>
          <TextInput
            {...field("domains")}
            label="관장하는 영역"
            required
            hint="쉼표로 구분합니다. 예) 하늘, 번개, 법과 질서"
          />
          <TextInput {...field("summary")} label="한 줄 소개" required />
          <TextAreaInput
            {...field("description")}
            label="소개"
            required
            rows={8}
            hint="문단 사이는 빈 줄로 나눕니다."
          />
          <Flex gap="3" align="center" wrap="wrap">
            <Button type="submit" size="3" disabled={isPending}>
              {isPending ? "저장하는 중…" : figure ? "저장" : "만들기"}
            </Button>
            <Button asChild variant="soft" color="gray" size="3">
              <Link href="/admin/figures">취소</Link>
            </Button>
          </Flex>
        </Flex>
      </form>
      {figure && (
        <ConfirmDeleteButton
          name={figure.name}
          onDelete={deleteFigureAction.bind(null, figure.slug)}
        />
      )}
    </Flex>
  );
}
