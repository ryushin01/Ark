import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { PreferenceToggle } from "./PreferenceToggle";

afterEach(() => {
  localStorage.clear();
  delete document.documentElement.dataset.annotations;
});

/** html 속성의 변화를 감지하는 MutationObserver 콜백이 돌도록 기다립니다. */
const flush = () => act(() => new Promise<void>((resolve) => setTimeout(resolve)));

describe("PreferenceToggle", () => {
  it("끄면 html 속성과 저장소에 남고, 다시 켜면 지웁니다", async () => {
    const user = userEvent.setup();
    render(<PreferenceToggle name="annotations" label="주석" />);
    const button = screen.getByRole("button", { name: "주석" });
    expect(button).toHaveAttribute("aria-pressed", "true");

    await user.click(button);
    await flush();
    expect(button).toHaveAttribute("aria-pressed", "false");
    expect(document.documentElement.dataset.annotations).toBe("off");
    expect(localStorage.getItem("ark-annotations")).toBe("off");

    await user.click(button);
    await flush();
    expect(button).toHaveAttribute("aria-pressed", "true");
    expect(document.documentElement.dataset.annotations).toBeUndefined();
    expect(localStorage.getItem("ark-annotations")).toBeNull();
  });

  it("저장소를 쓸 수 없어도 이번 방문에는 적용합니다", async () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("denied");
    });
    const user = userEvent.setup();
    render(<PreferenceToggle name="annotations" label="주석" />);
    await user.click(screen.getByRole("button", { name: "주석" }));
    await flush();
    expect(document.documentElement.dataset.annotations).toBe("off");
  });
});
