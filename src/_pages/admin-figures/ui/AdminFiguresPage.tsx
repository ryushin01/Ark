import Link from "next/link";
import { notFound } from "next/navigation";
import { Button, Flex, Link as RadixLink, Table, Text } from "@radix-ui/themes";

import { getExhibits } from "@/entities/exhibit/index.server";
import { getFigure, getFigures } from "@/entities/figure/index.server";
import { getPantheons } from "@/entities/pantheon/index.server";
import { EditLinkCell, Notice, PageHeader } from "@/shared/ui/admin";

import { FigureForm } from "./FigureForm";

type ListProps = { pantheon?: string; saved?: string; deleted?: string };

/** 신·인물 목록. 계열로 거를 수 있습니다. */
export async function AdminFiguresPage({ pantheon, saved, deleted }: ListProps) {
  const [figures, pantheons, exhibits] = await Promise.all([
    getFigures(),
    getPantheons(),
    getExhibits(),
  ]);
  const pantheonName = (slug: string) => pantheons.find((item) => item.slug === slug)?.name ?? slug;
  const rows = figures
    .filter((figure) => !pantheon || figure.pantheonSlug === pantheon)
    .sort(
      (a, b) =>
        pantheons.findIndex((item) => item.slug === a.pantheonSlug) -
          pantheons.findIndex((item) => item.slug === b.pantheonSlug) || a.order - b.order,
    );

  return (
    <>
      <PageHeader
        title="신·인물"
        description={`${rows.length}명${pantheon ? ` · ${pantheonName(pantheon)}` : ""}`}
        actions={
          <Button asChild>
            <Link href="/admin/figures/new">새 신 추가</Link>
          </Button>
        }
      />
      <Notice saved={saved} deleted={deleted} />
      <nav aria-label="계열로 거르기">
        <Flex gap="3" wrap="wrap" mb="4" asChild>
          <ul>
            <li>
              <RadixLink asChild weight={pantheon ? "regular" : "bold"}>
                <Link href="/admin/figures" aria-current={pantheon ? undefined : "page"}>
                  전체
                </Link>
              </RadixLink>
            </li>
            {pantheons.map((item) => (
              <li key={item.slug}>
                <RadixLink asChild weight={pantheon === item.slug ? "bold" : "regular"}>
                  <Link
                    href={`/admin/figures?pantheon=${item.slug}`}
                    aria-current={pantheon === item.slug ? "page" : undefined}
                  >
                    {item.name}
                  </Link>
                </RadixLink>
              </li>
            ))}
          </ul>
        </Flex>
      </nav>
      <Table.Root variant="surface">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell>이름</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>계열</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>별칭</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>자료</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>
              <span className="sr-only">관리</span>
            </Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {rows.map((figure) => (
            <Table.Row key={figure.slug} align="center">
              <Table.RowHeaderCell>
                <Flex direction="column">
                  <Text weight="medium">{figure.name}</Text>
                  <Text size="1" color="gray" lang="en">
                    {figure.nameEn}
                  </Text>
                </Flex>
              </Table.RowHeaderCell>
              <Table.Cell>{pantheonName(figure.pantheonSlug)}</Table.Cell>
              <Table.Cell>{figure.epithet}</Table.Cell>
              <Table.Cell>
                {exhibits.filter((exhibit) => exhibit.figureSlug === figure.slug).length}점
              </Table.Cell>
              <EditLinkCell href={`/admin/figures/${figure.slug}`} name={figure.name} />
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </>
  );
}

/** 신·인물 만들기(slug 없음)·고치기 */
export async function AdminFigureEditPage({ slug }: { slug?: string }) {
  const [figure, pantheons] = await Promise.all([
    slug ? getFigure(slug) : Promise.resolve(null),
    getPantheons(),
  ]);
  if (slug && !figure) notFound();

  return (
    <>
      <PageHeader
        title={figure ? `${figure.name} 고치기` : "새 신 추가"}
        description={
          figure ? `주소: /figures/${figure.slug}` : "* 표시는 꼭 입력해야 하는 칸입니다."
        }
      />
      <FigureForm
        figure={figure ?? undefined}
        pantheons={pantheons.map(({ slug: value, name }) => ({ slug: value, name }))}
      />
    </>
  );
}
