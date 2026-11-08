import { expect, userEvent, within } from "storybook/test";

import { SwipeGallery } from "./SwipeGallery";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const credit = {
  artist: null,
  license: "Public domain",
  licenseUrl: null,
  sourceUrl: "https://commons.wikimedia.org/",
};

const meta = {
  title: "Pages/Archive/SwipeGallery",
  component: SwipeGallery,
  args: {
    label: "북유럽 신화",
    images: [
      {
        src: "/images/exhibits/thor-jotnar.jpg",
        width: 1081,
        height: 1600,
        alt: "염소가 끄는 수레 위에서 망치를 치켜든 토르가 거인들과 싸우는 그림",
        credit,
      },
      {
        src: "/images/exhibits/odin-wanderer.jpg",
        width: 500,
        height: 733,
        alt: "챙 넓은 모자를 쓴 노인 모습의 오딘",
        credit,
      },
    ],
  },
  decorators: [(Story) => <div style={{ maxWidth: 480 }}>{Story()}</div>],
} satisfies Meta<typeof SwipeGallery>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 이전·다음 버튼으로도 넘길 수 있습니다. 첫 장에서는 이전 버튼이 꺼져 있습니다. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("button", { name: /이전 이미지/ })).toBeDisabled();
    await userEvent.click(canvas.getByRole("button", { name: /다음 이미지/ }));
    // 부드러운 스크롤이 끝나면 쪽 번호가 바뀝니다.
    await expect(await canvas.findByText("2 / 2", {}, { timeout: 3000 })).toBeInTheDocument();
  },
};

/** 이미지가 없으면 자리표시를 보여 줍니다. (작품 이미지는 저작권 확인 후 등록) */
export const Empty: Story = { args: { images: [] } };
