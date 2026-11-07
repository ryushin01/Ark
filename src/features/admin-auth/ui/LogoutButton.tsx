import { Button } from "@radix-ui/themes";

import { logoutAction } from "../api/actions";

export function LogoutButton() {
  return (
    <form action={logoutAction}>
      <Button type="submit" variant="ghost" color="gray">
        로그아웃
      </Button>
    </form>
  );
}
