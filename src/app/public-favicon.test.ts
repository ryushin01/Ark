import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

// Paseo처럼 프로젝트 아이콘을 자동으로 찾는 도구는 src/를 보지 않고 public/을 하위 폴더까지 뒤진다.
// public/ 바로 아래에 아이콘이 없으면 `pnpm build`가 만든 public/storybook/favicon.svg(Storybook 로고)가
// 잡힐 수 있으므로, public/ 바로 아래에 사이트 아이콘과 같은 favicon.png를 두어 먼저 찾게 한다.
// 사이트는 이 파일을 쓰지 않는다(사이트 아이콘은 이 폴더의 icon.svg·favicon.ico·apple-icon.png).
// 사이트 아이콘 가운데 PNG이면서 밝은·어두운 바탕 모두에서 보이는 apple-icon.png(종이색 바탕의 A)를 복사해 둔다.
describe("도구용 프로젝트 아이콘(public/favicon.png)", () => {
  it("사이트 홈 화면 아이콘(src/app/apple-icon.png)과 같은 파일이다", () => {
    const root = path.resolve(import.meta.dirname, "../..");
    const toolIcon = readFileSync(path.join(root, "public/favicon.png"));
    const siteIcon = readFileSync(path.join(root, "src/app/apple-icon.png"));

    expect(
      toolIcon.equals(siteIcon),
      "src/app/apple-icon.png를 바꿨다면 public/favicon.png에도 복사하세요",
    ).toBe(true);
  });
});
