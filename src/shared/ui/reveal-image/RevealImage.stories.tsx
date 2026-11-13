import { RevealImage } from "./RevealImage";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta = {
  title: "Shared/RevealImage",
  component: RevealImage,
  args: {
    sizes: "400px",
    image: {
      src: "/images/exhibits/zeus-otricoli.jpg",
      width: 1051,
      height: 1600,
      alt: "곱슬거리는 긴 머리와 풍성한 수염을 한 제우스의 대리석 두상",
    },
  },
  decorators: [(Story) => <div style={{ width: 320 }}>{Story()}</div>],
} satisfies Meta<typeof RevealImage>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 원본 비율. 그림마다의 출처는 화면 대신 README의 출처에 모읍니다. */
export const Natural: Story = {};

/** 부모를 가득 채우는 이미지 */
export const Cover: Story = {
  args: { fit: "cover" },
  decorators: [(Story) => <div style={{ width: 320, height: 240 }}>{Story()}</div>],
};
