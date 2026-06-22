# asze.net posts

개인 블로그 글 목록입니다. 운영/작성 절차는 [RUNBOOK.md](docs/runbooks/RUNBOOK.md)를 따릅니다.

## 공개 글

| 날짜 | 분류 | 제목 | 원본 |
| --- | --- | --- | --- |
| 2026-06-21 | Infra | [Redis 운영 주제 지도](https://asze.net/posts/redis-operations-lab/) | [redis-operations-lab.md](src/content/blog/redis-operations-lab.md) |
| 2026-06-20 | Infra | [Redis RDB와 AOF: 무엇을 얼마나 잃어도 되는가](https://asze.net/posts/redis-persistence-rdb-aof/) | [redis-persistence-rdb-aof.md](src/content/blog/redis-persistence-rdb-aof.md) |
| 2026-06-19 | Infra | [Redis Sentinel과 Cluster: 장애 전환과 확장을 나눠 보기](https://asze.net/posts/redis-failover-sentinel-cluster/) | [redis-failover-sentinel-cluster.md](src/content/blog/redis-failover-sentinel-cluster.md) |
| 2026-06-18 | Infra | [Redis 메모리 정책: 무엇을 버릴지 먼저 정하기](https://asze.net/posts/redis-memory-eviction/) | [redis-memory-eviction.md](src/content/blog/redis-memory-eviction.md) |
| 2026-06-17 | Infra | [Redis 지연: single-threaded보다 event loop 점유 시간을 보기](https://asze.net/posts/redis-latency-single-thread/) | [redis-latency-single-thread.md](src/content/blog/redis-latency-single-thread.md) |
| 2026-06-16 | Infra | [Redis Lock: 중복 실행을 어디까지 막을 것인가](https://asze.net/posts/redis-lock-correctness/) | [redis-lock-correctness.md](src/content/blog/redis-lock-correctness.md) |

## 초안

아직 없습니다.

## 글 목록 필드

각 글은 `src/content/blog/*.md`의 frontmatter로 목록 정보를 정의합니다.

```yaml
title: "글 제목"
description: "글 설명"
pubDate: "YYYY-MM-DD"
category: "Infra"
thumbnail: "/images/redis-operations-thumbnail.svg"
```
