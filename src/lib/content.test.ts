import { describe, expect, test } from 'vitest';

import { getAllPosts, getPostBySlug } from './content';

describe('content pipeline', () => {
  test('reads category and optional thumbnail from Markdown frontmatter', () => {
    const posts = getAllPosts();

    expect(posts).toHaveLength(1);
    expect(posts[0]).toMatchObject({
      slug: 'first-post',
      title: '첫 글 — GitHub에서 Cloudflare로',
      description: '정적 사이트 배포 파이프라인을 옮긴 기록',
      category: 'Infra',
      thumbnail: '/images/sample.svg',
    });
    expect(posts[0].dateLabel).toBe('2026.06.21');
  });

  test('returns Markdown content by slug', () => {
    const post = getPostBySlug('first-post');

    expect(post.content).toContain('Cloudflare Pages');
  });
});
