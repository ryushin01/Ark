"use client";

import { useRef, useState } from "react";
import Image from "next/image";

import { type ArchiveImage, useInView } from "@/shared/lib";

import { CreditLine } from "../credit-line";
import styles from "./RevealImage.module.css";

type RevealImageProps = {
  image: ArchiveImage;
  /** next/image sizes. 레이아웃 폭에 맞게 지정합니다. */
  sizes: string;
  /**
   * natural: 원본 비율 그대로
   * cover: 부모(className으로 크기 지정)를 가득 채웁니다.
   */
  fit?: "natural" | "cover";
  /** 첫 화면에 보이는 이미지면 true (LCP) */
  priority?: boolean;
  /** 출처 표기를 숨길지. 같은 이미지를 바로 옆에서 이미 표기했을 때만 씁니다. */
  hideCredit?: boolean;
  className?: string;
};

/**
 * 화면에 들어오고 이미지가 다 받아지면 위에서 아래로 드러나는 자료 이미지입니다.
 * 이미지 오른쪽 아래에 저작자·라이선스를 표기하고, 원본 파일 정보로 연결합니다.
 */
export function RevealImage({
  image,
  sizes,
  fit = "natural",
  priority = false,
  hideCredit = false,
  className,
}: RevealImageProps) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { rootMargin: "0px 0px -5% 0px" });
  const [isLoaded, setIsLoaded] = useState(false);
  const isShown = isInView && isLoaded;

  return (
    <figure
      ref={ref}
      className={[styles.figure, styles[fit], isShown && styles.shown, className]
        .filter(Boolean)
        .join(" ")}
    >
      {fit === "cover" ? (
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes={sizes}
          priority={priority}
          className={styles.image}
          onLoad={() => setIsLoaded(true)}
          onError={() => setIsLoaded(true)}
        />
      ) : (
        <Image
          src={image.src}
          alt={image.alt}
          width={image.width}
          height={image.height}
          sizes={sizes}
          priority={priority}
          className={styles.image}
          onLoad={() => setIsLoaded(true)}
          onError={() => setIsLoaded(true)}
        />
      )}
      {!hideCredit && (
        <figcaption className={styles.credit}>
          <CreditLine credit={image.credit} linkClassName={styles.creditLink} />
        </figcaption>
      )}
    </figure>
  );
}
