import { RevealText } from "./RevealText";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta = {
  title: "Shared/RevealText",
  component: RevealText,
  args: { text: "신화의 계열", as: "h2", mode: "words" },
} satisfies Meta<typeof RevealText>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 제목: 단어마다 아래에서 떠오릅니다. */
export const Words: Story = {};

/** 본문: 문단 전체가 떠오릅니다. */
export const Block: Story = {
  args: {
    as: "p",
    mode: "block",
    text: "Ark는 세계 여러 문명의 신화를 한곳에 모은 도서관입니다.",
  },
};

/** 어두운 화면 */
export const Dark: Story = { parameters: { theme: "dark" } };
