/**
 * Ark 로고의 A 모양 (spothq cryptocurrency-icons의 Ark 아이콘에서 원형 배경을 뺀 안쪽 모양, CC0).
 * 원본 좌표(32×32)에서 A가 x 5~27, y 7~25에 있어, 정사각형 4 4 24 24로 잘라 가운데에 꽉 채웁니다.
 * 파비콘(`app/icon.svg`)과 같은 모양입니다.
 */
const LOGO_PATH =
  "M15.947 13.347L5 24.89 15.996 7 27 25 15.947 13.347zm1.588 4.585h-3.422l1.76-1.936 1.662 1.953v-.017zm-6.6 3.177v-.024l1.941-1.987v-.009l5.92-.025 1.998 2.045h-9.858z";

/**
 * Ark 로고. 글자색(currentColor)을 따라 검은 띠 위에서는 밝게, 밝은 바탕(어드민)에서는 어둡게 그립니다.
 * 로고만 있는 링크의 이름이 되도록 label을 접근 가능한 이름으로 씁니다.
 */
export function Logo({ label, className }: { label: string; className?: string }) {
  return (
    <svg viewBox="4 4 24 24" role="img" aria-label={label} className={className}>
      <path fill="currentColor" d={LOGO_PATH} />
    </svg>
  );
}
