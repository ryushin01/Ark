"use client";

import { useEffect, useMemo, useRef, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";

import { type ShownImage, skipsOptimization, smallSrc, useMotionOff } from "@/shared/lib";

import { CANVAS_START_X, layoutCanvas, placeCell } from "../model/canvas";
import styles from "./VaultCanvas.module.css";

import type { CSSProperties } from "react";

export type CanvasTile = {
  slug: string;
  name: string;
  /** 전시 번호 (예: 004) */
  no: string;
  /** 그림이 없을 때 새길 영문 첫 글자 */
  glyph: string;
  image: ShownImage | null;
};

/** 넓은 화면의 첫 화면 범위(열 폭 단위). 이 안의 그림은 지연 로딩하지 않습니다. */
const FIRST_VIEW = { x: 4.4, y: 2.7 };
/** 첫 화면 가운데의 통째로 보이는 타일. 가장 먼저 받습니다(LCP 후보). */
const isPriority = ({ x, y }: { x: number; y: number }) => x >= 0 && x < 3.6 && y >= 0 && y < 1.6;
/** 끌기와 클릭을 가르는 거리(px) */
const DRAG_THRESHOLD = 6;
/** 방향키·버튼 한 번에 옮기는 거리(열 폭 단위) */
const STEP = 0.75;
const FRICTION = 0.92;
const EASE = 0.16;

const noop = () => () => {};
const useHydrated = () =>
  useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );

const ARROWS: Record<string, [number, number]> = {
  ArrowLeft: [1, 0],
  ArrowRight: [-1, 0],
  ArrowUp: [0, 1],
  ArrowDown: [0, -1],
};

/**
 * 비밀 전시실의 무한 캔버스
 * - 유물 타일을 열마다 높이가 다른 벽돌형으로 깔고, 끌기(관성)·휠·방향키·버튼으로 사방으로 움직입니다. 끝은 반대쪽과 이어집니다.
 * - 타일은 전시 순서대로 놓인 순서 있는 목록의 링크라, 화면 낭독기와 Tab으로 모두 닿습니다. 초점을 받은 타일은 화면 가운데로 옵니다.
 * - 첫 위치는 서버에서 CSS 변수(열 폭 단위)로 그려 두므로, 자바스크립트를 받기 전에도 같은 화면이 보입니다.
 * - 움직임을 끄면(동작 줄이기, 사이트 설정) 또는 자바스크립트가 없으면 CSS가 정적인 벽돌형 목록으로 바꾸고, 페이지를 그대로 스크롤합니다.
 */
export function VaultCanvas({ tiles }: { tiles: CanvasTile[] }) {
  const layout = useMemo(() => layoutCanvas(tiles.length), [tiles.length]);
  const stageRef = useRef<HTMLDivElement>(null);
  const tileRefs = useRef<(HTMLLIElement | null)[]>([]);
  const nudgeRef = useRef<(dx: number, dy: number) => void>(() => {});
  const motionOff = useMotionOff();
  const active = useHydrated() && !motionOff;

  useEffect(() => {
    const stage = stageRef.current;
    const elements = tileRefs.current;
    if (!active || !stage) return;

    let unit = elements[0]?.offsetWidth || 1;
    let x = CANVAS_START_X;
    let y = 0;
    let targetX = x;
    let targetY = y;
    let velocityX = 0;
    let velocityY = 0;
    let frame = 0;
    let pointer: { id: number; x: number; y: number; moved: number } | null = null;
    let suppressClick = false;

    const render = () => {
      layout.cells.forEach((cell, index) => {
        const element = elements[index];
        if (!element) return;
        const position = placeCell(cell, layout, x, y);
        element.style.transform = `translate3d(${position.x * unit}px, ${position.y * unit}px, 0)`;
      });
    };

    const tick = () => {
      frame = 0;
      if (!pointer) {
        targetX += velocityX;
        targetY += velocityY;
        velocityX *= FRICTION;
        velocityY *= FRICTION;
      }
      x += (targetX - x) * EASE;
      y += (targetY - y) * EASE;
      const settled =
        Math.abs(targetX - x) < 1e-4 &&
        Math.abs(targetY - y) < 1e-4 &&
        Math.abs(velocityX) < 1e-4 &&
        Math.abs(velocityY) < 1e-4;
      if (settled) {
        x = targetX;
        y = targetY;
      }
      render();
      if (!settled || pointer) frame = requestAnimationFrame(tick);
    };
    const wake = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };

    const nudge = (dx: number, dy: number) => {
      velocityX = 0;
      velocityY = 0;
      targetX += dx;
      targetY += dy;
      wake();
    };
    nudgeRef.current = nudge;

    /** 타일을 화면 가운데로 옮깁니다. */
    const center = (index: number, instant = false) => {
      const element = elements[index];
      const cell = layout.cells[index];
      if (!element || !cell) return;
      const position = placeCell(cell, layout, targetX, targetY);
      const { width, height } = stage.getBoundingClientRect();
      const dx = width / 2 / unit - (position.x + 0.5);
      const dy = height / 2 / unit - (position.y + cell.height / 2);
      if (instant) {
        targetX += dx;
        targetY += dy;
        x = targetX;
        y = targetY;
        render();
      } else nudge(dx, dy);
    };

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const scale = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? stage.clientHeight : 1;
      const horizontal = event.shiftKey && event.deltaX === 0;
      velocityX = 0;
      velocityY = 0;
      targetX -= ((horizontal ? event.deltaY : event.deltaX) * scale) / unit;
      targetY -= ((horizontal ? 0 : event.deltaY) * scale) / unit;
      wake();
    };

    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0) return;
      if (event.target instanceof Element && event.target.closest("button")) return;
      pointer = { id: event.pointerId, x: event.clientX, y: event.clientY, moved: 0 };
      velocityX = 0;
      velocityY = 0;
      suppressClick = false;
    };
    const onPointerMove = (event: PointerEvent) => {
      if (!pointer || event.pointerId !== pointer.id) return;
      const dx = (event.clientX - pointer.x) / unit;
      const dy = (event.clientY - pointer.y) / unit;
      pointer.moved += Math.hypot(event.clientX - pointer.x, event.clientY - pointer.y);
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      if (pointer.moved > DRAG_THRESHOLD) {
        suppressClick = true;
        stage.dataset.dragging = "";
      }
      targetX += dx;
      targetY += dy;
      x = targetX;
      y = targetY;
      velocityX = velocityX * 0.5 + dx * 0.5;
      velocityY = velocityY * 0.5 + dy * 0.5;
      wake();
    };
    const onPointerUp = (event: PointerEvent) => {
      if (!pointer || event.pointerId !== pointer.id) return;
      pointer = null;
      delete stage.dataset.dragging;
      wake();
    };
    // 끌고 난 뒤의 클릭은 링크로 가지 않게 막습니다.
    const onClick = (event: MouseEvent) => {
      if (!suppressClick) return;
      suppressClick = false;
      event.preventDefault();
      event.stopPropagation();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      const arrow = ARROWS[event.key];
      if (!arrow || event.altKey || event.ctrlKey || event.metaKey) return;
      event.preventDefault();
      nudge(arrow[0] * STEP, arrow[1] * STEP);
    };
    // 초점을 받은 타일이 화면 밖이거나 가장자리에 걸리면 가운데로 옮깁니다.
    const onFocusIn = (event: FocusEvent) => {
      const item = event.target instanceof Element ? event.target.closest("li") : null;
      const index = item ? elements.indexOf(item) : -1;
      if (!item || index < 0) return;
      const box = item.getBoundingClientRect();
      const view = stage.getBoundingClientRect();
      const margin = unit * 0.4;
      const inside =
        box.left >= view.left + margin &&
        box.right <= view.right - margin &&
        box.top >= view.top + margin &&
        box.bottom <= view.bottom - margin;
      if (!inside) center(index);
    };
    const onResize = () => {
      unit = elements[0]?.offsetWidth || unit;
      render();
    };

    // 주소의 #유물 이름으로 열면(또는 #만 바꾸면) 그 타일을 가운데에 둡니다(주소 공유).
    const hashIndex = () =>
      tiles.findIndex((tile) => tile.slug === decodeURIComponent(location.hash.slice(1)));
    const onHashChange = () => {
      const index = hashIndex();
      if (index >= 0) center(index);
    };
    if (hashIndex() >= 0) center(hashIndex(), true);
    else render();

    stage.addEventListener("wheel", onWheel, { passive: false });
    stage.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);
    stage.addEventListener("click", onClick, true);
    stage.addEventListener("keydown", onKeyDown);
    stage.addEventListener("focusin", onFocusIn);
    window.addEventListener("resize", onResize);
    window.addEventListener("hashchange", onHashChange);
    return () => {
      cancelAnimationFrame(frame);
      stage.removeEventListener("wheel", onWheel);
      stage.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
      stage.removeEventListener("click", onClick, true);
      stage.removeEventListener("keydown", onKeyDown);
      stage.removeEventListener("focusin", onFocusIn);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("hashchange", onHashChange);
      for (const element of elements) element?.style.removeProperty("transform");
      nudgeRef.current = () => {};
    };
  }, [active, layout, tiles]);

  return (
    <div ref={stageRef} className={styles.stage} data-lenis-prevent="">
      <ol className={styles.list} aria-label={`전시된 유물 ${tiles.length}점`}>
        {tiles.map((tile, index) => {
          const cell = layout.cells[index];
          const start = placeCell(cell, layout, CANVAS_START_X, 0);
          const firstView = start.x < FIRST_VIEW.x && start.y < FIRST_VIEW.y;
          return (
            <li
              key={tile.slug}
              id={tile.slug}
              ref={(element) => {
                tileRefs.current[index] = element;
              }}
              className={styles.tile}
              style={{ "--x": start.x, "--y": start.y, "--h": cell.height } as CSSProperties}
            >
              <Link href={`/vault/${tile.slug}`} className={styles.link} draggable={false}>
                {tile.image ? (
                  <Image
                    src={smallSrc(tile.image.src)}
                    alt={tile.image.alt}
                    fill
                    sizes="(min-width: 1024px) 23vw, (min-width: 640px) 31vw, 45vw"
                    loading={isPriority(start) ? "eager" : "lazy"}
                    fetchPriority={isPriority(start) ? "high" : firstView ? "auto" : "low"}
                    unoptimized={skipsOptimization(tile.image.src)}
                    draggable={false}
                    className={styles.image}
                  />
                ) : (
                  <span className={styles.glyph} aria-hidden="true" lang="en">
                    {tile.glyph}
                  </span>
                )}
                <span className={styles.caption}>
                  <span className={styles.no} lang="en">
                    N°{tile.no}
                  </span>
                  <span className={styles.name}>{tile.name}</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
      <div className={styles.pad} role="group" aria-label="캔버스 움직이기">
        {(
          [
            ["위쪽", "ArrowUp", "↑"],
            ["왼쪽", "ArrowLeft", "←"],
            ["아래쪽", "ArrowDown", "↓"],
            ["오른쪽", "ArrowRight", "→"],
          ] as const
        ).map(([label, key, symbol]) => (
          <button
            key={key}
            type="button"
            className={styles.padButton}
            data-dir={key}
            aria-label={`캔버스 ${label} 보기`}
            onClick={() => nudgeRef.current(ARROWS[key][0] * STEP, ARROWS[key][1] * STEP)}
          >
            <span aria-hidden="true">{symbol}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
