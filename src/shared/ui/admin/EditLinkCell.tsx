import Link from "next/link";
import { Button, Table } from "@radix-ui/themes";

/**
 * 목록 표 끝의 "고치기" 칸. 같은 글자의 링크가 줄마다 있으므로 링크 이름에 대상 이름을 넣어 구별합니다.
 * 보이는 글자("고치기")가 이름에 그대로 들어가게 합니다. (KWCAG 6.4.3, 6.5.3)
 */
export function EditLinkCell({ href, name }: { href: string; name: string }) {
  return (
    <Table.Cell justify="end">
      <Button asChild size="1" variant="soft">
        <Link href={href} aria-label={`${name} 고치기`}>
          고치기
        </Link>
      </Button>
    </Table.Cell>
  );
}
