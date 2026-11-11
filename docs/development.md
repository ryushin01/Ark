# 개발 가이드

## 구조: Feature-Sliced Design v2.1

계층은 위에서 아래로 `_app → _pages → widgets → features → entities → shared` 순서입니다. 슬라이스는 자기보다 아래 계층만 가져오고, 다른 슬라이스는 공개 API(`index.ts`)로만 가져옵니다. 두 규칙은 `eslint.config.mjs`의 `no-restricted-imports`가 검사하고, 슬라이스 구성은 Steiger(`pnpm lint:fsd`, `steiger.config.mjs`)가 검사합니다.

- Next.js의 `src/app/`에 있는 라우트 파일은 `_pages`를 다시 내보내기만 합니다. 동적 라우트는 `params`를 풀어 넘기는 정도만 둡니다.
- 서버 전용 코드(조회·저장, 스키마)가 있는 슬라이스는 `index.server.ts`로 따로 내보냅니다. 클라이언트 컴포넌트는 `index.ts`(타입, 상수, UI)만 가져옵니다.
- `_app`은 공개 사이트용 `index.ts`와 어드민용 `index.admin.ts`로 나눕니다. 어드민 레이아웃이 Radix Themes CSS(압축 전 약 680KB)를 가져오므로, 한 파일로 내보내면 공개 사이트도 이 CSS를 받게 됩니다.
- Next.js `app` 폴더와 겹치지 않게 FSD의 app·pages 계층은 `_app`, `_pages`로 씁니다. 그래서 Steiger의 `fsd/typo-in-layer-name`만 끄고, 라우트 폴더 `src/app/`은 검사에서 뺍니다.
- 한 페이지에서만 쓰는 UI와 Server Action은 그 페이지 슬라이스의 `ui`·`api`에 둡니다(예: 홈의 연대기, 어드민 편집 폼). 두 곳 이상에서 쓰게 되면 `widgets`·`features`로 올립니다.

| 계층       | 슬라이스                                                                                                                                                                                          |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `_app`     | `layouts`(루트·사이트·어드민), `scroll`(부드러운 스크롤, 스크롤 위치 되돌리기), `transitions`(화면 전환), `seo`, `styles`                                                                         |
| `_pages`   | `home`(악보 무대, 계열 목록, 신 색인), `pantheon`, `figure`(자료 목록), `figure-search`(신 찾기), `archive`(스와이프 갤러리), `error`, `not-found`, `admin-*`(목록과 편집 폼, 저장 Server Action) |
| `widgets`  | `site-header`, `site-footer`, `figure-grid`(신 카드 목록: 계열 상세·신 찾기), `admin-shell`                                                                                                       |
| `features` | `admin-auth`                                                                                                                                                                                      |
| `entities` | `pantheon`(신화 계열), `figure`(신·인물), `exhibit`(소장 자료), `work`(영향받은 작품)                                                                                                             |
| `shared`   | `ui`(Divider, FilterGroup, 손글씨 주석, RevealText, RevealImage, VisuallyHidden), `lib`(훅, 이미지 출처), `config`                                                                                |

## 디자인

공개 사이트는 mariavasilyeva.com의 악보 모티프를 참고해 신화 도서관에 맞게 옮겼습니다. 이미지, 문구, 글꼴은 가져오지 않았습니다. 어드민은 Radix Themes 그대로입니다.

| 요소        | 내용                                                                                                         |
| ----------- | ------------------------------------------------------------------------------------------------------------ |
| 세로 띠     | 넓은 화면 양옆의 검은 띠(`widgets/site-header`). 작은 화면에서는 위쪽 띠. 메뉴는 전체 화면 `dialog`입니다.   |
| 악보 무대   | 홈 첫 화면(`_pages/home/ui/ScoreStage`). 스크롤하면 자료 필름이 흐르고 재생선 위 계열이 콜라주로 펼쳐집니다. |
| 오선        | `.staff` 전역 클래스와 `--rule` 줄                                                                           |
| 손글씨 주석 | `shared/ui/hand`. 장식이라 `aria-hidden`이고 세로 띠의 주석 설정으로 끕니다.                                 |

| 토큰                                              | 값                    | 쓰임                  |
| ------------------------------------------------- | --------------------- | --------------------- |
| `--paper` / `--ink`                               | `#f9f9f9` / `#131313` | 종이와 잉크           |
| `--rule`                                          | 잉크 14%              | 오선, 구분선          |
| `--rail`                                          | `2.75rem`             | 세로 띠 폭(터치 44px) |
| `--ease-magic`, `--ease-out-expo`, `--ease-quart` | cubic-bezier          | 등장·전환 애니메이션  |

글꼴은 모두 SIL OFL입니다. 제목은 Cinzel(영문)과 Hahmlet(한글), 본문과 표기는 Courier Prime을 쓰고, 본문 한글은 운영체제의 명조 글꼴(AppleMyungjo, Noto Serif CJK KR, 바탕)을 씁니다. 한글 웹 글꼴은 글이 많은 화면에서 수백 KB를 받아 모바일 첫 화면을 늦추기 때문입니다(본문 글꼴을 빼서 홈 전송량 1,034KB → 773KB). 제목 글꼴은 `@fontsource`의 글자 묶음별 조각이라 화면에 쓰인 글자가 든 조각만 받습니다.

- 손글씨(Nanum Pen Script)는 주석에 쓰는 글자만 담은 `src/_app/styles/fonts/nanum-pen-notes.woff2`(8KB)입니다. 주석에 새 글자를 쓰면 `pyftsubset NanumPenScript-Regular.ttf --text="…" --flavor=woff2`로 다시 만듭니다.
- 첫 화면 밖의 목록은 `content-visibility: auto`로 화면 가까이 올 때만 그립니다. 그려지지 않은 글자의 글꼴 조각은 받지 않습니다.
- 필름과 콜라주의 작은 이미지에는 저작자를 표기할 자리가 없어 퍼블릭 도메인·CC0 자료만 씁니다. 대표 자료는 라이선스와 관계없이 쓰되 무대 아래쪽에 출처를 표기합니다.
- 등장 애니메이션의 시작 상태(숨김)는 `html.js`일 때만 적용합니다. 루트 레이아웃의 인라인 스크립트가 첫 페인트 전에 `js` 클래스와 저장된 설정(`data-annotations`, `data-motion`)을 붙입니다.
- `prefers-reduced-motion: reduce`이거나 움직임 설정을 끄면 등장 애니메이션, 악보 무대의 스크롤 연출, Lenis, 화면 전환을 모두 끕니다(`useMotionOff`). 이때 필름은 직접 가로 스크롤합니다.
- 화면 전환은 SSGOI가 맡습니다. 규칙은 `_app/transitions/config.ts`, 제공자는 `PageTransitions`이고, 라우트 경계(`SsgoiRouteBoundary`)는 `SiteLayout`의 `main`(relative, z-index 0, overflow-x: clip) 안에 둡니다. 설정 객체는 컴포넌트 밖에 둡니다(렌더마다 새로 만들면 엔진이 다시 만들어져 스크롤 위치를 잃습니다).
  - SSGOI는 `prefers-reduced-motion`을 스스로 읽지 않으므로 움직임을 끄면 전환이 없는 설정으로 바꿉니다.
  - 스크롤은 Lenis가 맡으므로 SSGOI의 입력 잠금(`scrollLock`)을 끄고, 전환하는 동안 Lenis를 멈춥니다(`useSsgoiTransition`). 페이지를 옮길 때 맨 위로 보내는 일은 SSGOI가 합니다.
  - `cacheComponents`는 이전 화면을 지우지 않고 숨겨 두었다가 다시 보여 주므로 대개 보던 자리가 남지만, 같은 경로의 다른 화면(신 → 다른 신)이나 새로고침한 뒤에는 남지 않습니다. 그래서 `_app/scroll/ScrollRestoration`이 주소(경로+검색어)별 스크롤 위치를 세션 저장소에 남기고, 뒤로·앞으로 가면(`popstate`, 또는 `back_forward`로 문서를 새로 불러오면) 화면 전환이 끝난 뒤 그 자리로 되돌립니다. 전환 중에는 저장하지 않고, 사용자가 직접 스크롤하면 되돌리기를 멈춥니다.
- 지연 로딩 이미지는 `clip-path`로 완전히 잘라 두면 브라우저가 불러오지 않습니다. 시작 상태는 `opacity`로만 숨깁니다.

## 데이터와 이미지

- 탈것·동반자는 계보와 달리 DB가 아닌 코드 데이터(`entities/figure/model/bonds.ts`)입니다. ZERO가 `sync:ark`로 이 파일을 직접 읽으므로 모양(`{ rider, partner, relation: "mount" | "companion", note? }`)을 바꾸면 ZERO에도 알립니다.

지금은 각 엔티티의 `api/mock-data.ts`를 씁니다. 조회 함수는 `"use cache"`와 `cacheTag`로 캐시하므로, 저장 기능을 붙일 때는 Server Action에서 `updateTag`로 갱신합니다.

자료 이미지는 `scripts/commons-sources.json`에 Commons 파일 이름을 적고 `pnpm images:resolve`로 받습니다.

- 라이선스가 퍼블릭 도메인·CC0·CC BY·CC BY-SA가 아니면 실패합니다.
- 이미지는 긴 변 1600px 이하 JPEG로 `public/images/exhibits/`에 저장합니다. Wikimedia 원본을 화면에서 직접 불러오면 요청 제한(429)에 걸리기 때문입니다.
- 저작자·라이선스·원본 주소는 `src/entities/exhibit/api/mock/commons-images.json`에 저장되고, 화면의 이미지마다 표기됩니다.
- 대체 텍스트는 실제 이미지를 보고 `exhibit/api/mock-data.ts`에 직접 씁니다.
- 이미 받은 이미지는 다시 받지 않습니다. 모두 다시 받으려면 `pnpm images:resolve --fresh`를 씁니다.

### 소개 글의 출처

신·계열 소개는 나무위키 등 여러 자료로 사실을 확인한 뒤 직접 쓴 글입니다. 나무위키 문장은 옮기지 않습니다. 나무위키는 CC BY-NC-SA 2.0 KR이라 옮기면 같은 라이선스를 따라야 하고, 검증되지 않은 서술이 있을 수 있기 때문입니다. 해석이 갈리는 자료는 자료의 `note`에 다른 견해를 함께 적습니다. 예를 들어 버니 부조, 님루드 부조, 사자를 제압하는 영웅이 그렇습니다.

### 신·인물의 분류

신·인물은 `kind`로 나눕니다. 신(`god`), 영웅(`hero`: 신이 아닌 인물), 몬스터(`monster`), 그 밖의 존재(`other`: 마녀·악마·정령·수호물)입니다. 건국 시조와 실존 인물은 후대에 신으로 모셔졌더라도 영웅으로 분류합니다(예: 단군, 동명성왕, 최영).

몬스터는 `grade`로 등급을 나눕니다. 몬스터는 반드시 등급이 있어야 하고, 몬스터가 아니면 `grade`는 비어 있어야 합니다. 둘 다 DB 제약 `figures_monster_grade_check`가 막으므로, 몬스터를 넣을 때는 등급을 함께 넣습니다.

| 등급   | 값       | 기준                                                                  | 예                                     |
| ------ | -------- | --------------------------------------------------------------------- | -------------------------------------- |
| 신수   | `divine` | 초월적인 존재인 신에 육박하는 존재                                    | 티폰, 펜리르, 요르문간드, 아펩         |
| 영수   | `spirit` | 사람에 준하는 사고를 하거나, 여러 문화권에서 소개되고 추앙받는 존재   | 슬레이프니르, 페가수스, 베누, 스핑크스 |
| 몬스터 | `common` | 그 밖의 모든 하등한 존재. 화면에는 등급 없이 ‘몬스터’로만 표시합니다. | 케르베로스, 히드라, 미노타우로스       |

### 신들의 계보

계보는 `genealogies` 테이블에 계열마다 한 줄(따른 문헌과 계보 JSON)로 두고, 어드민의 ‘계보’ 메뉴에서 고칩니다. 저장할 때 JSON 형식과, 계보 속 신 주소가 Ark에 있는지 검사합니다. 처음 데이터는 `entities/genealogy/api/mock-data.ts`이며 시드로 넣습니다. 계열 화면의 ‘신들의 계보’와 신 화면의 ‘가족’(부모·배우자·자식·형제자매, `findRelatives`)이 이 데이터를 씁니다. 사람마다 혼인(`unions`: 배우자와 자식)을 붙이고, Ark에 있는 신·인물이면 `slug`를 적어 그 화면으로 잇습니다. 문헌마다 다른 전승은 `note`에 적습니다. `e2e/genealogy.spec.ts`가 모든 `slug`가 Ark 데이터에 있는지 확인합니다.

### 계열을 고르는 기준

계열은 가장 이른 문헌의 연도(`eraYear`) 순서로 놓고, 대륙(`continent`: 아시아·유럽·아프리카·아메리카·오세아니아)으로 거를 수 있습니다. 나무위키 「신화/목록」을 바탕으로 넓혔지만, 다음은 넣지 않았습니다.

- 퍼블릭 도메인·CC 라이선스의 자료 이미지를 한 점도 찾지 못한 계열 (예: 아칸 신화). 계열마다 대표 자료가 있어야 하기 때문입니다.
- 이미지가 신과 무관하거나(축제 사진, 풍경), 현대 창작물만 있는 경우. 이런 신은 자료 없이 소개만 둡니다 (예: 라이마, 바하근, 암마, 마우-리사, 락롱꾸언).
- 현대 종교의 신앙 대상이나, 공동체가 외부 공개를 원하지 않는 전승

목업 데이터를 바꾸면 `pnpm db:seed:generate`로 `supabase/seed.sql`을 다시 만들고, 로컬은 `pnpm db:reset`, 운영은 `pnpm db:seed:prod`로 넣습니다. Supabase CLI는 이미 한 번 넣은 시드 파일을 `db push --include-seed`로 다시 실행하지 않으므로, 운영에는 SQL을 직접 실행합니다. 시드는 이미 있는 행을 건너뛰므로(`on conflict do nothing`) 어드민에서 고친 내용은 그대로 남습니다.

## 어드민

`/admin`은 Radix Themes만으로 만들었습니다. 공개 사이트의 디자인 토큰을 쓰지 않습니다.

| 역할   | 로그인                    | 할 수 있는 일                                                                                              |
| ------ | ------------------------- | ---------------------------------------------------------------------------------------------------------- |
| 관리자 | `ADMIN_PASSWORD` 비밀번호 | 계열 고치기, 신·작품 만들기·고치기·삭제, 자료 설명·출처 고치기·삭제                                        |
| 데모   | 버튼 하나                 | 모든 화면 보기. 저장은 서버에서 막습니다. 배포본에서 방문자가 공개 데이터를 바꾸지 못하게 하려는 것입니다. |

- 비밀번호 로그인은 같은 곳에서 15분 안에 5번 틀리면 잠깁니다. 실패 기록은 `admin_login_attempts` 테이블(IP는 SHA-256 해시만)에 남고, 성공하면 지웁니다. 하루 지난 기록은 크론이 지웁니다. 데모 로그인은 제한하지 않습니다.
- 세션은 HMAC 서명 쿠키(`ark_admin`, path `/admin`, httpOnly, 24시간)입니다. 24시간은 시간 제한 안내가 필요 없는 길이입니다(KWCAG 6.2.1. `src/proxy.ts`가 로그인하지 않은 요청을 로그인 화면으로 보내고, 저장하는 Server Action은 `checkWritePermission()`으로 권한을 다시 확인합니다.
- 입력값은 엔티티의 zod 스키마(`model/schema.ts`)로 검사합니다. 오류가 나면 칸마다 `aria-invalid`와 오류 메시지를 연결하고, 오류 요약으로 초점을 옮깁니다. 입력한 값은 그대로 남깁니다.
- 미리보기 배포에는 `ADMIN_PASSWORD`를 두지 않아 저장할 수 없습니다. 운영과 같은 데이터베이스를 읽기 때문입니다.
- 저장하면 `updateTag`로 캐시를 갱신합니다. 미리 그린 공개 페이지는 저장 뒤 첫 요청에 이전 내용을 보여 주고, 곧바로 새 내용으로 다시 그립니다.
- 로그인하지 않고 어드민 주소로 오면, 로그인한 뒤 그 화면으로 돌아갑니다. 돌아갈 주소는 `/admin` 아래 경로만 받습니다.
- 계열은 만들고 고치고 지울 수 있습니다. 신이 속한 계열은 지울 수 없습니다.
- 다른 데이터가 가리키는 항목은 지우지 않습니다. 자료나 작품이 연결된 신, 계열의 대표 자료로 쓰는 자료가 그렇습니다.
- Radix Themes 기본 색 중 명도 대비가 모자란 조합은 `shared/ui/admin/admin-theme.css`에서 보정합니다(진한 바탕 버튼, Select 자리표시). 주황 배지·안내는 `highContrast`를 씁니다.

## 데이터: Supabase

각 엔티티의 `api/table.ts`는 `createRepository`(`shared/api`)로 저장소를 만듭니다. `SUPABASE_URL`과 `SUPABASE_SECRET_KEY`가 있으면 Supabase 테이블을, 없으면 메모리 목업 테이블을 씁니다. 목업은 서버를 다시 시작하면 시드로 돌아갑니다.

| 항목           | 내용                                                                                                                                                                                                 |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 스키마         | `supabase/migrations/`. `pantheons`, `figures`, `exhibits`, `works`. 계열의 대표 자료는 지연 외래 키입니다.                                                                                          |
| RLS            | 누구나 읽기(작품은 공개 상태만). 쓰기 정책이 없으므로 공개 키로는 쓸 수 없습니다. 서버는 secret key로 쓰고, 그 전에 앱의 어드민 세션을 확인합니다.                                                   |
| Storage        | 공개 버킷 `images`. 업로드는 sharp로 긴 변 1600px JPEG로 줄여 `exhibits/`, `works/`에 올립니다. 4MB까지 받습니다(Vercel 함수 본문 한도 4.5MB). 자료를 지우거나 이미지를 바꾸면 이전 파일도 지웁니다. |
| 시드           | `pnpm db:seed:generate`가 목업 데이터로 `supabase/seed.sql`을 만들고, `supabase db push --remote --include-seed`로 넣습니다. 시드 이미지는 앱의 `/images/exhibits/`에 있습니다.                      |
| 일시 정지 방지 | 무료 프로젝트는 7일 동안 요청이 없으면 멈춥니다. Vercel Cron(`vercel.json`)이 매일 `/api/keep-alive`를 부릅니다.                                                                                     |

### DB 타입

`pnpm db:types`가 로컬 DB 스키마로 `src/shared/api/database.types.ts`를 만듭니다. 각 엔티티의 `api/table.ts`는 이 타입으로 행↔모델 변환(`toRow`, `fromRow`)을 검사하므로, 컬럼 이름이 틀리거나 필수 컬럼을 빠뜨리면 타입 검사에서 걸립니다. 마이그레이션을 바꾸면 `pnpm db:types`를 다시 실행합니다.

### 로컬과 운영 분리

| 환경                | 데이터베이스                            | 설정 파일                                          |
| ------------------- | --------------------------------------- | -------------------------------------------------- |
| 로컬 개발·로컬 빌드 | 로컬 Supabase (`pnpm db:start`, Docker) | `.env.local` (로컬 주소와 로컬 기본 키)            |
| 운영 (Vercel)       | Supabase 프로젝트 `ark`                 | Vercel 환경 변수                                   |
| 운영 마이그레이션   | Supabase 프로젝트 `ark`                 | `.env.prod-secrets` (Next.js가 자동으로 읽지 않음) |

로컬에서 저장하거나 업로드해도 운영 데이터는 바뀌지 않습니다. 운영 비밀 값은 Next.js가 읽지 않는 `.env.prod-secrets`에만 두고, `pnpm db:push`만 이 파일을 읽습니다. 두 파일 모두 커밋하지 않습니다.

마이그레이션은 `supabase migration new <이름>`으로 만들고, 로컬은 `supabase migration up`(또는 `pnpm db:reset`), 운영은 `pnpm db:push`로 적용합니다. 새 테이블을 쓰는 코드를 배포하기 전에 운영 마이그레이션을 먼저 적용합니다.

단위 테스트(`vitest.config.mts`)와 E2E 서버(`playwright.config.ts`)는 Supabase 환경 변수를 빈 값으로 덮어써 목업을 씁니다. README 스크린샷(`pnpm screenshots`)만 로컬 Supabase를 씁니다.

## 환경 변수

| 이름                          | 필요한 곳 | 내용                                                                               |
| ----------------------------- | --------- | ---------------------------------------------------------------------------------- |
| `ADMIN_PASSWORD`              | 저장할 때 | 관리자 비밀번호. 없으면 데모 로그인만 됩니다.                                      |
| `ADMIN_SESSION_SECRET`        | 운영      | 세션 서명 키. 운영 환경에서 없으면 로그인을 막습니다. 개발 환경은 기본값을 씁니다. |
| `NEXT_PUBLIC_FEATURE_ARCHIVE` | 선택      | 아래 기능 플래그                                                                   |

## 오류 화면과 보안 헤더

| 파일                                                         | 감싸는 범위                                                          |
| ------------------------------------------------------------ | -------------------------------------------------------------------- |
| `src/app/(site)/error.tsx`                                   | 공개 사이트. "다시 시도"(`retry`)와 처음 화면 링크                   |
| `src/app/admin/error.tsx`, `src/app/admin/(panel)/error.tsx` | 어드민 로그인과 관리 화면 (Radix Themes)                             |
| `src/app/global-error.tsx`                                   | 루트 레이아웃까지 실패했을 때. 전역 스타일 없이 인라인 스타일로 그림 |

오류 내용은 화면에 보이지 않고, 서버 기록과 맞춰 볼 수 있는 식별자(`error.digest`)만 보입니다. 공개 데이터는 캐시되어 있어 데이터베이스가 잠시 멈춰도 공개 화면은 대부분 그대로 나옵니다.

`next.config.ts`의 `headers()`로 모든 응답에 CSP, `X-Frame-Options: DENY`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`를 붙입니다. CSP는 nonce를 쓰면 모든 페이지를 요청마다 그려야 하므로 nonce 없는 방식을 쓰고, Next.js의 인라인 스크립트 때문에 `'unsafe-inline'`을 허용합니다. 외부 스크립트, 다른 사이트의 프레임 삽입, 다른 주소로의 폼 전송은 막습니다. E2E가 헤더와 CSP 위반(콘솔)을 검사합니다.

`/storybook/` 아래만 미리보기 iframe을 위해 `X-Frame-Options: SAMEORIGIN`과 `frame-ancestors 'self'`를 쓰고, Storybook UI의 내장 글꼴을 위해 `font-src`에 `data:`를 더합니다.

## Storybook 배포

`pnpm build`는 Storybook을 먼저 `public/storybook`에 빌드한 뒤 앱을 빌드합니다. 그래서 디자인 시스템이 앱과 같은 주소의 `/storybook`에 함께 배포되고, 공개 사이트 바닥글의 **디자인 시스템(Storybook)** 링크로 들어갑니다.

- 정적 파일이라 폴더 주소로는 열리지 않아 `/storybook`을 `/storybook/index.html`로 보냅니다(`next.config.ts`의 `redirects`).
- 이때 `pnpm build-storybook`(앱 빌드가 먼저 부르는 스크립트)으로 빌드할 때는 `public` 폴더를 복사하지 않습니다. 같은 주소에서 열리므로 스토리의 `/images`는 앱의 파일을 그대로 씁니다(결과물 약 50MB → 20MB).
- 개발 서버(`pnpm dev`)에는 빌드 결과물이 없어 바닥글 링크가 Storybook 개발 서버(`http://localhost:6006`)로 갑니다.

## SEO

`src/_app/seo/`의 `sitemap`(계열·신 주소), `robots`(어드민·API 제외)를 `src/app/sitemap.ts`, `robots.ts`가 내보냅니다. 기본 공유 이미지는 `src/app/opengraph-image.jpg`이고, 계열·신 화면은 대표 자료 이미지를 공유 이미지로 씁니다. 운영 주소는 `shared/config/site.ts`의 `SITE.url`입니다.

## CI와 의존성

GitHub Actions(`.github/workflows/ci.yml`)는 두 작업을 나란히 돌립니다.

- `check`: 린트, FSD 구조(Steiger), 서식, 타입, 단위, 스토리, 빌드, E2E (목업 저장소. 모든 계열·신 화면의 axe와 가로 넘침 포함)
- `upload`: 로컬 Supabase를 띄우고 업로드 E2E

Dependabot(`.github/dependabot.yml`)이 같은 메이저 안의 패치·마이너 업데이트를 주 1회(npm), 월 1회(Actions) PR로 올립니다. 출시 후 14일이 지난 버전만 제안합니다.

메이저 업데이트는 직접 합니다. 2026-11-08 기준으로 다음은 올리지 않았습니다.

- **TypeScript 7:** typescript-eslint가 TypeScript 6.1 미만만 지원합니다. 지원하는 6.0까지 올렸습니다. (Next.js 빌드는 7을 지원)
- **ESLint 10:** `eslint-config-next`가 쓰는 import·jsx-a11y·react 플러그인이 ESLint 9까지만 지원합니다.
- **`@types/node` 26:** 실행 환경이 Node.js 22(`.nvmrc`)라 타입도 22에 맞춥니다.

## 하지 않기로 한 것

- **시드 이미지를 Storage로 옮기기:** 저장소의 `public/images/exhibits/`(26MB)에 둡니다. 옮기면 CI와 E2E가 운영 Storage에 네트워크로 의존하게 됩니다.
- **저장 직후 첫 요청의 이전 페이지:** 공개 페이지는 미리 그린 페이지라, 저장 뒤 첫 요청은 이전 내용이고 다음 요청부터 새 내용입니다. 없애려면 요청마다 그려야 해 정적 페이지의 속도 이점을 잃습니다.

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

KWCAG 2.2 33개 항목은 직접 점검했습니다(0.5.0). 이미지 위의 큰 글자 대비, 영문 이름의 `lang`, 어드민 화면별 제목, 세션 24시간, 링크 밑줄, 랜드마크 이름을 이때 고쳤습니다. HTML 검사(html-validate)에서 남는 항목은 프레임워크·라이브러리 출력이라 그대로 둡니다. React Server Action 폼의 `action=""`, 이미지 미리 불러오기 `<link>`(표준상 `imagesrcset`이 있으면 `href`를 생략할 수 있음), Radix 체크박스 그룹의 숨은 input이 여기에 해당합니다.

axe 검사는 스토리 테스트와 E2E에서 실행합니다. 스토리 테스트의 Storybook 설정은 `@storybook/addon-vitest`가 자동으로 적용합니다(별도 setup 파일 없음). axe를 통과해도 KWCAG 준수는 아니므로, 새 화면은 검사 항목을 직접 점검합니다.

## 테스트

| 종류            | 위치                        | 명령                             |
| --------------- | --------------------------- | -------------------------------- |
| 단위            | `src/**/*.test.ts(x)`       | `pnpm test`                      |
| 스토리          | `src/**/*.stories.tsx`      | `pnpm test:storybook`            |
| E2E             | `e2e/site.spec.ts`          | `pnpm build && pnpm test:e2e`    |
| README 스크린샷 | `e2e/readme.screenshots.ts` | `pnpm build && pnpm screenshots` |

E2E는 프로덕션 빌드에서 375·768·1440px의 가로 넘침, axe(WCAG 2.2 AA), 본문 바로가기, 메뉴 키보드 동작, 아카이브 플래그를 검사합니다. 어드민 E2E는 로그인, 데모 저장 차단, 만들기→공개 화면 반영→삭제 흐름을 검사합니다. 메모리 저장소를 바꾸므로 공개 사이트 검사가 끝난 뒤 순서대로 실행합니다(`admin` 프로젝트). 테스트용 비밀번호는 `playwright.config.ts`의 `webServer.env`에 있습니다.
