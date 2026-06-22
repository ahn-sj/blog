import { describe, expect, test } from 'vitest';
import { readFileSync } from 'node:fs';

import { getAllPosts, getPostBySlug } from './content';

describe('content pipeline', () => {
  test('publishes Redis operations as a topic-focused series', () => {
    const posts = getAllPosts();

    expect(posts).toHaveLength(6);
    expect(posts.map((post) => post.slug)).toEqual([
      'redis-operations-lab',
      'redis-persistence-rdb-aof',
      'redis-failover-sentinel-cluster',
      'redis-memory-eviction',
      'redis-latency-single-thread',
      'redis-lock-correctness',
    ]);
    expect(posts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          slug: 'redis-operations-lab',
          title: 'Redis 운영 주제 지도',
          description: 'Redis 운영에서 섞이기 쉬운 주제를 데이터 손실, 장애 전환, 메모리, 지연, 락으로 나눈 안내 글',
          category: 'Infra',
          thumbnail: '/images/redis-operations-thumbnail.svg',
        }),
        expect.objectContaining({
          slug: 'redis-persistence-rdb-aof',
          title: 'Redis RDB와 AOF: 무엇을 얼마나 잃어도 되는가',
          description: 'RDB와 AOF를 백업 기능이 아니라 데이터 손실 허용 범위로 비교한다',
          thumbnail: '/images/redis-persistence-rdb-aof.svg',
        }),
        expect.objectContaining({
          slug: 'redis-failover-sentinel-cluster',
          title: 'Redis Sentinel과 Cluster: 장애 전환과 확장을 나눠 보기',
          description: 'Sentinel과 Cluster를 고가용성, sharding, key 설계 관점에서 분리해 비교한다',
          thumbnail: '/images/redis-failover-sentinel-cluster.svg',
        }),
        expect.objectContaining({
          slug: 'redis-memory-eviction',
          title: 'Redis 메모리 정책: 무엇을 버릴지 먼저 정하기',
          description: 'maxmemory와 eviction policy를 성능 설정이 아니라 장애 시 버릴 데이터 선택으로 본다',
          thumbnail: '/images/redis-memory-eviction.svg',
        }),
        expect.objectContaining({
          slug: 'redis-latency-single-thread',
          title: 'Redis 지연: single-threaded보다 event loop 점유 시간을 보기',
          description: 'Redis 지연을 큰 명령, hot key, background 작업이 event loop에 주는 영향으로 설명한다',
          thumbnail: '/images/redis-latency-single-thread.svg',
        }),
        expect.objectContaining({
          slug: 'redis-lock-correctness',
          title: 'Redis Lock: 중복 실행을 어디까지 막을 것인가',
          description: 'Redis lock을 TTL, unlock, idempotency, fencing token과 함께 보는 글',
          thumbnail: '/images/redis-lock-correctness.svg',
        }),
      ]),
    );
  });

  test('keeps the Redis series index focused on navigation instead of mixing every topic', () => {
    const post = getPostBySlug('redis-operations-lab');

    expect(post).toMatchObject({
      slug: 'redis-operations-lab',
      title: 'Redis 운영 주제 지도',
      description: 'Redis 운영에서 섞이기 쉬운 주제를 데이터 손실, 장애 전환, 메모리, 지연, 락으로 나눈 안내 글',
      category: 'Infra',
      thumbnail: '/images/redis-operations-thumbnail.svg',
    });
    expect(post.dateLabel).toBe('2026.06.21');
    expect(post.content).toContain('한 글에 모두 넣으면 메시지가 흐려진다');
    expect(post.content).toContain('/posts/redis-persistence-rdb-aof/');
    expect(post.content).not.toContain('## RDB와 AOF는 백업 방식이 아니라 선택 기준이다');
    expect(post.content).not.toContain('## Sentinel과 Cluster는 장애를 없애지 않는다');
    expect(post.content).not.toContain('## Lock은 편의 기능이 아니라 사고 방지 장치다');
  });

  test('keeps each Redis topic article focused on one message', () => {
    const persistence = getPostBySlug('redis-persistence-rdb-aof');
    const failover = getPostBySlug('redis-failover-sentinel-cluster');
    const memory = getPostBySlug('redis-memory-eviction');
    const latency = getPostBySlug('redis-latency-single-thread');
    const lock = getPostBySlug('redis-lock-correctness');

    expect(persistence.content).toContain('이 글의 질문은 하나다');
    expect(persistence.content).toContain('세션 데이터가 사라지면 사용자는 다시 로그인해야 한다');
    expect(persistence.content).not.toMatch(/Sentinel|Cluster|Redisson|single-threaded/);

    expect(failover.content).toContain('이 글의 질문은 하나다');
    expect(failover.content).toContain('Sentinel은 장애 전환을 돕고, Cluster는 데이터를 나눈다');
    expect(failover.content).not.toMatch(/AOF rewrite|eviction|Redlock/);

    expect(memory.content).toContain('이 글의 질문은 하나다');
    expect(memory.content).toContain('eviction policy는 장애 때 무엇을 버릴지 정하는 규칙이다');
    expect(memory.content).not.toMatch(/Sentinel|AOF|Redisson|single-threaded/);

    expect(latency.content).toContain('이 글의 질문은 하나다');
    expect(latency.content).toContain('Redis 지연은 event loop를 오래 잡는 작업에서 시작한다');
    expect(latency.content).not.toMatch(/Sentinel|AOF|eviction|Redisson/);

    expect(lock.content).toContain('이 글의 질문은 하나다');
    expect(lock.content).toContain('Redis lock의 목적은 중복 실행을 줄이는 것이다');
    expect(lock.content).not.toMatch(/Sentinel|AOF rewrite|eviction|single-threaded/);
  });

  test('redirects old post paths to the Redis series index', () => {
    const redirects = readFileSync('public/_redirects', 'utf8');

    expect(redirects).toContain('/posts/failure-containment-patterns/ /posts/redis-operations-lab/ 301');
    expect(redirects).toContain('/posts/reliability-pattern-lab/ /posts/redis-operations-lab/ 301');
    expect(redirects).toContain('/posts/first-post/ /posts/redis-operations-lab/ 301');
    expect(redirects).toContain('/posts/vpc-peering-transit-gateway/ /posts/redis-operations-lab/ 301');
  });
});
