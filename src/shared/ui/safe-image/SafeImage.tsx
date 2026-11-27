"use client";

import { type ComponentProps, useCallback, useState } from "react";
import Image from "next/image";

/** 그림을 받지 못했을 때 대신 보여 주는 저장소 안의 흐린 자리 표시 그림(외부 요청 없음) */
export const IMAGE_PLACEHOLDER_SRC = "/images/placeholder.svg";

type SafeImageProps = ComponentProps<typeof Image>;

/**
 * 받지 못한 그림을 흐린 자리 표시로 바꾸는 next/image.
 * 어드민에서 올린 그림(Supabase Storage)이나 이미지 최적화가 끊겨도 깨진 그림 아이콘 대신
 * 같은 크기의 자리 표시를 보여 줍니다. 대체 텍스트는 그대로 두어 무엇이 있던 자리인지 알 수 있게 합니다.
 *
 * 실패는 next/image의 onError 대신 img 요소의 error 이벤트로 듣습니다. next/image는 onError를 받으면
 * 하이드레이션 뒤 src를 다시 넣어 아직 받는 중인 그림을 처음부터 다시 받게 해, 첫 화면 LCP가 늦어집니다
 * (비밀 전시실 Lighthouse 성능 0.90 → 0.88). 하이드레이션 전에 이미 실패한 그림은 연결할 때 확인합니다.
 */
export function SafeImage({ src, alt, unoptimized, ...props }: SafeImageProps) {
  const [failedSrc, setFailedSrc] = useState<SafeImageProps["src"] | null>(null);
  const failed = failedSrc !== null && failedSrc === src;

  const watch = useCallback(
    (image: HTMLImageElement | null) => {
      if (!image || failed) return;
      const fail = () => setFailedSrc(src);
      if (image.complete && image.naturalWidth === 0 && image.currentSrc) fail();
      image.addEventListener("error", fail);
      return () => image.removeEventListener("error", fail);
    },
    [src, failed],
  );

  return (
    <Image
      {...props}
      ref={watch}
      alt={alt}
      src={failed ? IMAGE_PLACEHOLDER_SRC : src}
      unoptimized={failed || unoptimized}
      data-image-fallback={failed ? "" : undefined}
    />
  );
}
