import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier";
import simpleImportSort from "eslint-plugin-simple-import-sort";

/**
 * FSD 계층. 위 계층은 아래 계층만 가져올 수 있습니다.
 * (app → _pages → widgets → features → entities → shared)
 */
const LAYERS = ["_app", "_pages", "widgets", "features", "entities", "shared"];

/** 각 계층에서 가져오면 안 되는 위 계층과, 슬라이스 내부 파일을 바로 가져오는 경로를 막습니다. */
const layerRules = LAYERS.map((layer, index) => ({
  files: [`src/${layer}/**/*.{ts,tsx}`],
  rules: {
    "no-restricted-imports": [
      "error",
      {
        patterns: [
          ...LAYERS.slice(0, index).map((upper) => ({
            group: [`@/${upper}`, `@/${upper}/**`],
            message: `${layer} 계층은 위 계층(${upper})을 가져올 수 없습니다.`,
          })),
          {
            group: [
              "@/_pages/*/**",
              "@/widgets/*/**",
              "@/features/*/**",
              "@/entities/*/**",
              "!@/*/*/index.server",
            ],
            message: "슬라이스는 공개 API(index.ts, 서버 전용은 index.server.ts)로만 가져옵니다.",
          },
        ],
      },
    ],
  },
}));

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  ...layerRules,
  {
    // import 정렬: 외부 패키지 → 내부(@/) → 상대 경로 → 타입 → 사이드 이펙트(CSS)
    plugins: { "simple-import-sort": simpleImportSort },
    rules: {
      "simple-import-sort/imports": [
        "error",
        {
          groups: [
            ["^react$", "^react-dom", "^next", "^@?\\w"],
            ["^@/"],
            ["^\\."],
            ["^.*\\u0000$"],
            ["^\\u0000"],
          ],
        },
      ],
      "simple-import-sort/exports": "error",
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "storybook-static/**",
    "playwright-report/**",
    "test-results/**",
    "coverage/**",
  ]),
  prettier,
]);

export default eslintConfig;
