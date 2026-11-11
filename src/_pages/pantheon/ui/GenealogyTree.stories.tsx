import { GenealogyTree } from "./GenealogyTree";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta = {
  title: "Pages/Pantheon/GenealogyTree",
  component: GenealogyTree,
  parameters: { layout: "fullscreen" },
  args: {
    genealogy: {
      pantheonSlug: "norse",
      source: "스노리 스투를루손 「산문 에다」",
      roots: [
        {
          name: "로키",
          nameEn: "Loki",
          slug: "loki",
          unions: [
            {
              partner: { name: "앙그르보다", nameEn: "Angrboða", note: "거인" },
              children: [
                { name: "펜리르", nameEn: "Fenrir", slug: "fenrir" },
                { name: "요르문간드", nameEn: "Jörmungandr", slug: "jormungandr" },
                { name: "헬", nameEn: "Hel" },
              ],
            },
            {
              partner: { name: "스바딜파리", nameEn: "Svaðilfari", note: "거인의 말" },
              children: [{ name: "슬레이프니르", nameEn: "Sleipnir", slug: "sleipnir" }],
              note: "로키가 암말로 변해 낳았습니다",
            },
          ],
        },
      ],
    },
  },
} satisfies Meta<typeof GenealogyTree>;

export default meta;
type Story = StoryObj<typeof meta>;

/** ‘─’ 뒤는 배우자, 들여 쓴 목록은 자식입니다. Ark에 있는 신은 링크입니다. */
export const Default: Story = {};
