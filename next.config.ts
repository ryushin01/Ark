import type { NextConfig } from "next";

/** 로컬 Supabase(pnpm db:start)를 쓰는지. 이때만 로컬 주소의 이미지를 최적화합니다. */
const usesLocalSupabase = process.env.SUPABASE_URL?.startsWith("http://127.0.0.1") ?? false;

const nextConfig: NextConfig = {
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
