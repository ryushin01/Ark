import type { NextConfig } from "next";

/** 로컬 Supabase(pnpm db:start)를 쓰는지. 이때만 로컬 주소의 이미지를 최적화합니다. */
const usesLocalSupabase = process.env.SUPABASE_URL?.startsWith("http://127.0.0.1") ?? false;

const isDev = process.env.NODE_ENV === "development";

/**
 * 보안 헤더
 * - CSP: nonce를 쓰면 모든 페이지를 요청마다 그려야 하므로, 정적 페이지를 지키는 nonce 없는 방식을 씁니다.
 *   Next.js의 인라인 스크립트·스타일 때문에 'unsafe-inline'이 필요합니다. 외부 스크립트는 막습니다.
 * - 이미지는 Next.js 이미지 최적화(/_next/image, 같은 출처)를 거치므로 img-src는 같은 출처와 data:만 엽니다.
 * - frame-ancestors 'none', X-Frame-Options: 다른 사이트가 어드민을 프레임으로 끼워 넣지 못하게 합니다.
 * - upgrade-insecure-requests는 Vercel 배포에서만 씁니다. (로컬 http 서버의 요청을 https로 바꾸지 않도록)
 */
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' blob: data:",
  "font-src 'self'",
  `connect-src 'self'${isDev ? " ws:" : ""}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(process.env.VERCEL ? ["upgrade-insecure-requests"] : []),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
];

const storybookHeaders = securityHeaders.map((header) => {
  if (header.key === "X-Frame-Options") return { ...header, value: "SAMEORIGIN" };
  if (header.key === "Content-Security-Policy")
    // Storybook UI는 내장 글꼴을 data: 주소로 불러옵니다.
    return {
      ...header,
      value: header.value
        .replace("frame-ancestors 'none'", "frame-ancestors 'self'")
        .replace("font-src 'self'", "font-src 'self' data:"),
    };
  return header;
});

const nextConfig: NextConfig = {
  async headers() {
    return [
      { source: "/((?!storybook/).*)", headers: securityHeaders },
      // Storybook은 미리보기를 같은 출처의 iframe으로 띄우므로 같은 출처 프레임만 허용합니다.
      { source: "/storybook/:path*", headers: storybookHeaders },
    ];
  },
  async redirects() {
    return [
      // 빌드 결과물(public/storybook)은 정적 파일이라 폴더 주소로는 열리지 않아 index.html로 보냅니다.
      // (rewrite로 연결하면 주소가 /storybook에 남아 상대 경로 파일을 찾지 못합니다.)
      { source: "/storybook", destination: "/storybook/index.html", permanent: false },
    ];
  },
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    // 어드민에서 올린 이미지 (Supabase Storage 공개 버킷)
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/**" },
      ...(usesLocalSupabase
        ? [
            {
              protocol: "http" as const,
              hostname: "127.0.0.1",
              port: "54321",
              pathname: "/storage/v1/object/public/**",
            },
          ]
        : []),
    ],
    dangerouslyAllowLocalIP: usesLocalSupabase,
  },
  experimental: {
    // 어드민 이미지 업로드 (최대 4MB) + 폼 값. Vercel 함수 본문 한도 4.5MB에 맞춥니다.
    serverActions: { bodySizeLimit: "4.5mb" },
  },
};

export default nextConfig;
