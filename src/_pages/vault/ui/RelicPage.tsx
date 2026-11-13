import Link from "next/link";
import { notFound } from "next/navigation";

import { getExhibits } from "@/entities/exhibit/index.server";
import { getFigures } from "@/entities/figure/index.server";
import { neighborsOf, RELIC_KIND_LABEL } from "@/entities/relic";
import { getRelic, getRelics } from "@/entities/relic/index.server";
import { SiteFooter } from "@/widgets/site-footer";

import { RelicImage } from "./RelicImage";
import styles from "./RelicPage.module.css";

export async function generateRelicParams() {
  const relics = await getRelics();
  return relics.map((relic) => ({ slug: relic.slug }));
}

/** 제목·설명과 유물 그림을 공유 이미지로 씁니다. */
export async function generateRelicMetadata(slug: string) {
  const [relic, exhibits] = await Promise.all([getRelic(slug), getExhibits()]);
  if (!relic) return {};
  const image = exhibits.find((exhibit) => exhibit.id === relic.exhibitId)?.image;
  return {
    title: `${relic.name} — 비밀 전시실`,
    description: relic.power,
    openGraph: {
      title: `${relic.name} (${relic.nameEn})`,
      description: relic.power,
      ...(image && {
        images: [{ url: image.src, width: image.width, height: image.height, alt: image.alt }],
      }),
    },
  };
}

/** 유물 상세: 진열장, 기원·힘·대가·문헌, 지닌 이, 앞뒤 유물 */
export async function RelicPage({ slug }: { slug: string }) {
  const [relic, relics, figures, exhibits] = await Promise.all([
    getRelic(slug),
    getRelics(),
    getFigures(),
    getExhibits(),
  ]);
  if (!relic) notFound();

  const exhibit = exhibits.find((item) => item.id === relic.exhibitId) ?? null;
  const owners = relic.figureSlugs
    .map((figureSlug) => figures.find((figure) => figure.slug === figureSlug))
    .filter((figure) => figure !== undefined);
  const neighbors = neighborsOf(relics, slug);

  return (
    <div className={`theme-dark ${styles.page}`}>
      <header className={`${styles.header} px-global`}>
        <nav aria-label="현재 위치" className={styles.breadcrumb}>
          <ol>
            <li>
              <Link href="/">홈</Link>
            </li>
            <li>
              <Link href="/vault">비밀 전시실</Link>
            </li>
            <li aria-current="page">{relic.name}</li>
          </ol>
        </nav>
        <p className={styles.no}>
          <span lang="en">No. {String(relic.order).padStart(2, "0")}</span> ·{" "}
          {RELIC_KIND_LABEL[relic.kind]}
        </p>
        <h1 className={styles.title}>{relic.name}</h1>
        <p className={styles.nameEn} lang="en">
          {relic.nameEn}
        </p>
      </header>

      <div className={`${styles.body} px-global`}>
        <div className={styles.visual}>
          <RelicImage
            image={exhibit?.image ?? null}
            nameEn={relic.nameEn}
            sizes="(min-width: 1024px) 50vw, 100vw"
            eager
          />
          {exhibit && (
            <p className={styles.caption}>
              {exhibit.title}
              {exhibit.dateLabel && ` · ${exhibit.dateLabel}`}
            </p>
          )}
        </div>

        <dl className={styles.facts}>
          <div>
            <dt>기원</dt>
            <dd>{relic.origin}</dd>
          </div>
          <div>
            <dt>힘</dt>
            <dd>{relic.power}</dd>
          </div>
          {relic.price && (
            <div>
              <dt>대가</dt>
              <dd>{relic.price}</dd>
            </div>
          )}
          <div>
            <dt>전하는 문헌</dt>
            <dd>{relic.source}</dd>
          </div>
          {owners.length > 0 && (
            <div>
              <dt>지닌 이</dt>
              <dd>
                <ul className={styles.owners}>
                  {owners.map((figure) => (
                    <li key={figure.slug}>
                      <Link href={`/figures/${figure.slug}`} className={styles.link}>
                        {figure.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </dd>
            </div>
          )}
        </dl>
      </div>

      {neighbors && (
        <nav className={`${styles.pager} px-global`} aria-label="다른 유물">
          <Link href={`/vault/${neighbors.prev.slug}`} className={styles.pagerLink} rel="prev">
            <span className={styles.pagerLabel}>이전 진열장</span>
            {neighbors.prev.name}
          </Link>
          <Link href="/vault" className={styles.link}>
            전시실로 돌아가기
          </Link>
          <Link href={`/vault/${neighbors.next.slug}`} className={styles.pagerLink} rel="next">
            <span className={styles.pagerLabel}>다음 진열장</span>
            {neighbors.next.name}
          </Link>
        </nav>
      )}

      <SiteFooter />
    </div>
  );
}
