import { ScoreRows } from "./ScoreRows";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const credit = {
  artist: null,
  license: "Public domain",
  licenseUrl: null,
  sourceUrl: "https://commons.wikimedia.org/",
};

const meta = {
  title: "Pages/Home/ScoreRows",
  component: ScoreRows,
  parameters: { layout: "fullscreen" },
  args: {
    items: [
      {
        slug: "egyptian",
        name: "이집트 신화",
        nameEn: "Egyptian",
        eraLabel: "기원전 24세기경",
        continent: "africa",
        earliestSource: "피라미드 텍스트",
        figureCount: 3,
        images: [
          {
            src: "/images/exhibits/weighing-heart.jpg",
            width: 1600,
            height: 824,
            alt: "",
            credit,
          },
        ],
      },
      {
        slug: "greek",
        name: "그리스 신화",
        nameEn: "Greek",
        eraLabel: "기원전 8세기경",
        continent: "europe",
        earliestSource: "호메로스 「일리아스」·「오디세이아」",
        figureCount: 5,
        images: [],
      },
    ],
  },
} satisfies Meta<typeof ScoreRows>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 한 계열이 오선 한 줄입니다. 오래된 기록부터 놓습니다. */
export const Default: Story = {};
