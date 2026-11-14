"use client";

import { useRef, useState } from "react";
import Image from "next/image";

import { type ShownImage, useInView } from "@/shared/lib";

import styles from "./RevealImage.module.css";

type RevealImageProps = {
  image: ShownImage;
  /** next/image sizes. 레이아웃 폭에 맞게 지정합니다. */
  sizes: string;
  /**
   * natural: 원본 비율 그대로
   * cover: 부모(className으로 크기 지정)를 가득 채웁니다.
   */
  fit?: "natural" | "cover";
  /**
   * 첫 화면에 보이는 이미지면 true (LCP 후보)
   * 지연 로딩을 끄고 먼저 받습니다. (Next.js 16에서 priority는 deprecated)
   */
  eager?: boolean;
  className?: string;
};

/**
 * 화면에 들어오고 이미지가 다 받아지면 위에서 아래로 드러나는 자료 이미지입니다.
 * 그림마다의 저작자·라이선스는 화면 대신 README의 출처에 모읍니다(바닥글의 '자료 출처').
 */
export function RevealImage({
  image,
  sizes,
  fit = "natural",
  eager = false,
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
          loading={eager ? "eager" : "lazy"}
          fetchPriority={eager ? "high" : "auto"}
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
          loading={eager ? "eager" : "lazy"}
          fetchPriority={eager ? "high" : "auto"}
          className={styles.image}
          onLoad={() => setIsLoaded(true)}
          onError={() => setIsLoaded(true)}
        />
      )}
    </figure>
  );
}
