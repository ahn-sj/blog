---
title: "Redis 운영을 장애와 복구 관점에서 보기"
description: "RDB/AOF, Sentinel/Cluster, eviction, lock을 운영 선택 기준으로 정리한 글"
pubDate: "2026-06-21"
category: "Infra"
thumbnail: "/images/redis-operations-thumbnail.svg"
---

Redis는 빠른 저장소로 시작하지만 운영에서는 질문이 달라진다. “얼마나 빠른가?”보다 먼저 봐야 할 것은 “장애가 나면 무엇이 사라지고, 서비스는 어떻게 버티는가?”다.

캐시라면 몇 개의 값이 사라져도 다시 만들 수 있다. 세션이라면 이야기가 다르다. 세션 데이터가 사라지면 사용자는 다시 로그인해야 한다. rate limit 값이 사라지면 제한이 잠시 풀릴 수 있다. 분산 락이 잘못 풀리면 같은 작업이 두 번 실행될 수 있다.

그래서 Redis 운영 글의 목적은 Redis 기능을 많이 아는 것이 아니다. cache, session, rate limit, lock처럼 쓰는 곳마다 어떤 설정이 맞는지 설명할 수 있게 만드는 것이다.

## 먼저 역할을 나누기

Redis를 “빠른 key-value store” 하나로만 보면 설정 선택이 어려워진다. 같은 Redis라도 맡은 일이 다르면 장애 때의 영향도 다르다.

| Redis 사용처 | 장애가 나면 생기는 일 | 먼저 물어볼 질문 | 주로 볼 지표 |
| --- | --- | --- | --- |
| Cache | 원본 DB를 다시 읽는다 | 잠깐 느려져도 되는가 | hit/miss, latency |
| Session | 로그인이 풀릴 수 있다 | 데이터가 사라져도 되는가 | lost session count |
| Rate limit | 제한이 느슨해질 수 있다 | 실패 시 열어둘지 막을지 정했는가 | error rate, counter reset |
| Ranking | 점수가 일부 빠질 수 있다 | 재계산할 수 있는가 | write loss, restore time |
| Lock | 같은 작업이 두 번 돌 수 있다 | 중복 실행이 정말 위험한가 | duplicate execution count |

이 표에서 중요한 것은 Redis 자체가 아니라 서비스 영향이다. Redis가 같은 방식으로 죽어도 cache 장애와 session 장애는 사용자에게 다르게 보인다.

![Redis 운영 판단 지도](/images/redis-operations-map.svg)

## RDB와 AOF는 백업 방식이 아니라 선택 기준이다

RDB와 AOF는 “무엇을 얼마나 잃어도 되는가”의 선택이다. RDB는 특정 시점의 사진을 남긴다. AOF는 쓰기 명령을 계속 기록한다.

| 기준 | RDB | AOF |
| --- | --- | --- |
| 쉽게 말하면 | 중간중간 찍는 스냅샷 | 계속 적는 작업 기록 |
| 장점 | 파일이 작고 재시작이 빠른 편 | 최근 데이터 손실을 줄이기 좋다 |
| 단점 | 마지막 스냅샷 뒤 데이터가 사라질 수 있다 | 파일이 커지고 rewrite 때 부담이 생긴다 |
| 잘 맞는 곳 | 캐시처럼 다시 만들 수 있는 데이터 | 세션처럼 최근 값 손실이 아픈 데이터 |

예를 들어 캐시만 넣는 Redis라면 AOF까지 켜는 것이 비용만 늘릴 수 있다. 반대로 세션을 넣는데 RDB만 믿으면 장애 뒤 대량 로그아웃이 생길 수 있다. 좋은 설정은 멋진 설정이 아니라 손실을 설명할 수 있는 설정이다.

## Sentinel과 Cluster는 장애를 없애지 않는다

Sentinel과 Cluster를 쓰면 안전해진다고 말하기 쉽다. 하지만 더 정확히 말하면, 장애가 났을 때 Redis가 어느 방식으로 이어서 동작할지 정하는 것이다.

| 구성 | 무엇을 해주는가 | 조심할 점 | 어울리는 상황 |
| --- | --- | --- | --- |
| Standalone | 가장 단순한 Redis | 한 대가 죽으면 끝이다 | 로컬, 학습, 중요하지 않은 캐시 |
| Sentinel | master 장애 시 replica를 올린다 | failover 중 쓰기 손실이 있을 수 있다 | 하나의 데이터 묶음에 고가용성이 필요할 때 |
| Cluster | 데이터를 slot으로 나눠 여러 노드에 둔다 | multi-key 명령과 key 설계가 어려워진다 | 메모리와 트래픽이 커질 때 |

여기서 봐야 할 값은 이름이 아니라 시간이다. master가 죽고 다시 쓰기가 가능해지기까지 몇 초가 걸렸는지, 그 사이 어떤 요청이 실패했는지 남겨야 한다.

## 메모리가 꽉 차면 Redis는 결정을 한다

Redis는 메모리 위에서 빠르게 움직인다. 그래서 메모리가 꽉 찼을 때의 정책이 중요하다. 정책을 정하지 않으면 장애 때 어떤 key가 사라지는지 설명하기 어렵다.

| 정책 | 쉽게 말하면 | 위험 |
| --- | --- | --- |
| `noeviction` | 더 이상 쓰지 않는다 | 쓰기 요청이 실패한다 |
| `allkeys-lru` | 오래 안 쓴 key부터 지운다 | 중요한 key도 지워질 수 있다 |
| `volatile-ttl` | TTL이 있는 key 중 곧 끝날 것을 지운다 | TTL 없는 key는 남고 쓰기 실패가 날 수 있다 |

캐시는 지워져도 다시 만들 수 있다. 하지만 세션이나 락 key가 예상 없이 지워지면 사용자가 튕기거나 작업이 중복될 수 있다. eviction policy는 성능 튜닝이 아니라 장애 때 무엇을 버릴지 정하는 일이다.

## Redis는 single-threaded라고만 외우면 부족하다

Redis 명령 실행은 주로 event loop에서 순서대로 처리된다. 그래서 무거운 명령 하나가 들어오면 뒤 요청도 기다릴 수 있다. 다만 network I/O, background save, AOF rewrite 같은 주변 작업은 별도 thread나 process가 관여할 수 있다.

그러니 질문은 “Redis가 정말 single-thread인가?”가 아니다. “내가 실행하는 명령이 event loop를 오래 잡고 있는가?”다.

| 상황 | 확인할 것 | 왜 중요한가 |
| --- | --- | --- |
| 큰 key 조회 | payload 크기 | 큰 응답은 뒤 요청을 밀리게 한다 |
| 많은 key 삭제 | 삭제 비용 | 한 번에 많이 지우면 지연이 튄다 |
| AOF rewrite | rewrite 진행 여부 | 디스크 작업이 지연을 만들 수 있다 |
| hot key | 특정 key 요청 집중 | 한 key에 트래픽이 몰리면 병목이 된다 |

## Lock은 편의 기능이 아니라 사고 방지 장치다

Redis lock은 간단해 보인다. `SET NX PX`로 잡고, 끝나면 지우면 된다. 하지만 실제로는 TTL, unlock, 중복 실행을 함께 봐야 한다.

| 방식 | 장점 | 조심할 점 |
| --- | --- | --- |
| Lettuce 직접 구현 | 동작을 정확히 볼 수 있다 | TTL과 unlock Lua를 직접 잘못 만들 수 있다 |
| Redisson | watchdog, reentrant lock 같은 기능을 제공한다 | 추상화를 믿고 failure model을 놓칠 수 있다 |
| Redlock | 여러 Redis에 lock을 잡는 방식 | correctness 보장인지 효율 개선인지 먼저 나눠야 한다 |

정말 중요한 작업이라면 Redis lock만으로 끝내지 않는다. DB unique constraint, idempotency key, fencing token 같은 장치를 같이 봐야 한다. 중복 실행이 절대 안 되는 작업과 “한 번 더 돌아도 괜찮은” 작업은 설계가 다르다.

![Redis 장애와 복구 확인 흐름](/images/redis-operations-recovery.svg)

## 실험은 이렇게 보면 된다

Redis 운영을 이해하려면 문서만 읽는 것보다 작게 깨뜨려 보는 편이 낫다.

| 실험 | 하는 일 | 확인할 것 |
| --- | --- | --- |
| RDB 손실 확인 | write 직후 Redis를 죽이고 다시 켠다 | 마지막 snapshot 뒤 값이 사라지는가 |
| AOF 복구 확인 | AOF를 켜고 같은 실험을 한다 | 손실 범위가 줄어드는가 |
| Sentinel failover | master를 멈춘다 | 새 master가 올라오기까지 몇 초인가 |
| Cluster node down | slot 담당 노드를 멈춘다 | 어떤 key가 실패하는가 |
| Memory full | maxmemory를 낮추고 key를 넣는다 | 어떤 key가 제거되는가 |
| Lock duplicate | lock TTL보다 작업을 오래 돌린다 | 같은 작업이 두 번 실행되는가 |

결과에는 성공 로그만 남기면 부족하다. 실패한 요청, 사라진 key 수, 복구 시간, 선택하지 않은 대안도 같이 남겨야 다음 사람이 같은 실수를 반복하지 않는다.

## 결론

Redis 운영에서 중요한 질문은 “Redis를 쓸 수 있는가?”가 아니다. “이 데이터가 사라져도 되는가?”, “장애 중에 무엇을 열고 무엇을 막을 것인가?”, “복구 뒤 어떤 값을 믿을 것인가?”다.

| 상황 | 먼저 할 일 |
| --- | --- |
| 캐시를 넣는다 | 없어져도 다시 만들 수 있는지 확인한다 |
| 세션을 넣는다 | 데이터 손실 허용 범위를 먼저 정한다 |
| Sentinel을 쓴다 | failover 시간과 그 사이 실패를 측정한다 |
| Cluster를 쓴다 | key 설계와 multi-key 제약을 확인한다 |
| 락을 쓴다 | 중복 실행을 막을 최종 안전장치를 둔다 |

Redis는 빠르다. 하지만 운영에서는 빠른 것보다 설명 가능한 것이 더 중요하다. 어떤 데이터를 잃을 수 있고, 어느 요청을 실패시킬지 정할 수 있을 때 Redis는 안전한 도구가 된다.
