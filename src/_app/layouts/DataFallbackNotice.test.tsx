import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const fallback = vi.hoisted(() => ({ on: false }));

vi.mock("@/shared/api/index.server", () => ({ isUsingFallbackData: () => fallback.on }));

const { DataFallbackNotice } = await import("./DataFallbackNotice");

describe("DataFallbackNotice", () => {
  it("내장 데이터로 대신 보여 주는 중이면 상태 안내를 띄웁니다", () => {
    fallback.on = true;
    render(<DataFallbackNotice />);
    expect(screen.getByRole("status")).toHaveTextContent("오프라인 데이터로 표시 중");
  });

  it("Supabase(또는 목업)를 그대로 읽으면 아무것도 그리지 않습니다", () => {
    fallback.on = false;
    const { container } = render(<DataFallbackNotice />);
    expect(container).toBeEmptyDOMElement();
  });
});
