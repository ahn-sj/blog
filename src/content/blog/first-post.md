---
title: "첫 글 — GitHub에서 Cloudflare로"
description: "정적 사이트 배포 파이프라인을 옮긴 기록"
pubDate: "2026-06-21"
category: "Infra"
thumbnail: "/images/sample.svg"
---

LLM이 작성한 Markdown 파일을 Git에 커밋하면 Cloudflare Pages로 자동 배포되는 흐름을 확인하기 위한 첫 글입니다.

이미지는 `public/images` 아래에 두고 Markdown에서 절대 경로로 참조합니다.

![샘플 이미지](/images/sample.svg)

## 배포 구조

GitHub Actions가 `main` 브랜치 push를 감지해 정적 사이트를 빌드하고 Cloudflare Pages에 배포합니다.

```bash
npm run build
wrangler pages deploy out
```
