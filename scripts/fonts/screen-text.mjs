import { decodeHTML } from "entities";

/**
 * 소스 한 파일에서 화면에 나올 수 있는 글자를 모읍니다.
 * 문자열·템플릿 글자와 JSX 글자를 모으고, 주석은 뺍니다.
 * JSX 글자와 JSX 속성 문자열에 적힌 이름 있는 엔티티(&times;·&lsquo; 등)는 화면에 그려질 글자로 풉니다.
 *
 * @param {typeof import("typescript")} ts TypeScript 파서
 * @param {string} fileName 파일 이름(.tsx면 JSX로 읽음)
 * @param {string} text 파일 내용
 * @returns {string[]}
 */
export function sourceStrings(ts, fileName, text) {
  const kind = fileName.endsWith("x") ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
  // 부모 노드를 이어 두어(true) JSX 속성 안의 문자열인지 알 수 있게 함
  const source = ts.createSourceFile(fileName, text, ts.ScriptTarget.Latest, true, kind);
  /** @type {string[]} */
  const parts = [];
  /** @param {import("typescript").Node} node */
  const visit = (node) => {
    if (ts.isJsxText(node)) parts.push(decodeHTML(node.text));
    else if (ts.isStringLiteral(node) && ts.isJsxAttribute(node.parent))
      parts.push(decodeHTML(node.text));
    else if (
      ts.isStringLiteralLike(node) ||
      ts.isTemplateHead(node) ||
      ts.isTemplateMiddle(node) ||
      ts.isTemplateTail(node)
    )
      parts.push(node.text);
    ts.forEachChild(node, visit);
  };
  visit(source);
  return parts;
}
