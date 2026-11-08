import Link from "next/link";
import { notFound } from "next/navigation";
import { Button, Link as RadixLink, Table } from "@radix-ui/themes";

import { getExhibits } from "@/entities/exhibit/index.server";
import { getFigures } from "@/entities/figure/index.server";
import { getPantheon, getPantheons } from "@/entities/pantheon/index.server";
import { Notice, PageHeader } from "@/shared/ui/admin";

import { PantheonForm } from "./PantheonForm";

/** 신화 계열 목록 */
export async function AdminPantheonsPage({ saved, deleted }: { saved?: string; deleted?: string }) {
  const [pantheons, figures] = await Promise.all([getPantheons(), getFigures()]);

  return (
    <>
      <PageHeader
        title="신화 계열"
        description="연대기는 정렬용 연도 순서로 보입니다."
        actions={
          <Button asChild>
            <Link href="/admin/pantheons/new">새 계열 추가</Link>
          </Button>
        }
      />
      <Notice saved={saved} deleted={deleted} />
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

/** 신화 계열 만들기(slug 없음)·고치기 */
export async function AdminPantheonEditPage({ slug }: { slug?: string }) {
  const [pantheon, exhibits] = await Promise.all([
    slug ? getPantheon(slug) : Promise.resolve(null),
    getExhibits(),
  ]);
  if (slug && !pantheon) notFound();

  return (
    <>
      <PageHeader
        title={pantheon ? `${pantheon.name} 고치기` : "새 계열 추가"}
        description={
          pantheon
            ? `주소: /pantheons/${pantheon.slug}`
            : "대표 자료는 지금 있는 자료에서 고르고, 신과 자료를 추가한 뒤 바꿀 수 있습니다."
        }
      />
      <PantheonForm
        pantheon={pantheon ?? undefined}
        exhibits={exhibits.map(({ id, title }) => ({ id, title }))}
      />
    </>
  );
}
