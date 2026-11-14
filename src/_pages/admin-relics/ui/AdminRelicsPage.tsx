import Link from "next/link";
import { notFound } from "next/navigation";
import { Button, Flex, Table, Text } from "@radix-ui/themes";

import { getExhibits } from "@/entities/exhibit/index.server";
import { getFigures } from "@/entities/figure/index.server";
import { RELIC_KIND_LABEL } from "@/entities/relic";
import { getRelic, getRelics } from "@/entities/relic/index.server";
import { EditLinkCell, Notice, PageHeader } from "@/shared/ui/admin";

import { RelicForm } from "./RelicForm";

/** 신화 속 유물 목록 (비밀 전시실) */
export async function AdminRelicsPage({ saved, deleted }: { saved?: string; deleted?: string }) {
  const [relics, figures] = await Promise.all([getRelics(), getFigures()]);
  const figureName = new Map(figures.map((figure) => [figure.slug, figure.name]));

  return (
    <>
      <PageHeader
        title="유물"
        description="비밀 전시실에 놓이는 신화 속 유물. 전시 순서대로 보입니다."
        actions={
          <Button asChild>
            <Link href="/admin/relics/new">새 유물 추가</Link>
          </Button>
        }
      />
      <Notice saved={saved} deleted={deleted} />
      <Table.Root variant="surface">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell>순서</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>유물</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>갈래</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>지닌 이</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>
              <span className="sr-only">관리</span>
            </Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {relics.map((relic) => (
            <Table.Row key={relic.slug} align="center">
              <Table.Cell>{relic.order}</Table.Cell>
              <Table.RowHeaderCell>
                <Flex direction="column">
                  <Text weight="medium">{relic.name}</Text>
                  <Text size="1" color="gray">
                    {relic.nameEn}
                  </Text>
                </Flex>
              </Table.RowHeaderCell>
              <Table.Cell>{RELIC_KIND_LABEL[relic.kind]}</Table.Cell>
              <Table.Cell>
                {relic.figureSlugs.map((slug) => figureName.get(slug) ?? slug).join(", ")}
              </Table.Cell>
              <EditLinkCell href={`/admin/relics/${relic.slug}`} name={relic.name} />
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </>
  );
}

/** 유물 만들기(slug 없음)·고치기 */
export async function AdminRelicEditPage({ slug }: { slug?: string }) {
  const [relic, relics, figures, exhibits] = await Promise.all([
    slug ? getRelic(slug) : Promise.resolve(null),
    getRelics(),
    getFigures(),
    getExhibits(),
  ]);
  if (slug && !relic) notFound();
  const nextOrder = Math.max(0, ...relics.map((item) => item.order)) + 1;

  return (
    <>
      <PageHeader
        title={relic ? `${relic.name} 고치기` : "새 유물 추가"}
        description="그림은 소장 자료 가운데 퍼블릭 도메인·CC0 자료를 골라 씁니다."
      />
      <RelicForm
        relic={relic ?? undefined}
        nextOrder={nextOrder}
        figures={figures.map(({ slug: value, name }) => ({ slug: value, name }))}
        exhibits={exhibits.map(({ id, title }) => ({ id, title }))}
      />
    </>
  );
}
