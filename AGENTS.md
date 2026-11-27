# Ark — 에이전트 작업 안내

`next dev`가 넣던 영어 안내 블록은 `next.config.ts`의 `agentRules: false`로 꺼 두었으므로 이 파일은 손으로 관리합니다. 그 블록의 내용은 이렇습니다: 이 저장소의 Next.js 16은 학습 데이터와 API·규칙·파일 구조가 다를 수 있으니, 코드를 쓰기 전에 `node_modules/next/dist/docs/`에서 해당 안내를 읽고 지원 중단(deprecation) 안내를 따릅니다. 아래는 이 저장소의 규칙입니다. 자세한 내용은 `README.md`, `docs/development.md`, `CHANGELOG.md`에 있습니다.

## 1. 프로젝트 개요

- 세계 신화의 신·영웅·몬스터와 자료(조각·회화·유물 사진), 신화 속 유물을 보여 주는 세계 신화 도서관입니다.
- 화면 축: 신화 도서관(공개 웹, 비밀 전시실 `/vault` 포함) · 어드민(같은 웹의 `/admin`)
- 운영: https://ark-ryushin01.vercel.app/ · 어드민: `/admin`(데모 계정으로 둘러보기) · Storybook: `/storybook/index.html`

## 2. 기술 스택과 구조

- Next.js 16(App Router), React 19, TypeScript, CSS, Radix Themes(어드민만), Supabase(Postgres·Storage, 없으면 메모리 목업), zod, Sentry(선택)
- Feature-Sliced Design v2.1. 층 순서는 `_app → _pages → widgets → features → entities → shared`이며, 슬라이스는 자기보다 아래 층만, 다른 슬라이스는 공개 API(`index.ts`)로만 가져옵니다. `eslint.config.mjs`의 `no-restricted-imports`와 Steiger(`pnpm lint:fsd`, `steiger.config.mjs`)가 검사합니다.
- `src/app/`의 라우트 파일은 `_pages`를 다시 내보내기만 합니다. 서버 전용 코드는 `index.server.ts`로, 어드민용 `_app`은 `index.admin.ts`로 따로 내보냅니다(공개 사이트가 Radix CSS를 받지 않게).
- 한 페이지에서만 쓰는 UI·Server Action은 그 페이지 슬라이스의 `ui`·`api`에 두고, 두 곳 이상에서 쓰면 `widgets`·`features`로 올립니다.
- 비밀 전시실(`_pages/vault`)은 Indrajaal의 화면 구성을 참고한 무한 캔버스(`VaultCanvas`, 배치 `model/canvas.ts`, WebGL 없이 CSS 변환 + `requestAnimationFrame`)와 흐린 배경 상세(이야기 듣기 `LorePlayer`, Web Speech API)입니다. 어두운 바탕과 전용 글꼴(`vault-theme.css`: Big Shoulders Display·도현·Pretendard)은 전시실에서만 받고, 움직임을 끄면 정적인 목록이 됩니다. 레퍼런스의 이미지·문구·코드는 쓰지 않습니다. 자세한 내용은 `docs/development.md`의 "비밀 전시실".
- 소식 피드(`/feed.xml`, RSS 2.0)는 `CHANGELOG.md`를 읽어 최근 30개 릴리스를 냅니다(`_app/seo/feed.ts`, 읽는 쪽 `shared/feed`의 async generator). CHANGELOG 절 제목은 `## x.y.z - YYYY-MM-DD` 형식을 지켜야 피드에 실립니다. 자세한 설명은 `docs/development.md`의 SEO 절.
- 탈것·동반자 데이터(`entities/figure/model/bonds.ts`)는 ZERO가 `sync:ark`로 직접 읽으므로 모양을 바꾸면 ZERO에도 알립니다.

## 3. 설치·개발 명령

- 패키지 매니저: pnpm(`packageManager` 고정), Node.js 22(`.nvmrc`)
- `corepack enable pnpm` → `pnpm install` → `pnpm db:start`(로컬 Supabase, Docker 필요) → `pnpm dev`(http://localhost:3000, 어드민 `/admin`)
- 환경 변수(이름만, `.env.example` 참고): `SUPABASE_URL`, `SUPABASE_SECRET_KEY`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`, `NEXT_PUBLIC_FEATURE_ARCHIVE`, `CRON_SECRET`, `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_DSN`(서버 오류만 따로 보낼 때, `.env.example`에는 없음)
- 비밀 값 없이 clone → install → dev/build만으로 데모 데이터로 동작합니다. Supabase 값을 비우면 메모리 목업, 값이 있는데 닿지 않으면(요청마다 5초 제한) 읽기만 시드로 대신하고 공개 사이트·어드민에 "오프라인 데이터로 표시 중" 안내(`role="status"`)를 띄웁니다. 쓰기는 대신하지 않습니다. 로컬 개발은 운영 DB를 쓰지 않습니다. 운영 비밀 값은 `.env.prod-secrets`(Next.js가 읽지 않음, `pnpm db:push`만 읽음)에만 둡니다.
- 그 밖의 명령: `pnpm storybook`, `pnpm db:reset`, `pnpm db:types`(마이그레이션을 바꾸면 다시 실행), `pnpm db:seed:generate`, `pnpm images:resolve`, `pnpm credits`, `pnpm fonts`(화면 글자를 바꾼 뒤), `pnpm screenshots`

## 4. 검사·테스트 명령

| 명령                          | 내용                                                                |
| ----------------------------- | ------------------------------------------------------------------- |
| `pnpm lint` / `pnpm lint:fsd` | ESLint(경고 0) / FSD 구조(Steiger)                                  |
| `pnpm format:check`           | Prettier(Markdown 포함)                                             |
| `pnpm typecheck`              | `next typegen && tsc --noEmit`                                      |
| `pnpm test`                   | 단위(Vitest)                                                        |
| `pnpm check`                  | CI와 같은 검사 전부(`scripts/check.mjs`, 묶음 골라 돌리기 가능)     |
| `pnpm test:coverage`          | 커버리지(로직 계층 80%, 전체 기준선 `vitest.config.mts`)            |
| `pnpm test:storybook`         | 모든 스토리 렌더링과 axe                                            |
| `pnpm build`                  | Storybook을 `public/storybook`에 빌드한 뒤 앱 빌드                  |
| `pnpm size` / `pnpm lhci`     | 번들 크기 예산 / Lighthouse 기준 (먼저 `build`)                     |
| `pnpm test:e2e`               | 프로덕션 빌드 E2E(화면 폭별 넘침, axe, 키보드, 보안 헤더, 오프라인) |
| `pnpm test:e2e:offline`       | 오프라인 E2E만(`e2e/offline.spec.ts`, 모든 화면)                    |
| `pnpm test:visual`            | 시각 회귀(기준 이미지는 Linux CI 것, macOS는 건너뜀)                |
| `pnpm test:vitals`            | 무거운 화면 LCP·CLS·INP                                             |
| `pnpm test:e2e:local-db`      | 이미지 업로드 E2E(로컬 Supabase 필요)                               |

- 오프라인 E2E(Playwright `offline` 프로젝트)는 localhost 밖 요청을 모두 막고 공개·어드민 화면이 비지 않는지, 그리고 `SUPABASE_URL=https://supabase.invalid`로 띄운 두 번째 서버(포트 +1)에서 시드 대체가 되는지 봅니다.
- CI(`.github/workflows/ci.yml`, push main·pull_request)는 작업마다 `pnpm check <묶음>`을 부릅니다: `check`(static, 필수 검사), `build`(빌드 한 번, 결과물을 다음 작업에 넘김), `e2e`(세 조각), `visual`(Playwright Docker, 시각 회귀·Web Vitals), `lighthouse`, `upload`(로컬 Supabase, 콘텐츠 반영 SQL 두 번 + 부하 측정 + 업로드 E2E). 바뀐 파일이 Markdown뿐이면 무거운 검사를 건너뜁니다. 자세한 내용은 `docs/development.md`의 "CI와 의존성".
- pre-commit(husky): 스테이징 파일 lint-staged(eslint --fix, prettier) → `pnpm typecheck` → `pnpm test`
- 품질 예산: JS 400 kB·CSS 145 kB(gzip, `.size-limit.json`), Lighthouse 데스크톱 성능 90·접근성 100·권장 95·SEO 90(`lighthouserc.json`, `/vault`·`/vault/mjolnir` 포함)
- 테스트 원칙(Testing Library): 구현 세부가 아니라 사용자가 보는 동작을 검사하고, 요소는 역할·이름(`getByRole`)으로 찾습니다. 단위·컴포넌트는 Vitest + Testing Library(jsdom), 스토리는 Vitest 브라우저 모드(`@storybook/addon-vitest`, a11y 애드온), 화면 흐름은 Playwright E2E, 접근성은 axe(`@axe-core/playwright`, Storybook a11y)로 검사합니다. 버그를 고치면 고치기 전에 실패하는 테스트를 함께 넣습니다.

## 5. 코드 스타일

- Prettier(`.prettierrc`): 너비 100, 큰따옴표, 세미콜론, trailing comma all, CSS는 들여쓰기 4. ESLint는 `eslint-config-next` + jsx-a11y recommended + simple-import-sort.
- 어드민은 Radix Themes만 쓰고 공개 사이트 디자인 토큰을 쓰지 않습니다. 입력값은 엔티티 zod 스키마(`model/schema.ts`)로 검사하고, 저장 액션은 공통 도우미(`formError`, `fieldError`, `fieldErrorsState`, `duplicateKeyError`, `finishAdminAction`)와 중복 제출 잠금(`useSubmitLock`)을 씁니다.
- 접근성(WCAG 2.2·KWCAG 2.2): 네이티브 요소 먼저(메뉴는 `<dialog>` `showModal`), 텍스트 대비 4.5:1, 모든 기능 키보드 가능·초점 항상 보임, 조작 크기 24px 이상(이 저장소는 터치 대상 44px), 입력칸 레이블과 오류의 `aria-invalid`·`aria-describedby` 연결 및 오류 요약으로 초점 이동, 바뀌는 안내는 `role="status"`, 본문 바로가기·`lang`·페이지별 제목. 장식 이미지는 `alt=""`, 자료 이미지는 내용을 설명합니다. 자동 검사는 `eslint-plugin-jsx-a11y`(recommended 전부)와 axe(Storybook·Playwright)이고, axe를 통과해도 새 화면은 KWCAG 항목을 직접 점검합니다.
- TypeScript strict(`tsconfig.json`의 `"strict": true`)를 유지하고 `any`·`as` 단언·`@ts-ignore`를 피합니다. 외부 입력은 zod 등으로 검증합니다(어드민 폼은 엔티티 `model/schema.ts`).

## 6. Git·PR

- 흐름: GitHub Flow. `main`에 직접 커밋·푸시하지 않고, 최신 `main`에서 브랜치를 만들어 PR로만 병합합니다. PR은 목적 하나로 작게 만들고 본문에 무엇·왜·검사 결과를 적습니다.
- 브랜치 이름: `feat/…`, `fix/…`, `refactor/…`, `docs/…`, `test/…`, `chore/…`, `release/…`. 이 저장소는 CI 변경에 `ci/…`도 썼습니다(예: `ci/parallel-jobs`).
- 커밋 메시지: Conventional Commits `<타입>: <한국어 요약>`, 타입은 `feat`, `fix`, `refactor`, `perf`, `docs`, `test`, `style`, `chore`, `ci`, `build`. 호환이 깨지면 본문에 `BREAKING CHANGE:`를 적습니다.
  - 실제 예) `fix: 케르눈노스 자료의 출처를 CC BY-SA 3.0으로 바로잡음 1.4.2 (#55)`, `ci: 검사를 작업으로 나눠 동시에 돌리고, Markdown만 바뀌면 무거운 검사를 건너뜀 1.4.3 (#56)`
  - 표준과 다른 점: 이 저장소는 버전을 괄호 없이 요약 뒤에 `x.y.z`로 붙이고, squash 병합이 `(#PR)`을 덧붙입니다.
  - 본문은 `-` 목록으로 무엇을 왜 바꿨는지 적고, 끝에 `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`를 붙입니다.
- 기여자는 ryushin01만 남깁니다(2026-11-21 사용자 결정). 커밋 작성자는 항상 `ryushin0 <141554987+ryushin01@users.noreply.github.com>`이고, 이 저장소는 백엔드 코드가 있어 공동 작성자 줄은 `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>` 하나만 넣습니다.
  - GitHub Actions가 커밋하는 워크플로는 작성자를 ryushin01로 설정합니다(`github-actions[bot]` 금지).
  - Dependabot PR은 그대로 병합하지 않습니다. 변경 내역을 확인하고 같은 변경을 ryushin01 커밋으로 다시 만들어 병합합니다(병합 커밋 작성자가 dependabot이 되지 않게).
- 버전: Semantic Versioning(주.부.수). 기능·수정 PR은 `package.json`의 `version`과 README의 version 배지를 함께 맞춥니다. 문서만 바뀐 PR은 버전을 올리지 않습니다.
- 변경 기록: `CHANGELOG.md`(제목 "버전 기록"), 최신 버전을 위에 두고 `## x.y.z - YYYY-MM-DD` 아래 `-` 목록으로 적습니다. 표준(Keep a Changelog)과 다른 점: `[Unreleased]` 절과 추가·변경·수정·제거 소제목 없이 버전마다 바로 적습니다.
- 병합은 squash. CI가 통과하면 바로 병합하고 CodeRabbit 리뷰는 기다리지 않습니다(이미 달린 맞는 지적은 반영).

## 7. 배포·릴리스

- Vercel 프로젝트 `ark`. `vercel.json`의 `git.deploymentEnabled`에서 main을 포함해 모든 브랜치의 Git 배포를 끄고, PR 미리보기도 없습니다.
- main의 CI가 통과하면 `.github/workflows/release.yml`이 오래된 실행 거르기 → 운영 DB 마이그레이션 → 콘텐츠 반영(`scripts/seed-sync.mts`, 반영 기록 `release_state`와 한 트랜잭션) → Vercel 배포 훅 순서로 운영에 반영합니다. 실패하면 Release를 main에서 손으로 다시 실행합니다(`workflow_dispatch`). 코드에서 사라진 행은 운영 DB에서 지우지 않으므로 필요하면 마이그레이션으로 지웁니다.
- 데모: 어드민 로그인 화면의 **데모 계정으로 둘러보기**(저장은 서버에서 막힘). `ADMIN_PASSWORD`가 없으면 데모 로그인만 됩니다.
- 릴리스: 병합 뒤 태그·GitHub 릴리스 `vX.Y.Z`(제목도 같음), 대상은 병합 커밋 전체 SHA, 본문은 CHANGELOG의 해당 절.
- 릴리스 뒤 백업 `bash ~/Documents/Archive/Backup/backup.sh`, 보관함 `Ark v1.0.0 고도화 계획.md`에 진행 기록, 소개가 바뀌면 프로필 `ryushin01/ryushin01` README 표 갱신.

## 8. 보안·주의사항

- 비밀값·`.env.local`·`.env.prod-secrets`를 커밋하지 않습니다. 운영 값은 Vercel 환경 변수와 GitHub 비밀 값(`SUPABASE_DB_URL`, `VERCEL_DEPLOY_HOOK_URL`)에만 둡니다.
- 데모·미리보기에 운영 DB 쓰기나 유료 키를 넣지 않습니다. 미리보기에는 `ADMIN_PASSWORD`를 두지 않습니다.
- 자료 이미지 저작권: 새 자료는 퍼블릭 도메인·CC0만 씁니다. 평면 작품은 작가 사망 1955년 이전(작가 불명이면 1900년 이전), 조각·유물 사진은 사진 자체의 라이선스를 확인합니다. 출처는 `commons-images.json`, README 출처, `docs/credits.md`에 모읍니다.
- 영향 아카이브(`NEXT_PUBLIC_FEATURE_ARCHIVE`)의 작품 이미지는 저작권자가 있어 저장소에 넣지 않고, 확인하지 못한 작품은 `status: "draft"`로 둡니다.
- 메이저 업데이트는 직접 합니다. TypeScript 6.0(typescript-eslint 지원 범위), ESLint 9, `@types/node` 22에 고정해 둡니다.
- `next/image` 변형 폭(`next.config.ts`의 `imageSizes`·`deviceSizes`)이나 새 그림을 늘리면 Vercel 무료 플랜 이미지 최적화 한도(1.4.1의 402 문제)에 닿을 수 있으니, 배포 뒤 운영에서 그림이 나오는지 확인합니다(전시실 캔버스는 폭 384 변형을 씀).
- 같은 파일 이름으로 그림만 바꾸면 이미지 캐시(31일) 때문에 이전 그림이 보이므로 파일 이름도 바꿉니다.
- 상태(CI·배포·릴리스·주소)는 명령 결과(`gh run`, `curl` 등)로 확인한 것만 말합니다.
- 먼저 묻기: 새 런타임 의존성 추가, 빌드·배포 설정(`next.config.ts`, `vercel.json`, 워크플로) 변경, 운영 DB에서 행 지우기.
- 절대 금지: 비밀값을 `NEXT_PUBLIC_*`에 넣기, `.env*` 커밋, `eslint-disable`·`--no-verify`로 검사 우회, `main`에 직접 푸시.

## 9. 공통 규칙

규칙은 3계층입니다. 1층 전역(`~/.claude/CLAUDE.md`, OpenCode는 `~/.config/opencode/AGENTS.md`로 같은 파일) → 2층 ryushin01 공통(`~/Documents/GitHub/CLAUDE.md`, Claude Code만 읽음) → 3층 이 파일. 충돌하면 이 파일이 우선합니다. 2층을 읽지 못하는 도구를 위해 핵심을 아래에 요약합니다.

- 답변·커밋·PR·문서는 한국어로 씁니다.
- 허락을 묻지 않고 끝까지 진행한 뒤 결과를 한 번에 보고합니다. 비용·비밀값 생성·디자인 결정·되돌리기 어려운 일·다른 조직 저장소에 공개로 글 올리기는 진행 전에 보고하고 결정을 받습니다.
- 사용자의 진행 중인 작업을 보호합니다. 로컬에 커밋하지 않은 변경이나 원격에 없는 브랜치가 있으면 `git worktree add`로 따로 작업하고 끝나면 지웁니다.
- 기여자는 ryushin01만 남깁니다(커밋 작성자·`Co-Authored-By`·Actions·Dependabot 규칙은 6절).
- Vercel은 Hobby 요금제로 계정 전체 하루 100회 배포 한도가 있습니다. 배포가 많은 날은 버전 단위로 묶고, 한도에 걸리면 병합·릴리스까지만 하고 다음 날 반영합니다. 사용자가 배포일을 정하면 그 전에는 PR만 올려 둡니다.
- 공개 데모에 실제 DB 접속 정보·유료 API 키·로컬 `.env` 값을 넣지 않고, 데모 모드가 꺼지면 원래 동작이 그대로여야 합니다.
- 병합 뒤 릴리스·백업·보관함 기록·프로필 README 갱신은 7절을 따릅니다.
- 다른 세션에 보내는 공지는 ryushin01 그룹 세션에만 보냅니다.
