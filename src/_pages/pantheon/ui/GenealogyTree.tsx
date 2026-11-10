import Link from "next/link";

import { Divider } from "@/shared/ui";

import styles from "./GenealogyTree.module.css";

import type { Genealogy, GenealogyNode } from "../model/genealogy";

/** 이름. Ark에 있는 신·인물이면 그 화면으로 가는 링크입니다. */
function Person({ node }: { node: GenealogyNode }) {
  return (
    <span className={styles.person}>
      {node.slug ? (
        <Link href={`/figures/${node.slug}`} className={styles.link}>
          {node.name}
        </Link>
      ) : (
        <span className={styles.name}>{node.name}</span>
      )}{" "}
      <span lang="en" className={styles.en}>
        {node.nameEn}
      </span>
      {node.note && <span className={styles.note}> ({node.note})</span>}
    </span>
  );
}

function PersonItem({ node }: { node: GenealogyNode }) {
  return (
    <li className={styles.item}>
      <Person node={node} />
      {node.unions && node.unions.length > 0 && (
        <ul className={styles.unions}>
          {node.unions.map((union, index) => (
            <li key={union.partner?.name ?? `alone-${index}`} className={styles.union}>
              <p className={styles.couple}>
                <span aria-hidden="true" className={styles.mark}>
                  ─{" "}
                </span>
                {union.partner ? (
                  <>
                    <span className="sr-only">배우자 </span>
                    <Person node={union.partner} />
                  </>
                ) : (
                  <span className={styles.alone}>배우자 없이</span>
                )}
                {union.note && <span className={styles.note}> ({union.note})</span>}
              </p>
              {union.children.length > 0 && (
                <ul className={styles.children} aria-label="자식">
                  {union.children.map((child) => (
                    <PersonItem key={child.name} node={child} />
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

/**
 * 신들의 계보
 * ‘─’ 뒤는 배우자, 들여 쓴 목록은 그 사이의 자식입니다. 중첩 목록이라 화면 낭독기로도 위아래를 따라갈 수 있습니다.
 */
export function GenealogyTree({ genealogy }: { genealogy: Genealogy }) {
  return (
    <section className={`${styles.section} px-global`} aria-labelledby="genealogy-title">
      <Divider />
      <h2 id="genealogy-title" className={styles.title}>
        신들의 계보
      </h2>
      <p className={styles.lead}>
        ‘─’ 뒤는 배우자, 들여 쓴 줄은 그 사이의 자식입니다. 이름에 밑줄이 있으면 Ark에 기록된
        신·인물입니다.
      </p>
      <p className={styles.source}>따른 문헌: {genealogy.source}</p>
      <ul className={styles.tree}>
        {genealogy.roots.map((root, index) => (
          <PersonItem key={`${root.name}-${index}`} node={root} />
        ))}
      </ul>
    </section>
  );
}
