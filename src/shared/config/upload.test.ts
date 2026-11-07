import { describe, expect, it } from "vitest";

import { describeUploadProblem, UPLOAD } from "./upload";

describe("describeUploadProblem", () => {
  it("허용한 형식과 크기면 null입니다", () => {
    expect(describeUploadProblem({ size: 1000, type: "image/webp" })).toBeNull();
  });

  it("형식이 다르거나 크기를 넘으면 이유를 알려 줍니다", () => {
    expect(describeUploadProblem({ size: 1000, type: "image/gif" })).toMatch(/JPG, PNG, WebP/);
    expect(describeUploadProblem({ size: UPLOAD.maxBytes + 1, type: "image/jpeg" })).toMatch(
      /4MB 이하.*4\.0MB/,
    );
    expect(describeUploadProblem(null)).toMatch(/골라 주세요/);
  });
});
