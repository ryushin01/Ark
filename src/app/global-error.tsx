"use client";

/**
 * 루트 레이아웃까지 실패했을 때의 마지막 오류 화면
 * 전역 스타일과 글꼴이 없으므로 최소한의 인라인 스타일로 그립니다.
 */
export default function GlobalError({ retry }: { error: unknown; retry: () => void }) {
  return (
    <html lang="ko">
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          display: "grid",
          placeContent: "center",
          gap: 16,
          padding: 16,
          background: "#eadfd2",
          color: "#8a4a1f",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <title>오류 — Ark</title>
        <h1 style={{ margin: 0 }}>Ark를 불러오지 못했습니다.</h1>
        <p style={{ margin: 0 }}>잠시 뒤 다시 시도해 주세요.</p>
        <button
          type="button"
          onClick={() => retry()}
          style={{ minHeight: 44, font: "inherit", color: "inherit", cursor: "pointer" }}
        >
          다시 시도
        </button>
      </body>
    </html>
  );
}
