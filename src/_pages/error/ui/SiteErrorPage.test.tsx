import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { SiteErrorPage } from "./SiteErrorPage";

describe("SiteErrorPage", () => {
  it("다시 시도 버튼이 retry를 부르고, 오류 식별자만 보여 줍니다", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const retry = vi.fn();
    const error = Object.assign(new Error("DB 접속 실패: 비밀 정보"), { digest: "123abc" });
    render(<SiteErrorPage error={error} retry={retry} />);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "기록을 불러오지 못했습니다.",
    );
    expect(screen.getByText("오류 식별자: 123abc")).toBeInTheDocument();
    expect(screen.queryByText(/비밀 정보/)).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "다시 시도" }));
    expect(retry).toHaveBeenCalledOnce();
  });
});
