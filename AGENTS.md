<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Ark — 에이전트 작업 안내

위 블록은 `next dev`가 다시 넣는 Next.js 안내이므로 지우지 않습니다. 아래는 이 저장소의 규칙입니다. 자세한 내용은 `README.md`, `docs/development.md`, `CHANGELOG.md`에 있습니다.

## 1. 프로젝트 개요

- 세계 신화의 신·영웅·몬스터와 자료(조각·회화·유물 사진), 신화 속 유물을 보여 주는 세계 신화 도서관입니다.
- 화면 축 2개: 신화 도서관(공개 웹) · 어드민(같은 웹의 `/admin`)
- 운영: https://ark-ryushin01.vercel.app/ · 어드민: `/admin`(데모 계정으로 둘러보기) · Storybook: `/storybook/index.html`

## 2. 기술 스택과 구조

- Next.js 16(App Router), React 19, TypeScript, CSS, Radix Themes(어드민만), Supabase(Postgres·Storage, 없으면 메모리 목업), zod, Sentry(선택)
- Feature-Sliced Design v2.1. 층 순서는 `_app → _pages → widgets → features → entities → shared`이며, 슬라이스는 자기보다 아래 층만, 다른 슬라이스는 공개 API(`index.ts`)로만 가져옵니다. `eslint.config.mjs`의 `no-restricted-imports`와 Steiger(`pnpm lint:fsd`, `steiger.config.mjs`)가 검사합니다.
- `src/app/`의 라우트 파일은 `_pages`를 다시 내보내기만 합니다. 서버 전용 코드는 `index.server.ts`로, 어드민용 `_app`은 `index.admin.ts`로 따로 내보냅니다(공개 사이트가 Radix CSS를 받지 않게).
- 한 페이지에서만 쓰는 UI·Server Action은 그 페이지 슬라이스의 `ui`·`api`에 두고, 두 곳 이상에서 쓰면 `widgets`·`features`로 올립니다.
- 탈것·동반자 데이터(`entities/figure/model/bonds.ts`)는 ZERO가 `sync:ark`로 직접 읽으므로 모양을 바꾸면 ZERO에도 알립니다.

## 3. 설치·개발 명령

- 패키지 매니저: pnpm(`packageManager` 고정), Node.js 22(`.nvmrc`)
- `corepack enable pnpm` → `pnpm install` → `pnpm db:start`(로컬 Supabase, Docker 필요) → `pnpm dev`(http://localhost:3000, 어드민 `/admin`)
- 환경 변수(이름만, `.env.example` 참고): `SUPABASE_URL`, `SUPABASE_SECRET_KEY`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`, `NEXT_PUBLIC_FEATURE_ARCHIVE`, `CRON_SECRET`, `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_DSN`
- Supabase 값을 비우면 메모리 목업으로 동작합니다. 로컬 개발은 운영 DB를 쓰지 않습니다. 운영 비밀 값은 `.env.prod-secrets`(Next.js가 읽지 않음, `pnpm db:push`만 읽음)에만 둡니다.
- 그 밖의 명령: `pnpm storybook`, `pnpm db:reset`, `pnpm db:types`(마이그레이션을 바꾸면 다시 실행), `pnpm db:seed:generate`, `pnpm images:resolve`, `pnpm credits`, `pnpm fonts`(화면 글자를 바꾼 뒤), `pnpm screenshots`

## 4. 검사·테스트 명령

| 명령                          | 내용                                                      |
| ----------------------------- | --------------------------------------------------------- |
| `pnpm lint` / `pnpm lint:fsd` | ESLint(경고 0) / FSD 구조(Steiger)                        |
| `pnpm format:check`           | Prettier(Markdown 포함)                                   |
| `pnpm typecheck`              | `next typegen && tsc --noEmit`                            |
| `pnpm test`                   | 단위(Vitest)                                              |
| `pnpm test:storybook`         | 모든 스토리 렌더링과 axe                                  |
| `pnpm build`                  | Storybook을 `public/storybook`에 빌드한 뒤 앱 빌드        |
| `pnpm size` / `pnpm lhci`     | 번들 크기 예산 / Lighthouse 기준 (먼저 `build`)           |
| `pnpm test:e2e`               | 프로덕션 빌드 E2E(화면 폭별 넘침, axe, 키보드, 보안 헤더) |
| `pnpm test:e2e:local-db`      | 이미지 업로드 E2E(로컬 Supabase 필요)                     |

- CI(`.github/workflows/ci.yml`)는 작업을 나눠 동시에 돕니다: `check`(lint → lint:fsd → format:check → typecheck → test), `build`(test:storybook → build → size), `e2e`, `lighthouse`, `upload`(로컬 Supabase, 콘텐츠 반영 SQL 두 번 + 업로드 E2E). 바뀐 파일이 Markdown뿐이면 `e2e`·`lighthouse`·`upload`를 건너뜁니다.
- pre-commit(husky): 스테이징 파일 lint-staged(eslint --fix, prettier) → `pnpm typecheck` → `pnpm test`
- 품질 예산: JS 400 kB·CSS 145 kB(gzip, `.size-limit.json`), Lighthouse 데스크톱 성능 90·접근성 100·권장 95·SEO 90(`lighthouserc.json`)

## 5. 코드 스타일

- Prettier(`.prettierrc`): 너비 100, 큰따옴표, 세미콜론, trailing comma all, CSS는 들여쓰기 4. ESLint는 `eslint-config-next` + jsx-a11y recommended + simple-import-sort.
- 어드민은 Radix Themes만 쓰고 공개 사이트 디자인 토큰을 쓰지 않습니다. 입력값은 엔티티 zod 스키마(`model/schema.ts`)로 검사하고, 저장 액션은 공통 도우미(`formError`, `fieldError`, `fieldErrorsState`, `duplicateKeyError`, `finishAdminAction`)와 중복 제출 잠금(`useSubmitLock`)을 씁니다.
- 접근성(KWCAG 2.2): 네이티브 요소 먼저(메뉴는 `<dialog>` `showModal`), 텍스트 대비 4.5:1, 모든 기능 키보드 가능·초점 항상 보임, 조작 크기 24px 이상(이 저장소는 터치 대상 44px), 입력칸 레이블과 오류의 `aria-invalid`·`aria-describedby` 연결 및 오류 요약으로 초점 이동, 바뀌는 안내는 `role="status"`, 본문 바로가기·`lang`·페이지별 제목. 장식 이미지는 `alt=""`, 자료 이미지는 내용을 설명합니다. axe를 통과해도 새 화면은 KWCAG 항목을 직접 점검합니다.

## 6. Git·PR

- `main`에 직접 커밋·푸시하지 않습니다. 최신 `main`에서 `feat/...`, `fix/...`, `docs/...`, `chore/...`, `ci/...` 브랜치를 만듭니다.
- 커밋·PR 제목: `<type>: <한국어 요약> <버전> (#PR)` 예) `fix: 케르눈노스 자료의 출처를 CC BY-SA 3.0으로 바로잡음 1.4.2 (#55)`. 본문은 `-` 목록으로 무엇을 왜 바꿨는지 적고, 끝에 `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`를 붙입니다.
- 기능·수정 PR은 `package.json` 버전, README 배지, `CHANGELOG.md`(`## x.y.z - YYYY-MM-DD`)를 함께 올립니다. 문서만 바뀐 PR은 버전을 올리지 않습니다.
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
- 같은 파일 이름으로 그림만 바꾸면 이미지 캐시(31일) 때문에 이전 그림이 보이므로 파일 이름도 바꿉니다.

## 9. 공통 규칙

공통 규칙은 `~/Documents/GitHub/CLAUDE.md`에 있으며, 이 파일과 충돌하면 이 파일이 우선합니다.

- 답변·커밋·PR·문서는 한국어로 씁니다.
- 허락을 묻지 않고 끝까지 진행한 뒤 결과를 한 번에 보고합니다(비용·비밀값·디자인 결정·되돌릴 수 없는 공개 행동은 보고만).
- 사용자의 진행 중인 작업을 보호합니다. 로컬에 커밋하지 않은 변경이 있으면 `git worktree add`로 따로 작업하고 끝나면 지웁니다.
- 다른 세션에 보내는 공지는 ryushin01 그룹 세션에만 보냅니다.
