// 한글 문자열 정렬 비교자 — localeCompare(_, 'ko') 대체.
//
// 왜: Hermes(Android)의 'ko' locale collation은 ICU 경로가 극악으로 느려서,
//   555개 풀 이름 정렬(~5천 비교)에 3~5초가 걸린다. iOS(JSC 네이티브 ICU)는 즉시라
//   "Android만 느림"의 실제 원인이었다(수영장 목록·달력 탭 마운트 지연).
// 대체: 미리조합 한글(U+AC00~U+D7A3)은 코드포인트 순서가 곧 가나다 사전순이라
//   평범한 문자열 비교로 사실상 동일하게 정렬되면서 ~100배 빠르다.
export const compareKo = (a: string, b: string): number =>
  a < b ? -1 : a > b ? 1 : 0;
