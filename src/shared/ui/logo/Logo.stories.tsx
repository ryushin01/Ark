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
    await expect(logos[0].querySelector("path")).toHaveAttribute("fill", "currentColor");
  },
};
