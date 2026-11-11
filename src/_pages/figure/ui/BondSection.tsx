import Link from "next/link";

import { Divider } from "@/shared/ui";

import styles from "./FamilySection.module.css";

import type { BondRow, Figure } from "@/entities/figure";

/** 신화 속 탈것·동반자. 짝이 없으면 그리지 않습니다. */
export function BondSection({ rows, figures }: { rows: BondRow[]; figures: Figure[] }) {
  if (rows.length === 0) return null;
  const nameOf = (slug: string) => figures.find((figure) => figure.slug === slug)?.name ?? slug;

  return (
    <section className={`${styles.section} px-global`} aria-labelledby="bonds-title">
      <Divider />
      <h2 id="bonds-title" className={styles.title}>
        탈것·동반자
      </h2>
      <dl className={styles.list}>
        {rows.map(({ label, items }) => (
          <div key={label} className={styles.row}>
            <dt>{label}</dt>
            <dd>
              <ul className={styles.people}>
                {items.map(({ slug, note }) => (
                  <li key={slug}>
                    <Link href={`/figures/${slug}`} className={styles.link}>
                      {nameOf(slug)}
                    </Link>
                    {note && <span className={styles.note}> ({note} 전함)</span>}
                  </li>
                ))}
              </ul>
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
