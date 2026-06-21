import { describe, expect, test } from 'vitest';

import { getAllPosts, getPostBySlug } from './content';

describe('content pipeline', () => {
  test('reads category and optional thumbnail from Markdown frontmatter', () => {
    const posts = getAllPosts();

    expect(posts).toHaveLength(1);
    expect(posts[0]).toMatchObject({
      slug: 'reliability-pattern-lab',
      title: '장애 전파를 막는 패턴을 실험으로 이해하기',
      description: 'timeout, retry, circuit breaker, bulkhead를 장애 전파 관점에서 비교한 설계 노트',
      category: 'Infra',
      thumbnail: '/images/reliability-pattern-lab-thumbnail.svg',
    });
    expect(posts[0].dateLabel).toBe('2026.06.21');
  });

  test('returns Markdown content by slug', () => {
    const post = getPostBySlug('reliability-pattern-lab');

    expect(post.content).toContain('장애 전파 차단의 목표는 장애를 없애는 것이 아니다');
    expect(post.content).toContain('retry는 복구 장치이면서 증폭 장치다');
    expect(post.content).toContain('/images/reliability-pattern-lab-containment.svg');
  });
});
