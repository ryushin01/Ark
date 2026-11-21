import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getExhibits } from "@/entities/exhibit/index.server";
import { getFigures } from "@/entities/figure/index.server";
import { getPantheons } from "@/entities/pantheon/index.server";
import { neighborsOf, RELIC_KIND_LABEL } from "@/entities/relic";
import { getRelic, getRelics } from "@/entities/relic/index.server";
import { monogram, skipsOptimization } from "@/shared/lib";
import { SiteFooter } from "@/widgets/site-footer";

import { relicNo } from "../model/relic-no";
import { LorePlayer } from "./LorePlayer";
import styles from "./RelicPage.module.css";
import { VaultMasthead, VaultMenu } from "./VaultChrome";

import "./vault-theme.css";

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
    alternates: { canonical: `/vault/${slug}` },
    openGraph: {
      title: `${relic.name} (${relic.nameEn})`,
      description: relic.power,
      ...(image && {
        images: [{ url: image.src, width: image.width, height: image.height, alt: image.alt }],
      }),
    },
  };
}

/** 이름 길이에 따라 큰 이름의 크기를 고릅니다(짧은 이름은 레퍼런스처럼 아주 크게). */
const nameSize = (name: string) => (name.length <= 5 ? "xl" : name.length <= 9 ? "lg" : "md");

/**
 * 유물 상세: 같은 그림을 크게 흐리게 깐 배경 위에 번호와 큰 이름, 가운데 정사각형 진열 패널,
 * 오른쪽에 '이야기 듣기'(브라우저 음성 합성)와 힘(요지)·기원·대가·지닌 이를 둡니다.
 */
export async function RelicPage({ slug }: { slug: string }) {
  const [relic, relics, figures, exhibits, pantheons] = await Promise.all([
    getRelic(slug),
    getRelics(),
    getFigures(),
    getExhibits(),
    getPantheons(),
  ]);
  if (!relic) notFound();

  const exhibit = exhibits.find((item) => item.id === relic.exhibitId) ?? null;
  const image = exhibit?.image ?? null;
  const owners = relic.figureSlugs
    .map((figureSlug) => figures.find((figure) => figure.slug === figureSlug))
    .filter((figure) => figure !== undefined);
  const pantheon = pantheons.find((item) => item.slug === owners[0]?.pantheonSlug);
  const neighbors = neighborsOf(relics, slug);
  const lore = [`${relic.name}.`, relic.origin, relic.power, relic.price].filter(Boolean).join(" ");

  return (
    <div className={`vault-theme theme-dark ${styles.page}`}>
      <section className={styles.hero} aria-labelledby="relic-name">
        <div className={styles.backdrop} aria-hidden="true">
          {image && (
            <Image
              src={image.src}
              alt=""
              fill
              sizes="25vw"
              unoptimized={skipsOptimization(image.src)}
              className={styles.backdropImage}
            />
          )}
        </div>

        <header className={styles.top}>
          <VaultMasthead count={relics.length} heading={false} />
          <VaultMenu
            lead={
              <Link href="/vault" className={styles.back}>
                캔버스로 돌아가기
              </Link>
            }
          />
        </header>

        <div className={styles.grid}>
          <div className={styles.identity}>
            <p className={styles.no} lang="en">
              N°{relicNo(relic.order)}
            </p>
            <h1 id="relic-name" className={styles.name} data-size={nameSize(relic.name)}>
              {relic.name}
            </h1>
            <p className={styles.nameEn} lang="en">
              {relic.nameEn}
            </p>
          </div>

          <dl className={styles.origins}>
            <div>
              <dt>전하는 문헌</dt>
              <dd>{relic.source}</dd>
            </div>
            <div>
              <dt>계열 · 갈래</dt>
              <dd>
                {pantheon ? `${pantheon.name} · ` : ""}
                {RELIC_KIND_LABEL[relic.kind]}
              </dd>
            </div>
          </dl>

          <figure className={styles.panel}>
            {image ? (
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes="(min-width: 1024px) 34vw, 92vw"
                loading="eager"
                fetchPriority="high"
                unoptimized={skipsOptimization(image.src)}
                className={styles.panelImage}
              />
            ) : (
              <div className={styles.empty}>
                <span aria-hidden="true" className={styles.glyph} lang="en">
                  {monogram(relic.nameEn)}
                </span>
                <figcaption>전하는 그림이 없는 유물</figcaption>
              </div>
            )}
          </figure>

          <div className={styles.player}>
            <LorePlayer text={lore} />
          </div>

          <div className={styles.story}>
            <p className={styles.label}>힘</p>
            <p className={styles.gist} data-long={relic.power.length > 70 || undefined}>
              {relic.power}
            </p>
            <dl className={styles.facts}>
              <div>
                <dt>기원</dt>
                <dd>{relic.origin}</dd>
              </div>
              {relic.price && (
                <div>
                  <dt>대가</dt>
                  <dd>{relic.price}</dd>
                </div>
              )}
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
        </div>
      </section>

      {neighbors && (
        <nav className={styles.pager} aria-label="다른 유물">
          <Link href={`/vault/${neighbors.prev.slug}`} className={styles.pagerLink} rel="prev">
            <span className={styles.pagerLabel}>이전 유물</span>
            {neighbors.prev.name}
          </Link>
          <Link
            href={`/vault/${neighbors.next.slug}`}
            className={`${styles.pagerLink} ${styles.pagerNext}`}
            rel="next"
          >
            <span className={styles.pagerLabel}>다음 유물</span>
            {neighbors.next.name}
          </Link>
        </nav>
      )}

      <SiteFooter />
    </div>
  );
}
