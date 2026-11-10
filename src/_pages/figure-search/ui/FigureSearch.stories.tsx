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
  // 검색 상태가 주소에 남으므로, 스토리마다 검색 값을 지우고 시작합니다.
  beforeEach: () => {
    const params = new URLSearchParams(window.location.search);
    ["q", "continent", "kind"].forEach((key) => params.delete(key));
    const query = params.toString();
    window.history.replaceState(null, "", `${window.location.pathname}${query ? `?${query}` : ""}`);
  },
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
        kind: "god",
        kindLabel: "신",
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
        kind: "god",
        kindLabel: "신",
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
        kind: "god",
        kindLabel: "신",
        exhibitCount: 0,
        image: null,
      },
      {
        slug: "heracles",
        name: "헤라클레스",
        nameEn: "Heracles",
        epithet: "열두 과업의 영웅",
        domains: ["영웅", "힘"],
        pantheonName: "그리스 신화",
        continent: "europe",
        kind: "hero",
        kindLabel: "영웅",
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

/** 분류로 거릅니다. 각 버튼의 개수는 다른 거르기를 적용한 상태에서 셉니다. */
export const FilterByKind: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const kinds = canvas.getByRole("group", { name: "분류로 거르기" });
    await userEvent.click(within(kinds).getByRole("button", { name: /^영웅/ }));
    await expect(canvas.getByText("신과 인물 1명")).toBeVisible();
    await expect(canvas.getByRole("link", { name: /^헤라클레스/ })).toBeVisible();
    const continents = canvas.getByRole("group", { name: "대륙으로 거르기" });
    await expect(within(continents).getByRole("button", { name: /^유럽/ })).toHaveAccessibleName(
      /유럽 1/,
    );
  },
};
