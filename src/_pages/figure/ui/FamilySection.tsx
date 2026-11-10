import Link from "next/link";

import { Divider } from "@/shared/ui";

import styles from "./FamilySection.module.css";

import type { GenealogyNode, Relatives } from "@/entities/genealogy";

const ROWS: { key: keyof Relatives; label: string }[] = [
  { key: "parents", label: "부모" },
  { key: "spouses", label: "배우자" },
  { key: "children", label: "자식" },
  { key: "siblings", label: "형제자매" },
];

function Person({ node }: { node: GenealogyNode }) {
  return node.slug ? (
    <Link href={`/figures/${node.slug}`} className={styles.link}>
      {node.name}
    </Link>
  ) : (
    <span>{node.name}</span>
  );
}

/** 신·인물의 가족. 계열의 계보에서 모읍니다. 계보에 없으면 그리지 않습니다. */
export function FamilySection({
  relatives,
  pantheonSlug,
}: {
  relatives: Relatives;
  pantheonSlug: string;
}) {
  const rows = ROWS.filter(({ key }) => relatives[key].length > 0);
  if (rows.length === 0) return null;

  return (
    <section className={`${styles.section} px-global`} aria-labelledby="family-title">
      <Divider />
      <h2 id="family-title" className={styles.title}>
        가족
      </h2>
      <dl className={styles.list}>
        {rows.map(({ key, label }) => (
          <div key={key} className={styles.row}>
            <dt>{label}</dt>
            <dd>
              <ul className={styles.people}>
                {relatives[key].map((node) => (
                  <li key={node.slug ?? node.name}>
                    <Person node={node} />
                  </li>
                ))}
              </ul>
            </dd>
          </div>
        ))}
      </dl>
      <p className={styles.more}>
        <Link href={`/pantheons/${pantheonSlug}#genealogy-title`} className={styles.link}>
          계보 전체 보기
        </Link>
      </p>
    </section>
  );
}
