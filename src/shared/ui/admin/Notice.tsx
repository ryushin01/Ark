import { Callout } from "@radix-ui/themes";

/** 저장·삭제 뒤 목록 위에 보여 주는 안내 */
export function Notice({ saved, deleted }: { saved?: string; deleted?: string }) {
  if (!saved && !deleted) return null;
  return (
    <Callout.Root color="green" role="status" mb="4">
      <Callout.Text>
        {saved ? `'${saved}'을(를) 저장했습니다.` : `'${deleted}'을(를) 삭제했습니다.`}
      </Callout.Text>
    </Callout.Root>
  );
}
