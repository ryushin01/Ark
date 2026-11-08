import Link from "next/link";
import { notFound } from "next/navigation";

import { getExhibits } from "@/entities/exhibit/index.server";
import { getFiguresByPantheon } from "@/entities/figure/index.server";
import { getPantheon, getPantheons } from "@/entities/pantheon/index.server";
import { Divider, RevealImage, RevealText } from "@/shared/ui";
import { SiteFooter } from "@/widgets/site-footer";

import { type FigureCard, FigureGrid } from "./FigureGrid";
import styles from "./PantheonPage.module.css";

export async function generatePantheonParams() {
  const pantheons = await getPantheons();
  return pantheons.map((pantheon) => ({ slug: pantheon.slug }));
}

/** 제목·설명과, 계열의 대표 자료 이미지를 공유 이미지로 씁니다. */
export async function generatePantheonMetadata(slug: string) {
  const [pantheon, exhibits] = await Promise.all([getPantheon(slug), getExhibits()]);
  if (!pantheon) return {};
  const image = exhibits.find((exhibit) => exhibit.id === pantheon.coverExhibitId)?.image;
  return {
    title: pantheon.name,
    description: pantheon.summary,
    openGraph: {
      title: pantheon.name,
      description: pantheon.summary,
      ...(image && {
        images: [{ url: image.src, width: image.width, height: image.height, alt: image.alt }],
      }),
    },
  };
}

/** 신화 계열 상세: 소개, 대표 자료, 속한 신·인물, 앞뒤 계열 */
export async function PantheonPage({ slug }: { slug: string }) {
  const [pantheon, pantheons, figures, exhibits] = await Promise.all([
    getPantheon(slug),
    getPantheons(),
    getFiguresByPantheon(slug),
    getExhibits(),
  ]);
  if (!pantheon) notFound();

  const cover = exhibits.find((exhibit) => exhibit.id === pantheon.coverExhibitId);
  const index = pantheons.findIndex((item) => item.slug === slug);
  const next = pantheons[(index + 1) % pantheons.length];

  const cards: FigureCard[] = figures.map((figure) => {
    const own = exhibits.filter((exhibit) => exhibit.figureSlug === figure.slug);
    return {
      slug: figure.slug,
      name: figure.name,
      nameEn: figure.nameEn,
      epithet: figure.epithet,
      image: own[0]?.image ?? null,
      exhibitCount: own.length,
    };
  });

  return (
    <>
      <header className={`${styles.header} px-global`}>
        <div className="grid-default">
          <div className={styles.titleCol}>
            <p className={styles.eyebrow}>
              <span lang="en">{pantheon.nameEn} Mythology</span> · {pantheon.region}
            </p>
            <RevealText as="h1" mode="words" text={pantheon.name} className={styles.title} />
          </div>
          <p className={styles.era}>
            <span aria-hidden="true">→ </span>
            {pantheon.eraLabel}
          </p>
        </div>
      </header>

      {cover && (
        <div className={`${styles.cover} px-global`}>
          <RevealImage image={cover.image} fit="cover" sizes="100vw" priority />
        </div>
      )}

      <section className="px-global" aria-labelledby="about-title">
        <Divider />
        <h2 id="about-title" className={styles.srOnly}>
          {pantheon.name} 소개
        </h2>
        <div className={`grid-default ${styles.about}`}>
          <RevealText text={pantheon.summary} className={styles.summary} />
          <div className={styles.description}>
            {pantheon.description.map((paragraph) => (
              <RevealText key={paragraph} text={paragraph} />
            ))}
            <p className={styles.source}>가장 이른 주요 문헌: {pantheon.earliestSource}</p>
          </div>
        </div>
      </section>

      <section className={`${styles.figures} px-global`} aria-labelledby="figures-title">
        <Divider />
        <RevealText
          as="h2"
          id="figures-title"
          mode="words"
          text="신과 영웅"
          className={styles.sectionTitle}
        />
        <FigureGrid figures={cards} />
      </section>

      {next && next.slug !== slug && (
        <nav className={`${styles.next} px-global`} aria-label="다음 계열">
          <Divider />
          <Link href={`/pantheons/${next.slug}`} className={styles.nextLink}>
            <span className={styles.nextLabel}>다음 계열 · {next.eraLabel}</span>
            <span className={styles.nextName}>{next.name}</span>
          </Link>
        </nav>
      )}

      <SiteFooter />
    </>
  );
}
