"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button, Flex } from "@radix-ui/themes";

import { INITIAL_FORM_STATE } from "@/shared/lib";
import { FormStatus, TextAreaInput, TextInput } from "@/shared/ui/admin";

import { saveGenealogyAction } from "../api/actions";

import type { Genealogy } from "@/entities/genealogy";

const EXAMPLE = `[{ "name": "크로노스", "nameEn": "Cronus", "unions": [{ "partner": { "name": "레아", "nameEn": "Rhea" }, "children": [{ "name": "제우스", "nameEn": "Zeus", "slug": "zeus" }] }] }]`;

/** 계보 고치기. 계보는 JSON으로 입력합니다. */
export function GenealogyForm({
  pantheonSlug,
  genealogy,
}: {
  pantheonSlug: string;
  genealogy: Genealogy | null;
}) {
  const [state, action, isPending] = useActionState(
    saveGenealogyAction.bind(null, pantheonSlug),
    INITIAL_FORM_STATE,
  );
  const values: Record<string, string | string[]> = state.values ?? {
    source: genealogy?.source ?? "",
    roots: JSON.stringify(genealogy?.roots ?? [], null, 2),
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
          <TextInput
            {...field("source")}
            label="따른 문헌"
            required
            hint="예) 헤시오도스 「신들의 계보」"
          />
          <TextAreaInput
            {...field("roots")}
            label="계보 (JSON)"
            required
            rows={24}
            hint={`사람마다 name, nameEn을 적고, Ark에 있는 신이면 slug를 적습니다. 혼인은 unions에 partner(없으면 null)와 children으로 적습니다. 비워 두려면 []. 예) ${EXAMPLE}`}
          />
          <Flex gap="3" align="center" wrap="wrap">
            <Button type="submit" size="3" disabled={isPending}>
              {isPending ? "저장하는 중…" : "저장"}
            </Button>
            <Button asChild variant="soft" color="gray" size="3">
              <Link href="/admin/genealogies">취소</Link>
            </Button>
          </Flex>
        </Flex>
      </form>
    </Flex>
  );
}
