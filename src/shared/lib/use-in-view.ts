"use client";

import { type RefObject, useEffect, useState } from "react";

/**
 * 요소가 화면에 들어오면 true가 됩니다. 한 번 들어오면 다시 false로 돌아가지 않습니다.
 * IntersectionObserver가 없는 환경에서는 false로 남지만, 숨김 스타일은 html.js일 때만 적용되므로 내용은 보입니다.
 */
export function useInView<T extends Element>(
  ref: RefObject<T | null>,
  { rootMargin = "0px 0px -10% 0px" }: { rootMargin?: string } = {},
) {
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, rootMargin]);

  return isInView;
}
