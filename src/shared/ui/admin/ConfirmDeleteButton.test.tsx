import { Theme } from "@radix-ui/themes";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ConfirmDeleteButton } from "./ConfirmDeleteButton";

import type { FormState } from "@/shared/lib";

const openDialog = async () => {
  await userEvent.click(screen.getByRole("button", { name: "삭제" }));
  return screen.findByRole("alertdialog");
};

describe("ConfirmDeleteButton", () => {
  it("확인 버튼을 빠르게 두 번 눌러도 한 번만 지운다", async () => {
    let finish: (state: FormState) => void = () => {};
    const onDelete = vi.fn(() => new Promise<FormState>((resolve) => (finish = resolve)));
    render(
      <Theme>
        <ConfirmDeleteButton name="제우스" onDelete={onDelete} />
      </Theme>,
    );
    const dialog = await openDialog();
    const confirm = dialog.querySelector("button.rt-variant-solid") as HTMLButtonElement;
    confirm.click();
    confirm.click();
    await waitFor(() => expect(onDelete).toHaveBeenCalledTimes(1));
    finish({ status: "error", message: "연결된 자료가 있어 삭제할 수 없습니다." });
    expect(await screen.findByRole("alert")).toHaveTextContent("연결된 자료가 있어");
  });

  it("실패하면 다시 지울 수 있다", async () => {
    const onDelete = vi.fn(async (): Promise<FormState> => ({ status: "error", message: "실패" }));
    render(
      <Theme>
        <ConfirmDeleteButton name="제우스" onDelete={onDelete} />
      </Theme>,
    );
    await userEvent.click(within(await openDialog()).getAllByRole("button", { name: "삭제" })[0]);
    await screen.findByRole("alert");
    await userEvent.click(within(await openDialog()).getAllByRole("button", { name: "삭제" })[0]);
    await waitFor(() => expect(onDelete).toHaveBeenCalledTimes(2));
  });
});
