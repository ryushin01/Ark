import { FigureGrid } from "./FigureGrid";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const credit = {
  artist: null,
  license: "Public domain",
  licenseUrl: null,
  sourceUrl: "https://commons.wikimedia.org/",
};

const meta = {
  title: "Pages/Pantheon/FigureGrid",
  component: FigureGrid,
  args: {
    figures: [
      {
        slug: "zeus",
        name: "제우스",
        nameEn: "Zeus",
        epithet: "하늘과 번개의 신",
        exhibitCount: 1,
        image: {
          src: "/images/exhibits/zeus-otricoli.jpg",
          width: 1051,
          height: 1600,
          alt: "",
          credit,
        },
      },
      {
        slug: "loki",
        name: "로키",
        nameEn: "Loki",
        epithet: "꾀와 변신의 신",
        exhibitCount: 0,
        image: null,
      },
    ],
  },
} satisfies Meta<typeof FigureGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 자료가 없는 신은 "자료 준비 중" 자리표시를 보여 줍니다. */
export const Default: Story = {};
