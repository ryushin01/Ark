import Link from "next/link";
import { Callout, Card, Flex, Grid, Heading, Link as RadixLink, Text } from "@radix-ui/themes";

import { getExhibits } from "@/entities/exhibit/index.server";
import { getFigures } from "@/entities/figure/index.server";
import { getPantheons } from "@/entities/pantheon/index.server";
import { getWorks } from "@/entities/work/index.server";
import { isSupabaseEnabled } from "@/shared/api/index.server";
import { features } from "@/shared/config";
import { PageHeader } from "@/shared/ui/admin";

/** 대시보드: 항목별 개수, 데이터 저장 방식 안내 */
export async function AdminDashboardPage() {
  const [pantheons, figures, exhibits, works] = await Promise.all([
    getPantheons(),
    getFigures(),
    getExhibits(),
    getWorks(),
  ]);
  const draftCount = works.filter((work) => work.status === "draft").length;
  const missingAlt = exhibits.filter((exhibit) => exhibit.image.alt.trim().length < 5).length;

  const cards = [
    {
      href: "/admin/pantheons",
      label: "신화 계열",
      count: pantheons.length,
      note: "연대기 순서와 대표 자료",
    },
    {
      href: "/admin/figures",
      label: "신·인물",
      count: figures.length,
      note: "이름, 별칭, 영역, 소개",
    },
    {
      href: "/admin/exhibits",
      label: "소장 자료",
      count: exhibits.length,
      note: `대체 텍스트 확인 필요 ${missingAlt}점`,
    },
    {
      href: "/admin/works",
      label: "영향 작품",
      count: works.length,
      note: `비공개(확인 중) ${draftCount}개`,
    },
  ];

  return (
    <>
      <PageHeader title="대시보드" description="도서관에 등록된 항목을 한눈에 봅니다." />
      <Flex direction="column" gap="3" mb="6">
        <Callout.Root color={isSupabaseEnabled() ? "green" : "gray"}>
          <Callout.Text>
            {isSupabaseEnabled()
              ? "Supabase 데이터베이스에 저장하고, 이미지는 Supabase Storage에 올립니다."
              : "지금은 목업 저장소로 동작합니다. 저장한 내용은 서버가 다시 시작되면 처음 데이터로 돌아가고, 이미지 업로드는 쓸 수 없습니다."}
          </Callout.Text>
        </Callout.Root>
        {!features.archive && (
          <Callout.Root color="orange" highContrast>
            <Callout.Text>
              영향 아카이브는 공개 사이트에서 숨겨져 있습니다. 작품 정보는 여기서 미리 관리할 수
              있습니다.
            </Callout.Text>
          </Callout.Root>
        )}
      </Flex>
      <Heading as="h2" size="4" mb="3">
        항목
      </Heading>
      <Grid columns={{ initial: "1", sm: "2", md: "4" }} gap="4" asChild>
        <ul>
          {cards.map((card) => (
            <li key={card.href}>
              <Card asChild size="3">
                <Link href={card.href}>
                  <Flex direction="column" gap="1">
                    <Text size="2" color="gray">
                      {card.label}
                    </Text>
                    <Text size="8" weight="bold">
                      {card.count}
                    </Text>
                    <Text size="2">{card.note}</Text>
                  </Flex>
                </Link>
              </Card>
            </li>
          ))}
        </ul>
      </Grid>
      <Text as="p" size="2" color="gray" mt="6">
        <RadixLink asChild>
          <Link href="/">공개 사이트에서 확인하기</Link>
        </RadixLink>
      </Text>
    </>
  );
}
