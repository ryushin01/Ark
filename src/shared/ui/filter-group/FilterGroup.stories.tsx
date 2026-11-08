import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";

import { FilterGroup } from "./FilterGroup";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const OPTIONS = [
  { value: "all", label: "전체", count: 41 },
  { value: "asia", label: "아시아", count: 15 },
  { value: "europe", label: "유럽", count: 13 },
];

function Example() {
  const [value, setValue] = useState("all");
  return (
    <FilterGroup label="대륙으로 거르기" options={OPTIONS} value={value} onChange={setValue} />
  );
}

const meta = {
  title: "Shared/FilterGroup",
  component: Example,
} satisfies Meta<typeof Example>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 고른 버튼에는 손으로 그린 타원이 둘리고 aria-pressed로 알립니다. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const europe = canvas.getByRole("button", { name: /^유럽/ });
    await userEvent.click(europe);
    await expect(europe).toHaveAttribute("aria-pressed", "true");
    await expect(canvas.getByRole("button", { name: /^전체/ })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  },
};
