import Link from "next/link";
import { notFound } from "next/navigation";
import { Button, Link as RadixLink, Table } from "@radix-ui/themes";

import { getExhibits } from "@/entities/exhibit/index.server";
import { getFigures } from "@/entities/figure/index.server";
import { getPantheon, getPantheons } from "@/entities/pantheon/index.server";
import { PantheonForm } from "@/features/edit-pantheon";
import { Notice, PageHeader } from "@/shared/ui/admin";

/** 신화 계열 목록 */
export async function AdminPantheonsPage({ saved }: { saved?: string }) {
  const [pantheons, figures] = await Promise.all([getPantheons(), getFigures()]);

  return (
    <>
      <PageHeader title="신화 계열" description="연대기는 정렬용 연도 순서로 보입니다." />
      <Notice saved={saved} />
      <Table.Root variant="surface">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell>이름</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>시기</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>가장 이른 문헌</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>신</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>
              <span className="sr-only">관리</span>
            </Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {pantheons.map((pantheon) => (
            <Table.Row key={pantheon.slug} align="center">
              <Table.RowHeaderCell>{pantheon.name}</Table.RowHeaderCell>
              <Table.Cell>{pantheon.eraLabel}</Table.Cell>
              <Table.Cell>{pantheon.earliestSource}</Table.Cell>
              <Table.Cell>
                <RadixLink asChild>
                  <Link href={`/admin/figures?pantheon=${pantheon.slug}`}>
                    {figures.filter((figure) => figure.pantheonSlug === pantheon.slug).length}명
                  </Link>
                </RadixLink>
              </Table.Cell>
              <Table.Cell justify="end">
                <Button asChild size="1" variant="soft">
                  <Link
                    href={`/admin/pantheons/${pantheon.slug}`}
                    aria-label={`${pantheon.name} 고치기`}
                  >
                    고치기
                  </Link>
                </Button>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </>
  );
}

/** 신화 계열 고치기 */
export async function AdminPantheonEditPage({ slug }: { slug: string }) {
  const [pantheon, exhibits] = await Promise.all([getPantheon(slug), getExhibits()]);
  if (!pantheon) notFound();

  return (
    <>
      <PageHeader
        title={`${pantheon.name} 고치기`}
        description={`주소: /pantheons/${pantheon.slug}`}
      />
      <PantheonForm
        pantheon={pantheon}
        exhibits={exhibits.map(({ id, title }) => ({ id, title }))}
      />
    </>
  );
}
