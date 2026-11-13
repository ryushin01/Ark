import { RevealImage } from "@/shared/ui";

import styles from "./RelicImage.module.css";

import type { ShownImage } from "@/shared/lib";
import type { CSSProperties } from "react";

type RelicImageProps = {
  image: ShownImage | null;
  /** 그림이 없을 때 진열장에 새길 글자 (영문 이름) */
  nameEn: string;
  sizes: string;
  eager?: boolean;
};

/** 어두운 진열장 안의 유물 그림. 전하는 그림이 없으면 이름 첫 글자를 새긴 빈 진열장을 보여 줍니다. */
export function RelicImage({ image, nameEn, sizes, eager }: RelicImageProps) {
  return (
    <figure className={styles.case}>
      {image ? (
        <div
          className={styles.frame}
          style={{ "--ratio": image.width / image.height } as CSSProperties}
        >
          <RevealImage image={image} sizes={sizes} eager={eager} className={styles.image} />
        </div>
      ) : (
        <div className={styles.empty}>
          <span aria-hidden="true" className={styles.glyph} lang="en">
            {nameEn.charAt(0)}
          </span>
          <figcaption className={styles.emptyNote}>전하는 그림이 없는 유물</figcaption>
        </div>
      )}
    </figure>
  );
}
