import { expect, within } from "storybook/test";

import { LorePlayer } from "./LorePlayer";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import "./vault-theme.css";

const meta = {
  title: "Pages/Vault/LorePlayer",
  component: LorePlayer,
  decorators: [
    (Story) => (
      <div
        className="vault-theme"
        style={{ padding: 32, background: "linear-gradient(135deg, #3a1d14, #0c0c0c)" }}
      >
        <div style={{ maxWidth: 420 }}>
          <Story />
        </div>
      </div>
    ),
  ],
  args: {
    text: "묠니르. 로키가 드베르그 형제에게 내기를 걸어 만들게 한 망치입니다. 던지면 반드시 맞히고 토르의 손으로 돌아옵니다.",
  },
} satisfies Meta<typeof LorePlayer>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 반투명 유리 패널의 '이야기 듣기'. 누르면 브라우저 음성 합성으로 읽습니다. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", { name: "이야기 듣기" })).toBeVisible();
    await expect(canvas.getByRole("progressbar", { name: "이야기 진행" })).toHaveAttribute(
      "aria-valuenow",
      "0",
    );
  },
};
