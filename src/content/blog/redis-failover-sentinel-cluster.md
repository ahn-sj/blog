---
title: "Redis Sentinel과 Cluster: 장애 전환과 확장을 나눠 보기"
description: "Sentinel과 Cluster를 고가용성, sharding, key 설계 관점에서 분리해 비교한다"
pubDate: "2026-06-19"
category: "Infra"
thumbnail: "/images/redis-failover-sentinel-cluster.svg"
---

이 글의 질문은 하나다. Redis 장애 전환과 확장을 같은 문제로 착각하고 있지 않은가?

Sentinel은 장애 전환을 돕고, Cluster는 데이터를 나눈다. 둘 다 운영 구성이지만 목적이 다르다.

![Redis Sentinel과 Cluster 비교](/images/redis-failover-sentinel-cluster.svg)

## 구성 이름보다 목적을 먼저 본다

| 구성 | 해결하려는 문제 | 조심할 점 |
| --- | --- | --- |
| Standalone | 가장 단순하게 Redis를 쓴다 | 한 대가 멈추면 서비스도 영향을 받는다 |
| Sentinel | master가 멈추면 replica를 새 master로 올린다 | 전환 중 실패 요청과 쓰기 손실을 측정해야 한다 |
| Cluster | 데이터를 slot으로 나눠 여러 노드에 둔다 | key 설계와 multi-key 명령 제약이 생긴다 |

Sentinel을 쓴다고 트래픽이 자동으로 넓게 분산되는 것은 아니다. Cluster를 쓴다고 장애 영향이 사라지는 것도 아니다.

## Sentinel에서 볼 것은 시간이다

Sentinel을 볼 때 중요한 값은 “켜져 있다”가 아니다. master가 멈춘 뒤 다시 쓰기가 가능해지기까지 얼마나 걸리는지다.

| 확인할 것 | 이유 |
| --- | --- |
| failover time | 사용자 오류 시간이 된다 |
| 실패한 요청 수 | 장애가 화면에서 어떻게 보였는지 알려준다 |
| client reconnect 동작 | 앱이 새 master를 따라가는지 확인한다 |
| replica lag | 전환 뒤 사라질 수 있는 쓰기를 가늠한다 |

운영 문서에는 “Sentinel 사용”보다 “master 중단 시 8초 동안 쓰기 실패, 이후 재연결”처럼 남기는 편이 낫다.

## Cluster에서 볼 것은 key 설계다

Cluster는 데이터를 slot으로 나눈다. 그래서 어떤 key들이 함께 움직여야 하는지 먼저 봐야 한다.

| 확인할 것 | 이유 |
| --- | --- |
| key 분포 | 특정 node에만 트래픽이 몰릴 수 있다 |
| multi-key 명령 | 다른 slot의 key를 함께 다루기 어렵다 |
| hot key | node를 늘려도 한 key 병목은 남는다 |
| node down 영향 | 어떤 slot의 요청이 실패하는지 봐야 한다 |

Cluster는 “대수가 많으니 안전하다”가 아니다. 데이터를 나누는 방식이 앱의 key 사용 방식과 맞아야 한다.

## 비교는 이렇게 끝낸다

| 상황 | 먼저 볼 선택 |
| --- | --- |
| 데이터 양은 작지만 master 장애를 줄이고 싶다 | Sentinel |
| 메모리와 트래픽이 한 대를 넘는다 | Cluster |
| key를 여러 개 묶어 자주 처리한다 | Cluster 제약을 먼저 검토 |
| 장애 중 사용자 오류 시간이 중요하다 | failover time 측정 |

Redis 구성 선택의 핵심은 이름이 아니다. 장애 전환이 필요한지, 데이터 분산이 필요한지 먼저 나누는 것이다.
