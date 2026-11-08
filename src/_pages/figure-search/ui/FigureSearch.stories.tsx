import { expect, userEvent, within } from "storybook/test";

import { FigureSearch } from "./FigureSearch";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const credit = {
  artist: null,
  license: "Public domain",
  licenseUrl: null,
  sourceUrl: "https://commons.wikimedia.org/",
};

const meta = {
  title: "Pages/FigureSearch/FigureSearch",
  component: FigureSearch,
  parameters: { layout: "padded" },
  args: {
    items: [
      {
        slug: "zeus",
        name: "제우스",
        nameEn: "Zeus",
        epithet: "신들의 왕",
        domains: ["하늘", "천둥", "정의"],
        pantheonName: "그리스 신화",
        continent: "europe",
        exhibitCount: 1,
        image: {
          src: "/images/exhibits/zeus-otricoli.jpg",
          width: 1200,
          height: 1600,
          alt: "",
          credit,
        },
      },
      {
        slug: "shango",
        name: "샹고",
        nameEn: "Shango",
        epithet: "천둥과 번개의 오리샤",
        domains: ["천둥", "번개", "정의", "춤"],
        pantheonName: "요루바 신화",
        continent: "africa",
        exhibitCount: 0,
        image: null,
      },
      {
        slug: "tangaroa",
        name: "탕가로아",
        nameEn: "Tangaroa",
        epithet: "바다의 신",
        domains: ["바다", "물고기", "창조"],
        pantheonName: "폴리네시아 신화",
        continent: "oceania",
        exhibitCount: 0,
        image: null,
      },
    ],
  },
} satisfies Meta<typeof FigureSearch>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 처음에는 모두 보여 줍니다. */
export const Default: Story = {};

/** 영역으로 찾고 대륙으로 한 번 더 거릅니다. 결과 개수는 화면 낭독기에 알립니다. */
export const SearchByDomain: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(
      canvas.getByRole("searchbox", { name: "이름·별칭·영역으로 찾기" }),
      "천둥",
    );
    await expect(canvas.getByText("신과 인물 2명")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: /^아프리카/ }));
    await expect(canvas.getByText("신과 인물 1명")).toBeVisible();
    await expect(canvas.getByRole("link", { name: /^샹고/ })).toBeVisible();
  },
};

/** 맞는 신이 없을 때의 안내 */
export const NoResult: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByRole("searchbox"), "없는 신");
    await expect(canvas.getByText(/찾는 신이 없습니다/)).toBeVisible();
  },
};
