import Link from "next/link";

import { type Relic, RELIC_KIND_LABEL } from "@/entities/relic";
import { Divider } from "@/shared/ui";

import styles from "./FamilySection.module.css";

/** 신·인물이 지니거나 얽힌 신화 속 유물. 비밀 전시실의 진열장으로 이어집니다. 없으면 그리지 않습니다. */
export function RelicSection({ relics }: { relics: Relic[] }) {
  if (relics.length === 0) return null;

  return (
    <section className={`${styles.section} px-global`} aria-labelledby="relics-title">
      <Divider />
      <h2 id="relics-title" className={styles.title}>
        지닌 유물
      </h2>
      <ul className={`${styles.list} ${styles.relics}`}>
        {relics.map((relic) => (
          <li key={relic.slug} className={styles.row}>
            <span className={styles.kind}>{RELIC_KIND_LABEL[relic.kind]}</span>
            <Link href={`/vault/${relic.slug}`} className={`${styles.link} ${styles.relicName}`}>
              {relic.name}
            </Link>
          </li>
        ))}
      </ul>
      <p className={styles.more}>
        <Link href="/vault" className={styles.link}>
          비밀 전시실 둘러보기
        </Link>
      </p>
    </section>
  );
}
