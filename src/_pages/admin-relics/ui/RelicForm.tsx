"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button, CheckboxGroup, Flex, Grid } from "@radix-ui/themes";

import { NO_IMAGE, type Relic, RELIC_KIND_LABEL, RELIC_KINDS } from "@/entities/relic";
import { INITIAL_FORM_STATE } from "@/shared/lib";
import {
  ConfirmDeleteButton,
  FormStatus,
  SelectInput,
  TextAreaInput,
  TextInput,
} from "@/shared/ui/admin";

import { deleteRelicAction, saveRelicAction } from "../api/actions";

const LEGEND_STYLE = {
  padding: 0,
  marginBottom: "var(--space-2)",
  fontSize: "var(--font-size-2)",
  fontWeight: "var(--font-weight-medium)",
} as const;

type RelicFormProps = {
  relic?: Relic;
  nextOrder: number;
  figures: { slug: string; name: string }[];
  exhibits: { id: string; title: string }[];
};

/** 신화 속 유물 만들기·고치기 폼 */
export function RelicForm({ relic, nextOrder, figures, exhibits }: RelicFormProps) {
  const [state, action, isPending] = useActionState(
    saveRelicAction.bind(null, relic?.slug ?? null),
    INITIAL_FORM_STATE,
  );
  const values: Record<string, string | string[]> = state.values ?? {
    slug: relic?.slug ?? "",
    name: relic?.name ?? "",
    nameEn: relic?.nameEn ?? "",
    kind: relic?.kind ?? "",
    origin: relic?.origin ?? "",
    power: relic?.power ?? "",
    price: relic?.price ?? "",
    source: relic?.source ?? "",
    exhibitId: relic ? (relic.exhibitId ?? NO_IMAGE) : NO_IMAGE,
    order: String(relic?.order ?? nextOrder),
    figureSlugs: relic?.figureSlugs ?? [],
  };
  const field = (name: string) => ({
    name,
    defaultValue: String(values[name] ?? ""),
    error: state.fieldErrors?.[name]?.[0],
  });
  const checked = Array.isArray(values.figureSlugs) ? values.figureSlugs : [];
  const figureError = state.fieldErrors?.figureSlugs?.[0];

  return (
    <Flex direction="column" gap="5">
      <FormStatus state={state} />
      <form action={action} noValidate>
        <Flex key={state.submittedAt ?? "initial"} direction="column" gap="4">
          <Grid columns={{ initial: "1", sm: "2" }} gap="4">
            <TextInput {...field("name")} label="유물 이름" required />
            <TextInput {...field("nameEn")} label="영문 이름" required />
            <TextInput
              {...field("slug")}
              label="주소 이름"
              required
              readOnly={Boolean(relic)}
              autoComplete="off"
              hint={
                relic
                  ? "만든 뒤에는 바꿀 수 없습니다."
                  : "영문 소문자, 숫자, 하이픈(-). 예) mjolnir"
              }
            />
            <SelectInput
              {...field("kind")}
              label="갈래"
              required
              options={RELIC_KINDS.map((kind) => ({ value: kind, label: RELIC_KIND_LABEL[kind] }))}
            />
            <TextInput
              {...field("order")}
              label="전시 순서"
              type="number"
              inputMode="numeric"
              required
            />
            <SelectInput
              {...field("exhibitId")}
              label="그림으로 쓸 소장 자료"
              hint="비워 두면 이름 첫 글자를 새긴 빈 진열장으로 보입니다."
              options={[
                { value: NO_IMAGE, label: "그림 없음" },
                ...exhibits.map((exhibit) => ({ value: exhibit.id, label: exhibit.title })),
              ]}
            />
          </Grid>
          <TextAreaInput
            {...field("origin")}
            label="기원"
            rows={3}
            required
            hint="만든 이와 얻게 된 경위"
          />
          <TextAreaInput {...field("power")} label="힘" rows={3} required />
          <TextAreaInput
            {...field("price")}
            label="대가"
            rows={3}
            hint="이 유물 때문에 치른 대가. 전하지 않으면 비워 둡니다."
          />
          <TextInput {...field("source")} label="전하는 문헌" required />
          <fieldset
            style={{ border: 0, margin: 0, padding: 0 }}
            aria-describedby={figureError ? "figureSlugs-error" : undefined}
          >
            <legend style={LEGEND_STYLE}>
              지닌 이·관련 인물 (고칠 때는 원래 대표 주인이 그대로 첫 번째에 남습니다)
            </legend>
            <CheckboxGroup.Root name="figureSlugs" defaultValue={checked}>
              <Grid columns={{ initial: "2", sm: "4" }} gap="2">
                {figures.map((figure) => (
                  <CheckboxGroup.Item key={figure.slug} value={figure.slug}>
                    {figure.name}
                  </CheckboxGroup.Item>
                ))}
              </Grid>
            </CheckboxGroup.Root>
            {figureError && (
              <p
                id="figureSlugs-error"
                style={{ color: "var(--red-11)", marginTop: "var(--space-2)" }}
              >
                {figureError}
              </p>
            )}
          </fieldset>
          <Flex gap="3" align="center" wrap="wrap">
            <Button type="submit" size="3" disabled={isPending}>
              {isPending ? "저장하는 중…" : relic ? "저장" : "만들기"}
            </Button>
            <Button asChild variant="soft" color="gray" size="3">
              <Link href="/admin/relics">취소</Link>
            </Button>
          </Flex>
        </Flex>
      </form>
      {relic && (
        <ConfirmDeleteButton
          name={relic.name}
          onDelete={deleteRelicAction.bind(null, relic.slug)}
        />
      )}
    </Flex>
  );
}
