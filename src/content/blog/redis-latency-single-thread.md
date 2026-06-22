---
title: "Redis 지연: single-threaded보다 event loop 점유 시간을 보기"
description: "Redis 지연을 큰 명령, hot key, background 작업이 event loop에 주는 영향으로 설명한다"
pubDate: "2026-06-17"
category: "Infra"
thumbnail: "/images/redis-latency-single-thread.svg"
---

이 글의 질문은 하나다. 어떤 작업이 Redis 응답을 밀리게 하는가?

Redis 지연은 event loop를 오래 잡는 작업에서 시작한다. “Redis는 single-threaded다”라고 외우는 것보다, 어떤 명령이 오래 걸리는지 보는 편이 실무에 더 가깝다.

![Redis event loop와 지연](/images/redis-latency-single-thread.svg)

## 핵심은 순서 대기다

Redis 명령 실행은 주로 event loop에서 순서대로 처리된다. 앞의 작업이 오래 걸리면 뒤 요청도 기다린다.

| 상황 | 왜 지연되는가 | 확인할 것 |
| --- | --- | --- |
| 큰 value 조회 | 응답을 만들고 보내는 시간이 길다 | payload size |
| 많은 key 삭제 | 삭제 작업이 오래 걸린다 | command latency |
| 넓은 범위 조회 | 한 번에 많은 데이터를 훑는다 | slowlog |
| hot key | 한 key에 요청이 몰린다 | key별 요청 집중도 |

작은 명령이 많을 때와 큰 명령 하나가 들어올 때의 지연 양상은 다르다.

## 주변 작업도 지연을 만든다

Redis가 모든 일을 한 thread에서만 하는 것은 아니다. 저장 파일 생성, rewrite, network I/O 같은 주변 작업은 별도 thread나 process가 관여할 수 있다. 그래도 앱 입장에서 중요한 것은 응답 시간이 튀는지다.

| 작업 | 볼 것 |
| --- | --- |
| background save | 진행 중 latency 변화 |
| rewrite | 디스크 사용량과 응답 시간 |
| replication | replica 지연과 client 영향 |
| network | 큰 응답 전송 시간 |

운영에서는 구조 설명보다 p99 latency, slowlog, 요청 실패율이 더 중요하다.

## 줄이는 방법도 질문에서 시작한다

| 질문 | 대응 |
| --- | --- |
| 큰 key가 있는가 | value 크기를 줄이거나 나눈다 |
| 한 번에 많이 지우는가 | 작은 단위로 나누거나 비동기 삭제를 검토한다 |
| 한 key에 몰리는가 | key 설계를 바꾸거나 cache 분산을 본다 |
| 특정 시간에만 튀는가 | background 작업 시간과 겹치는지 본다 |

Redis 지연 분석의 목표는 “thread 개수”를 맞히는 것이 아니다. event loop를 오래 잡는 작업을 찾아 줄이는 것이다.
