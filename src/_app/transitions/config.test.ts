import { describe, expect, it } from "vitest";

import { motionConfig, reducedConfig, selectConfig } from "./config";

type Rule = { on?: string; from?: string | string[]; to?: string; priority?: number };

describe("화면 전환 설정", () => {
  it("움직임을 끄면 전환이 없는 설정을 쓴다", () => {
    expect(selectConfig(true)).toBe(reducedConfig);
    expect(reducedConfig.transitions).toEqual([]);
  });

  it("움직임이 켜져 있으면 같은 설정 객체를 쓴다(엔진을 다시 만들지 않게)", () => {
    expect(selectConfig(false)).toBe(motionConfig);
    expect(selectConfig(false)).toBe(selectConfig(false));
  });

  it("신 화면으로 들어가는 길과 신화 계열로 들어가는 길에 drill을 쓰고, 나머지는 fade", () => {
    const rules = motionConfig.transitions as unknown as Rule[];
    expect(rules[0]).toMatchObject({ on: "/**", priority: -100 });
    expect(rules.map((r) => r.to).filter(Boolean)).toEqual(["/pantheons/*", "/figures/*"]);
  });

  it("스크롤 잠금은 Lenis가 맡는다", () => {
    expect(motionConfig.scrollLock).toBe(false);
  });
});
