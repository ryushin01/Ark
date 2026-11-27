import groupBy from "lodash-es/groupBy";
import sortBy from "lodash-es/sortBy";

import { getExhibits, unlistedCredit } from "@/entities/exhibit/index.server";
import { getFigures } from "@/entities/figure/index.server";
import { getPantheons } from "@/entities/pantheon/index.server";
import { toThumb } from "@/shared/lib";
import { RevealText } from "@/shared/ui";
import { SiteFooter } from "@/widgets/site-footer";

import { FigureIndex, type FigureIndexGroup } from "./FigureIndex";
import styles from "./HomePage.module.css";
import { type ScoreRow, ScoreRows } from "./ScoreRows";
import { type ScoreMovement, ScoreStage } from "./ScoreStage";

import type { ArchiveImage } from "@/shared/lib";
import type { Metadata } from "next";

/** 홈은 제목·설명을 루트 레이아웃의 기본값으로 쓰고 canonical만 정합니다. */
export const homeMetadata: Metadata = { alternates: { canonical: "/" } };

/** 첫 화면 무대의 콜라주 자리 수(ScoreStage의 SLOTS) */
const STAGE_IMAGES = 5;

/** 저작자 표기 의무가 없는 자료. 작은 필름과 콜라주에는 이런 자료만 씁니다. */
const isAttributionFree = (image: ArchiveImage) =>
  /^(public domain|cc0|no restrictions)/i.test(image.credit.license);

export async function HomePage() {
  const [pantheons, figures, exhibits] = await Promise.all([
    getPantheons(),
    getFigures(),
    getExhibits(),
  ]);
  /** 계열마다 그 계열의 신·인물(정해 둔 순서대로) */
  const figuresByPantheon = groupBy(sortBy(figures, "order"), "pantheonSlug");
  const figuresOf = (pantheonSlug: string) => figuresByPantheon[pantheonSlug] ?? [];
  const thumbOf = (figureSlug: string) => {
    const exhibit = exhibits.find((item) => item.figureSlug === figureSlug);
    return exhibit ? toThumb(exhibit.image) : null;
  };

  /** 대표 자료를 앞에 두고, 그 계열의 나머지 자료를 잇습니다. */
  const imagesOf = (pantheon: (typeof pantheons)[number]) => {
    const slugs = new Set(figuresOf(pantheon.slug).map((figure) => figure.slug));
    const cover = exhibits.find((exhibit) => exhibit.id === pantheon.coverExhibitId);
    const others = exhibits
      .filter((exhibit) => slugs.has(exhibit.figureSlug) && exhibit.id !== cover?.id)
      .map((exhibit) => exhibit.image)
      .filter(isAttributionFree);
    return [...(cover ? [cover.image] : []), ...others];
  };

  const imagesBySlug = new Map(pantheons.map((pantheon) => [pantheon.slug, imagesOf(pantheon)]));

  const movements: ScoreMovement[] = pantheons.map((pantheon) => {
    const images = imagesBySlug.get(pantheon.slug) ?? [];
    const cover = exhibits.find((exhibit) => exhibit.id === pantheon.coverExhibitId);
    // 출처는 README의 출처 전체 목록에 모읍니다. 목록에 없는 대표 자료만 무대에 출처를 함께 넘깁니다.
    const coverCredit = cover ? unlistedCredit(cover) : null;
    return {
      slug: pantheon.slug,
      name: pantheon.name,
      nameEn: pantheon.nameEn,
      eraLabel: pantheon.eraLabel,
      // 무대는 콜라주 5장(필름은 그중 3장)만 쓰므로 그만큼만 브라우저로 넘깁니다.
      images: images.slice(0, STAGE_IMAGES).map(toThumb),
      ...(coverCredit ? { coverCredit } : {}),
    };
  });

  const rows: ScoreRow[] = pantheons.map((pantheon) => ({
    slug: pantheon.slug,
    name: pantheon.name,
    nameEn: pantheon.nameEn,
    eraLabel: pantheon.eraLabel,
    continent: pantheon.continent,
    earliestSource: pantheon.earliestSource,
    figureCount: figuresOf(pantheon.slug).length,
    images: (imagesBySlug.get(pantheon.slug) ?? []).slice(0, 5).map(toThumb),
  }));

  const indexGroups: FigureIndexGroup[] = pantheons.map((pantheon) => ({
    pantheonSlug: pantheon.slug,
    pantheonName: pantheon.name,
    figures: figuresOf(pantheon.slug).map((figure) => ({
      slug: figure.slug,
      name: figure.name,
      nameEn: figure.nameEn,
      epithet: figure.epithet,
      image: thumbOf(figure.slug),
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
          text={
            <>
              <span className={styles.brand} lang="en">
                Ark
              </span>
              는 세계 여러 문명의 신화를 한곳에 모은 도서관입니다. 신과 영웅이 어떤 모습으로
              새겨지고 그려져 왔는지, 조각상과 회화, 유물로 따라갑니다.
            </>
          }
        />
        <RevealText
          className={styles.introNote}
          text="모든 자료는 박물관과 기록 보관소가 공개한 퍼블릭 도메인·CC 라이선스 이미지입니다. 저작자와 라이선스는 맨 아래 '자료 출처'에 모았습니다."
        />
      </section>

      <ScoreRows items={rows} />
      <FigureIndex groups={indexGroups} />
      <SiteFooter />
    </>
  );
}
