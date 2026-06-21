---
title: "장애 전파를 막는 패턴을 실험으로 이해하기"
description: "timeout, retry, circuit breaker, bulkhead를 장애 전파 관점에서 비교한 설계 노트"
pubDate: "2026-06-21"
category: "Infra"
thumbnail: "/images/reliability-pattern-lab-thumbnail.svg"
---

장애 전파 차단의 목표는 장애를 없애는 것이 아니다. 외부 API, cache, DB, broker 중 하나가 느려지거나 실패했을 때 그 영향이 전체 API, thread pool, connection pool까지 번지지 않게 만드는 것이다.

`reliability-pattern-lab`은 이 관점으로 만든 실험 노트다. 아직 완성된 구현 결과라기보다, 무엇을 재현하고 무엇을 측정해야 하는지 정리한 설계 지도에 가깝다. 주제는 단순하다. 외부 결제 API가 느려졌을 때 주문 API 전체가 같이 느려지는 상황을 만들고, timeout, retry, circuit breaker, bulkhead, fallback이 각각 어디까지 문제를 줄이는지 확인한다.

## 문제를 먼저 작게 만들기

대표 사례는 결제 API latency spike다. checkout 요청은 내부 주문 API로 들어오지만, 실제 완료에는 외부 결제 provider 호출이 필요하다. provider가 30초 동안 응답하지 않으면 주문 API의 요청 thread가 대기한다. 요청이 계속 들어오면 thread가 쌓이고, DB connection도 오래 붙잡히고, 결국 결제와 무관한 API까지 느려진다.

처음부터 “circuit breaker를 넣자”로 가면 판단이 흐려진다. 먼저 어떤 장애가 어떤 자원을 고갈시키는지 봐야 한다.

| 단계 | 질문 | 봐야 할 지표 |
| --- | --- | --- |
| As-Is | timeout 없이 dependency가 멈추면 어디서 쌓이는가 | blocked request count |
| Timeout | 전체 SLA 안에서 dependency별 대기 시간을 얼마로 자를 것인가 | timeout count, p95/p99 |
| Retry | 재시도가 복구인지 증폭인지 어떻게 구분할 것인가 | retry amplification |
| Circuit breaker | 실패율이 높을 때 빠르게 실패시키는가 | breaker state, fallback count |
| Bulkhead | 한 dependency 장애가 다른 API를 막지 않는가 | pool saturation, rejection count |

## 패턴을 기능 이름으로 고르지 않기

이 실험에서 보고 싶은 것은 패턴의 “존재 여부”가 아니다. 어떤 실패 모드에서 어떤 패턴이 도움이 되고, 잘못 쓰면 어떤 부작용이 생기는지를 같은 조건에서 비교하는 것이다.

| 패턴 | 막는 것 | 잘못 쓰면 생기는 일 | 먼저 물어볼 질문 |
| --- | --- | --- | --- |
| Timeout | 무한 대기 | 정상 지연까지 실패 처리 | 전체 요청 timeout budget은 얼마인가 |
| Retry | 일시 장애 | retry storm | 요청이 idempotent한가 |
| Backoff + jitter | 재시도 집중 | 회복 지연 | client 수가 많을 때 QPS가 어떻게 퍼지는가 |
| Circuit breaker | 실패 dependency 계속 호출 | 너무 빨리 open되어 가용성 저하 | open 중 사용자 경험은 무엇인가 |
| Bulkhead | shared pool 고갈 | pool 관리 복잡도 증가 | thread, connection, queue 중 무엇을 격리할 것인가 |
| Fallback | 전체 실패 | 부정확한 stale 응답 | stale data가 제품적으로 허용되는가 |

retry는 복구 장치이면서 증폭 장치다. dependency가 잠깐 흔들릴 때는 도움이 되지만, 이미 과부하인 서버에 즉시 retry 3회를 붙이면 장애를 세 배로 밀어 넣을 수 있다. 그래서 retry는 timeout, backoff, jitter, retry budget과 같이 봐야 한다.

## 실험 지도

lab의 흐름은 일부러 단계형으로 잡았다. 바로 To-Be를 구현하지 않고, 먼저 나쁜 상태를 재현한다.

```text
1. No-timeout baseline
   dependency hang -> request/thread 누적 확인

2. Timeout budget
   dependency별 timeout 적용 -> 대기 시간 제한 확인

3. Retry + backoff + jitter
   즉시 retry와 분산 retry 비교 -> retry amplification 확인

4. Circuit breaker + fallback
   실패율 증가 -> open, half-open, fallback 확인

5. Bulkhead
   recommendation pool 고갈 -> checkout 영향 제한 확인
```

![장애 전파 차단 실험 흐름](/images/reliability-pattern-lab-containment.svg)

## Spring Cloud는 어디에 둘까

Spring Cloud는 이 실험에서 “정답”이 아니라 비교 대상이다. application 안에서 Resilience4j로 timeout/retry/circuit breaker를 잡을 수도 있고, gateway layer에서 retry/filter를 잡을 수도 있다. Config Server로 runtime 설정을 중앙 관리할 수도 있다.

여기서 중요한 함정은 중복이다. gateway retry와 app retry가 동시에 켜지면 요청 하나가 provider 입장에서는 여러 요청으로 보인다.

| 위치 | 장점 | 주의점 |
| --- | --- | --- |
| App layer | dependency별 정책을 코드와 가까이 둔다 | 서비스마다 설정이 흩어질 수 있다 |
| Gateway layer | edge에서 공통 retry/filter를 제어한다 | app retry와 겹치면 amplification이 커진다 |
| Config layer | timeout/retry 값을 중앙에서 바꾼다 | config server 장애 시 기본값 전략이 필요하다 |

내가 확인하고 싶은 질문은 “Spring Cloud를 쓰면 좋은가?”가 아니다. “어느 정책을 gateway에 두고, 어느 정책을 app에 남기며, 설정 서버가 죽었을 때 서비스는 어떤 값으로 살아야 하는가?”다.

## 측정 없이 말하면 감상이다

이 주제는 말로만 설명하면 너무 쉽게 보인다. timeout 걸고, retry 붙이고, circuit breaker 켜면 끝난 것처럼 보인다. 하지만 실제 판단은 숫자에서 나온다.

| 지표 | 의미 |
| --- | --- |
| `request_latency_p95/p99` | 사용자가 체감하는 꼬리 지연 |
| `dependency_timeout_count` | timeout이 실제로 대기를 자르는지 |
| `retry_count` | 재시도가 얼마나 발생하는지 |
| `retry_amplification_factor` | 원 요청 대비 dependency 호출이 얼마나 늘었는지 |
| `circuit_breaker_state` | closed/open/half-open 전이가 기대대로 되는지 |
| `fallback_count` | 축소 응답이 얼마나 나가는지 |
| `thread_pool_saturation` | 특정 dependency가 shared resource를 고갈시키는지 |
| `error_rate` | 실패를 숨기지 않고 관측하는지 |

실험 결과 문서에는 성공 로그만 남기면 안 된다. 실패 주입 로그, 선택하지 않은 대안, 버린 이유, 운영자가 볼 dashboard와 alert 초안까지 있어야 다음 사람이 같은 판단을 반복하지 않는다.

## 내가 이 lab에서 얻고 싶은 것

최종 목표는 Spring Boot에 resilience annotation을 붙이는 것이 아니다. 장애 상황에서 “어느 요청을 빨리 실패시키고, 어느 기능은 축소 응답으로 살리고, 어느 dependency는 격리할지”를 설명할 수 있는 기준을 만드는 것이다.

내가 남기고 싶은 결론은 이런 형태다.

| 상황 | 우선순위 |
| --- | --- |
| dependency가 느려진다 | timeout budget부터 잡는다 |
| dependency가 순간 실패한다 | idempotency 확인 후 backoff+jitter retry를 본다 |
| 실패율이 계속 높다 | circuit breaker로 빠르게 실패시키고 fallback을 설계한다 |
| 특정 기능만 resource를 먹는다 | bulkhead로 thread/connection/queue를 분리한다 |
| gateway와 app 정책이 겹친다 | retry 횟수와 QPS 증폭을 먼저 계산한다 |

장애 대응 패턴은 화려한 기능이 아니라 손실을 제한하는 장치다. 어떤 요청을 포기할지, 어떤 응답을 축소할지, 어디서 더 기다리지 않을지 정해야 한다. 이 결정을 숫자와 장애 주입으로 확인하는 것이 `reliability-pattern-lab`의 목적이다.
