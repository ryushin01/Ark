import { PantheonTimeline } from "./PantheonTimeline";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const credit = {
  artist: null,
  license: "Public domain",
  licenseUrl: null,
  sourceUrl: "https://commons.wikimedia.org/",
};

const meta = {
  title: "Pages/Home/PantheonTimeline",
  component: PantheonTimeline,
  parameters: { theme: "dark", layout: "fullscreen" },
  args: {
    items: [
      {
        slug: "egyptian",
        name: "이집트 신화",
        nameEn: "Egyptian",
        eraLabel: "기원전 24세기경",
        continent: "africa",
        earliestSource: "피라미드 텍스트",
        summary: "죽음 이후의 삶과 심판, 태양의 순환을 중심으로 삼천 년 넘게 이어진 신화입니다.",
        figureCount: 3,
        cover: {
          src: "/images/exhibits/weighing-heart.jpg",
          width: 1600,
          height: 824,
          alt: "",
          credit,
        },
      },
      {
        slug: "greek",
        name: "그리스 신화",
        nameEn: "Greek",
        eraLabel: "기원전 8세기경",
        continent: "europe",
        earliestSource: "호메로스 「일리아스」·「오디세이아」",
        summary: "올림포스의 열두 신과 영웅들의 이야기로, 서양 예술과 문학의 뿌리가 된 신화입니다.",
        figureCount: 5,
        cover: null,
      },
    ],
  },
} satisfies Meta<typeof PantheonTimeline>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 가장 이른 문헌 순서. 넓은 화면에서는 좌우로 번갈아 놓입니다. */
export const Default: Story = {};
