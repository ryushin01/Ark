import { useActionState } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { type FormState, INITIAL_FORM_STATE } from "./form-state";
import { useSubmitLock } from "./use-submit-lock";

/** 끝날 때를 테스트가 정하는 액션 */
function deferredAction() {
  const calls: ((state: FormState) => void)[] = [];
  const action = vi.fn(
    () =>
      new Promise<FormState>((resolve) => {
        calls.push(resolve);
      }),
  );
  /** 아직 끝나지 않은 첫 호출을 끝냅니다. 액션은 비동기로 불리므로 불릴 때까지 기다립니다. */
  const finish = async (state: FormState) => {
    await waitFor(() => expect(calls.length).toBeGreaterThan(0));
    calls.shift()?.(state);
  };
  return { action, finish };
}

function TestForm({
  action,
  releaseOnSuccess,
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  releaseOnSuccess?: boolean;
}) {
  const [state, formAction] = useActionState(action, INITIAL_FORM_STATE);
  const lock = useSubmitLock(state, { releaseOnSuccess });
  return (
    <form action={formAction} onSubmit={lock}>
      <input name="title" defaultValue="제우스" aria-label="이름" />
      <button type="submit">저장</button>
      <p>{state.message}</p>
    </form>
  );
}

describe("useSubmitLock", () => {
  it("빠르게 두 번 눌러도 한 번만 보낸다", async () => {
    const { action, finish } = deferredAction();
    render(<TestForm action={action} />);
    await userEvent.dblClick(screen.getByRole("button", { name: "저장" }));
    await userEvent.click(screen.getByRole("button", { name: "저장" }));
    await waitFor(() => expect(action).toHaveBeenCalledTimes(1));
    // 막힌 제출이 입력값을 지우지 않습니다.
    expect(screen.getByRole("textbox", { name: "이름" })).toHaveValue("제우스");
    // React는 두 번째 제출을 첫 제출이 끝날 때까지 줄 세워 두므로, 끝난 뒤에도 한 번인지 봅니다.
    await finish({ status: "success", message: "저장함" });
    await screen.findByText("저장함");
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(action).toHaveBeenCalledTimes(1);
  });

  it("실패하면 풀어서 다시 보낼 수 있다", async () => {
    const { action, finish } = deferredAction();
    render(<TestForm action={action} />);
    await userEvent.click(screen.getByRole("button", { name: "저장" }));
    await finish({ status: "error", message: "실패" });
    await screen.findByText("실패");
    await userEvent.click(screen.getByRole("button", { name: "저장" }));
    await waitFor(() => expect(action).toHaveBeenCalledTimes(2));
    // 끝나지 않은 액션이 남으면 React가 다음 테스트의 액션 결과도 함께 기다리므로 끝내 둡니다.
    await finish({ status: "error", message: "또 실패" });
    await screen.findByText("또 실패");
  });

  it("화면을 떠나는 폼은 성공해도 잠근 채로 두고, 머무는 폼은 푼다", async () => {
    const stay = deferredAction();
    const { unmount } = render(<TestForm action={stay.action} releaseOnSuccess />);
    await userEvent.click(screen.getByRole("button", { name: "저장" }));
    await stay.finish({ status: "success", message: "추가함" });
    await screen.findByText("추가함");
    await userEvent.click(screen.getByRole("button", { name: "저장" }));
    await waitFor(() => expect(stay.action).toHaveBeenCalledTimes(2));
    // 끝나지 않은 액션이 남으면 React가 다음 액션의 결과도 함께 기다리므로 끝내 둡니다.
    await stay.finish({ status: "success", message: "또 추가함" });
    await screen.findByText("또 추가함");
    unmount();

    const leave = deferredAction();
    render(<TestForm action={leave.action} />);
    await userEvent.click(screen.getByRole("button", { name: "저장" }));
    await leave.finish({ status: "success", message: "저장함" });
    await screen.findByText("저장함");
    await userEvent.click(screen.getByRole("button", { name: "저장" }));
    expect(leave.action).toHaveBeenCalledTimes(1);
  });
});
