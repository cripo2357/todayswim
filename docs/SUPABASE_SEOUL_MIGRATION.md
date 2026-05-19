# Supabase 리전 이관 런북 — 뭄바이 → 서울

> **핵심 사실:** Supabase는 **기존 프로젝트의 리전을 변경할 수 없다.** "서울로 변경" = **서울 리전(`ap-northeast-2`)에 새 프로젝트를 만들고 스키마·시드·스토리지·인증·클라이언트 설정을 이관**하는 작업이다. 본 문서는 코드 전수 검증 기반 런북이다.

## 0. 결합점 인벤토리 (코드 검증됨)

| 항목 | 현재 | 이관 영향 |
|---|---|---|
| `src/lib/supabase.ts` | `EXPO_PUBLIC_SUPABASE_URL`/`_ANON_KEY` env만 읽음 | **코드 수정 0** — env 스왑만으로 전환 |
| `.env` (gitignored, 로컬 Metro) | 옛 URL/anon | 새 값으로 교체 |
| EAS env (클라우드 빌드) | 옛 URL/anon | `eas env`로 교체 (안 하면 빌드가 뭄바이로) |
| `.env.example` | placeholder(`your-project`) | 변경 불필요 |
| 마이그레이션 5개 (0021/0023/0024/0031/0034) | pool 사진 URL에 옛 ref `jdvpesumvkspoxrdqbqw` 하드코딩 | **새 ref로 치환 필요** (POOL_SEOUL_0005~0008) |
| `assets/pool-photos/` | 원본 5장 로컬 보존 (0005·0006·0007·0008·HOTEL_0001) | 새 `pool-photos` 버킷에 재업로드 → 유실 위험 0 |
| `avatars` 버킷 | 마이그레이션 0020이 생성 | 마이그레이션 재실행 시 자동 생성 |
| `pool-photos` 버킷 | 대시보드 수동 생성(마이그레이션 아님), public | 새 프로젝트에 수동 재생성 |
| Auth Google/Kakao | 옛 ref 콜백 | 새 `https://<새ref>.supabase.co/auth/v1/callback`로 재구성 |
| `supabase/config.toml` | 없음 (CLI 미연동) | 과거처럼 수동 적용 또는 CLI 신규 link |

서버 실데이터는 P1 특성상 대부분 시드(마이그레이션 내장) + 로컬/목업. 서버 귀속 사용자 데이터는 소량 dev 수준(`profile_nicknames` 닉네임 선점, `notifications`, `pool_submissions`/`schedule_submissions`, `avatars` 업로드). 보존 여부는 §2 결정.

## 1. 역할 분담

| 단계 | Claude(코드) | 크리스(대시보드·시크릿) |
|---|---|---|
| 새 서울 프로젝트 생성 | — | ✅ `ap-northeast-2`, ref/URL/anon/**service_role** 확보 |
| 5개 마이그레이션 ref 치환 | ✅ 새 ref 받으면 즉시 find/replace + 커밋 | — |
| 스키마·시드 적용(0001~0044) | (요청 시) 단일 번들 SQL 생성 | ✅ SQL editor 또는 CLI로 실행 |
| `pool-photos` 버킷+5장 업로드 | (안내) | ✅ 대시보드 업로드 |
| (조건부) dev 데이터 이관 | (요청 시) dump/restore 스크립트 | ✅ service_role로 실행 |
| Auth 재구성 | — | ✅ Supabase/Google/Kakao 콘솔 |
| `.env`+EAS env 스왑 | (안내) | ✅ 로컬·EAS(EXPO_TOKEN) |
| 검증·뭄바이 폐기 | (체크리스트) | ✅ |

> 🔒 **시크릿 원칙**(memory `security_secret_handling`): `service_role` key·anon key 값은 채팅·코드·커밋 어디에도 넣지 않는다. 크리스가 대시보드/로컬에서만 다룬다. **프로젝트 ref / `https://<ref>.supabase.co` URL은 공개 식별자**라 Claude가 받아 마이그레이션 치환에 사용 가능.

## 2. 결정 (확정됨)

1. **dev 서버 데이터: Fresh** — 보존 안 함. 마이그레이션 재실행 + pool 사진 재업로드만. (닉네임 선점·제보·알림·아바타 dev 데이터 폐기, P1이라 OK)
2. **적용 방식: 단일 번들 SQL** — `supabase/bundle_seoul_0001-0043.sql`(41파일·0001~0043, 0044 제외). **새 ref `hldfsstyzbnqnrlqhhtc`로 베이크 완료** — 소스 마이그레이션 5곳 + 번들 모두 치환됨(옛 ref 잔여 0). 새 빈 프로젝트 SQL editor에 **그대로 1회 붙여넣기**(추가 치환 불필요).

## 3. 단계별 런북 (순서 엄수, 컷오버 전까지 뭄바이 유지)

### 1단계 — 새 서울 프로젝트 (크리스)
- Supabase 새 프로젝트, **Region = Seoul (`ap-northeast-2`)**.
- 확보: 새 **project ref**, **URL**(`https://<ref>.supabase.co`), **anon key**, **service_role key**(시크릿).
- 새 **ref / URL** 을 Claude에게 전달(공개 식별자라 OK).

### 2단계 — 마이그레이션 ref 치환 (Claude) ✅ 완료
- 새 ref `hldfsstyzbnqnrlqhhtc` 확정. 소스 5개 파일 + 번들 치환 완료(옛 ref 잔여 0).
- `supabase/bundle_seoul_0001-0043.sql` 재생성(실 ref 베이크).

### 3단계 — 스키마·시드 적용 (크리스)
- `supabase/bundle_seoul_0001-0043.sql` **전체를 SQL editor에 1회** 실행.
- ⚠️ 의존성 보정: 번들은 0013(분류 flag 컬럼)을 0012(샘플 시드) 앞에 둠
  (파일번호≠의존성 순서 — 0012가 0013 컬럼 사용). 맨 앞 TEARDOWN이
  부분 적용분을 정리하므로 실패 후에도 그대로 재실행하면 됨(신규·빈
  프로젝트 = Fresh라 안전).
- `pools`/`schedules`/`announcements`/`nickname_blocklist` 시드 + `avatars` 버킷 + RLS·트리거가 함께 생성됨(전부 마이그레이션 내장).
- ⚠️ 0044(terms)는 Phase 2 초안 — 적용 보류(헤더 주석대로). 0001~0043만.

### 4단계 — Storage (크리스)
- 새 프로젝트에 **`pool-photos`** 버킷 생성(**public**).
- `assets/pool-photos/`의 5장 업로드: `POOL_SEOUL_0005.jpg`, `0006`, `0007`, `0008`, `HOTEL_0001`(사용 마이그레이션 확인 후).
- `avatars`는 0020이 생성했는지 확인(public read / 소유자 폴더 write 정책).

### 5단계 — (조건부) dev 데이터 이관
- §2-1 "보존" 선택 시에만: 뭄바이 → 서울 `pg_dump`(데이터 only: profile_nicknames, notifications, pool_submissions, schedule_submissions) + `avatars` 오브젝트 복사. service_role로 크리스 실행(Claude가 스크립트 제공).
- "fresh"면 생략.

### 6단계 — Auth 재구성 (크리스)
- Supabase 대시보드 Auth: Google·Kakao provider 재설정(Kakao client id/secret 재입력).
- 콜백 URL 변경: 새 `https://<새ref>.supabase.co/auth/v1/callback`.
  - Google Cloud OAuth: 승인된 리디렉션 URI에 새 콜백 추가.
  - Kakao 개발자콘솔: Redirect URI에 새 콜백 추가.
- 앱 딥링크 `poolsday://auth/callback`은 불변(코드 변경 없음).

### 7단계 — 클라이언트 설정 스왑 (크리스)
- 로컬 `.env`: `EXPO_PUBLIC_SUPABASE_URL`/`_ANON_KEY` 새 값. (Metro 재시작)
- EAS env(`eas env`, `EXPO_TOKEN` 사용 — memory `eas_env_vars`/`eas_social_login_token`): 동일 키 새 값으로 업데이트.

### 8단계 — 검증 (앱에서)
- `pools`/`schedules`/`announcements` fetch 정상(지도·목록·시간표).
- pool 사진 로드(새 ref URL).
- Google·Kakao 로그인 → 세션·프로필.
- 닉네임 중복검사(`profile_nicknames` SELECT/INSERT) + 금칙어 트리거.
- 제보 insert(`pool_submissions`).
- 아바타 업로드(`avatars`).

### 9단계 — 컷오버·폐기 (크리스)
- 검증 OK + 새 빌드 배포 후, 뭄바이 프로젝트 폐기.
- **롤백:** 검증 끝날 때까지 뭄바이 유지 → 문제 시 `.env`/EAS env만 옛 값으로 원복하면 즉시 복귀(코드 변경 없으므로).

## 4. 리스크·주의

- **EAS env 누락 = 빌드가 계속 뭄바이.** 7단계에서 로컬·EAS 둘 다 필수.
- pool 사진 URL은 ref 의존 — 2단계 치환 누락 시 사진 깨짐(앱은 v1 로컬 폴백 있으나 서버사진은 미표시).
- 0044(terms)는 미적용 유지(P2 초안).
- service_role key 노출 금지(채팅·커밋·.env 커밋 X).
- 마이그레이션은 멱등하지 않은 시드 INSERT 다수 → 새(빈) 프로젝트에 1회만, 순서대로.

---

*상태: 런북 작성 완료. 다음 = §2 결정 2건 → 새 ref 전달 시 2단계(치환) Claude 즉시 수행. 코드 결합은 마이그레이션 ref 5곳뿐, 나머지는 env·대시보드 작업.*
