---
title: "Redis 운영 주제 지도"
description: "Redis 운영에서 섞이기 쉬운 주제를 데이터 손실, 장애 전환, 메모리, 지연, 락으로 나눈 안내 글"
pubDate: "2026-06-21"
category: "Infra"
thumbnail: "/images/redis-operations-thumbnail.svg"
---

Redis 운영을 한 글로 설명하려고 하면 금방 흐려진다. RDB/AOF, Sentinel/Cluster, eviction, latency, lock은 모두 Redis 이야기지만 서로 다른 질문을 다룬다. 한 글에 모두 넣으면 메시지가 흐려진다.

그래서 이 글은 설명 글이 아니라 지도다. Redis 운영을 볼 때 먼저 주제를 나누고, 지금 필요한 질문에 맞는 글로 들어가면 된다.

![Redis 운영 주제 지도](/images/redis-operations-thumbnail.svg)

## 주제는 다섯 개로 나눈다

| 읽을 글 | 다루는 질문 | 읽고 나면 답해야 하는 것 |
| --- | --- | --- |
| [RDB와 AOF](/posts/redis-persistence-rdb-aof/) | 장애 뒤 무엇을 얼마나 잃어도 되는가 | cache와 session의 손실 허용 범위를 설명할 수 있는가 |
| [Sentinel과 Cluster](/posts/redis-failover-sentinel-cluster/) | 장애 전환과 확장을 어떻게 나눌 것인가 | failover와 sharding을 같은 문제로 착각하지 않는가 |
| [메모리와 eviction](/posts/redis-memory-eviction/) | 메모리가 꽉 차면 무엇을 버릴 것인가 | 삭제되어도 되는 key와 안 되는 key를 구분했는가 |
| [지연과 event loop](/posts/redis-latency-single-thread/) | 어떤 작업이 Redis 응답을 밀리게 하는가 | 큰 명령, hot key, background 작업을 측정할 수 있는가 |
| [Lock과 중복 실행](/posts/redis-lock-correctness/) | 같은 작업이 두 번 실행되면 어떻게 막을 것인가 | Redis lock 밖의 최종 안전장치가 있는가 |

## 먼저 정해야 할 것

Redis를 쓰는 이유가 빠른 응답이라도, 운영에서 먼저 정할 것은 속도가 아니다. 어떤 데이터가 사라져도 되는지, 장애 중에 어떤 요청을 실패시킬지, 복구 뒤 어떤 값을 믿을지다.

예를 들어 cache 값은 사라져도 다시 만들 수 있다. 하지만 세션 데이터가 사라지면 사용자는 다시 로그인해야 한다. rate limit 값이 사라지면 제한이 잠시 풀릴 수 있고, lock이 잘못 풀리면 같은 작업이 두 번 실행될 수 있다.

## 이 시리즈의 기준

각 글은 기능 설명보다 운영 판단을 우선한다. “이 설정이 좋다”가 아니라 “이 설정을 선택하면 어떤 실패를 받아들이는가”를 설명하는 것이 목표다.

| 기준 | 글에서 확인할 것 |
| --- | --- |
| 손실 | 장애 뒤 어떤 데이터가 사라질 수 있는가 |
| 시간 | 다시 읽고 쓸 수 있기까지 얼마나 걸리는가 |
| 실패 방식 | 요청을 실패시킬지, 느리게 둘지, 값을 버릴지 |
| 보완 장치 | Redis 밖에서 필요한 DB 제약, idempotency, alert |

Redis는 빠른 도구다. 하지만 운영에서는 빠른 것보다 설명 가능한 것이 더 중요하다.
