import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { IMAGE_PLACEHOLDER_SRC, SafeImage } from "./SafeImage";

const REMOTE = "https://example.supabase.co/storage/v1/object/public/exhibits/a.jpg";

describe("SafeImage", () => {
  it("그림을 받으면 원래 그림을 그대로 보여 줍니다", () => {
    render(
      <SafeImage
        src="/images/exhibits/a.jpg"
        alt="제우스 조각상"
        width={40}
        height={60}
        unoptimized
      />,
    );
    expect(screen.getByRole("img", { name: "제우스 조각상" })).toHaveProperty(
      "src",
      expect.stringMatching(/\/images\/exhibits\/a\.jpg$/),
    );
  });

  it("그림을 받지 못하면 대체 텍스트는 그대로 두고 저장소 안의 자리 표시로 바꿉니다", () => {
    render(<SafeImage src={REMOTE} alt="제우스 조각상" width={40} height={60} unoptimized />);
    fireEvent.error(screen.getByRole("img", { name: "제우스 조각상" }));
    const image = screen.getByRole("img", { name: "제우스 조각상" });
    expect(image).toHaveProperty(
      "src",
      expect.stringMatching(new RegExp(`${IMAGE_PLACEHOLDER_SRC}$`)),
    );
    expect(image).toHaveAttribute("data-image-fallback");
  });
});
