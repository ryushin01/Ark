import { expect, within } from "storybook/test";

import { RelicSection } from "./RelicSection";

import type { Relic } from "@/entities/relic";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const relic = (slug: string, name: string, kind: Relic["kind"], order: number): Relic => ({
  slug,
  name,
  nameEn: name,
  kind,
  figureSlugs: ["odin"],
  origin: "",
  power: "",
  price: null,
  source: "",
  exhibitId: null,
  order,
});

const meta = {
  title: "Pages/Figure/RelicSection",
  component: RelicSection,
  args: {
    relics: [
      relic("gungnir", "궁니르", "weapon", 2),
      relic("draupnir", "드라우프니르", "ornament", 3),
    ],
  },
} satisfies Meta<typeof RelicSection>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 오딘이 지닌 유물: 비밀 전시실의 진열장으로 이어집니다. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const region = within(canvasElement).getByRole("region", { name: "지닌 유물" });
    await expect(within(region).getByRole("link", { name: "궁니르" })).toHaveAttribute(
      "href",
      "/vault/gungnir",
    );
    await expect(within(region).getByText("장신구")).toBeInTheDocument();
  },
};

/** 지닌 유물이 없으면 그리지 않습니다. */
export const Empty: Story = {
  args: { relics: [] },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByRole("region")).toBeNull();
  },
};
