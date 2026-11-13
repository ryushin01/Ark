/**
 * 자료 그림 출처 전체 목록(docs/credits.md)을 다시 만듭니다.
 * 실행: pnpm credits (자료를 더하거나 출처를 고친 뒤, pnpm images:resolve 다음에)
 */
import { writeFile } from "node:fs/promises";

import { CREDITS_PATH, renderCredits } from "./credits";

await writeFile(CREDITS_PATH, renderCredits());
console.log(`${CREDITS_PATH}를 만들었습니다.`);
