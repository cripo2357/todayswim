# 슬롯 주차(weeks) 누락 전수 감사 — 재사용 프롬프트

**용도:** day_note(또는 slot_groups 라벨)에는 "특정 주차/격주" 운영이라 적혀 있는데
슬롯의 `weeks` 필드가 비어 있어 앱이 주차 필터링을 못 하는 풀을 전부 찾는다.
(사당문화회관 케이스와 동일 버그 — `slotRunsOnDate`는 weeks 없으면 매주 true 반환.
0572에서 사당 해소.) 아래 블록을 Claude에게 그대로 붙여넣으면 전체 감사를 돌린다.

---

```
[수영장 슬롯 주차(weeks) 누락 전수 감사]

목표: day_note(또는 slot_groups 라벨)에는 "특정 주차/격주" 운영이라고 써 있는데,
정작 슬롯의 weeks 필드가 비어 있어 앱이 주차 필터링을 못 하는 풀을 전부 찾아라.
(사당문화회관 케이스와 동일한 버그. slotRunsOnDate는 weeks 없으면 매주 true 반환.)

방법:
1. prod DB(schedules 테이블)에서 모든 스케줄을 pool 이름과 join해 by_day, day_notes,
   slot_groups를 가져온다. (pg + SUPABASE_DB_URL_PROD, 또는 supabase-js service_role.
   pg 미설치면 npm i --no-save pg. 임시 스크립트는 쓰고 끝나면 지울 것.)
2. 각 schedule의 각 요일(월~일)에 대해:
   - day_notes[요일] 또는 slot_groups[요일][].label 이 '주차 운영'을 언급하는가?
     주차 키워드(week-of-month)만: 주차 / 격주 / 홀수주 / 짝수주 / 첫째~다섯째 주 /
     첫 주 / 마지막(끝) 주 / "N·M주"(예 1·3주) / "매월 N주".
     ※ 제외: 매주, 주말, 주중, 주간 (이건 주차 제약 아님).
   - 그런데 그 요일의 슬롯(by_day[요일] 및 slot_groups[요일][].slots) 중
     weeks 배열이 있는 슬롯이 하나도 없으면 → 버그 의심으로 플래그.
3. 출력: 플래그된 풀 목록 = pool_id, 이름, 요일, day_note 원문, 슬롯 개수.
   (참고로 weeks가 이미 박힌 정상 풀도 따로 카운트해서 보여줄 것.)

참고 코드: src/lib/weekOfMonth.ts (weekOfMonth, slotRunsOnDate),
          src/types/schedule.ts (TimeSlot.weeks, SlotGroup).
주의: DB 변경 금지(읽기 전용 감사). 발견된 건 목록만 보고하고,
     고칠지는 내가 풀별로 정확한 weeks 값 확인 후 결정한다.
```

---

## 감지 정규식(참고)

```
주차 키워드: /(주차|격주|홀수\s*주|짝수\s*주|첫째\s*주|둘째\s*주|셋째\s*주|넷째\s*주|다섯째\s*주|첫\s*주|끝\s*주|마지막\s*주|[1-5]\s*[·,]\s*[1-5]\s*주|매월\s*[1-5]\s*주)/
제외: 매주 / 주말 / 주중 / 주간
```

## 백필 방법(발견 시)

풀별로 정확한 주차 확인 후, 해당 요일 슬롯에 `weeks` 부여(예 1주만=[1], 1·3주=[1,3],
격주=홀수주[1,3,5] 또는 짝수주[2,4]). by_day 변경은 마이그레이션으로(멱등 jsonb_set),
prod 직접 적용(apply-sql-env.mjs). 예시: supabase/migrations/0572_pool_sadang_sunday_weeks.sql