# 개발 가이드

## 구조: Feature-Sliced Design v2.1

계층은 위에서 아래로 `_app → _pages → widgets → features → entities → shared` 순서입니다. 슬라이스는 자기보다 아래 계층만 가져오고, 다른 슬라이스는 공개 API(`index.ts`)로만 가져옵니다. 두 규칙은 `eslint.config.mjs`의 `no-restricted-imports`가 검사합니다.

- Next.js의 `src/app/`에 있는 라우트 파일은 `_pages`를 다시 내보내기만 합니다. 동적 라우트는 `params`를 풀어 넘기는 정도만 둡니다.
- 서버 전용 코드(조회·저장, 스키마)가 있는 슬라이스는 `index.server.ts`로 따로 내보냅니다. 클라이언트 컴포넌트는 `index.ts`(타입, 상수, UI)만 가져옵니다.
- Next.js `app` 폴더와 겹치지 않게 FSD의 app·pages 계층은 `_app`, `_pages`로 씁니다.

| 계층       | 슬라이스                                                                                                         |
| ---------- | ---------------------------------------------------------------------------------------------------------------- |
| `_pages`   | `home`, `pantheon`, `figure`, `archive`, `not-found`                                                             |
| `widgets`  | `site-header`, `site-footer`, `home-hero`, `pantheon-timeline`, `figure-index`, `figure-grid`, `exhibit-gallery` |
| `features` | `swipe-gallery`                                                                                                  |
| `entities` | `pantheon`(신화 계열), `figure`(신·인물), `exhibit`(소장 자료), `work`(영향받은 작품)                            |
| `shared`   | `ui`(Divider, RevealText, RevealImage, VisuallyHidden), `lib`(훅, 이미지 출처), `config`                         |

## 디자인

참고 사이트(eladiodieste.com)의 디자인 언어를 신화 도서관에 맞게 옮겼습니다. 상용 글꼴은 쓰지 않고 Pretendard 가변 글꼴로 대신합니다.

| 토큰                                              | 값                    | 쓰임                       |
| ------------------------------------------------- | --------------------- | -------------------------- |
| `--black` / `--off-white`                         | `#000` / `#f1ece8`    | 홈(어두운 화면)            |
| `--sand` / `--brick`                              | `#eadfd2` / `#8a4a1f` | 상세 화면. 명도 대비 5.2:1 |
| `--ease-magic`, `--ease-out-expo`, `--ease-quart` | cubic-bezier          | 등장·전환 애니메이션       |

- 화면 안에 `.theme-dark`가 있으면 `:root:has(.theme-dark)`로 머리글과 `body`까지 어두운 색을 씁니다.
- 등장 애니메이션의 시작 상태(숨김)는 `html.js`일 때만 적용합니다. 루트 레이아웃의 인라인 스크립트가 첫 페인트 전에 `js` 클래스를 붙입니다.
- `prefers-reduced-motion: reduce`이면 등장 애니메이션, 스크롤 연출, Lenis를 모두 끕니다.
- 지연 로딩 이미지는 `clip-path`로 완전히 잘라 두면 브라우저가 불러오지 않습니다. 시작 상태는 `opacity`로만 숨깁니다.

## 데이터와 이미지

지금은 각 엔티티의 `api/mock-data.ts`를 씁니다. 조회 함수는 `"use cache"`와 `cacheTag`로 캐시하므로, 저장 기능을 붙일 때는 Server Action에서 `updateTag`로 갱신합니다.

자료 이미지는 `scripts/commons-sources.json`에 Commons 파일 이름을 적고 `pnpm images:resolve`로 받습니다.

- 라이선스가 퍼블릭 도메인·CC0·CC BY·CC BY-SA가 아니면 실패합니다.
- 이미지는 긴 변 1600px 이하 JPEG로 `public/images/exhibits/`에 저장합니다. Wikimedia 원본을 화면에서 직접 불러오면 요청 제한(429)에 걸리기 때문입니다.
- 저작자·라이선스·원본 주소는 `src/entities/exhibit/api/mock/commons-images.json`에 저장되고, 화면의 이미지마다 표기됩니다.
- 대체 텍스트는 실제 이미지를 보고 `exhibit/api/mock-data.ts`에 직접 씁니다.

## 어드민

`/admin`은 Radix Themes만으로 만들었습니다. 공개 사이트의 디자인 토큰을 쓰지 않습니다.

| 역할   | 로그인                    | 할 수 있는 일                                                                                              |
| ------ | ------------------------- | ---------------------------------------------------------------------------------------------------------- |
| 관리자 | `ADMIN_PASSWORD` 비밀번호 | 계열 고치기, 신·작품 만들기·고치기·삭제, 자료 설명·출처 고치기·삭제                                        |
| 데모   | 버튼 하나                 | 모든 화면 보기. 저장은 서버에서 막습니다. 배포본에서 방문자가 공개 데이터를 바꾸지 못하게 하려는 것입니다. |

- 세션은 HMAC 서명 쿠키(`ark_admin`, path `/admin`, httpOnly, 8시간)입니다. `src/proxy.ts`가 로그인하지 않은 요청을 로그인 화면으로 보내고, 저장하는 Server Action은 `checkWritePermission()`으로 권한을 다시 확인합니다.
- 입력값은 엔티티의 zod 스키마(`model/schema.ts`)로 검사합니다. 오류가 나면 칸마다 `aria-invalid`와 오류 메시지를 연결하고, 오류 요약으로 초점을 옮깁니다. 입력한 값은 그대로 남깁니다.
- 저장하면 `updateTag`로 캐시를 갱신합니다. 미리 그린 공개 페이지는 저장 뒤 첫 요청에 이전 내용을 보여 주고, 곧바로 새 내용으로 다시 그립니다.
- 다른 데이터가 가리키는 항목은 지우지 않습니다. 자료나 작품이 연결된 신, 계열의 대표 자료로 쓰는 자료가 그렇습니다.
- Radix Themes 기본 색 중 명도 대비가 모자란 조합은 `shared/ui/admin/admin-theme.css`에서 보정합니다(진한 바탕 버튼, Select 자리표시). 주황 배지·안내는 `highContrast`를 씁니다.

목업 저장소의 한계: 데이터는 서버 메모리에 있어 재시작하면 시드로 돌아가지만, 다시 그린 공개 페이지는 디스크 캐시에 남습니다. Supabase를 연결하면 각 엔티티의 `api/table.ts` 구현만 바꿉니다.

## 환경 변수

| 이름                          | 필요한 곳 | 내용                                                                               |
| ----------------------------- | --------- | ---------------------------------------------------------------------------------- |
| `ADMIN_PASSWORD`              | 저장할 때 | 관리자 비밀번호. 없으면 데모 로그인만 됩니다.                                      |
| `ADMIN_SESSION_SECRET`        | 운영      | 세션 서명 키. 운영 환경에서 없으면 로그인을 막습니다. 개발 환경은 기본값을 씁니다. |
| `NEXT_PUBLIC_FEATURE_ARCHIVE` | 선택      | 아래 기능 플래그                                                                   |

## 기능 플래그

| 환경 변수                     | 기본값 | 내용                                                                                                                    |
| ----------------------------- | ------ | ----------------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_FEATURE_ARCHIVE` | 꺼짐   | `true`이면 영향 아카이브(`/archive`), 메뉴 항목, 신 상세의 관련 작품을 보여 줍니다. 꺼져 있으면 `/archive`는 404입니다. |

영향 아카이브의 작품 이미지는 저작권자가 있으므로 저장소에 넣지 않습니다. 확인하지 못한 작품 정보는 `status: "draft"`로 두어 공개 화면에 내보내지 않습니다.

## 접근성 (KWCAG 2.2)

- 본문 바로가기, `lang="ko"`, 원제의 `lang` 지정, 제목 구조, 브레드크럼(`aria-current`)
- 작은 화면 메뉴는 네이티브 `<dialog>`(`showModal`)로 초점 가두기와 Esc 닫기를 처리합니다.
- 스와이프 갤러리는 터치 밀기 외에 이전·다음 버튼과 쪽 번호(`aria-live`)를 둡니다.
- 터치 대상은 44px 이상, 키보드 초점은 항상 보입니다.
- 장식 이미지(첫 화면, 미리보기)는 대체 텍스트를 비우고, 자료 이미지는 내용을 설명합니다.

axe 검사는 스토리 테스트와 E2E에서 실행합니다. axe를 통과해도 KWCAG 준수는 아니므로, 새 화면은 검사 항목을 직접 점검합니다.

## 테스트

| 종류            | 위치                        | 명령                             |
| --------------- | --------------------------- | -------------------------------- |
| 단위            | `src/**/*.test.ts(x)`       | `pnpm test`                      |
| 스토리          | `src/**/*.stories.tsx`      | `pnpm test:storybook`            |
| E2E             | `e2e/site.spec.ts`          | `pnpm build && pnpm test:e2e`    |
| README 스크린샷 | `e2e/readme.screenshots.ts` | `pnpm build && pnpm screenshots` |

E2E는 프로덕션 빌드에서 375·768·1440px의 가로 넘침, axe(WCAG 2.2 AA), 본문 바로가기, 메뉴 키보드 동작, 아카이브 플래그를 검사합니다. 어드민 E2E는 로그인, 데모 저장 차단, 만들기→공개 화면 반영→삭제 흐름을 검사합니다. 메모리 저장소를 바꾸므로 공개 사이트 검사가 끝난 뒤 순서대로 실행합니다(`admin` 프로젝트). 테스트용 비밀번호는 `playwright.config.ts`의 `webServer.env`에 있습니다.
