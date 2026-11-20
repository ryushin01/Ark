import { expect, within } from "storybook/test";

import { FigureGrid } from "./FigureGrid";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta = {
  title: "Widgets/FigureGrid",
  component: FigureGrid,
  args: {
    figures: [
      {
        slug: "zeus",
        name: "제우스",
        nameEn: "Zeus",
        epithet: "하늘과 번개의 신",
        kindLabel: "신",
        exhibitCount: 1,
        image: {
          src: "/images/exhibits/zeus-otricoli.jpg",
          width: 1051,
          height: 1600,
        },
      },
      {
        slug: "loki",
        name: "로키",
        nameEn: "Loki",
        epithet: "꾀와 변신의 신",
        kindLabel: "신",
        exhibitCount: 0,
        image: null,
      },
    ],
  },
} satisfies Meta<typeof FigureGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 자료가 없는 신(로키)은 오선 위에 영문 이름 첫 글자를 새긴 기본 그림을 보여 줍니다. */
export const Default: Story = {};

/** 기본 그림은 장식이라 화면 낭독기에는 숨기고, 카드 링크 이름은 신 이름으로 시작합니다("자료 0점"이 같은 내용을 알림). */
export const DefaultImage: Story = {
  play: async ({ canvasElement }) => {
    const card = within(canvasElement).getByRole("link", { name: /^로키/ });
    const placeholder = card.querySelector('[aria-hidden="true"]');
    await expect(placeholder).not.toBeNull();
    await expect(within(placeholder as HTMLElement).getByText("L")).toBeInTheDocument();
    await expect(card.querySelector("img")).toBeNull();
  },
};

/** 화면 맨 위 가까이 놓인 목록(신 찾기)은 첫 줄 이미지를 지연 로딩하지 않고, 첫 장은 먼저 받습니다(LCP). */
export const FirstRowEager: Story = {
  args: { eagerCount: 3 },
  play: async ({ canvasElement }) => {
    const image = within(canvasElement)
      .getByRole("link", { name: /^제우스/ })
      .querySelector("img");
    await expect(image).toHaveAttribute("loading", "eager");
    await expect(image).toHaveAttribute("fetchpriority", "high");
  },
};

/** 기본(계열 화면처럼 대표 이미지 아래의 목록)은 모두 지연 로딩합니다. */
export const LazyByDefault: Story = {
  play: async ({ canvasElement }) => {
    const image = within(canvasElement)
      .getByRole("link", { name: /^제우스/ })
      .querySelector("img");
    await expect(image).toHaveAttribute("loading", "lazy");
  },
};
