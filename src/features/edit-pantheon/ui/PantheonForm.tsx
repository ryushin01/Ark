"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button, Flex, Grid } from "@radix-ui/themes";

import { INITIAL_FORM_STATE } from "@/shared/lib";
import {
  ConfirmDeleteButton,
  FormStatus,
  SelectInput,
  TextAreaInput,
  TextInput,
} from "@/shared/ui/admin";

import { deletePantheonAction, savePantheonAction } from "../api/actions";

import type { Pantheon } from "@/entities/pantheon";

type PantheonFormProps = {
  /** 고칠 계열. 없으면 새로 만듭니다. */
  pantheon?: Pantheon;
  /** 대표 자료로 고를 수 있는 자료 */
  exhibits: { id: string; title: string }[];
};

/** 신화 계열 만들기·고치기 폼 */
export function PantheonForm({ pantheon, exhibits }: PantheonFormProps) {
  const [state, action, isPending] = useActionState(
    savePantheonAction.bind(null, pantheon?.slug ?? null),
    INITIAL_FORM_STATE,
  );
  const values: Record<string, string | string[]> = state.values ?? {
    slug: pantheon?.slug ?? "",
    name: pantheon?.name ?? "",
    nameEn: pantheon?.nameEn ?? "",
    region: pantheon?.region ?? "",
    earliestSource: pantheon?.earliestSource ?? "",
    eraLabel: pantheon?.eraLabel ?? "",
    eraYear: pantheon ? String(pantheon.eraYear) : "",
    summary: pantheon?.summary ?? "",
    description: pantheon?.description.join("\n\n") ?? "",
    coverExhibitId: pantheon?.coverExhibitId ?? "",
  };
  const field = (name: string) => ({
    name,
    defaultValue: String(values[name] ?? ""),
    error: state.fieldErrors?.[name]?.[0],
  });

  return (
    <Flex direction="column" gap="5">
      <FormStatus state={state} />
      <form action={action} noValidate>
        <Flex key={state.submittedAt ?? "initial"} direction="column" gap="4">
          <Grid columns={{ initial: "1", sm: "2" }} gap="4">
            <TextInput {...field("name")} label="이름" required />
            <TextInput {...field("nameEn")} label="영문 이름" required lang="en" />
            {!pantheon && (
              <TextInput
                {...field("slug")}
                label="주소 이름"
                required
                autoComplete="off"
                hint="영문 소문자, 숫자, 하이픈(-). 예) celtic → /pantheons/celtic. 만든 뒤에는 바꿀 수 없습니다."
              />
            )}
            <TextInput {...field("region")} label="지역" required />
            <TextInput {...field("earliestSource")} label="가장 이른 문헌" required />
            <TextInput
              {...field("eraLabel")}
              label="시기 표기"
              required
              hint="화면에 그대로 보입니다. 예) 기원전 8세기경"
            />
            <TextInput
              {...field("eraYear")}
              label="정렬용 연도"
              required
              type="number"
              inputMode="numeric"
              hint="연대기 순서를 정합니다. 기원전은 음수로 적습니다. 예) -800"
            />
          </Grid>
          <SelectInput
            {...field("coverExhibitId")}
            label="대표 자료"
            required
            hint="홈 연대기와 계열 화면 맨 위에 보입니다."
            options={exhibits.map(({ id, title }) => ({ value: id, label: title }))}
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
              {isPending ? "저장하는 중…" : pantheon ? "저장" : "만들기"}
            </Button>
            <Button asChild variant="soft" color="gray" size="3">
              <Link href="/admin/pantheons">취소</Link>
            </Button>
          </Flex>
        </Flex>
      </form>
      {pantheon && (
        <ConfirmDeleteButton
          name={pantheon.name}
          onDelete={deletePantheonAction.bind(null, pantheon.slug)}
        />
      )}
    </Flex>
  );
}
