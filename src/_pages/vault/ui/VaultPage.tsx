import { getExhibits } from "@/entities/exhibit/index.server";
import { getFigures } from "@/entities/figure/index.server";
import { getPantheons } from "@/entities/pantheon/index.server";
import { getRelics } from "@/entities/relic/index.server";
import { monogram, toShown } from "@/shared/lib";
import { SiteFooter } from "@/widgets/site-footer";

import { groupByPantheon } from "../model/group";
import { relicNo } from "../model/relic-no";
import { type CanvasTile, VaultCanvas } from "./VaultCanvas";
import { VaultFooterInfo, VaultMasthead, VaultMenu } from "./VaultChrome";
import { VaultIndex } from "./VaultIndex";
import styles from "./VaultPage.module.css";

import "./vault-theme.css";

export const vaultMetadata = {
  title: "비밀 전시실",
  alternates: { canonical: "/vault" },
  description:
    "묠니르, 아이기스, 구사나기의 검, 천부인, 성배처럼 신과 영웅이 쥐었던 신화 속 유물을, 그 힘과 그 힘이 치르게 한 대가와 함께 전시합니다.",
};

/**
 * 비밀 전시실: 유물 그림을 벽돌형으로 빽빽이 깐 무한 캔버스입니다. 끌어서 사방으로 둘러보고, 타일을 누르면 유물 상세로 갑니다.
 * 네 귀퉁이에 워드마크·메뉴(전시 목록)·위치와 시각·제작 정보를 고정합니다.
 */
export async function VaultPage() {
  const [relics, figures, exhibits, pantheons] = await Promise.all([
    getRelics(),
    getFigures(),
    getExhibits(),
    getPantheons(),
  ]);
  const pantheonBySlug = new Map(pantheons.map((pantheon) => [pantheon.slug, pantheon]));
  const figurePantheon = new Map(
    figures.map((figure) => [figure.slug, pantheonBySlug.get(figure.pantheonSlug)]),
  );
  const imageOf = new Map(exhibits.map((exhibit) => [exhibit.id, toShown(exhibit.image)]));

  const tiles: CanvasTile[] = relics.map((relic) => ({
    slug: relic.slug,
    name: relic.name,
    no: relicNo(relic.order),
    glyph: monogram(relic.nameEn),
    image: relic.exhibitId ? (imageOf.get(relic.exhibitId) ?? null) : null,
  }));
  const groups = groupByPantheon(relics, (slug) => figurePantheon.get(slug)).map((group) => ({
    key: group.key,
    label: group.label,
    relics: group.relics.map((relic) => ({
      slug: relic.slug,
      name: relic.name,
      no: relicNo(relic.order),
    })),
  }));

  return (
    <div className={`vault-theme theme-dark ${styles.vault}`}>
      <div className={styles.frame}>
        <header className={styles.top}>
          <VaultMasthead count={relics.length} heading />
          <VaultMenu lead={<VaultIndex groups={groups} total={relics.length} />} />
        </header>
        <p className={styles.hint} id="vault-hint">
          끌거나 휠·방향키로 사방을 둘러보고, 유물을 누르면 이야기를 엽니다.
        </p>
        <VaultCanvas tiles={tiles} />
        <div className={styles.bottom}>
          <VaultFooterInfo />
        </div>
      </div>
      <div className={styles.staticFooter}>
        <SiteFooter />
      </div>
    </div>
  );
}
