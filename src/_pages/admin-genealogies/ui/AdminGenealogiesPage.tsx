import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge, Button, Table } from "@radix-ui/themes";

import { getGenealogies } from "@/entities/genealogy/index.server";
import { getPantheon, getPantheons } from "@/entities/pantheon/index.server";
import { Notice, PageHeader } from "@/shared/ui/admin";

import { GenealogyForm } from "./GenealogyForm";

import type { GenealogyNode } from "@/entities/genealogy";

/** 계보 속 사람 수 */
const countPeople = (nodes: GenealogyNode[]): number =>
  nodes.reduce(
    (sum, node) =>
      sum +
      1 +
      (node.unions ?? []).reduce(
        (inner, union) => inner + (union.partner ? 1 : 0) + countPeople(union.children),
        0,
      ),
    0,
  );

/** 계열별 계보 목록 */
export async function AdminGenealogiesPage({ saved }: { saved?: string }) {
  const [pantheons, genealogies] = await Promise.all([getPantheons(), getGenealogies()]);

  return (
    <>
      <PageHeader
        title="계보"
        description="계열 화면의 ‘신들의 계보’와 신 화면의 ‘가족’에 쓰입니다."
      />
      <Notice saved={saved} />
      <Table.Root variant="surface">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell>계열</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>따른 문헌</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>사람</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>
              <span className="sr-only">관리</span>
            </Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {pantheons.map((pantheon) => {
            const genealogy = genealogies.find((item) => item.pantheonSlug === pantheon.slug);
            const people = genealogy ? countPeople(genealogy.roots) : 0;
            return (
              <Table.Row key={pantheon.slug} align="center">
                <Table.RowHeaderCell>{pantheon.name}</Table.RowHeaderCell>
                <Table.Cell>{genealogy?.source ?? "—"}</Table.Cell>
                <Table.Cell>
                  {people > 0 ? (
                    `${people}명`
                  ) : (
                    <Badge color="gray" highContrast>
                      아직 없음
                    </Badge>
                  )}
                </Table.Cell>
                <Table.Cell justify="end">
                  <Button asChild size="1" variant="soft">
                    <Link
                      href={`/admin/genealogies/${pantheon.slug}`}
                      aria-label={`${pantheon.name} 계보 ${people > 0 ? "고치기" : "만들기"}`}
                    >
                      {people > 0 ? "고치기" : "만들기"}
                    </Link>
                  </Button>
                </Table.Cell>
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table.Root>
    </>
  );
}

/** 계열의 계보 고치기 */
export async function AdminGenealogyEditPage({ slug }: { slug: string }) {
  const [pantheon, genealogies] = await Promise.all([getPantheon(slug), getGenealogies()]);
  if (!pantheon) notFound();
  const genealogy = genealogies.find((item) => item.pantheonSlug === slug) ?? null;

  return (
    <>
      <PageHeader
        title={`${pantheon.name} 계보`}
        description={`공개 화면: /pantheons/${pantheon.slug}`}
      />
      <GenealogyForm pantheonSlug={slug} genealogy={genealogy} />
    </>
  );
}
