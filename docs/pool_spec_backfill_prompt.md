# 수영장 규격 백필 프롬프트 (레인수·레인길이·수심·유아풀·다이빙풀)

> **용도**: 등록된 공공 수영장 중 규격(lane_count·pool_length·depth·has_kids_pool·has_diving_pool)이 비어있는 곳을 2차 출처로 채운다.
> **전제**: 규격은 **변동성이 거의 없는 객관사실**이라, 요금·시간표와 달리 **2차 출처를 넓게 포용**해서 참고해도 틀리지 않는다(크리스 2026-07-05, [[pool_specs_2nd_source_ok]]). 시간표·요금과 달리 cbswim·블로그·디렉토리도 규격 한정 신뢰.

## 채울 필드

| 필드 | 의미 | 규칙 |
|---|---|---|
| `lane_count` | 메인풀 레인 수(정수) | 성인 메인풀 기준. |
| `pool_length` | 메인풀 길이(m) | 25 또는 50 등. **50m 보유시 25m 병설이어도 50**([[pool_length_50_if_has_50m]]). |
| `depth_min` / `depth_max` | 수심(m) | 성인풀 최저~최고. 경사풀이면 범위(예 1.0~1.4). 값 하나만 있으면 min=max. |
| `has_kids_pool` | 유아풀 유무 | 유아풀/어린이풀/유아자유수영 있으면 true. |
| `has_diving_pool` | 다이빙풀 유무 | 다이빙풀/다이빙대/잠수풀 있으면 true. 대부분 false. |

## 출처 우선순위 (규격 한정, 넓게 포용)

1. **공공데이터/공유누리/운영주체 시설안내** — 시·군 체육시설 안내, 도시공사·시설관리공단 "시설현황/개요" 페이지의 규격표.
2. **서울시 체육시설포털·지자체 포털** — 규격 항목 제공.
3. **디렉토리/커뮤니티** — cbswim(수심까지 잘 가짐), 수위미(suwimi), 이오미터(25m.kr), poolow, kswim, swimmingis. **규격만 취신**(시간표·요금은 무시).
4. **규격 정리 블로그** — leonlsy 등 서울 25구 규격 정리([[pool_spec_blog_leonlsy]]), 지역 블로그 후기(레인/길이/수심 언급).
5. **카카오/네이버 플레이스** — 상세정보에 규격 있으면.

## 방법

- 풀 이름 + 주소(시군구)로 검색. **같은 시설**인지 주소로 확인(동명 타시설 오매칭 방지, [[pool_name_poi_audit_unreliable]] 교훈).
- 여러 출처가 일치하면 채택. 상충 시 공공/운영주체 우선. **불확실하면 null 유지**(추측 금지).
- `need`에 명시된 필드만 우선 채우되, 확실한 다른 규격도 같이 반환.
- 호텔풀(is_hotel_pool)은 대상 제외(인피니티풀이라 레인/길이 없음, [[hotel_pool_no_lane_length]]).

## 산출 (풀당 JSON)

```
{ "id":"POOL_XXXX", "lane_count":6, "pool_length":25, "depth_min":1.0, "depth_max":1.4,
  "has_kids_pool":true, "has_diving_pool":false, "source":"청주시설관리공단 시설현황", "confidence":"high|med|low" }
```
- 못 찾은 필드는 **키를 생략**(null 덮어쓰기 방지). confidence low는 검토용 플래그.

## 반영

- 검토 후 prod 직접 UPDATE(service_role, [[pool_db_prod_only]]). **기존 non-null 값은 덮지 않음**(누락분만 채움).
- has_kids_pool/has_diving_pool은 **true 발견 시에만 set**(false로 함부로 뒤집지 않음 — false가 "미확인"일 수 있음).
