import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CreditLine } from "./CreditLine";

const base = { sourceUrl: "https://commons.wikimedia.org/wiki/File:A.jpg" };

describe("CreditLine", () => {
  it("저작자, 라이선스 전문 링크, 원본 링크를 표기합니다", () => {
    render(
      <p>
        <CreditLine
          credit={{
            ...base,
            artist: "Marie-Lan Nguyen",
            license: "CC BY 2.5",
            licenseUrl: "https://creativecommons.org/licenses/by/2.5",
          }}
        />
      </p>,
    );
    expect(screen.getByText(/Marie-Lan Nguyen/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "CC BY 2.5 라이선스 전문" })).toHaveAttribute(
      "href",
      "https://creativecommons.org/licenses/by/2.5",
    );
    expect(screen.getByRole("link", { name: "원본 출처" })).toHaveAttribute("href", base.sourceUrl);
  });

  it("저작자를 모르고 라이선스 주소가 없으면 라이선스 글자와 원본 링크만 씁니다", () => {
    render(
      <p>
        <CreditLine
          credit={{ ...base, artist: "Unknown artist", license: "Public domain", licenseUrl: null }}
        />
      </p>,
    );
    expect(screen.queryByText(/Unknown/)).not.toBeInTheDocument();
    expect(screen.getAllByRole("link")).toHaveLength(1);
  });
});
