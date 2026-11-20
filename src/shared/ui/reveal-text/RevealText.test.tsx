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

  it("block 모드는 낱말 하나에 글꼴을 따로 줄 수 있게 React 노드도 그대로 그립니다", () => {
    render(
      <RevealText
        text={
          <>
            <span lang="en">Ark</span>는 세계 신화 도서관입니다.
          </>
        }
      />,
    );
    const word = screen.getByText("Ark");
    expect(word).toHaveAttribute("lang", "en");
    expect(word.parentElement?.tagName).toBe("P");
    expect(word.parentElement).toHaveTextContent("Ark는 세계 신화 도서관입니다.");
  });
});
