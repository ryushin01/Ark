export type ChangelogEntry = {
  version: string;
  /** YYYY-MM-DD */
  date: string;
  /** 절 안의 줄 (빈 줄 제외, 마크다운 그대로) */
  lines: string[];
};

const VERSION_HEADING = /^## (\d+\.\d+\.\d+) - (\d{4}-\d{2}-\d{2})\s*$/;

/** 문서를 한 줄씩 읽습니다. 줄 목록을 미리 만들지 않아 앞부분만 쓰면 뒤는 읽지 않습니다. */
function* eachLine(text: string): Generator<string> {
  let start = 0;
  while (start <= text.length) {
    const end = text.indexOf("\n", start);
    if (end === -1) {
      if (start < text.length) yield text.slice(start);
      return;
    }
    yield text.slice(start, end);
    start = end + 1;
  }
}

/**
 * CHANGELOG를 위에서부터 버전 절 하나씩 돌려줍니다.
 * 호출한 쪽이 필요한 만큼만 받고 멈추면(break) 나머지 문서는 읽지 않습니다.
 */
export async function* changelogEntries(
  markdown: string,
): AsyncGenerator<ChangelogEntry, void, undefined> {
  let current: ChangelogEntry | null = null;
  for (const raw of eachLine(markdown)) {
    const line = raw.trimEnd();
    if (line.startsWith("## ")) {
      if (current) yield current;
      const heading = VERSION_HEADING.exec(line);
      current = heading ? { version: heading[1]!, date: heading[2]!, lines: [] } : null;
      continue;
    }
    if (current && line.trim() !== "") current.lines.push(line);
  }
  if (current) yield current;
}

/** 목록 기호와 마크다운 서식(굵게·코드·링크)을 지운 한 줄 텍스트 */
export function toPlainText(line: string): string {
  return line
    .replace(/^\s*(?:[-*]|\d+\.)\s+/, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .trim();
}

const SUMMARY_LIMIT = 60;

/** 제목에 붙일 한 줄 요약: 첫 줄을 순수 텍스트로 바꿔 60자까지만 */
export function summarize(lines: readonly string[]): string {
  const first = lines[0];
  if (!first) return "";
  const text = toPlainText(first);
  return text.length > SUMMARY_LIMIT ? `${text.slice(0, SUMMARY_LIMIT)}…` : text;
}
