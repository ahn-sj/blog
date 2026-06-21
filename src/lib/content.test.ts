import { describe, expect, test } from 'vitest';
import { readFileSync } from 'node:fs';

import { getAllPosts, getPostBySlug } from './content';

describe('content pipeline', () => {
  test('reads category and optional thumbnail from Markdown frontmatter', () => {
    const posts = getAllPosts();

    expect(posts).toHaveLength(1);
    expect(posts[0]).toMatchObject({
      slug: 'redis-operations-lab',
      title: 'Redis 운영을 장애와 복구 관점에서 보기',
      description: 'RDB/AOF, Sentinel/Cluster, eviction, lock을 운영 선택 기준으로 정리한 글',
      category: 'Infra',
      thumbnail: '/images/redis-operations-thumbnail.svg',
    });
    expect(posts[0].dateLabel).toBe('2026.06.21');
  });

  test('returns Markdown content by slug', () => {
    const post = getPostBySlug('redis-operations-lab');

    expect(post.content).toContain('Redis는 빠른 저장소로 시작하지만 운영에서는 질문이 달라진다');
    expect(post.content).toContain('세션 데이터가 사라지면 사용자는 다시 로그인해야 한다');
    expect(post.content).toContain('/images/redis-operations-map.svg');
    expect(post.content).not.toMatch(/failure-containment|장애 전파 차단|retry는 복구 장치/);
  });

  test('redirects old post paths to the Redis post slug', () => {
    const redirects = readFileSync('public/_redirects', 'utf8');

    expect(redirects).toContain('/posts/failure-containment-patterns/ /posts/redis-operations-lab/ 301');
    expect(redirects).toContain('/posts/reliability-pattern-lab/ /posts/redis-operations-lab/ 301');
    expect(redirects).toContain('/posts/first-post/ /posts/redis-operations-lab/ 301');
    expect(redirects).toContain('/posts/vpc-peering-transit-gateway/ /posts/redis-operations-lab/ 301');
  });
});
