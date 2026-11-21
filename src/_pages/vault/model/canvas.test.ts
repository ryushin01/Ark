import { describe, expect, it } from "vitest";

import { CANVAS_COLUMNS, CANVAS_GAP, layoutCanvas, placeCell } from "./canvas";

describe("layoutCanvas", () => {
  it("타일을 열에 차례로 돌려 담고, 같은 열의 타일은 틈을 두고 겹치지 않게 쌓습니다", () => {
    const layout = layoutCanvas(152);
    expect(layout.cells).toHaveLength(152);
    expect(layout.columnHeights).toHaveLength(CANVAS_COLUMNS);
    const first = layout.cells.filter((cell) => cell.col === 0);
    for (let i = 1; i < first.length; i++) {
      expect(first[i].top).toBeCloseTo(first[i - 1].top + first[i - 1].height + CANVAS_GAP);
    }
  });

  it("열마다 높이가 달라 위아래가 엇갈립니다", () => {
    const { columnHeights } = layoutCanvas(152);
    expect(new Set(columnHeights.map((h) => h.toFixed(3))).size).toBeGreaterThan(1);
  });

  it("타일이 열 수보다 적으면 열 수를 줄입니다", () => {
    expect(layoutCanvas(3).columnHeights).toHaveLength(3);
  });
});

describe("placeCell", () => {
  it("한 바퀴(세계 폭·열 높이)를 옮기면 제자리로 돌아옵니다", () => {
    const layout = layoutCanvas(40);
    const cell = layout.cells[17];
    const start = placeCell(cell, layout, 0.3, -1.2);
    const looped = placeCell(
      cell,
      layout,
      0.3 + layout.width,
      -1.2 - layout.columnHeights[cell.col],
    );
    expect(looped.x).toBeCloseTo(start.x);
    expect(looped.y).toBeCloseTo(start.y);
  });

  it("감은 위치는 항상 한 칸 앞에서 세계 폭 안쪽입니다", () => {
    const layout = layoutCanvas(152);
    for (const offset of [-50.2, -3, 0, 7.7, 120]) {
      for (const cell of layout.cells) {
        const { x, y } = placeCell(cell, layout, offset, offset * 1.3);
        expect(x).toBeGreaterThanOrEqual(-1 - CANVAS_GAP - 1e-9);
        expect(x).toBeLessThan(layout.width);
        expect(y).toBeGreaterThanOrEqual(-cell.height - CANVAS_GAP - 1e-9);
        expect(y).toBeLessThan(layout.columnHeights[cell.col]);
      }
    }
  });
});
