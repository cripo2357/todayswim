-- Pool's Day v1 — announcements 테스트용 더미 10건.
-- 4가지 유형(신기능/기능 업데이트/정보 업데이트/이벤트) + 최근(7일 이내)/이전 섹션 모두 커버.
-- 운영 전 시드 데이터로 활용. 본 운영 시작 시 삭제하거나 실 데이터로 교체.

delete from public.announcements;

insert into public.announcements (type, title, body, bullets, button_label, button_url, published_at) values
  -- ===== 최근 (7일 이내) — 5건 =====
  ('new_feature',    '수영 기록 기능 출시',
                     '오늘부터 수영한 거리·시간을 기록하고 통계로 볼 수 있어요.',
                     null,
                     null, null,
                     now() - interval '6 hours'),

  ('feature_update', 'v1.3 업데이트',
                     '검색 필터와 마커 디자인이 더 보기 좋게 개선되었습니다.',
                     array['자유수영 시간 필터에 요일 다중 선택 추가', '50m 풀 마커는 큰 사이즈로 강조', '카드 사진 로딩 속도 개선'],
                     null, null,
                     now() - interval '1 day'),

  ('info_update',    '수영장 정보 업데이트',
                     '서울/부산 지역 수영장 정보가 갱신되었습니다.',
                     array['신규 수영장 12곳 추가', '운영시간/요금 정보 수정 39곳'],
                     null, null,
                     now() - interval '2 days'),

  ('event',          'CRIPO 굿즈 이벤트',
                     '시간표 작성에 참여하시면 추첨을 통해 CRIPO 수경을 드려요.',
                     null,
                     '응모하기', 'https://example.com/event/cripo-goods',
                     now() - interval '4 days'),

  ('new_feature',    '즐겨찾기 기능 출시',
                     '자주 가는 수영장을 즐겨찾기에 추가해서 빠르게 찾을 수 있어요.',
                     null,
                     null, null,
                     now() - interval '5 days'),

  -- ===== 이전 (7일 이상) — 5건 =====
  ('feature_update', 'v1.2 업데이트',
                     '지도 사용성이 크게 개선되었습니다.',
                     array['클러스터 마커 도입 — 줌 아웃 시 가까운 수영장끼리 묶임', '내 위치 버튼 응답 속도 개선'],
                     null, null,
                     now() - interval '12 days'),

  ('event',          '브랜드 X 콜라보 종료',
                     '많은 참여 감사드려요. 다음 이벤트로 곧 찾아뵙겠습니다.',
                     null,
                     '결과 확인', 'https://example.com/event/brand-x-result',
                     now() - interval '18 days'),

  ('info_update',    '경기 지역 수영장 추가',
                     '경기 남부 지역 수영장 정보가 새로 등록되었습니다.',
                     array['수원·성남·용인 외 8개 시', '총 47곳 신규 등록'],
                     null, null,
                     now() - interval '25 days'),

  ('new_feature',    '닉네임 시간표 등록',
                     '시간표 작성 시 닉네임을 남기면 다른 사용자에게 표시됩니다.',
                     null,
                     null, null,
                     now() - interval '32 days'),

  ('feature_update', 'v1.1 업데이트',
                     '초기 버전 안정화 패치입니다.',
                     array['지도 마커 라벨 가독성 개선', '필터 진입/적용 속도 개선', '몇 가지 크래시 이슈 수정'],
                     null, null,
                     now() - interval '45 days');
