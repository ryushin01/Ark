/**
 * 비밀 전시실 캔버스의 배치. 모든 길이는 '열 폭' 단위입니다(화면에서는 열 폭 px을 곱함).
 * 타일을 차례로 열에 돌려 담아 열마다 높이가 다른 벽돌형 그리드를 만들고,
 * 끌어서 움직이면 가로는 세계 폭, 세로는 열 높이로 감아 끝없이 이어지게 합니다.
 */

/** 타일 사이 틈(열 폭에 대한 비율) */
export const CANVAS_GAP = 0.037;
/** 한 칸(열 폭 + 틈) */
export const CANVAS_PITCH = 1 + CANVAS_GAP;
/** 세계의 열 수. 화면에 보이는 열(최대 약 4.6열)보다 넉넉히 많아야 감아도 빈 곳이 없습니다. */
export const CANVAS_COLUMNS = 10;
/** 첫 화면의 왼쪽 열이 반쯤 잘려 보이도록 미는 거리 */
export const CANVAS_START_X = -0.53;

/** 타일 높이(열 폭 대비). 정사각형 가까이에서 조금씩 달라 열마다 위아래가 엇갈립니다. */
const HEIGHTS = [1, 1.04, 0.97, 1.1, 1, 0.94, 1.16, 1.02];

export type CanvasCell = { col: number; top: number; height: number };

export type CanvasLayout = {
  cells: CanvasCell[];
  /** 열마다의 감는 높이(타일 높이와 틈의 합) */
  columnHeights: number[];
  /** 열마다 처음 어긋나게 둔 세로 위치 */
  phases: number[];
  /** 가로로 감는 폭 */
  width: number;
};

export function layoutCanvas(count: number, columns = CANVAS_COLUMNS): CanvasLayout {
  const cols = Math.max(1, Math.min(columns, count));
  const tops = Array.from({ length: cols }, () => 0);
  const cells = Array.from({ length: count }, (_, index) => {
    const col = index % cols;
    const height = HEIGHTS[(index * 5 + col * 3) % HEIGHTS.length];
    const cell = { col, top: tops[col], height };
    tops[col] += height + CANVAS_GAP;
    return cell;
  });
  const phases = Array.from({ length: cols }, (_, col) => -(((col * 0.61) % 1) * 0.8));
  return { cells, columnHeights: tops, phases, width: cols * CANVAS_PITCH };
}

const mod = (value: number, size: number) => ((value % size) + size) % size;

/** 끌어 옮긴 거리(offsetX·offsetY, 열 폭 단위)만큼 움직인 뒤 감은 타일의 왼쪽 위 위치 */
export function placeCell(
  cell: CanvasCell,
  layout: CanvasLayout,
  offsetX: number,
  offsetY: number,
): { x: number; y: number } {
  const x = mod(cell.col * CANVAS_PITCH + offsetX + CANVAS_PITCH, layout.width) - CANVAS_PITCH;
  const span = cell.height + CANVAS_GAP;
  const y =
    mod(cell.top + layout.phases[cell.col] + offsetY + span, layout.columnHeights[cell.col]) - span;
  return { x, y };
}
