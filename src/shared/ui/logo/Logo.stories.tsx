import { expect, within } from "storybook/test";

import { Logo } from "./Logo";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta = {
  title: "Shared/Logo",
  component: Logo,
  args: { label: "Ark" },
  decorators: [
    (Story) => (
      <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
        <div style={{ width: 48, height: 48, color: "#131313" }}>
          <Story />
        </div>
        <div style={{ width: 48, height: 48, padding: 8, background: "#131313", color: "#f9f9f9" }}>
          <Story />
        </div>
      </div>
    ),
  ],
} satisfies Meta<typeof Logo>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 밝은 바탕에서는 어둡게, 검은 띠 위에서는 밝게(글자색을 따름) 그립니다. 로고만 있는 링크의 이름이 됩니다. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const logos = within(canvasElement).getAllByRole("img", { name: "Ark" });
    await expect(logos).toHaveLength(2);
    const path = logos[0].querySelector("path");
    await expect(path).toHaveAttribute("fill", "currentColor");
    // 원본처럼 A의 속(가로획 위 삼각형)은 비고, 굵은 빗금과 오른쪽 다리는 칠합니다 (경로 좌표)
    await expect(path?.isPointInFill(new DOMPoint(760, 640))).toBe(false);
    await expect(path?.isPointInFill(new DOMPoint(330, 900))).toBe(true);
    await expect(path?.isPointInFill(new DOMPoint(860, 600))).toBe(true);
  },
};
