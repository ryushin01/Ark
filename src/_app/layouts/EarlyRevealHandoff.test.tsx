import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { EarlyRevealHandoff } from "./EarlyRevealHandoff";

describe("EarlyRevealHandoff", () => {
  it("React가 넘겨받으면 EarlyReveal의 관찰을 끝내고 지운다", () => {
    const disconnect = vi.fn();
    window.__arkEarlyReveal = { disconnect };
    render(<EarlyRevealHandoff />);
    expect(disconnect).toHaveBeenCalledOnce();
    expect(window.__arkEarlyReveal).toBeUndefined();
  });

  it("스크립트가 돌지 않았으면 아무것도 하지 않는다", () => {
    expect(() => render(<EarlyRevealHandoff />)).not.toThrow();
  });
});
