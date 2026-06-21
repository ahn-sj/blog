# ADR: 개인 블로그 React 진영 전환

## Status

Accepted

## Context

개인 블로그는 Markdown 기반 글쓰기, asze.net 운영 도메인, Cloudflare Pages 배포, 낮은 유지보수 비용을 유지해야 한다. 디자인은 `design-drafts/DESIGN.md`를 SSOT로 확정했다.

## Options

| 후보 | 유지보수 | Markdown/MDX | 정적 export | Cloudflare Pages | 구현 복잡도 |
|---|---|---|---|---|---|
| Next.js static export | React 생태계 표준에 가깝고 문서/레퍼런스가 많다 | 파일 기반 parser와 MDX 확장 가능 | `output: "export"`로 `out/` 생성 | 정적 산출물 배포와 호환 | 중간 |
| Vite React + MDX | 가볍고 단순하다 | MDX는 쉽지만 블로그 메타/라우팅은 직접 구성 | 직접 prerender 구성이 필요 | 정적 배포 가능 | 중간~높음 |
| React Router prerender | React Router 앱과 잘 맞는다 | 직접 content pipeline 필요 | prerender 구성이 가능 | 정적 배포 가능 | 높음 |
| Astro 유지 | 블로그 SSG 유지보수는 낮다 | 내장 content collection 강점 | 기본 정적 빌드 | 기존 배포와 호환 | 낮음 |

## Decision

Next.js static export로 전환한다.

주요 이유:

- React 컴포넌트 기반 UI와 Storybook을 자연스럽게 붙일 수 있다.
- `next build`만으로 Cloudflare Pages 배포 산출물인 `out/`을 만들 수 있다.
- App Router의 `generateStaticParams()`로 글 상세 페이지를 정적으로 생성할 수 있다.
- 글 수가 적은 개인 블로그라 빌드 타임 Markdown metadata를 클라이언트 목록 필터로 넘기는 방식이 단순하다.

## Consequences

- Astro content collection은 제거하고 `src/lib/content.ts`가 frontmatter를 읽는다.
- 글 상세 경로는 디자인 명세에 맞춰 `/posts/[slug]`로 둔다.
- 배포 설정은 `dist`가 아니라 `out`을 사용한다.
- Markdown raw HTML 실행은 허용하지 않고 `react-markdown` 기본 렌더링만 사용한다.
