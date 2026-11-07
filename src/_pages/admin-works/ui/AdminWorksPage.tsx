import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge, Box, Button, Callout, Flex, Table, Text } from "@radix-ui/themes";

import { getFigures } from "@/entities/figure/index.server";
import { WORK_MEDIUM_LABEL, WORK_STATUS_LABEL } from "@/entities/work";
import { getWork, getWorks } from "@/entities/work/index.server";
import { WorkForm, WorkImages } from "@/features/edit-work";
import { isSupabaseEnabled } from "@/shared/api/index.server";
import { features } from "@/shared/config";
import { Notice, PageHeader } from "@/shared/ui/admin";

/** 영향 작품 목록 */
export async function AdminWorksPage({ saved, deleted }: { saved?: string; deleted?: string }) {
  const works = await getWorks();

  return (
    <>
      <PageHeader
        title="영향 작품"
        description="신화의 영향을 받은 게임·애니메이션·소설"
        actions={
          <Button asChild>
            <Link href="/admin/works/new">새 작품 추가</Link>
          </Button>
        }
      />
      {!features.archive && (
        <Callout.Root color="orange" highContrast mb="4">
          <Callout.Text>
            영향 아카이브는 공개 사이트에서 숨겨져 있습니다. 공개로 바꿔도 기능 플래그를 켜기
            전까지는 보이지 않습니다.
          </Callout.Text>
        </Callout.Root>
      )}
      <Notice saved={saved} deleted={deleted} />
      <Table.Root variant="surface">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell>작품</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>분류</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>발표</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>상태</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>
              <span className="sr-only">관리</span>
            </Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {works.map((work) => (
            <Table.Row key={work.slug} align="center">
              <Table.RowHeaderCell>
                <Flex direction="column">
                  <Text weight="medium">{work.title}</Text>
                  <Text size="1" color="gray">
                    {work.titleOriginal}
                  </Text>
                </Flex>
              </Table.RowHeaderCell>
              <Table.Cell>{WORK_MEDIUM_LABEL[work.medium]}</Table.Cell>
              <Table.Cell>{work.year ?? "—"}</Table.Cell>
              <Table.Cell>
                <Badge color={work.status === "published" ? "green" : "gray"}>
                  {WORK_STATUS_LABEL[work.status]}
                </Badge>
              </Table.Cell>
              <Table.Cell justify="end">
                <Button asChild size="1" variant="soft">
                  <Link href={`/admin/works/${work.slug}`} aria-label={`${work.title} 고치기`}>
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

/** 작품 만들기(slug 없음)·고치기 */
export async function AdminWorkEditPage({ slug }: { slug?: string }) {
  const [work, figures] = await Promise.all([
    slug ? getWork(slug) : Promise.resolve(null),
    getFigures(),
  ]);
  if (slug && !work) notFound();

  return (
    <>
      <PageHeader
        title={work ? `${work.title} 고치기` : "새 작품 추가"}
        description="작품 이미지는 저장한 뒤 아래에서 출처와 함께 올립니다."
      />
      <WorkForm
        work={work ?? undefined}
        figures={figures.map(({ slug: value, name }) => ({ slug: value, name }))}
      />
      {work && (
        <Box mt="8">
          <WorkImages
            slug={work.slug}
            title={work.title}
            images={work.images}
            canUpload={isSupabaseEnabled()}
          />
        </Box>
      )}
    </>
  );
}
