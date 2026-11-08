import { getExhibits } from "@/entities/exhibit/index.server";
import { getFigures } from "@/entities/figure/index.server";
import { getPantheons } from "@/entities/pantheon/index.server";
import { RevealText } from "@/shared/ui";
import { SiteFooter } from "@/widgets/site-footer";

import { FigureIndex, type FigureIndexGroup } from "./FigureIndex";
import styles from "./HomePage.module.css";
import { type ScoreRow, ScoreRows } from "./ScoreRows";
import { type ScoreMovement, ScoreStage } from "./ScoreStage";

import type { Exhibit } from "@/entities/exhibit";
import type { ArchiveImage } from "@/shared/lib";

/** 저작자 표기 의무가 없는 자료. 작은 필름과 콜라주에는 이런 자료만 씁니다. */
const isAttributionFree = (image: ArchiveImage) =>
  /^(public domain|cc0|no restrictions)/i.test(image.credit.license);

export async function HomePage() {
  const [pantheons, figures, exhibits] = await Promise.all([
    getPantheons(),
    getFigures(),
    getExhibits(),
  ]);
  const firstExhibitOf = (figureSlug: string): Exhibit | null =>
    exhibits.find((exhibit) => exhibit.figureSlug === figureSlug) ?? null;

  /** 대표 자료(출처는 화면에 함께 표기)를 앞에 두고, 그 계열의 나머지 자료를 잇습니다. */
  const imagesOf = (pantheon: (typeof pantheons)[number]) => {
    const slugs = new Set(
      figures
        .filter((figure) => figure.pantheonSlug === pantheon.slug)
        .map((figure) => figure.slug),
    );
    const cover = exhibits.find((exhibit) => exhibit.id === pantheon.coverExhibitId);
    const others = exhibits
      .filter((exhibit) => slugs.has(exhibit.figureSlug) && exhibit.id !== cover?.id)
      .map((exhibit) => exhibit.image)
      .filter(isAttributionFree);
    return [...(cover ? [cover.image] : []), ...others];
  };

  const movements: ScoreMovement[] = pantheons.map((pantheon) => ({
    slug: pantheon.slug,
    name: pantheon.name,
    nameEn: pantheon.nameEn,
    eraLabel: pantheon.eraLabel,
    images: imagesOf(pantheon),
  }));

  const rows: ScoreRow[] = pantheons.map((pantheon) => ({
    slug: pantheon.slug,
    name: pantheon.name,
    nameEn: pantheon.nameEn,
    eraLabel: pantheon.eraLabel,
    continent: pantheon.continent,
    earliestSource: pantheon.earliestSource,
    figureCount: figures.filter((figure) => figure.pantheonSlug === pantheon.slug).length,
    images: imagesOf(pantheon).slice(0, 5),
  }));

  const indexGroups: FigureIndexGroup[] = pantheons.map((pantheon) => ({
    pantheonSlug: pantheon.slug,
    pantheonName: pantheon.name,
    figures: figures
      .filter((figure) => figure.pantheonSlug === pantheon.slug)
      .sort((a, b) => a.order - b.order)
      .map((figure) => ({
        slug: figure.slug,
        name: figure.name,
        nameEn: figure.nameEn,
        epithet: figure.epithet,
        image: firstExhibitOf(figure.slug)?.image ?? null,
      })),
  }));

  return (
    <>
      <ScoreStage movements={movements} />

      <section className={`${styles.intro} px-global`} aria-labelledby="intro-title">
        <h2 id="intro-title" className="sr-only">
          소개
        </h2>
        <RevealText
          className={styles.statement}
          text="Ark는 세계 여러 문명의 신화를 한곳에 모은 도서관입니다. 신과 영웅이 어떤 모습으로 새겨지고 그려져 왔는지, 조각상과 회화, 유물로 따라갑니다."
        />
        <RevealText
          className={styles.introNote}
          text="모든 자료는 박물관과 기록 보관소가 공개한 퍼블릭 도메인·CC 라이선스 이미지이며, 각 이미지에 저작자와 라이선스를 밝혔습니다."
        />
      </section>

      <ScoreRows items={rows} />
      <FigureIndex groups={indexGroups} />
      <SiteFooter />
    </>
  );
}
