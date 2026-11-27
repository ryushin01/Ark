"use client";

import { type ComponentProps, useState } from "react";
import Image from "next/image";

/** 그림을 받지 못했을 때 대신 보여 주는 저장소 안의 흐린 자리 표시 그림(외부 요청 없음) */
export const IMAGE_PLACEHOLDER_SRC = "/images/placeholder.svg";

type SafeImageProps = ComponentProps<typeof Image>;

/**
 * 받지 못한 그림을 흐린 자리 표시로 바꾸는 next/image.
 * 어드민에서 올린 그림(Supabase Storage)이나 이미지 최적화가 끊겨도 깨진 그림 아이콘 대신
 * 같은 크기의 자리 표시를 보여 줍니다. 대체 텍스트는 그대로 두어 무엇이 있던 자리인지 알 수 있게 합니다.
 * (next/image는 하이드레이션 전에 난 오류도 다시 알려 줍니다.)
 */
export function SafeImage({ src, alt, onError, unoptimized, ...props }: SafeImageProps) {
  const [failedSrc, setFailedSrc] = useState<SafeImageProps["src"] | null>(null);
  const failed = failedSrc !== null && failedSrc === src;

  return (
    <Image
      {...props}
      alt={alt}
      src={failed ? IMAGE_PLACEHOLDER_SRC : src}
      unoptimized={failed || unoptimized}
      data-image-fallback={failed ? "" : undefined}
      onError={(event) => {
        if (!failed) setFailedSrc(src);
        onError?.(event);
      }}
    />
  );
}
