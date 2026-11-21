import { expect, within } from "storybook/test";

import { type CanvasTile, VaultCanvas } from "./VaultCanvas";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import "./vault-theme.css";

const IMAGES = [
  {
    src: "/images/exhibits/achilles-shield.jpg",
    width: 1600,
    height: 1600,
    alt: "가운데 전차를 모는 태양신을 두고 둘레에 도시와 사람들의 장면이 새겨진 둥근 금빛 방패",
  },
  {
    src: "/images/exhibits/zeus-otricoli.jpg",
    width: 1051,
    height: 1600,
    alt: "곱슬거리는 긴 머리와 풍성한 수염을 한 제우스의 대리석 두상",
  },
];

/** 캔버스가 화면을 채우도록 타일 40개(그림 두 점과 빈 진열장을 돌려 씀) */
const tiles: CanvasTile[] = Array.from({ length: 40 }, (_, index) => ({
  slug: `relic-${index + 1}`,
  name: `유물 ${index + 1}`,
  no: String(index + 1).padStart(3, "0"),
  glyph: "A",
  image: index % 5 === 4 ? null : IMAGES[index % 2],
}));

const meta = {
  title: "Pages/Vault/VaultCanvas",
  component: VaultCanvas,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div className="vault-theme" style={{ minHeight: "100vh" }}>
        <Story />
      </div>
    ),
  ],
  args: { tiles },
} satisfies Meta<typeof VaultCanvas>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 벽돌형 무한 캔버스. 끌기·휠·방향키·버튼으로 움직이고, 타일은 순서 있는 목록의 링크입니다. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const list = canvas.getByRole("list", { name: "전시된 유물 40점" });
    await expect(within(list).getAllByRole("link")).toHaveLength(40);
  },
};
