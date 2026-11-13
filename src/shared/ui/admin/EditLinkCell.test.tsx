import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { EditLinkCell } from "./EditLinkCell";

describe("EditLinkCell", () => {
  it("보이는 글자 '고치기'를 포함하고 대상 이름으로 구별되는 링크를 그립니다", () => {
    render(
      <table>
        <tbody>
          <tr>
            <EditLinkCell href="/admin/figures/zeus" name="제우스" />
          </tr>
        </tbody>
      </table>,
    );
    const link = screen.getByRole("link", { name: "제우스 고치기" });
    expect(link).toHaveAttribute("href", "/admin/figures/zeus");
    expect(link).toHaveTextContent("고치기");
  });
});
