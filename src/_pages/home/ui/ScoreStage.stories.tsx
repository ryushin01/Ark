import { ScoreStage } from "./ScoreStage";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const image = (name: string, width: number, height: number) => ({
  src: `/images/exhibits/${name}.jpg`,
  width,
  height,
});

const meta = {
  title: "Pages/Home/ScoreStage",
  component: ScoreStage,
  parameters: { layout: "fullscreen" },
  args: {
    movements: [
      {
        slug: "egyptian",
        name: "이집트 신화",
        nameEn: "Egyptian",
        eraLabel: "기원전 24세기경",
        images: [image("weighing-heart", 1600, 824), image("isis-horus", 1200, 1600)],
      },
      {
        slug: "greek",
        name: "그리스 신화",
        nameEn: "Greek",
        eraLabel: "기원전 8세기경",
        images: [image("zeus-otricoli", 1200, 1600)],
      },
    ],
  },
} satisfies Meta<typeof ScoreStage>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 재생선 위의 계열이 콜라주로 펼쳐지고, 필름의 각 묶음은 계열 화면으로 가는 링크입니다. */
export const Default: Story = {};
