// 수영장까지 길찾기 — 휴대폰 지도앱 연동.
//
// 정책(크리스 확정 2026-07-09):
// - Android: `geo:` 로 던져 **사용자가 지정해둔 기본 지도앱을 존중**한다.
//   기본값이 없으면 OS가 설치된 지도앱 선택창을 띄우고, 사용자가 "항상"을
//   고르면 그게 기본값이 된다. 우리가 앱을 고르지 않는 게 핵심.
// - iOS: 애플이 **기본 지도앱 변경을 허용하지 않는다**(브라우저·메일과 달리
//   지도는 기본앱 설정 자체가 없음). 그래서 "설치돼 있는 앱"을 기본값 대용으로
//   삼아 네이버 → 카카오 → 애플 순으로 폴백한다. 애플지도는 삭제해도 링크가
//   열리는 시스템 앱이라 마지막 폴백으로 안전.
//
// iOS 판별은 `canOpenURL`이라 app.config.ts의 `LSApplicationQueriesSchemes`에
// nmap·kakaomap 등록 필수(미등록이면 항상 false → 전부 애플지도로 떨어짐).
// = 네이티브 설정이므로 새 빌드부터 동작.

import { Linking, Platform } from 'react-native';

/** 네이버 지도 `appname` 파라미터 — 호출한 앱 식별자(네이버 요구 필수값). */
const APP_ID = 'com.cripo.poolsday';

export type DirectionsTarget = {
  lat: number;
  lng: number;
  /** 도착지 표시 이름(수영장 이름). */
  name: string;
};

/**
 * 목적지까지 길찾기를 지도앱에서 연다.
 *
 * 실패해도 throw 하지 않는다 — 길찾기는 부가 동선이라 여기서 앱이 죽거나
 * 에러 모달이 뜨는 게 더 나쁘다. 열지 못하면 조용히 false 반환.
 */
export async function openDirections(target: DirectionsTarget): Promise<boolean> {
  const { lat, lng, name } = target;
  const dname = encodeURIComponent(name);

  const candidates =
    Platform.OS === 'android'
      ? // 사용자 기본 지도앱/선택창에 위임. label은 () 안에 넣는 geo: 규약.
        [`geo:${lat},${lng}?q=${lat},${lng}(${dname})`]
      : [
          // 대중교통 길찾기 기준(수영장은 대개 도심 생활권).
          `nmap://route/public?dlat=${lat}&dlng=${lng}&dname=${dname}&appname=${APP_ID}`,
          `kakaomap://route?ep=${lat},${lng}&by=PUBLICTRANSIT`,
          `maps://?daddr=${lat},${lng}&dirflg=r`,
        ];

  for (const url of candidates) {
    try {
      // Android geo: 는 canOpenURL 이 패키지 가시성(Android 11+)에 걸려
      // false 를 줄 수 있어 곧장 openURL 시도 → 실패 시 웹 폴백.
      if (Platform.OS === 'ios' && !(await Linking.canOpenURL(url))) continue;
      await Linking.openURL(url);
      return true;
    } catch {
      // 다음 후보로
    }
  }

  // 지도앱을 하나도 못 열었을 때(Android에 지도앱 부재 등) 웹 길찾기.
  try {
    await Linking.openURL(
      `https://map.naver.com/p/search/${dname}?c=${lng},${lat},15,0,0,0,dh`,
    );
    return true;
  } catch {
    return false;
  }
}
