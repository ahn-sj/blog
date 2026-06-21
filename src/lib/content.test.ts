import { describe, expect, test } from 'vitest';
import { readFileSync } from 'node:fs';

import { getAllPosts, getPostBySlug } from './content';

describe('content pipeline', () => {
  test('reads category and optional thumbnail from Markdown frontmatter', () => {
    const posts = getAllPosts();

    expect(posts).toHaveLength(1);
    expect(posts[0]).toMatchObject({
      slug: 'failure-containment-patterns',
      title: '장애 전파를 막는 패턴을 실험으로 이해하기',
      description: 'timeout, retry, circuit breaker, bulkhead를 장애 전파 관점에서 비교한 설계 노트',
      category: 'Infra',
      thumbnail: '/images/failure-containment-thumbnail.svg',
    });
    expect(posts[0].dateLabel).toBe('2026.06.21');
  });

  test('returns Markdown content by slug', () => {
    const post = getPostBySlug('failure-containment-patterns');

    expect(post.content).toContain('장애 전파 차단의 목표는 장애를 없애는 것이 아니다');
    expect(post.content).toContain('retry는 복구 장치이면서 증폭 장치다');
    expect(post.content).toContain('/images/failure-containment-flow.svg');
    expect(post.content).not.toMatch(/reliability-pattern-lab|lab|실험 노트/);
  });

  test('redirects old post paths to the abstracted slug', () => {
    const redirects = readFileSync('public/_redirects', 'utf8');

    expect(redirects).toContain('/posts/reliability-pattern-lab/ /posts/failure-containment-patterns/ 301');
    expect(redirects).toContain('/posts/first-post/ /posts/failure-containment-patterns/ 301');
    expect(redirects).toContain('/posts/vpc-peering-transit-gateway/ /posts/failure-containment-patterns/ 301');
  });
});
