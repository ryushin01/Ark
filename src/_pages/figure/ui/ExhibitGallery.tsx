import { type Exhibit, EXHIBIT_KIND_LABEL } from "@/entities/exhibit";
import { type ImageCredit, toShown } from "@/shared/lib";
import { CreditLine, RevealImage } from "@/shared/ui";

import styles from "./ExhibitGallery.module.css";

/**
 * 한 신의 소장 자료 목록
 * 자료마다 번호, 이미지, 분류·시기·소장처를 보여 줍니다. 넓은 화면에서는 이미지와 설명이 좌우로 번갈아 놓입니다.
 */
export function ExhibitGallery({
  exhibits,
  credits = {},
}: {
  exhibits: Exhibit[];
  /**
   * 화면에 보여 줄 출처(자료 id별). 출처는 README의 출처 전체 목록에 모으지만, 목록에 없는 자료
   * (어드민에서 더하거나 고친 자료)는 여기에 넘겨 정보 목록에 함께 보여 줍니다.
   */
  credits?: Record<string, ImageCredit>;
}) {
  if (exhibits.length === 0) {
    return <p className={styles.empty}>아직 등록된 자료가 없습니다.</p>;
  }

  return (
    <ol className={styles.list}>
      {exhibits.map((exhibit, index) => (
        <li key={exhibit.id} className={styles.item} data-side={index % 2 ? "right" : "left"}>
          <RevealImage
            image={toShown(exhibit.image)}
            sizes="(min-width: 768px) 58vw, 100vw"
            eager={index === 0}
            className={styles.image}
          />
          <div className={styles.body}>
            <p className={styles.number} aria-hidden="true">
              [{String(index + 1).padStart(2, "0")}]
            </p>
            <h3 className={styles.title}>{exhibit.title}</h3>
            <dl className={styles.facts}>
              <div>
                <dt>분류</dt>
                <dd>{EXHIBIT_KIND_LABEL[exhibit.kind]}</dd>
              </div>
              {exhibit.dateLabel && (
                <div>
                  <dt>시기</dt>
                  <dd>{exhibit.dateLabel}</dd>
                </div>
              )}
              {exhibit.holder && (
                <div>
                  <dt>소장</dt>
                  <dd>{exhibit.holder}</dd>
                </div>
              )}
              {credits[exhibit.id] && (
                <div>
                  <dt>출처</dt>
                  <dd>
                    <CreditLine credit={credits[exhibit.id]} />
                  </dd>
                </div>
              )}
            </dl>
            {exhibit.note && <p className={styles.note}>{exhibit.note}</p>}
          </div>
        </li>
      ))}
    </ol>
  );
}
