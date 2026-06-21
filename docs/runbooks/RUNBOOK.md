# Blog Runbook

asze.net 개인 블로그 운영 절차입니다.

## Stack

- Next.js App Router
- Static export: `out/`
- Content source: `src/content/blog/*.md`
- Assets: `public/images/*`
- Deployment: GitHub Actions -> Cloudflare Pages
- Production: <https://asze.net/>

## Local Setup

```bash
npm install
npm run dev
```

## Add a Post

1. `src/content/blog/<slug>.md` 파일을 만든다.
2. frontmatter를 채운다.
3. 이미지는 `public/images` 아래에 두고 `/images/<file>` 절대 경로로 참조한다.
4. `README.md`의 글 목록에 공개 글을 추가한다.

```md
---
title: "글 제목"
description: "글 설명"
pubDate: "2026-06-21"
category: "Infra"
thumbnail: "/images/sample.svg"
---

본문
```

## Verify

```bash
npm test
npm run build
npm run build-storybook
npm audit --omit=dev
```

반응형 변경은 static export 산출물로 확인한다.

```bash
npm run build
npx --yes serve out -l 4173
```

확인 대상:

- `/`
- `/posts/<slug>/`
- 1280px, 820px, 390px, 320px viewport
- horizontal overflow 없음
- 본문 이미지가 화면 폭을 넘지 않음
- 주요 글자 크기가 작게 보이지 않음

## Deploy

`main` push가 GitHub Actions 배포를 실행한다.

필요한 GitHub repository secrets:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

Cloudflare Pages project:

- Project: `blog`
- Output directory: `out/`

## Production Check

```bash
curl -I https://asze.net/
curl -I https://www.asze.net/
curl -I https://asze.net/posts/first-post/
```

기대값:

- HTTP 200
- Cloudflare Pages 기준 문구 유지
- GitHub Pages 잔여 표현 없음

## Notes

- secret 값은 문서, Backlog, commit message에 기록하지 않는다.
- 임시 검증 산출물은 `artifacts/`에 둘 수 있지만 커밋하지 않는다.
- 디자인 기준은 [design-drafts/DESIGN.md](../../design-drafts/DESIGN.md)를 우선한다.
