import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SiteFooter } from "./SiteFooter";

describe("SiteFooter", () => {
  it("디자인 시스템(Storybook)과 GitHub 저장소로 가는 링크를 둡니다", () => {
    render(<SiteFooter />);
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
