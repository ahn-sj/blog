---
title: "Redis 메모리 정책: 무엇을 버릴지 먼저 정하기"
description: "maxmemory와 eviction policy를 성능 설정이 아니라 장애 시 버릴 데이터 선택으로 본다"
pubDate: "2026-06-18"
category: "Infra"
thumbnail: "/images/redis-memory-eviction.svg"
---

이 글의 질문은 하나다. Redis 메모리가 꽉 차면 무엇을 버릴 것인가?

eviction policy는 장애 때 무엇을 버릴지 정하는 규칙이다. 이걸 성능 튜닝처럼만 보면 중요한 key가 사라졌을 때 설명할 수 없다.

![Redis 메모리와 eviction 정책](/images/redis-memory-eviction.svg)

## 메모리 full은 장애 방식이다

Redis는 메모리 위에서 빠르게 움직인다. 그래서 메모리가 꽉 찼을 때 두 가지 중 하나가 일어난다. 새 쓰기를 거절하거나, 기존 key를 지운다.

| 선택 | 사용자에게 보이는 모습 | 맞는 상황 |
| --- | --- | --- |
| 쓰기 실패 | 요청이 실패하거나 오류가 난다 | 값을 임의로 지우면 안 되는 경우 |
| key 제거 | 일부 데이터가 사라진다 | 다시 만들 수 있는 cache 위주 |

둘 중 어느 쪽이 더 안전한지는 데이터 성격이 정한다.

## 정책은 이름보다 영향으로 본다

| 정책 | 쉽게 말하면 | 위험 |
| --- | --- | --- |
| `noeviction` | 더 이상 쓰지 않는다 | 쓰기 요청이 실패한다 |
| `allkeys-lru` | 오래 안 쓴 key부터 지운다 | 중요한 key도 지워질 수 있다 |
| `volatile-lru` | TTL이 있는 key 중 오래 안 쓴 것을 지운다 | TTL 없는 key 때문에 쓰기 실패가 날 수 있다 |
| `volatile-ttl` | TTL이 있는 key 중 곧 끝날 것을 지운다 | 의도와 다른 key가 먼저 없어질 수 있다 |

cache Redis라면 `allkeys-lru`가 자연스러울 수 있다. 세션이나 작업 상태가 섞인 Redis라면 같은 정책이 장애가 될 수 있다.

## 같은 Redis에 섞을수록 위험하다

cache, session, lock key를 같은 Redis에 넣고 같은 메모리 정책을 쓰면 판단이 어려워진다.

| 섞인 데이터 | 생길 수 있는 일 |
| --- | --- |
| cache + session | cache 압박 때문에 session이 사라진다 |
| cache + rate limit | cache 증가 때문에 제한 counter가 초기화된다 |
| cache + lock | lock key가 사라져 같은 작업이 다시 실행된다 |

가능하면 데이터 성격이 다른 Redis는 분리한다. 분리하지 못한다면 key prefix, TTL, maxmemory 정책을 문서로 남긴다.

## 운영에서는 이 값을 본다

| 지표 | 의미 |
| --- | --- |
| used_memory | 현재 메모리 사용량 |
| maxmemory | 제한값에 얼마나 가까운지 |
| evicted_keys | 실제로 제거된 key 수 |
| rejected write | 쓰기 실패가 사용자 오류로 이어지는지 |

메모리 정책의 목적은 Redis를 계속 빠르게 만드는 것만이 아니다. 장애 때 무엇을 버릴지 미리 정해 두는 것이다.
