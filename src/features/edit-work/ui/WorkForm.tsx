"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button, CheckboxGroup, Flex, Grid, RadioGroup } from "@radix-ui/themes";

import { type Work, WORK_MEDIUM_LABEL, WORK_MEDIUMS, WORK_STATUS_LABEL } from "@/entities/work";
import { INITIAL_FORM_STATE } from "@/shared/lib";
import {
  ConfirmDeleteButton,
  FormStatus,
  SelectInput,
  TextAreaInput,
  TextInput,
} from "@/shared/ui/admin";

import { deleteWorkAction, saveWorkAction } from "../api/actions";

const LEGEND_STYLE = {
  padding: 0,
  marginBottom: "var(--space-2)",
  fontSize: "var(--font-size-2)",
  fontWeight: "var(--font-weight-medium)",
} as const;

type WorkFormProps = {
  work?: Work;
  figures: { slug: string; name: string }[];
};

/** 영향받은 작품 만들기·고치기 폼. 작품 이미지는 저장한 뒤 WorkImages에서 올립니다. */
export function WorkForm({ work, figures }: WorkFormProps) {
  const [state, action, isPending] = useActionState(
    saveWorkAction.bind(null, work?.slug ?? null),
    INITIAL_FORM_STATE,
  );
  const values: Record<string, string | string[]> = state.values ?? {
    slug: work?.slug ?? "",
    title: work?.title ?? "",
    titleOriginal: work?.titleOriginal ?? "",
    medium: work?.medium ?? "",
    year: work?.year ? String(work.year) : "",
    creator: work?.creator ?? "",
    summary: work?.summary ?? "",
    status: work?.status ?? "draft",
    figureSlugs: work?.figureSlugs ?? [],
  };
  const field = (name: string) => ({
    name,
    defaultValue: String(values[name] ?? ""),
    error: state.fieldErrors?.[name]?.[0],
  });
  const checked = Array.isArray(values.figureSlugs) ? values.figureSlugs : [];

  return (
    <Flex direction="column" gap="5">
      <FormStatus state={state} />
      <form action={action} noValidate>
        <Flex key={state.submittedAt ?? "initial"} direction="column" gap="4">
          <Grid columns={{ initial: "1", sm: "2" }} gap="4">
            <TextInput {...field("title")} label="작품 이름" required />
            <TextInput {...field("titleOriginal")} label="원제" required />
            <TextInput
              {...field("slug")}
              label="주소 이름"
              required
              readOnly={Boolean(work)}
              autoComplete="off"
              hint={
                work
                  ? "만든 뒤에는 바꿀 수 없습니다."
                  : "영문 소문자, 숫자, 하이픈(-). 예) final-fantasy"
              }
            />
            <SelectInput
              {...field("medium")}
              label="분류"
              required
              options={WORK_MEDIUMS.map((medium) => ({
                value: medium,
                label: WORK_MEDIUM_LABEL[medium],
              }))}
            />
            <TextInput {...field("year")} label="발표 연도" type="number" inputMode="numeric" />
            <TextInput {...field("creator")} label="제작" />
          </Grid>
          <TextAreaInput
            {...field("summary")}
            label="신화와의 관계"
            rows={4}
            hint="어떤 신화를 어떻게 빌려 왔는지 확인한 사실만 적습니다. 공개하려면 꼭 필요합니다."
          />
          <fieldset style={{ border: 0, margin: 0, padding: 0 }}>
            <legend style={LEGEND_STYLE}>관련 신</legend>
            <CheckboxGroup.Root name="figureSlugs" defaultValue={checked}>
              <Grid columns={{ initial: "2", sm: "4" }} gap="2">
                {figures.map((figure) => (
                  <CheckboxGroup.Item key={figure.slug} value={figure.slug}>
                    {figure.name}
                  </CheckboxGroup.Item>
                ))}
              </Grid>
            </CheckboxGroup.Root>
          </fieldset>
          <fieldset style={{ border: 0, margin: 0, padding: 0 }}>
            <legend style={LEGEND_STYLE}>공개 여부</legend>
            <RadioGroup.Root name="status" defaultValue={String(values.status)}>
              <RadioGroup.Item value="draft">{WORK_STATUS_LABEL.draft}</RadioGroup.Item>
              <RadioGroup.Item value="published">{WORK_STATUS_LABEL.published}</RadioGroup.Item>
            </RadioGroup.Root>
          </fieldset>
          <Flex gap="3" align="center" wrap="wrap">
            <Button type="submit" size="3" disabled={isPending}>
              {isPending ? "저장하는 중…" : work ? "저장" : "만들기"}
            </Button>
            <Button asChild variant="soft" color="gray" size="3">
              <Link href="/admin/works">취소</Link>
            </Button>
          </Flex>
        </Flex>
      </form>
      {work && (
        <ConfirmDeleteButton name={work.title} onDelete={deleteWorkAction.bind(null, work.slug)} />
      )}
    </Flex>
  );
}
