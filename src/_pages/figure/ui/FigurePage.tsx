import Link from "next/link";
import { notFound } from "next/navigation";

import { getExhibits } from "@/entities/exhibit/index.server";
import { kindLabel } from "@/entities/figure";
import { getFigure, getFigures } from "@/entities/figure/index.server";
import { findRelatives } from "@/entities/genealogy";
import { getGenealogies } from "@/entities/genealogy/index.server";
import { getPantheon } from "@/entities/pantheon/index.server";
import { WORK_MEDIUM_LABEL } from "@/entities/work";
import { getWorksByFigure } from "@/entities/work/index.server";
import { features } from "@/shared/config";
import { Divider, RevealText } from "@/shared/ui";
import { SiteFooter } from "@/widgets/site-footer";

import { ExhibitGallery } from "./ExhibitGallery";
import { FamilySection } from "./FamilySection";
import styles from "./FigurePage.module.css";

export async function generateFigureParams() {
  const figures = await getFigures();
  return figures.map((figure) => ({ slug: figure.slug }));
}

/** 제목·설명과, 대표 자료 이미지를 공유 이미지로 씁니다. */
export async function generateFigureMetadata(slug: string) {
  const [figure, exhibits] = await Promise.all([getFigure(slug), getExhibits()]);
  if (!figure) return {};
  const image = exhibits.find((exhibit) => exhibit.figureSlug === slug)?.image;
  return {
    title: figure.name,
    description: figure.summary,
    openGraph: {
      title: `${figure.name} — ${figure.epithet}`,
      description: figure.summary,
      ...(image && {
        images: [{ url: image.src, width: image.width, height: image.height, alt: image.alt }],
      }),
    },
  };
}

/** 신·인물 상세: 소개, 소장 자료, (아카이브가 켜져 있으면) 영향을 받은 작품, 같은 계열의 다른 신 */
export async function FigurePage({ slug }: { slug: string }) {
  const [figure, figures, exhibits] = await Promise.all([
    getFigure(slug),
    getFigures(),
    getExhibits(),
  ]);
  if (!figure) notFound();

  const [pantheon, works, genealogies] = await Promise.all([
    getPantheon(figure.pantheonSlug),
    features.archive ? getWorksByFigure(slug) : Promise.resolve([]),
    getGenealogies(),
  ]);
  const own = exhibits.filter((exhibit) => exhibit.figureSlug === slug);
  const siblings = figures
    .filter((item) => item.pantheonSlug === figure.pantheonSlug && item.slug !== slug)
    .sort((a, b) => a.order - b.order);

  return (
    <>
      <header className={`${styles.header} px-global`}>
        {pantheon && (
          <nav aria-label="현재 위치" className={styles.breadcrumb}>
            <ol>
              <li>
                <Link href="/">홈</Link>
              </li>
              <li>
                <Link href={`/pantheons/${pantheon.slug}`}>{pantheon.name}</Link>
              </li>
              <li aria-current="page">{figure.name}</li>
            </ol>
          </nav>
        )}
        <div className="grid-default">
          <div className={styles.titleCol}>
            <p className={styles.eyebrow}>
              <span lang="en">{figure.nameEn}</span> · {kindLabel(figure)}
            </p>
            <RevealText as="h1" mode="words" text={figure.name} className={styles.title} />
            <p className={styles.epithet}>{figure.epithet}</p>
          </div>
          <div className={styles.domains}>
            <h2 className={styles.domainsTitle}>관장하는 영역</h2>
            <ul>
              {figure.domains.map((domain) => (
                <li key={domain}>{domain}</li>
              ))}
            </ul>
          </div>
        </div>
      </header>

      <section className="px-global" aria-labelledby="about-title">
        <Divider />
        <h2 id="about-title" className={styles.srOnly}>
          {figure.name} 소개
        </h2>
        <div className={`grid-default ${styles.about}`}>
          <RevealText text={figure.summary} className={styles.summary} />
          <div className={styles.description}>
            {figure.description.map((paragraph) => (
              <RevealText key={paragraph} text={paragraph} />
            ))}
          </div>
        </div>
      </section>

      <FamilySection
        relatives={findRelatives(genealogies, slug)}
        pantheonSlug={figure.pantheonSlug}
      />

      <section className={`${styles.section} px-global`} aria-labelledby="exhibits-title">
        <Divider />
        <h2 id="exhibits-title" className={styles.sectionTitle}>
          소장 자료 <span className={styles.count}>{own.length}점</span>
        </h2>
        <ExhibitGallery exhibits={own} />
      </section>

      {works.length > 0 && (
        <section className={`${styles.section} px-global`} aria-labelledby="works-title">
          <Divider />
          <h2 id="works-title" className={styles.sectionTitle}>
            이 신화가 남긴 흔적
          </h2>
          <ul className={styles.works}>
            {works.map((work) => (
              <li key={work.slug}>
                <Link href={`/archive#${work.slug}`} className={styles.workLink}>
                  <span className={styles.workTitle}>{work.title}</span>
                  <span className={styles.workMeta}>
                    {WORK_MEDIUM_LABEL[work.medium]}
                    {work.year && ` · ${work.year}`}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {siblings.length > 0 && pantheon && (
        <nav className={`${styles.section} px-global`} aria-labelledby="siblings-title">
          <Divider />
          <h2 id="siblings-title" className={styles.siblingsTitle}>
            {pantheon.name}의 다른 신
          </h2>
          <ul className={styles.siblings}>
            {siblings.map((item) => (
              <li key={item.slug}>
                <Link href={`/figures/${item.slug}`} className={styles.siblingLink}>
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}

      <SiteFooter />
    </>
  );
}
