import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { RevealText } from "./RevealText";

describe("RevealText", () => {
  it("단어로 나눠도 제목의 접근 가능한 이름은 원래 문장과 같습니다", () => {
    render(<RevealText as="h2" mode="words" text="세계 신화 도서관" />);
    expect(screen.getByRole("heading", { level: 2, name: "세계 신화 도서관" })).toBeInTheDocument();
  });

  it("block 모드는 문장을 그대로 렌더링합니다", () => {
    render(<RevealText text="신들의 기록" />);
    expect(screen.getByText("신들의 기록").tagName).toBe("P");
  });
});
