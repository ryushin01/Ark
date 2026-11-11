# 시퀀스 다이어그램

Ark의 주요 흐름입니다. 코드 위치는 `src/` 기준입니다.

## 1. 공개 화면 조회

신·계열·자료 화면은 서버 컴포넌트가 캐시된 조회 함수를 부릅니다. Supabase 환경 변수가 없으면 같은 모양의 메모리 목업이 답합니다.

```mermaid
sequenceDiagram
    actor 방문자
    participant 브라우저
    participant 화면 as 서버 컴포넌트<br/>(_pages/figure)
    participant 조회 as getFigure<br/>(entities/figure, "use cache")
    participant 저장소 as Repository<br/>(shared/api/repository.server)
    participant DB as Supabase Postgres
    participant 목업 as 메모리 목업

    방문자->>브라우저: /figures/zeus 열기
    브라우저->>화면: 요청
    화면->>조회: getFigure("zeus")
    alt 캐시에 있음 (cacheLife: hours, 태그 figures)
        조회-->>화면: 캐시된 신
    else 캐시 없음
        조회->>저장소: find("zeus")
        alt Supabase 설정됨
            저장소->>DB: select … eq(slug)
            DB-->>저장소: 행
        else 환경 변수 없음
            저장소->>목업: find
            목업-->>저장소: 시드 데이터
        end
        저장소-->>조회: 모델(fromRow)
        조회-->>화면: 신
    end
    화면-->>브라우저: HTML 스트리밍
```

## 2. 어드민 로그인

```mermaid
sequenceDiagram
    actor 관리자
    participant 폼 as 로그인 폼
    participant 액션 as loginAction<br/>(features/admin-auth)
    participant 제한 as 로그인 제한<br/>(shared/auth/login-throttle)
    participant 쿠키 as 세션 쿠키

    관리자->>폼: 비밀번호 입력 또는 "데모 계정으로 둘러보기"
    폼->>액션: Server Action
    alt 데모 계정
        액션->>쿠키: role=demo 서명 토큰
        액션-->>관리자: 원래 보려던 화면으로 이동
    else 비밀번호
        액션->>제한: 최근 실패 횟수
        alt 15분 안에 5번 실패
            액션-->>폼: 잠김 안내
        else 비밀번호 틀림
            액션->>제한: 실패 기록
            액션-->>폼: 남은 횟수 안내
        else 맞음
            액션->>제한: 실패 기록 지우기
            액션->>쿠키: role=admin 서명 토큰
            액션-->>관리자: 원래 보려던 화면으로 이동
        end
    end
```

## 3. 어드민 저장과 공개 화면 갱신

```mermaid
sequenceDiagram
    actor 관리자
    participant 폼 as 신 편집 폼
    participant 액션 as saveFigureAction<br/>(_pages/admin-figures)
    participant 권한 as checkWritePermission
    participant 검증 as zod 스키마
    participant 저장소 as Repository
    participant 캐시 as Next 캐시

    관리자->>폼: 저장
    폼->>액션: FormData
    액션->>권한: 세션 확인
    alt 로그인이 끝났거나 데모 계정
        권한-->>폼: 저장하지 않았다는 안내
    else 관리자
        액션->>검증: safeParse
        alt 형식 오류
            검증-->>폼: 칸별 오류와 입력값 유지
        else 통과
            액션->>저장소: 신화 계열 확인 후 insert / update
            alt 같은 주소 이름이 있음
                저장소-->>폼: duplicate 안내
            else 저장됨
                액션->>캐시: updateTag("figures")
                액션-->>관리자: 목록으로 이동(?saved=)
                Note over 캐시: 다음 공개 화면 요청은 새 데이터로 다시 그림
            end
        end
    end
```

## 4. 자료 이미지 업로드

```mermaid
sequenceDiagram
    actor 관리자
    participant 액션 as addWorkImageAction<br/>(_pages/admin-works)
    participant 처리 as uploadImage<br/>(shared/api/image-storage)
    participant sharp
    participant 스토리지 as Supabase Storage<br/>(images 버킷)

    관리자->>액션: 이미지 파일
    액션->>처리: uploadImage(file, path)
    alt Supabase 미연결
        처리-->>액션: 업로드할 수 없다는 안내
    else 형식·크기 오류
        처리-->>액션: checkImageFile 안내
    else
        처리->>sharp: 회전 보정, 긴 변 1600px, JPEG 80
        sharp-->>처리: 버퍼, 너비, 높이
        처리->>스토리지: upload(path)
        스토리지-->>처리: 공개 주소
        처리-->>액션: src, width, height
    end
```

매일 03:00(UTC)에는 Vercel Cron이 `/api/keep-alive`를 불러 무료 Supabase 프로젝트가 잠들지 않게 합니다.
