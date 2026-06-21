---
title: "장애 전파를 막는 패턴을 실험으로 이해하기"
description: "timeout, retry, circuit breaker, bulkhead를 장애 전파 관점에서 비교한 설계 노트"
pubDate: "2026-06-21"
category: "Infra"
thumbnail: "/images/failure-containment-thumbnail.svg"
---

장애 전파 차단의 목표는 장애를 없애는 것이 아니다. 외부 API, cache, DB, broker 중 하나가 느려지거나 실패했을 때 그 영향이 전체 API, thread pool, connection pool까지 번지지 않게 만드는 것이다.

장애 대응 패턴은 기능 이름으로 고르면 안 된다. 같은 timeout이라도 “사용자 요청을 빨리 포기할 것인가”, “downstream 호출만 끊을 것인가”, “retry와 합쳐 전체 대기 시간을 제한할 것인가”에 따라 전혀 다른 설계가 된다. 먼저 실패가 어떤 자원을 고갈시키는지 작게 재현하고, 그 다음 패턴별 손익을 비교해야 한다.

## 문제를 먼저 작게 만들기

대표 사례는 외부 결제 API latency spike다. checkout 요청은 내부 주문 API로 들어오지만, 실제 완료에는 외부 provider 호출이 필요하다. provider가 30초 동안 응답하지 않으면 주문 API의 요청 thread가 대기한다. 요청이 계속 들어오면 thread가 쌓이고, DB connection도 오래 붙잡히고, 결국 결제와 무관한 API까지 느려진다.

처음부터 “circuit breaker를 넣자”로 가면 판단이 흐려진다. 먼저 장애 전파 경로를 쪼개야 한다.

| 관점 | 확인할 질문 | 대표 지표 | 실패 시 보이는 현상 |
| --- | --- | --- | --- |
| Dependency | 어떤 외부 호출이 느려지는가 | dependency latency p95/p99 | provider hang, timeout 증가 |
| Request | 사용자 요청은 어디서 대기하는가 | request latency p95/p99 | 전체 API 꼬리 지연 증가 |
| Resource | 어떤 pool이 먼저 포화되는가 | thread/connection saturation | 무관한 API까지 지연 |
| Recovery | 복구 시 요청이 몰리는가 | retry amplification factor | retry storm, QPS 급증 |
| User experience | 실패를 어떻게 축소할 것인가 | fallback count, error rate | 전체 실패 또는 stale 응답 |

![장애 전파 차단 비교 지도](/images/failure-containment-flow.svg)

## 패턴별 비교

아래 표의 핵심은 “무엇을 막는가”와 “무엇을 새로 만들 수 있는가”를 같이 보는 것이다. 장애 대응 패턴은 손실을 없애지 않고, 손실을 더 작은 범위로 옮긴다.

| 패턴 | 막는 것 | 잘못 쓰면 생기는 일 | 먼저 물어볼 질문 |
| --- | --- | --- | --- |
| Timeout | 무한 대기 | 정상 지연까지 실패 처리 | 전체 요청 timeout budget은 얼마인가 |
| Retry | 일시 장애 | retry storm | 요청이 idempotent한가 |
| Backoff + jitter | 재시도 집중 | 회복 지연 | client 수가 많을 때 QPS가 어떻게 퍼지는가 |
| Circuit breaker | 실패 dependency 계속 호출 | 너무 빨리 open되어 가용성 저하 | open 중 사용자 경험은 무엇인가 |
| Bulkhead | shared pool 고갈 | pool 관리 복잡도 증가 | thread, connection, queue 중 무엇을 격리할 것인가 |
| Fallback | 전체 실패 | 부정확한 stale 응답 | stale data가 제품적으로 허용되는가 |

retry는 복구 장치이면서 증폭 장치다. dependency가 잠깐 흔들릴 때는 도움이 되지만, 이미 과부하인 서버에 즉시 retry 3회를 붙이면 장애를 세 배로 밀어 넣을 수 있다. 그래서 retry는 timeout, backoff, jitter, retry budget과 같이 봐야 한다.

## 설계 순서

패턴을 한 번에 모두 켜면 어떤 장치가 실제로 효과를 냈는지 알기 어렵다. 설계와 검증은 단계형으로 나누는 편이 낫다.

| 순서 | 적용 전 관찰 | 적용할 장치 | 통과 기준 |
| --- | --- | --- | --- |
| 1 | dependency hang 시 request/thread 누적 | baseline 측정 | 병목 자원과 전파 경로 식별 |
| 2 | 전체 SLA보다 긴 downstream 대기 | timeout budget | p99가 상한 안으로 들어옴 |
| 3 | 순간 실패가 반복됨 | retry + backoff + jitter | 성공률은 오르고 QPS 증폭은 제한됨 |
| 4 | 실패율이 계속 높음 | circuit breaker + fallback | 빠른 실패와 축소 응답이 관측됨 |
| 5 | 특정 기능이 shared pool을 먹음 | bulkhead | 무관한 API latency가 유지됨 |

이 순서의 목적은 완벽한 장애 대응이 아니다. 어떤 요청을 더 기다리지 않을지, 어떤 기능을 축소할지, 어떤 자원을 격리할지를 숫자로 결정하는 것이다.

## Spring Cloud는 어디에 둘까

Spring Cloud는 이 주제에서 정답이 아니라 배치 선택지다. application 안에서 Resilience4j로 timeout/retry/circuit breaker를 잡을 수도 있고, gateway layer에서 retry/filter를 잡을 수도 있다. Config Server로 runtime 설정을 중앙 관리할 수도 있다.

여기서 중요한 함정은 중복이다. gateway retry와 app retry가 동시에 켜지면 요청 하나가 provider 입장에서는 여러 요청으로 보인다.

| 위치 | 장점 | 주의점 | 적합한 정책 |
| --- | --- | --- | --- |
| App layer | dependency별 정책을 코드와 가깝게 둔다 | 서비스마다 설정이 흩어질 수 있다 | idempotency 기반 retry, fallback |
| Gateway layer | edge에서 공통 filter를 제어한다 | app retry와 겹치면 amplification이 커진다 | rate limit, coarse timeout |
| Config layer | timeout/retry 값을 중앙에서 바꾼다 | config server 장애 시 기본값 전략이 필요하다 | 운영 중 조정 가능한 threshold |

질문은 “Spring Cloud를 쓰면 좋은가?”가 아니다. “어느 정책을 gateway에 두고, 어느 정책을 app에 남기며, 설정 서버가 죽었을 때 서비스는 어떤 값으로 살아야 하는가?”다.

## 측정 없이 말하면 감상이다

timeout 걸고, retry 붙이고, circuit breaker 켜면 끝난 것처럼 보인다. 실제 판단은 숫자에서 나온다.

| 지표 | 의미 | 판단 예시 |
| --- | --- | --- |
| `request_latency_p95/p99` | 사용자가 체감하는 꼬리 지연 | timeout 적용 후 p99 상한 확인 |
| `dependency_timeout_count` | timeout이 실제로 대기를 자르는지 | 특정 provider 장애 감지 |
| `retry_count` | 재시도가 얼마나 발생하는지 | 순간 실패와 상시 실패 구분 |
| `retry_amplification_factor` | 원 요청 대비 dependency 호출이 얼마나 늘었는지 | retry storm 방지 |
| `circuit_breaker_state` | closed/open/half-open 전이가 기대대로 되는지 | open/half-open threshold 조정 |
| `fallback_count` | 축소 응답이 얼마나 나가는지 | 사용자 영향 범위 추정 |
| `thread_pool_saturation` | 특정 dependency가 shared resource를 고갈시키는지 | bulkhead 필요성 판단 |
| `error_rate` | 실패를 숨기지 않고 관측하는지 | fallback이 장애를 가리는지 확인 |

실험 결과에는 성공 로그만 남기면 안 된다. 실패 주입 조건, 선택하지 않은 대안, 버린 이유, 운영자가 볼 dashboard와 alert 초안까지 있어야 다음 사람이 같은 판단을 반복하지 않는다.

## 결론

장애 대응 패턴은 화려한 기능이 아니라 손실을 제한하는 장치다.

| 상황 | 우선순위 |
| --- | --- |
| dependency가 느려진다 | timeout budget부터 잡는다 |
| dependency가 순간 실패한다 | idempotency 확인 후 backoff+jitter retry를 본다 |
| 실패율이 계속 높다 | circuit breaker로 빠르게 실패시키고 fallback을 설계한다 |
| 특정 기능만 resource를 먹는다 | bulkhead로 thread/connection/queue를 분리한다 |
| gateway와 app 정책이 겹친다 | retry 횟수와 QPS 증폭을 먼저 계산한다 |

어떤 요청을 포기할지, 어떤 응답을 축소할지, 어디서 더 기다리지 않을지 정해야 한다. 그 결정을 숫자와 장애 주입으로 확인할 때 timeout, retry, circuit breaker, bulkhead는 기능 목록이 아니라 운영 기준이 된다.
