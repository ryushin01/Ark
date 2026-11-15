import ts from "typescript";
import { describe, expect, it } from "vitest";

import { sourceStrings } from "./screen-text.mjs";

describe("sourceStrings", () => {
  it("JSX 글자와 속성의 이름 있는 엔티티를 글자로 풀어, 직접 쓴 글자와 같은 글자를 모은다", () => {
    const named = sourceStrings(
      ts,
      "named.tsx",
      'export const A = () => <button aria-label="&times; 닫기">&lsquo;신&rsquo; &times;</button>;',
    );
    const literal = sourceStrings(
      ts,
      "literal.tsx",
      'export const A = () => <button aria-label="× 닫기">‘신’ ×</button>;',
    );
    expect(named).toEqual(literal);
  });

  it("주석의 글자는 모으지 않는다", () => {
    expect(sourceStrings(ts, "a.ts", '// 주석\nexport const a = "글자";')).toEqual(["글자"]);
  });
});
