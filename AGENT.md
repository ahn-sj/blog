# AGENT.md

이 파일은 이 repository에서 작업하는 에이전트를 위한 프로젝트 로컬 지침입니다.

## Project

- 개인 블로그: <https://asze.net/>
- Stack: Next.js App Router static export
- Content: Markdown files in `src/content/blog`
- Deploy: GitHub Actions -> Cloudflare Pages
- Output: `out/`

## Source Of Truth

- 글 목록: `README.md`
- 운영 절차: `docs/runbooks/RUNBOOK.md`
- 디자인 기준: `design-drafts/DESIGN.md`

## Working Rules

- 변경은 요청 범위에 맞게 작게 유지한다.
- 글 추가 시 `src/content/blog/*.md`와 `README.md` 글 목록을 함께 갱신한다.
- 사용법, 검증, 배포 절차는 `README.md`에 늘리지 말고 `docs/runbooks/RUNBOOK.md`에 둔다.
- 이미지 asset은 `public/images`에 두고 Markdown에서는 `/images/<file>`로 참조한다.
- `out/`, `.next/`, `storybook-static/`, `artifacts/`, `dist/` 같은 생성 산출물은 커밋하지 않는다.
- secret, token, account ID 값은 문서나 commit message에 기록하지 않는다.

## Verification

문서만 바꾸는 경우:

```bash
git diff --check
```

코드, 스타일, content pipeline 변경이 있으면:

```bash
npm test
npm run build
npm run build-storybook
npm audit --omit=dev
```

반응형 UI 변경은 Playwright 또는 브라우저로 `320px`, `390px`, `820px`, `1280px`를 확인한다.

## Deployment

배포가 필요한 변경은 `main` push 후 GitHub Actions run과 production URL을 확인한다.

```bash
curl -I https://asze.net/
curl -I https://www.asze.net/
```
