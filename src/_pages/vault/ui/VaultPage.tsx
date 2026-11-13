import Link from "next/link";

import { getExhibits } from "@/entities/exhibit/index.server";
import { getFigures } from "@/entities/figure/index.server";
import { getPantheons } from "@/entities/pantheon/index.server";
import { RELIC_KIND_LABEL } from "@/entities/relic";
import { getRelics } from "@/entities/relic/index.server";
import { RevealText } from "@/shared/ui";
import { SiteFooter } from "@/widgets/site-footer";

import { groupByPantheon } from "../model/group";
import { RelicImage } from "./RelicImage";
import styles from "./VaultPage.module.css";

export const vaultMetadata = {
  title: "비밀 전시실",
  description:
    "묠니르, 아이기스, 구사나기의 검, 천부인, 성배처럼 신과 영웅이 쥐었던 신화 속 유물을, 그 힘과 그 힘이 치르게 한 대가와 함께 전시합니다.",
};

const pad = (order: number) => String(order).padStart(2, "0");

/** 비밀 전시실: 신화 속 유물을 한 점씩 진열장에 놓고, 기원·힘·대가를 함께 보여 줍니다. */
export async function VaultPage() {
  const [relics, figures, exhibits, pantheons] = await Promise.all([
    getRelics(),
    getFigures(),
    getExhibits(),
    getPantheons(),
  ]);
  const figureName = new Map(figures.map((figure) => [figure.slug, figure.name]));
  const pantheonBySlug = new Map(pantheons.map((pantheon) => [pantheon.slug, pantheon]));
  const figurePantheon = new Map(
    figures.map((figure) => [figure.slug, pantheonBySlug.get(figure.pantheonSlug)]),
  );
  const groups = groupByPantheon(relics, (slug) => figurePantheon.get(slug));
  const groupLabel = new Map(
    groups.flatMap((group) => group.relics.map((relic) => [relic.slug, group.label])),
  );
  const imageOf = new Map(exhibits.map((exhibit) => [exhibit.id, exhibit.image]));

  return (
    <div className={`theme-dark ${styles.vault}`}>
      <header className={`${styles.intro} px-global`}>
        <p className={styles.eyebrow}>
          <span lang="en">Secret Vault</span> · 신화의 유물 {relics.length}점
        </p>
        <RevealText as="h1" mode="words" text="비밀 전시실" className={styles.title} />
        <p className={styles.lead}>
          신과 영웅이 쥐었던 물건들입니다. 무엇을 할 수 있었는지와 함께, 그 힘이 누구에게 무엇을
          치르게 했는지를 나란히 적었습니다.
        </p>
        <p className={styles.cue} aria-hidden="true">
          아래로 내려가 진열장을 여세요
        </p>
      </header>

      <nav className={`${styles.index} px-global`} aria-labelledby="vault-index-title">
        <h2 id="vault-index-title" className={styles.indexTitle}>
          전시 목록
        </h2>
        <div className={styles.indexGroups}>
          {groups.map((group) => (
            <section key={group.key} aria-labelledby={`vault-group-${group.key}`}>
              <h3 id={`vault-group-${group.key}`} className={styles.groupTitle}>
                {group.label} <span className={styles.groupCount}>{group.relics.length}</span>
              </h3>
              <ol className={styles.indexList}>
                {group.relics.map((relic) => (
                  <li key={relic.slug}>
                    <a href={`#${relic.slug}`} className={styles.indexLink}>
                      <span className={styles.indexNo}>{pad(relic.order)}</span>
                      {relic.name}
                    </a>
                  </li>
                ))}
              </ol>
            </section>
          ))}
        </div>
      </nav>

      <ol className={styles.halls}>
        {relics.map((relic, index) => {
          const image = relic.exhibitId ? (imageOf.get(relic.exhibitId) ?? null) : null;
          const owners = relic.figureSlugs.filter((slug) => figureName.has(slug));
          return (
            <li
              key={relic.slug}
              id={relic.slug}
              className={`${styles.hall} px-global`}
              data-side={index % 2 === 0 ? "left" : "right"}
            >
              <article className={styles.vitrine} aria-labelledby={`${relic.slug}-name`}>
                <div className={styles.visual}>
                  <RelicImage
                    image={image}
                    nameEn={relic.nameEn}
                    sizes="(min-width: 1024px) 45vw, 100vw"
                    eager={index === 0}
                  />
                </div>
                <div className={styles.label}>
                  <p className={styles.no}>
                    <span lang="en">No. {pad(relic.order)}</span> · {RELIC_KIND_LABEL[relic.kind]} ·{" "}
                    {groupLabel.get(relic.slug)}
                  </p>
                  <h2 id={`${relic.slug}-name`} className={styles.name}>
                    {relic.name}
                  </h2>
                  <p className={styles.nameEn} lang="en">
                    {relic.nameEn}
                  </p>
                  <dl className={styles.facts}>
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
                    {owners.length > 0 && (
                      <div>
                        <dt>지닌 이</dt>
                        <dd>
                          <ul className={styles.owners}>
                            {owners.map((slug) => (
                              <li key={slug}>
                                <Link href={`/figures/${slug}`} className={styles.ownerLink}>
                                  {figureName.get(slug)}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </dd>
                      </div>
                    )}
                  </dl>
                  <Link href={`/vault/${relic.slug}`} className={styles.more}>
                    {relic.name} 자세히 보기
                  </Link>
                </div>
              </article>
            </li>
          );
        })}
      </ol>

      <SiteFooter />
    </div>
  );
}
