import { Table, Theme } from "@radix-ui/themes";
import { expect, within } from "storybook/test";

import { EditLinkCell } from "./EditLinkCell";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import "@radix-ui/themes/styles.css";
import "./admin-theme.css";

const meta = {
  title: "Admin/EditLinkCell",
  component: EditLinkCell,
  args: { href: "/admin/figures/zeus", name: "제우스" },
  decorators: [
    (Story) => (
      <Theme accentColor="brown" grayColor="sand" radius="small" className="ark-admin">
        <Table.Root>
          <Table.Body>
            <Table.Row>
              <Table.RowHeaderCell>제우스</Table.RowHeaderCell>
              {Story()}
            </Table.Row>
          </Table.Body>
        </Table.Root>
      </Theme>
    ),
  ],
} satisfies Meta<typeof EditLinkCell>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 목록 표의 마지막 칸. 링크 이름에 대상 이름이 들어가 줄마다 구별됩니다. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("link", { name: "제우스 고치기" })).toBeVisible();
  },
};
