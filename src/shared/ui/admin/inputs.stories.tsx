import { Theme } from "@radix-ui/themes";
import { expect, within } from "storybook/test";

import { SelectInput, TextAreaInput, TextInput } from "./inputs";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import "@radix-ui/themes/styles.css";
import "./admin-theme.css";

const meta = {
  title: "Admin/Inputs",
  component: TextInput,
  args: { name: "epithet", label: "별칭", hint: "예) 하늘과 번개의 신", required: true },
  decorators: [
    (Story) => (
      <Theme accentColor="brown" grayColor="sand" radius="small" className="ark-admin">
        <div style={{ maxWidth: 420, padding: 16 }}>{Story()}</div>
      </Theme>
    ),
  ],
} satisfies Meta<typeof TextInput>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 레이블과 안내가 입력 칸에 연결됩니다. */
export const Text: Story = {
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole("textbox", { name: /별칭/ });
    await expect(input).toHaveAccessibleDescription("예) 하늘과 번개의 신");
  },
};

/** 오류가 있으면 aria-invalid와 오류 메시지를 연결합니다. */
export const WithError: Story = {
  args: { error: "별칭을 입력해 주세요. 예) 하늘과 번개의 신" },
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole("textbox", { name: /별칭/ });
    await expect(input).toHaveAttribute("aria-invalid", "true");
    await expect(input).toHaveAccessibleDescription(/별칭을 입력해 주세요/);
  },
};

/** 여러 줄 입력 */
export const TextArea: Story = {
  render: () => (
    <TextAreaInput name="description" label="소개" hint="문단 사이는 빈 줄로 나눕니다." required />
  ),
};

/** 목록에서 고르기 */
export const Select: Story = {
  render: () => (
    <SelectInput
      name="pantheonSlug"
      label="신화 계열"
      required
      options={[
        { value: "greek", label: "그리스 신화" },
        { value: "norse", label: "북유럽 신화" },
      ]}
    />
  ),
};
