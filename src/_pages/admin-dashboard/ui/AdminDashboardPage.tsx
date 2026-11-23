import Link from "next/link";
import { Callout, Flex, Heading } from "@radix-ui/themes";

import { getExhibits } from "@/entities/exhibit/index.server";
import { getFigures } from "@/entities/figure/index.server";
import { getGenealogies } from "@/entities/genealogy/index.server";
import { getPantheons } from "@/entities/pantheon/index.server";
import { getRelics } from "@/entities/relic/index.server";
import { getWorks } from "@/entities/work/index.server";
import { isSupabaseEnabled } from "@/shared/api/index.server";
import { features } from "@/shared/config";
import { PageHeader } from "@/shared/ui/admin";

import styles from "./AdminDashboardPage.module.css";

/**
 * 대시보드: 항목별 개수(어드민 메뉴 순서), 데이터 저장 방식 안내
 * 항목은 번호와 사선이 붙은 큰 세리프 목록으로 보여 줍니다. 번호는 CSS 카운터라 읽는 이름에 들어가지 않습니다.
 */
export async function AdminDashboardPage() {
  const [pantheons, figures, genealogies, exhibits, relics, works] = await Promise.all([
    getPantheons(),
    getFigures(),
    getGenealogies(),
    getExhibits(),
    getRelics(),
    getWorks(),
  ]);
  const draftCount = works.filter((work) => work.status === "draft").length;
  const missingAlt = exhibits.filter((exhibit) => exhibit.image.alt.trim().length < 5).length;
  const relicsWithoutImage = relics.filter((relic) => relic.exhibitId === null).length;

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
      href: "/admin/genealogies",
      label: "계보",
      count: genealogies.length,
      note: "가계도가 있는 신화 계열",
    },
    {
      href: "/admin/exhibits",
      label: "소장 자료",
      count: exhibits.length,
      note: `대체 텍스트 확인 필요 ${missingAlt}점`,
    },
    {
      href: "/admin/relics",
      label: "유물",
      count: relics.length,
      note: `그림 없는 유물 ${relicsWithoutImage}점`,
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
      <PageHeader hero title="대시보드" description="도서관에 등록된 항목을 한눈에 봅니다." />
      <a href="#admin-items" className={styles.scrollCue}>
        항목 보기
      </a>
      <Flex direction="column" gap="3" mb="9" className={styles.notices}>
        <Callout.Root color={isSupabaseEnabled() ? "green" : "gray"} highContrast>
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
      <section aria-labelledby="admin-items" className={styles.section}>
        <Heading as="h2" id="admin-items" tabIndex={-1} className={styles.sectionTitle}>
          항목
        </Heading>
        <ol className={styles.list}>
          {cards.map((card) => (
            <li key={card.href} className={styles.item}>
              <Link href={card.href} className={styles.row}>
                <span className={styles.label}>{card.label}</span>
                <span className={styles.count}>{card.count}</span>
                <span className={styles.note}>{card.note}</span>
              </Link>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
