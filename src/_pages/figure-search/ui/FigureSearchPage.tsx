import { getExhibits } from "@/entities/exhibit/index.server";
import { kindLabel } from "@/entities/figure";
import { getFigures } from "@/entities/figure/index.server";
import { getPantheons } from "@/entities/pantheon/index.server";
import { getRelics } from "@/entities/relic/index.server";
import { toThumb } from "@/shared/lib";
import { RevealText } from "@/shared/ui";
import { SiteFooter } from "@/widgets/site-footer";

import { FigureSearch } from "./FigureSearch";
import styles from "./FigureSearchPage.module.css";

import type { SearchItem } from "../model/search";
import type { Metadata } from "next";

export const figureSearchMetadata: Metadata = {
  title: "신 찾기",
  description:
    "세계 신화의 신과 영웅을 이름, 별칭, 관장 영역, 지닌 유물, 대륙, 분류로 찾습니다. 초성으로도 찾을 수 있습니다.",
};

/** 모든 신·인물을 이름·영역·유물·대륙으로 찾는 화면. 순서는 계열 연대기 순서를 따릅니다. */
export async function FigureSearchPage() {
  const [pantheons, figures, exhibits, relics] = await Promise.all([
    getPantheons(),
    getFigures(),
    getExhibits(),
    getRelics(),
  ]);
  /** 신·인물마다 지니거나 관련된 유물 이름(한글·영문) */
  const relicNames = new Map<string, string[]>();
  for (const relic of relics) {
    for (const slug of relic.figureSlugs) {
      relicNames.set(slug, [...(relicNames.get(slug) ?? []), relic.name, relic.nameEn]);
    }
  }

  const items: SearchItem[] = pantheons.flatMap((pantheon) =>
    figures
      .filter((figure) => figure.pantheonSlug === pantheon.slug)
      .map((figure) => {
        const own = exhibits.filter((exhibit) => exhibit.figureSlug === figure.slug);
        return {
          slug: figure.slug,
          name: figure.name,
          nameEn: figure.nameEn,
          epithet: figure.epithet,
          kind: figure.kind,
          kindLabel: kindLabel(figure),
          image: own[0] ? toThumb(own[0].image) : null,
          exhibitCount: own.length,
          domains: figure.domains,
          pantheonName: pantheon.name,
          continent: pantheon.continent,
          relics: relicNames.get(figure.slug) ?? [],
        };
      }),
  );

  return (
    <>
      <header className={`${styles.header} px-global`}>
        <p className={styles.eyebrow}>
          <span lang="en">Search</span> · 신화 {pantheons.length}개 계열
        </p>
        <RevealText as="h1" mode="words" text="신 찾기" className={styles.title} />
      </header>
      <section className={`${styles.results} px-global`} aria-label="찾기와 결과">
        <FigureSearch items={items} />
      </section>
      <SiteFooter />
    </>
  );
}
