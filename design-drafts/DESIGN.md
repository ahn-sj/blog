# 개인 블로그 디자인 명세 (asze.net)

방향: **가로 리스트(초안 1번)** · 흰 배경 · 미니멀 · 직관적 UX
범위: 디자인 요소 정리 (코드 구현은 다음 세션)
미리보기: `design-drafts/index.html` — 상단 버튼으로 홈/글목록/글상세 전환

---

## 1. 디자인 원칙

- 글 내용이 주인공. 장식 최소화.
- 흰 배경 전체. 그림자 대신 얇은 구분선으로만 구조 표현.
- 단일 컬럼, 좁은 폭(720px). 모바일·데스크톱 동일 레이아웃.
- 포인트색은 한 가지(teal)만. 태그·링크 hover·코드 링크에만 사용.

---

## 2. 디자인 토큰

| 토큰 | 값 | 용도 |
|------|-----|------|
| `--bg` | `#ffffff` | 전체 배경 |
| `--fg` | `#1a1a1a` | 제목·본문 |
| `--fg-sub` | `#6b7280` | 설명·소개 |
| `--fg-muted` | `#9ca3af` | 날짜·보조 라벨 |
| `--accent` | `#0f766e` | 링크·hover |
| `--tag-fg-default` | `#0f766e` | 태그 글자(미지정 시) |
| `--tag-bg-default` | `#e6f4f1` | 태그 배경(미지정 시) |
| `--line` | `#eeeeee` | 글 구분선 |
| `--line-strong` | `#e5e7eb` | 소셜 버튼 테두리 |
| `--radius` | `10px` | 썸네일·히어로 |
| `--radius-sm` | `6px` | 태그·코드 |
| `--maxw` | `720px` | 홈·목록 폭 |
| `--maxw-read` | `680px` | 글 상세 가독 폭 |
| 폰트 | `Pretendard` | 전체 (fallback: system-ui) |

### 타이포 스케일

| 요소 | size / weight | 비고 |
|------|---------------|------|
| 홈 h1 | 28 / 700 | letter-spacing -.02em |
| 글상세 h1 | 30 / 700 | line-height 1.25 |
| 글 제목(목록) | 17 / 600 | |
| 본문 | 16 / 400 | line-height 1.85 |
| 설명(목록) | 14 / 400 | 2줄 말줄임(line-clamp 2) |
| 날짜 | 13 / 400 | muted, tabular-nums |
| 태그 | 12 / 600 | accent |
| 섹션 라벨 | 12 / 600 | uppercase, letter-spacing .09em |

---

## 3. 컴포넌트 인벤토리

다음 세션에서 Next.js + Storybook + TDD로 구현할 단위.

| 컴포넌트 | 역할 | props(예상) |
|----------|------|-------------|
| `SiteHeader` | 브랜드(좌, 홈 링크) + 소셜(우) | `brand`, `social` |
| `SiteFooter` | © 만 | — |
| `SocialLinks` | GitHub·LinkedIn·Email 아이콘 (헤더 우측) | `github`, `linkedin` (url), `email` |
| `TagBadge` | 카테고리 태그 1개 (색 지정 가능) | `label`, `color?`, `bg?` |
| `Thumbnail` | 미리보기 이미지 / 없으면 placeholder | `src?`, `alt`, `ratio` |
| `PostListItem` | 가로 리스트 한 줄 (썸네일+태그+날짜+제목+설명) | `post` |
| `PostList` | `PostListItem` 묶음 | `posts[]` |
| `CategoryFilter` | 카테고리 필터 칩 (전체+각 태그, 개수 표시) | `categories[]`, `active`, `onChange` |
| `Pagination` | 페이지 번호 + 이전/다음 | `total`, `page`, `onChange` |
| `Intro` | 홈 상단 소개 문구 | `title`, `description` |
| `Prose` | 글 본문 Markdown 렌더 영역 | `children` |
| `ArticleHeader` | 글상세 상단(태그/날짜/제목/설명/히어로) | `post` |

### PostListItem 레이아웃 (핵심)

```
[썸네일 104x78] [ (태그) (날짜)        ]
               [ 제목 17/600          ]
               [ 설명 14 · 1줄 말줄임  ]
```
- 썸네일 비율 4:3, radius 10. 이미지 없으면 그라데이션 placeholder.
- 행 전체가 링크. hover 시 제목만 accent.
- 행 사이 `--line` 구분선, 첫 행은 선 없음.
- 설명은 2줄까지(`-webkit-line-clamp: 2`), 넘치면 `…`.

### 카테고리 필터 (CategoryFilter)

- 위치: "글" 섹션 라벨 아래, 리스트 위. 칩(pill) 가로 나열, 줄바꿈 허용.
- 항목: `전체` + 등장하는 카테고리 전체. 각 칩에 글 개수 표시.
- 활성 칩은 검정 채움(중립). 글 안의 태그 색과 구분되어 혼동 없음.
- 동작: 칩 클릭 → 해당 카테고리만 표시 + 페이지 1로 리셋. 결과 없으면 빈 상태 문구.
- 칩 색은 중립(검정 활성), 글 내 태그는 카테고리 색 — 역할이 다름.

### 페이지네이션 (Pagination)

- **페이지당 글 수: `PAGE_SIZE = 5`** (가로 리스트 1행 ~118px 기준, 한 화면에 적절).
- 위치: 리스트 하단 중앙.
- 구성: `‹` 이전 · 페이지 번호 · `›` 다음. 현재 페이지 검정 채움.
- 첫/마지막 페이지에서 이전/다음 disabled. 페이지 1개면 미표시.
- 필터와 연동: 필터된 결과 기준으로 페이지 수 계산. 페이지 이동 시 리스트 상단으로만 부드럽게 스크롤.

### 리로드 없는 필터/페이지 전환 (UX)

필터·페이지 전환은 **페이지 새로고침 없이 클라이언트에서 처리**한다.

- 구현 방식(다음 세션): 모든 글 메타데이터를 빌드 타임에 클라이언트로 넘기고, `useState`로
  `activeCategory` / `page`만 바꿔 목록 영역만 다시 렌더. 헤더·인트로·필터 칩은 그대로 둔다.
  → 개인 블로그는 글 수가 적어 가장 단순하고 즉각적.
- 칩/페이지 버튼은 active 상태만 토글, 목록(`PostList`)만 교체 → 깜빡임 최소화.
- 목록 교체 시 항목에 fade-in(+미세 stagger) 전환을 줘 "리로드" 느낌 없이 자연스럽게 갱신.
- **강제 스크롤 없음**: 페이지/필터 전환 시 화면 위치를 그대로 유지(상단으로 점프시키지 않음).
- 목록 영역에 `min-height`(PAGE_SIZE 분량)를 줘 결과 수가 줄어도 높이가 유지되어 스크롤이 밀리지 않음.
- (선택) URL에 `?category=&page=` 동기화 시 `router.replace`(shallow)로 공유·뒤로가기 지원하되
  풀 리로드는 하지 않음. static export(`output: 'export'`)에서 쿼리스트링 방식은 호환됨.
- 별도 `/page/2` 정적 경로 분할 방식은 글이 많아질 때만 고려(이번 범위 밖).

---

## 4. 페이지 구조

홈과 글 목록을 **하나로 통합**한다. 별도 `/posts` 목록 페이지 없음.

| 페이지 | 경로(예정) | 구성 |
|--------|-----------|------|
| 홈(=글 목록) | `/` | Header(brand+소셜) → Intro → "글" + 필터칩 → 리스트(5개/페이지) → 페이지네이션 → Footer(©) |
| 글 상세 | `/posts/[slug]` | Header(brand+소셜) → ArticleHeader(+히어로) → Prose → Footer(©) |

- 헤더는 brand(`asze.net`)만. 클릭 시 홈. 별도 nav 없음.
- 글 상세에서 홈 복귀는 상단 "← 홈" 링크 + brand로 가능.
- 소개·태그 탭/필터 페이지는 **이번 범위 제외** (추후 필요 시 nav 부활).

---

## 5. 콘텐츠 frontmatter 스키마 (디자인이 요구하는 필드)

현재 Astro 스키마: `title`, `description`, `pubDate`.
디자인 반영 위해 추가 필요:

```yaml
---
title: "장애 전파를 막는 패턴을 실험으로 이해하기"
description: "timeout, retry, circuit breaker, bulkhead를 장애 전파 관점에서 비교한 설계 노트"
pubDate: "2026-06-21"
category: "Infra"               # 추가 — 태그 배지 1개 (목록 구분용)
thumbnail: "/images/failure-containment-thumbnail.svg"  # 추가 — 미리보기 이미지 (선택, 없으면 placeholder)
---
```

- `category`: 단일 문자열. 디자인엔 태그 1개만 노출. 복수 태그는 추후 확장 여지.
- `thumbnail`: 선택 필드. 미지정 시 placeholder 렌더.

### 태그 색상 — 카테고리 매핑 방식 (확정)

태그+색을 **한 곳에서 한 번 정의**하고 여러 글에서 재사용한다.
글 frontmatter에는 `category` 이름만 적고, 색은 매핑 테이블에서 자동으로 가져온다.
→ 같은 카테고리는 어디서든 같은 색. 색을 바꾸려면 매핑 한 줄만 수정.

```ts
// 태그 레지스트리: 사용자가 직접 관리하는 단일 SSOT (다음 세션에서 코드화)
const TAG_COLORS = {
  Engineer:   { fg: "#0f766e", bg: "#e6f4f1" },  // teal
  Infra:      { fg: "#0f766e", bg: "#e6f4f1" },
  React:      { fg: "#1d4ed8", bg: "#e0ecff" },  // blue
  Note:       { fg: "#b45309", bg: "#fef3c7" },  // amber
  TypeScript: { fg: "#4338ca", bg: "#e7e5ff" },  // indigo
  Life:       { fg: "#be123c", bg: "#ffe4e6" },  // rose
};
```

동작:
- 글에는 `category: "Engineer"`만 작성 → 렌더 시 매핑에서 색 조회 → `--tag-fg`/`--tag-bg` 주입.
- 새 태그 추가/색 변경 = `TAG_COLORS`에 한 줄 추가/수정. 모든 해당 글에 일괄 반영.
- 매핑에 없는 카테고리는 기본색(`--tag-*-default`, teal)로 표시.

---

## 6. 반응형

- 헤더 우측 소셜: GitHub · LinkedIn · Email(`mailto:seongjae.dev@gmail.com`) 아이콘(테두리 없음).
- 푸터는 `© 2026 안성재`만.
- 단일 컬럼이라 별도 데스크톱/모바일 레이아웃 분기 없음.
- 모바일: 좌우 여백 20px, 썸네일·폰트 동일 유지. 설명 말줄임으로 1줄 보장.

---

## 7. 다음 세션 작업(코드, 범위 밖)

1. ADR: Astro → Next.js static export
2. Next.js 스캐폴딩 (`output: 'export'`, CSS Modules)
3. 콘텐츠 파이프라인 (`category`/`thumbnail` 포함) — TDD
4. 위 컴포넌트 TDD + Storybook (frontend-engineer, react-guide)
5. 페이지 3종
6. 배포 산출물 `dist` → `out` 갱신
7. eval-robot 검증 + Backlog evidence
