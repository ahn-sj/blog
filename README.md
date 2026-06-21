# blog

Markdown 기반 개인 블로그입니다. Astro로 정적 HTML을 만들고 GitHub Actions에서 Cloudflare Pages에 배포합니다.

## 글 작성

새 글은 `src/content/blog/*.md`에 추가합니다.

```md
---
title: "글 제목"
description: "글 설명"
pubDate: "2026-06-21"
---

본문
```

이미지는 `public/images` 아래에 두고 `/images/file-name.ext`로 참조합니다.

## 명령어

```bash
npm install
npm run dev
npm run build
```

배포 URL:

```text
https://asze.net/
```

## Cloudflare Pages 배포 설정

GitHub repository secrets에 아래 값을 추가해야 합니다.

- `CLOUDFLARE_API_TOKEN`: Cloudflare Pages 배포 권한이 있는 API token
- `CLOUDFLARE_ACCOUNT_ID`: Cloudflare account ID

Cloudflare Pages project 이름은 `blog`입니다.
