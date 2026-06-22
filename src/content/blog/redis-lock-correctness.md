---
title: "Redis Lock: 중복 실행을 어디까지 막을 것인가"
description: "Redis lock을 TTL, unlock, idempotency, fencing token과 함께 보는 글"
pubDate: "2026-06-16"
category: "Infra"
thumbnail: "/images/redis-lock-correctness.svg"
---

이 글의 질문은 하나다. 같은 작업이 두 번 실행되면 어디에서 막을 것인가?

Redis lock의 목적은 중복 실행을 줄이는 것이다. 하지만 lock 하나만으로 모든 정합성을 맡기면 위험하다.

![Redis lock과 중복 실행 방지](/images/redis-lock-correctness.svg)

## Lock은 TTL부터 위험해진다

Redis lock은 보통 `SET key value NX PX <ttl>` 형태로 잡는다. 문제는 작업 시간이 TTL보다 길어질 때다.

| 상황 | 생길 수 있는 일 |
| --- | --- |
| TTL이 너무 짧다 | 작업 중 lock이 풀리고 다른 작업이 들어온다 |
| TTL이 너무 길다 | 실패한 작업 때문에 다음 작업이 오래 막힌다 |
| unlock이 단순 delete다 | 남의 lock을 지울 수 있다 |
| 작업 재시도가 있다 | 같은 요청이 다시 실행될 수 있다 |

lock value를 확인하고 지우는 Lua script가 필요한 이유도 여기에 있다. 내가 잡은 lock만 풀어야 한다.

## 구현 방식보다 실패 모델을 본다

| 방식 | 장점 | 조심할 점 |
| --- | --- | --- |
| 직접 구현 | 동작을 정확히 볼 수 있다 | TTL, value 검증, unlock을 직접 책임져야 한다 |
| Redisson | watchdog, reentrant lock 같은 기능이 있다 | 추상화를 믿고 실패 조건을 잊기 쉽다 |
| 여러 Redis에 잡는 방식 | 단일 지점 의존을 줄이려 한다 | 정확성 보장인지 효율 개선인지 먼저 나눠야 한다 |

도구가 좋아도 작업이 두 번 실행될 가능성은 남는다. 그래서 Redis 밖의 방어선이 필요하다.

## 최종 안전장치는 Redis 밖에 둔다

중복 실행이 정말 위험하다면 DB나 메시지 처리 쪽에 최종 장치를 둔다.

| 장치 | 역할 |
| --- | --- |
| idempotency key | 같은 요청을 한 번만 처리한다 |
| DB unique constraint | 중복 row 생성을 막는다 |
| fencing token | 오래된 작업이 새 작업을 덮지 못하게 한다 |
| 상태 전이 검증 | 이미 끝난 작업을 다시 진행하지 않는다 |

Redis lock은 시작점이다. 마지막 방어선은 데이터가 실제로 바뀌는 곳에 있어야 한다.

## 기록해야 할 지표

| 지표 | 의미 |
| --- | --- |
| lock acquire failure | 경쟁이 얼마나 있는지 |
| lock wait time | 사용자가 얼마나 기다리는지 |
| expired while running | TTL보다 긴 작업이 있는지 |
| duplicate execution count | 실제 사고 가능성이 있는지 |

Redis lock 설계의 결론은 “lock을 잡았다”가 아니다. lock이 풀려도 중복 실행을 어디서 막는지 설명할 수 있어야 한다.
