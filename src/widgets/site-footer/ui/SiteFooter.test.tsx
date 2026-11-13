import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SiteFooter } from "./SiteFooter";

describe("SiteFooter", () => {
  it("자료 출처, 디자인 시스템(Storybook), GitHub 저장소로 가는 링크를 둡니다", () => {
    render(<SiteFooter />);
    // 그림마다의 저작자·라이선스는 화면 대신 README의 출처에 모읍니다.
    expect(screen.getByRole("link", { name: "자료 출처" })).toHaveAttribute(
      "href",
      "https://github.com/ryushin01/Ark#출처",
    );
    expect(screen.getByRole("link", { name: "디자인 시스템(Storybook)" })).toHaveAttribute(
      "href",
      "/storybook/index.html",
    );
    expect(screen.getByRole("link", { name: "GitHub 저장소" })).toHaveAttribute(
      "href",
      "https://github.com/ryushin01/Ark",
    );
  });
});
