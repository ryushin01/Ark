import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    // 어드민에서 올린 이미지 (Supabase Storage 공개 버킷)
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/**" },
    ],
  },
  experimental: {
    // 어드민 이미지 업로드 (최대 4MB) + 폼 값. Vercel 함수 본문 한도 4.5MB에 맞춥니다.
    serverActions: { bodySizeLimit: "4.5mb" },
  },
};

export default nextConfig;
