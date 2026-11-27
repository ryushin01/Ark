import { useRef } from "react";
import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useInView } from "./use-in-view";

type Entry = { isIntersecting: boolean };

/** jsdom에 없는 IntersectionObserver를 흉내 냅니다. 화면에 들어온 것처럼 직접 알려 줄 수 있습니다. */
function fakeIntersectionObserver() {
  const observers: FakeObserver[] = [];
  class FakeObserver {
    observed: Element[] = [];
    disconnected = false;
    constructor(
      readonly callback: (entries: Entry[]) => void,
      readonly options: { rootMargin?: string },
    ) {
      observers.push(this);
    }
    observe(element: Element) {
      this.observed.push(element);
    }
    disconnect() {
      this.disconnected = true;
    }
  }
  vi.stubGlobal("IntersectionObserver", FakeObserver);
  return {
    observers,
    show(entries: Entry[]) {
      act(() => {
        for (const observer of observers) if (!observer.disconnected) observer.callback(entries);
      });
    },
  };
}

function Section({ rootMargin, attach = true }: { rootMargin?: string; attach?: boolean }) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, rootMargin ? { rootMargin } : undefined);
  return (
    <section ref={attach ? ref : undefined} aria-label="자료">
      <p role="status">{isInView ? "보임" : "아직 안 보임"}</p>
    </section>
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useInView", () => {
  it("화면에 들어오면 보이고, 한 번 보인 뒤에는 관찰을 멈춥니다", () => {
    const io = fakeIntersectionObserver();
    render(<Section />);
    expect(screen.getByRole("status")).toHaveTextContent("아직 안 보임");
    expect(io.observers[0]?.observed).toEqual([screen.getByRole("region", { name: "자료" })]);
    expect(io.observers[0]?.options).toEqual({ rootMargin: "0px 0px -10% 0px" });

    io.show([]);
    io.show([{ isIntersecting: false }]);
    expect(screen.getByRole("status")).toHaveTextContent("아직 안 보임");

    io.show([{ isIntersecting: true }]);
    expect(screen.getByRole("status")).toHaveTextContent("보임");
    expect(io.observers[0]?.disconnected).toBe(true);
  });

  it("여백(rootMargin)을 바꿔 줄 수 있고, 화면을 떠나면 관찰을 멈춥니다", () => {
    const io = fakeIntersectionObserver();
    const { unmount } = render(<Section rootMargin="100px" />);
    expect(io.observers[0]?.options).toEqual({ rootMargin: "100px" });
    unmount();
    expect(io.observers[0]?.disconnected).toBe(true);
  });

  it("IntersectionObserver가 없는 브라우저에서는 보이지 않은 상태로 남습니다", () => {
    vi.stubGlobal("IntersectionObserver", undefined);
    render(<Section />);
    expect(screen.getByRole("status")).toHaveTextContent("아직 안 보임");
  });

  it("관찰할 요소가 없으면 관찰하지 않습니다", () => {
    const io = fakeIntersectionObserver();
    render(<Section attach={false} />);
    expect(io.observers).toHaveLength(0);
    expect(screen.getByRole("status")).toHaveTextContent("아직 안 보임");
  });
});
