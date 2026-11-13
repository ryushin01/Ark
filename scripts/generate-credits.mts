/** 실행: pnpm credits → docs/credits.md */
import { writeFile } from "node:fs/promises";

import { renderCredits } from "./credits";

await writeFile(new URL("../docs/credits.md", import.meta.url), renderCredits());
console.log("docs/credits.md를 만들었습니다.");
