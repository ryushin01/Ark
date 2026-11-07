import { getExhibits } from "@/entities/exhibit/index.server";
import { getFigures } from "@/entities/figure/index.server";
import { getPantheons } from "@/entities/pantheon/index.server";
import { Divider, RevealImage, RevealText } from "@/shared/ui";
import { FigureIndex, type FigureIndexGroup } from "@/widgets/figure-index";
import { HomeHero } from "@/widgets/home-hero";
import { PantheonTimeline, type TimelineItem } from "@/widgets/pantheon-timeline";
import { SiteFooter } from "@/widgets/site-footer";

import styles from "./HomePage.module.css";

import type { Exhibit } from "@/entities/exhibit";

/** 첫 화면 이미지. 저작자 표기가 필요 없는 퍼블릭 도메인·CC0 자료만 씁니다. */
const HERO_EXHIBIT_IDS = [
  "zeus-otricoli",
  "thor-jotnar",
  "queen-of-night",
  "shiva-nataraja",
  "venus-de-milo",
  "isis-horus",
  "odin-wanderer",
  "raijin-hokusai",
];

/** 소개 문단 아래 세 장 */
const INTRO_EXHIBIT_IDS = ["athena-giustiniani", "ishtar-gate-lion", "susanoo-orochi"];

const pick = (exhibits: Exhibit[], ids: string[]) =>
  ids.flatMap((id) => exhibits.find((exhibit) => exhibit.id === id) ?? []);

export async function HomePage() {
  const [pantheons, figures, exhibits] = await Promise.all([
    getPantheons(),
    getFigures(),
    getExhibits(),
  ]);
  const firstExhibitOf = (figureSlug: string) =>
    exhibits.find((exhibit) => exhibit.figureSlug === figureSlug) ?? null;

  const timelineItems: TimelineItem[] = pantheons.map((pantheon) => ({
    slug: pantheon.slug,
    name: pantheon.name,
    nameEn: pantheon.nameEn,
    eraLabel: pantheon.eraLabel,
    earliestSource: pantheon.earliestSource,
    summary: pantheon.summary,
    figureCount: figures.filter((figure) => figure.pantheonSlug === pantheon.slug).length,
    cover: exhibits.find((exhibit) => exhibit.id === pantheon.coverExhibitId)?.image ?? null,
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
    <div className={`theme-dark ${styles.page}`}>
      <HomeHero images={pick(exhibits, HERO_EXHIBIT_IDS).map((exhibit) => exhibit.image)} />

      <div className={styles.content}>
        <section className="px-global" aria-labelledby="intro-title">
          <Divider />
          <h2 id="intro-title" className={styles.srOnly}>
            소개
          </h2>
          <RevealText
            className={styles.statement}
            text="Ark는 세계 여러 문명의 신화를 한곳에 모은 도서관입니다. 신과 영웅이 어떤 모습으로 새겨지고 그려져 왔는지, 조각상과 회화, 유물로 따라갑니다."
          />
          <div className={`grid-default ${styles.introRow}`}>
            <RevealText
              className={styles.introNote}
              text="모든 자료는 박물관과 기록 보관소가 공개한 퍼블릭 도메인·CC 라이선스 이미지이며, 각 이미지에 저작자와 라이선스를 밝혔습니다."
            />
          </div>
          <ul className={`grid-default ${styles.introImages}`}>
            {pick(exhibits, INTRO_EXHIBIT_IDS).map((exhibit) => (
              <li key={exhibit.id} className={styles.introImage}>
                <RevealImage
                  image={exhibit.image}
                  fit="cover"
                  sizes="(min-width: 768px) 33vw, 80vw"
                />
              </li>
            ))}
          </ul>
          <Divider />
        </section>

        <PantheonTimeline items={timelineItems} />
        <FigureIndex groups={indexGroups} />
        <SiteFooter />
      </div>
    </div>
  );
}
