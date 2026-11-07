"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button, Callout, Flex, Grid } from "@radix-ui/themes";

import { type Exhibit, EXHIBIT_KIND_LABEL, EXHIBIT_KINDS } from "@/entities/exhibit";
import { INITIAL_FORM_STATE } from "@/shared/lib";
import {
  ConfirmDeleteButton,
  FileInput,
  FormStatus,
  SelectInput,
  TextAreaInput,
  TextInput,
} from "@/shared/ui/admin";

import { deleteExhibitAction, saveExhibitAction } from "../api/actions";

type ExhibitFormProps = {
  /** 고칠 자료. 없으면 새로 만듭니다. */
  exhibit?: Exhibit;
  figures: { slug: string; name: string }[];
  /** 이미지 업로드를 쓸 수 있는지 (Supabase 연결 여부) */
  canUpload: boolean;
};

/** 자료 만들기·고치기 폼. 새 자료는 이미지가 꼭 필요하고, 고칠 때는 이미지를 고른 경우에만 바꿉니다. */
export function ExhibitForm({ exhibit, figures, canUpload }: ExhibitFormProps) {
  const [state, action, isPending] = useActionState(
    saveExhibitAction.bind(null, exhibit?.id ?? null),
    INITIAL_FORM_STATE,
  );
  const values: Record<string, string | string[]> = state.values ?? {
    id: exhibit?.id ?? "",
    figureSlug: exhibit?.figureSlug ?? "",
    title: exhibit?.title ?? "",
    kind: exhibit?.kind ?? "",
    dateLabel: exhibit?.dateLabel ?? "",
    holder: exhibit?.holder ?? "",
    note: exhibit?.note ?? "",
    alt: exhibit?.image.alt ?? "",
    artist: exhibit?.image.credit.artist ?? "",
    license: exhibit?.image.credit.license ?? "",
    sourceUrl: exhibit?.image.credit.sourceUrl ?? "",
  };
  const field = (name: string) => ({
    name,
    defaultValue: String(values[name] ?? ""),
    error: state.fieldErrors?.[name]?.[0],
  });

  return (
    <Flex direction="column" gap="5">
      {!canUpload && (
        <Callout.Root color="gray">
          <Callout.Text>
            이미지 업로드는 Supabase를 연결해야 쓸 수 있습니다. 지금은 설명과 출처만 고칠 수
            있습니다.
          </Callout.Text>
        </Callout.Root>
      )}
      <FormStatus state={state} />
      <form action={action} noValidate>
        <Flex key={state.submittedAt ?? "initial"} direction="column" gap="4">
          <FileInput
            name="image"
            label={exhibit ? "이미지 바꾸기" : "이미지"}
            required={!exhibit}
            disabled={!canUpload}
            error={state.fieldErrors?.image?.[0]}
            hint={`JPG·PNG·WebP, 4MB 이하. 긴 변 1600px로 줄여 저장합니다.${
              exhibit ? " 고르지 않으면 지금 이미지를 그대로 둡니다." : ""
            } 오류가 나면 파일을 다시 골라 주세요.`}
          />
          <Grid columns={{ initial: "1", sm: "2" }} gap="4">
            <TextInput {...field("title")} label="자료 이름" required />
            {!exhibit && (
              <TextInput
                {...field("id")}
                label="자료 id"
                required
                autoComplete="off"
                hint="영문 소문자, 숫자, 하이픈(-). 만든 뒤에는 바꿀 수 없습니다."
              />
            )}
            <SelectInput
              {...field("figureSlug")}
              label="신·인물"
              required
              options={figures.map(({ slug, name }) => ({ value: slug, label: name }))}
            />
            <SelectInput
              {...field("kind")}
              label="분류"
              required
              options={EXHIBIT_KINDS.map((kind) => ({
                value: kind,
                label: EXHIBIT_KIND_LABEL[kind],
              }))}
            />
            <TextInput {...field("dateLabel")} label="시기" hint="예) 기원전 460년경" />
            <TextInput {...field("holder")} label="소장처" />
          </Grid>
          <TextAreaInput
            {...field("note")}
            label="해석 메모"
            rows={3}
            hint="해석이 갈리는 자료라면 그 설명을 적습니다."
          />
          <TextAreaInput
            {...field("alt")}
            label="대체 텍스트"
            required
            rows={3}
            hint="이미지를 보지 못하는 사람에게 무엇이 보이는지 설명합니다. 실제 이미지를 보고 적어 주세요."
          />
          <Grid columns={{ initial: "1", sm: "3" }} gap="4">
            <TextInput {...field("artist")} label="저작자" hint="모르면 비워 둡니다." />
            <TextInput
              {...field("license")}
              label="라이선스"
              required
              hint="예) Public domain, CC BY 4.0"
            />
            <TextInput {...field("sourceUrl")} label="원본 주소" required type="url" />
          </Grid>
          <Flex gap="3" align="center" wrap="wrap">
            <Button type="submit" size="3" disabled={isPending}>
              {isPending ? "저장하는 중…" : exhibit ? "저장" : "만들기"}
            </Button>
            <Button asChild variant="soft" color="gray" size="3">
              <Link href="/admin/exhibits">취소</Link>
            </Button>
          </Flex>
        </Flex>
      </form>
      {exhibit && (
        <ConfirmDeleteButton
          name={exhibit.title}
          onDelete={deleteExhibitAction.bind(null, exhibit.id)}
        />
      )}
    </Flex>
  );
}
