import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button, Flex, Table, Text } from "@radix-ui/themes";

import { EXHIBIT_KIND_LABEL } from "@/entities/exhibit";
import { getExhibit, getExhibits } from "@/entities/exhibit/index.server";
import { getFigures } from "@/entities/figure/index.server";
import { isSupabaseEnabled } from "@/shared/api/index.server";
import { Notice, PageHeader } from "@/shared/ui/admin";

import { ExhibitForm } from "./ExhibitForm";

/** 소장 자료 목록 */
export async function AdminExhibitsPage({ saved, deleted }: { saved?: string; deleted?: string }) {
  const [exhibits, figures] = await Promise.all([getExhibits(), getFigures()]);
  const figureName = (slug: string) => figures.find((figure) => figure.slug === slug)?.name ?? slug;

  return (
    <>
      <PageHeader
        title="소장 자료"
        description={`${exhibits.length}점 · 이미지 업로드는 Supabase 연결 후 사용할 수 있습니다.`}
      />
      <Notice saved={saved} deleted={deleted} />
      <Table.Root variant="surface">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell>
              <span className="sr-only">미리보기</span>
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>자료</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>신</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>라이선스</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>
              <span className="sr-only">관리</span>
            </Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {exhibits.map((exhibit) => (
            <Table.Row key={exhibit.id} align="center">
              <Table.Cell>
                <Image
                  src={exhibit.image.src}
                  alt=""
                  width={48}
                  height={Math.round((48 * exhibit.image.height) / exhibit.image.width)}
                  style={{ maxHeight: 64, width: 48, objectFit: "cover" }}
                />
              </Table.Cell>
              <Table.RowHeaderCell>
                <Flex direction="column">
                  <Text weight="medium">{exhibit.title}</Text>
                  <Text size="1" color="gray">
                    {EXHIBIT_KIND_LABEL[exhibit.kind]}
                    {exhibit.dateLabel && ` · ${exhibit.dateLabel}`}
                  </Text>
                </Flex>
              </Table.RowHeaderCell>
              <Table.Cell>{figureName(exhibit.figureSlug)}</Table.Cell>
              <Table.Cell>{exhibit.image.credit.license}</Table.Cell>
              <Table.Cell justify="end">
                <Button asChild size="1" variant="soft">
                  <Link
                    href={`/admin/exhibits/${exhibit.id}`}
                    aria-label={`${exhibit.title} 고치기`}
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

/** 자료 만들기(id 없음)·고치기 */
export async function AdminExhibitEditPage({ id }: { id?: string }) {
  const [exhibit, figures] = await Promise.all([
    id ? getExhibit(id) : Promise.resolve(null),
    getFigures(),
  ]);
  if (id && !exhibit) notFound();
  const form = (
    <ExhibitForm
      exhibit={exhibit ?? undefined}
      figures={figures.map(({ slug, name }) => ({ slug, name }))}
      canUpload={isSupabaseEnabled()}
    />
  );

  if (!exhibit) {
    return (
      <>
        <PageHeader title="새 자료 추가" description="* 표시는 꼭 입력해야 하는 칸입니다." />
        {form}
      </>
    );
  }

  return (
    <>
      <PageHeader title={`${exhibit.title} 고치기`} />
      <Flex gap="6" direction={{ initial: "column", md: "row" }} align="start">
        <figure style={{ margin: 0, flex: "0 0 240px" }}>
          <Image
            src={exhibit.image.src}
            alt={exhibit.image.alt}
            width={exhibit.image.width}
            height={exhibit.image.height}
            sizes="240px"
            style={{ width: 240, height: "auto" }}
          />
          <Text as="p" size="1" color="gray" mt="2">
            지금 이미지
          </Text>
        </figure>
        <div style={{ flex: 1, minWidth: 0, width: "100%" }}>{form}</div>
      </Flex>
    </>
  );
}
