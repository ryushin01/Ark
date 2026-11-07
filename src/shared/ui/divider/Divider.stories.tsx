import { Divider } from "./Divider";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta = {
  title: "Shared/Divider",
  component: Divider,
} satisfies Meta<typeof Divider>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 화면에 들어오면 왼쪽에서 오른쪽으로 펼쳐집니다. */
export const Default: Story = {};
