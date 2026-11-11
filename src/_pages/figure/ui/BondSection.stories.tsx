import { expect, within } from "storybook/test";

import { findBonds } from "@/entities/figure";

import { BondSection } from "./BondSection";

import type { Figure } from "@/entities/figure";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const names: Record<string, string> = {
  odin: "오딘",
  sleipnir: "슬레이프니르",
  "huginn-muninn": "후긴과 무닌",
  pegasus: "페가수스",
  bellerophon: "벨레로폰",
  perseus: "페르세우스",
};
const figures = Object.entries(names).map(([slug, name]) => ({ slug, name })) as Figure[];

const meta = {
  title: "Pages/Figure/BondSection",
  component: BondSection,
  args: { rows: findBonds("odin"), figures },
} satisfies Meta<typeof BondSection>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 타는 쪽: 오딘의 탈것과 동반자 */
export const Rider: Story = {
  play: async ({ canvasElement }) => {
    const region = within(canvasElement).getByRole("region", { name: "탈것·동반자" });
    await expect(within(region).getByRole("link", { name: "슬레이프니르" })).toHaveAttribute(
      "href",
      "/figures/sleipnir",
    );
    await expect(within(region).getByText("동반자", { exact: true })).toBeInTheDocument();
  },
};

/** 탈것 쪽: 페가수스를 탄 영웅. 전승이 한정적인 짝은 설명을 덧붙입니다. */
export const Mount: Story = {
  args: { rows: findBonds("pegasus") },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("타는 이")).toBeInTheDocument();
    await expect(canvas.getByText(/중세 이후/)).toBeInTheDocument();
  },
};

/** 짝이 없으면 아무것도 그리지 않습니다. */
export const Empty: Story = {
  args: { rows: [] },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByRole("region")).toBeNull();
  },
};
