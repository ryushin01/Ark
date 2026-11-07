import { pingDatabase } from "@/shared/api/index.server";
import { pruneLoginAttempts } from "@/shared/auth/index.server";

/**
 * Vercel Cron(vercel.json)이 하루 한 번 부릅니다.
 * CRON_SECRET이 설정되어 있으면 Vercel이 보내는 Authorization 헤더를 확인합니다.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ ok: false }, { status: 401 });
  }
  const result = await pingDatabase();
  if (result.ok) await pruneLoginAttempts();
  return Response.json(result, { status: result.ok ? 200 : 500 });
}
