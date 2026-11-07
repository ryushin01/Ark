# Ark - 세계 신화 도서관

[![CI](https://github.com/ryushin01/Ark/actions/workflows/ci.yml/badge.svg)](https://github.com/ryushin01/Ark/actions/workflows/ci.yml)
![version](https://img.shields.io/badge/version-0.6.0-8a4a1f)
![Storybook](https://img.shields.io/badge/Storybook-10-FF4785?logo=storybook&logoColor=white)

그리스, 북유럽, 이집트, 메소포타미아, 인도, 일본 신화의 신과 영웅을 조각상, 회화, 유물 자료로 살펴보는 세계 신화 도서관입니다.

**[데모 바로 보기](https://ark-indol.vercel.app/)** · 어드민은 [/admin](https://ark-indol.vercel.app/admin)에서 **데모 계정으로 둘러보기**를 누르면 됩니다.

> **프로젝트 상태:** 개발 중인 **포트폴리오 프로젝트**입니다. 데이터와 업로드 이미지는 Supabase(Postgres, Storage)에 저장하고, 환경 변수가 없으면 메모리 목업으로 동작합니다. 자료 이미지는 모두 Wikimedia Commons의 퍼블릭 도메인·CC 라이선스 자료이며, 이미지마다 저작자와 라이선스를 표기했습니다.

## 화면

| 홈                                                                                                                    | 신화 계열 연대기                                                                                           |
| --------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| ![검정 바탕에 World와 Myths라는 큰 글자, 그 사이에 흑백 신화 자료 이미지가 흩어진 첫 화면](docs/images/home-hero.jpg) | ![가운데 세로선을 따라 인도 신화와 그리스 신화가 좌우로 번갈아 놓인 연대기](docs/images/home-timeline.jpg) |

| 신 색인                                                                                        | 계열 상세                                                                                      |
| ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| ![신화별 신 이름 목록. 오딘에 마우스를 올리자 오딘 그림이 떠 있다](docs/images/home-index.jpg) | ![모래색 바탕에 그리스 신화 제목과 기원전 8세기경 표기, 청동상 사진](docs/images/pantheon.jpg) |

| 어드민 대시보드                                                                                          | 어드민 편집                                                                |
| -------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| ![데모 계정으로 로그인한 대시보드. 계열 6, 신 22, 자료 25, 작품 6 카드](docs/images/admin-dashboard.jpg) | ![오딘의 이름, 별칭, 영역, 소개를 고치는 폼](docs/images/admin-figure.jpg) |

| 신 상세                                                                                   | 모바일 홈                                                                                                       | 모바일 신 상세                                                                                                      |
| ----------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| ![토르의 소장 자료 1점. 거인과 싸우는 토르 그림과 분류·시기 정보](docs/images/figure.jpg) | <img src="docs/images/mobile-home.jpg" alt="모바일 첫 화면의 World, Myths 글자와 신화 자료 이미지" width="240"> | <img src="docs/images/mobile-figure.jpg" alt="모바일에서 본 아마테라스의 소장 자료 목판화와 출처 표기" width="240"> |

## 주요 기능

| 화면          | 내용                                                                                                                                                                    |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 홈            | 스크롤하면 흩어진 자료 이미지가 모이는 첫 화면, 가장 이른 문헌 순서의 신화 계열 연대기, 마우스를 따라다니는 미리보기가 있는 신 색인                                     |
| 계열 상세     | 계열 소개, 대표 자료, 속한 신 목록, 다음 계열로 이동                                                                                                                    |
| 신 상세       | 별칭과 관장 영역, 소개, 소장 자료(분류·시기·소장처·해석 메모), 같은 계열의 다른 신                                                                                      |
| 어드민        | 계열·신·자료·작품 관리와 이미지 업로드(Radix Themes). 관리자 비밀번호로 로그인하면 저장할 수 있고, 데모 계정은 둘러보기만 합니다. 저장하면 공개 화면에 바로 반영됩니다. |
| 영향 아카이브 | 신화의 영향을 받은 게임·애니메이션·소설을 스와이프 갤러리로 보여 줍니다. 작품 이미지의 저작권을 확인하기 전까지 기능 플래그로 숨겨 둡니다.                              |

모든 등장 애니메이션은 사용자가 동작 줄이기를 켜면 멈추고, 자바스크립트가 없어도 내용이 보입니다.

## 기술 스택

![React, Next.js, TypeScript, CSS, pnpm, Vitest](https://skillicons.dev/icons?i=react,nextjs,ts,css,pnpm,vitest)

| 구분        | 사용 기술                                                                                                                                            |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| 프레임워크  | Next.js 16 (App Router, Cache Components), React 19, TypeScript                                                                                      |
| 구조        | Feature-Sliced Design v2.1                                                                                                                           |
| 스타일·연출 | CSS Modules, Lenis(부드러운 스크롤), Pretendard                                                                                                      |
| 어드민      | Radix Themes, Server Actions, zod, sharp(이미지 줄이기)                                                                                              |
| 품질        | ESLint(import 정렬, FSD 계층 규칙), Prettier, husky + lint-staged, Vitest + React Testing Library, Storybook 스토리 테스트(axe), Playwright E2E(axe) |
| 데이터      | Supabase (Postgres, RLS, Storage), Vercel Cron(무료 프로젝트 깨우기)                                                                                 |
| 문서        | Storybook 10 (`@storybook/nextjs-vite`)                                                                                                              |

## 시작하기

Node.js 22(`.nvmrc`)와 pnpm이 필요합니다.

```bash
nvm use
corepack enable pnpm
pnpm install
cp .env.example .env.local   # 로컬 Supabase 값으로 채웁니다 (아래)
pnpm db:start                # 로컬 Supabase (Docker 필요, 마이그레이션·시드 자동 적용)
pnpm dev                     # http://localhost:3000, 어드민은 /admin
```

`pnpm db:start`가 출력하는 `API_URL`과 `SECRET_KEY`를 `.env.local`의 `SUPABASE_URL`, `SUPABASE_SECRET_KEY`에 넣고 `ADMIN_PASSWORD`를 정합니다. 비워 두면 메모리 목업으로 동작하고, 어드민은 **데모 계정으로 둘러보기**로 들어갈 수 있습니다. 로컬 개발은 운영 데이터베이스를 쓰지 않습니다. `.env.local`에 로컬 Supabase를 적었다면 `pnpm build` 전에도 `pnpm db:start`가 필요합니다.

| 명령                                     | 설명                                                          |
| ---------------------------------------- | ------------------------------------------------------------- |
| `pnpm build` / `pnpm start`              | 프로덕션 빌드 / 실행                                          |
| `pnpm storybook`                         | Storybook 개발 서버 (`http://localhost:6006`)                 |
| `pnpm lint` / `pnpm typecheck`           | ESLint / 타입 검사                                            |
| `pnpm test`                              | 단위 테스트                                                   |
| `pnpm test:storybook`                    | 모든 스토리 렌더링과 접근성 검사                              |
| `pnpm test:e2e`                          | 프로덕션 빌드의 실제 화면 검사 (먼저 `build` 필요)            |
| `pnpm test:e2e:local-db`                 | 이미지 업로드 E2E (로컬 Supabase 필요)                        |
| `pnpm db:push` / `pnpm db:seed:generate` | Supabase 마이그레이션 적용 / 시드 SQL 만들기                  |
| `pnpm images:resolve`                    | Wikimedia Commons에서 자료 이미지와 라이선스 정보를 다시 받기 |

환경 변수와 전체 규칙은 [개발 가이드](docs/development.md)를 참고하세요.

## 프로젝트 구조

```
e2e/               E2E 테스트와 README 스크린샷 촬영
public/images/     자료 이미지 (Wikimedia Commons)
scripts/           자료 이미지·라이선스 정보 받기, 시드 SQL 만들기
supabase/          마이그레이션(스키마·RLS·Storage), 시드
src/
├─ app/            Next.js 라우트 (_pages를 다시 내보내기만 함)
├─ _app/           루트·사이트·어드민 레이아웃, 전역 스타일
├─ _pages/         홈, 계열, 신, 아카이브, 404, 어드민 화면
├─ widgets/        머리글·바닥글, 첫 화면, 연대기, 신 색인, 자료 목록, 어드민 틀
├─ features/       스와이프 갤러리, 어드민 로그인, 계열·신·자료·작품 편집
├─ entities/       계열(pantheon), 신(figure), 자료(exhibit), 작품(work)
├─ shared/         등장 애니메이션 UI, 어드민 입력 부품, 세션, 저장소(Supabase·목업)
└─ proxy.ts        /admin 접근 제어
```

## 문서

| 문서                               | 내용                                                                      |
| ---------------------------------- | ------------------------------------------------------------------------- |
| [개발 가이드](docs/development.md) | FSD 구조, 디자인 토큰, 데이터와 이미지, 어드민, 환경 변수, 접근성, 테스트 |
| [버전 기록](CHANGELOG.md)          | 버전별 변경 내용                                                          |
