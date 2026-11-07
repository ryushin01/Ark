/** 이미지 업로드 제한. 서버(Server Action)와 브라우저(파일 고르기)가 같은 값을 씁니다. */
export const UPLOAD = {
  /** Vercel 함수의 요청 본문 한도(4.5MB) 안에 들어오도록 4MB로 제한합니다. */
  maxBytes: 4 * 1024 * 1024,
  types: ["image/jpeg", "image/png", "image/webp"],
} as const;

/** 올릴 수 있는 이미지인지 확인합니다. 문제가 없으면 null */
export function describeUploadProblem(file: { size: number; type: string } | null | undefined) {
  if (!file || file.size === 0) return "이미지 파일을 골라 주세요.";
  if (!(UPLOAD.types as readonly string[]).includes(file.type)) {
    return "JPG, PNG, WebP 이미지만 올릴 수 있습니다.";
  }
  if (file.size > UPLOAD.maxBytes) {
    const megabytes = (file.size / 1024 / 1024).toFixed(1);
    return `이미지는 4MB 이하로 올려 주세요. 고른 파일은 ${megabytes}MB입니다.`;
  }
  return null;
}
