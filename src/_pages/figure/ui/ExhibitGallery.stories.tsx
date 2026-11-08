import { ExhibitGallery } from "./ExhibitGallery";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta = {
  title: "Pages/Figure/ExhibitGallery",
  component: ExhibitGallery,
  args: {
    exhibits: [
      {
        id: "thor-jotnar",
        figureSlug: "thor",
        title: "거인과 싸우는 토르",
        kind: "painting",
        dateLabel: "1872년",
        holder: "스웨덴 국립미술관",
        note: null,
        image: {
          src: "/images/exhibits/thor-jotnar.jpg",
          width: 1081,
          height: 1600,
          alt: "염소가 끄는 수레 위에서 망치를 치켜든 토르가 번개 속에서 거인들과 싸우는 그림",
          credit: {
            artist: "Mårten Eskil Winge",
            license: "Public domain",
            licenseUrl: null,
            sourceUrl: "https://commons.wikimedia.org/",
          },
        },
      },
    ],
  },
} satisfies Meta<typeof ExhibitGallery>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 번호, 이미지(출처 표기), 분류·시기·소장처 */
export const Default: Story = {};

/** 등록된 자료가 없을 때 */
export const Empty: Story = { args: { exhibits: [] } };
