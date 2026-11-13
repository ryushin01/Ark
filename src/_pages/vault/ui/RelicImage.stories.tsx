import { expect, within } from "storybook/test";

import { RelicImage } from "./RelicImage";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta = {
  title: "Pages/Vault/RelicImage",
  component: RelicImage,
  decorators: [
    (Story) => (
      <div
        className="theme-dark"
        style={{ background: "var(--page-bg)", color: "var(--page-fg)", padding: 24 }}
      >
        <Story />
      </div>
    ),
  ],
  args: {
    nameEn: "Shield of Achilles",
    sizes: "50vw",
    image: {
      src: "/images/exhibits/achilles-shield.jpg",
      width: 1600,
      height: 1600,
      alt: "가운데 전차를 모는 태양신을 두고 둘레에 도시와 사람들의 장면이 새겨진 둥근 금빛 방패",
    },
  },
} satisfies Meta<typeof RelicImage>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 그림이 있는 진열장 */
export const WithImage: Story = {
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("img", { name: /금빛 방패/ })).toBeInTheDocument();
  },
};

/** 전하는 그림이 없으면 이름 첫 글자를 새긴 빈 진열장 */
export const Empty: Story = {
  args: { image: null, nameEn: "Draupnir" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("전하는 그림이 없는 유물")).toBeInTheDocument();
    await expect(canvas.queryByRole("img")).toBeNull();
  },
};
