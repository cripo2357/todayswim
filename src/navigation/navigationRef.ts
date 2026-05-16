// NavigationContainer 바깥(App.tsx의 GlobalAddScheduleSheet 등)에서도
// 명령형으로 화면 이동할 수 있는 공용 ref.
// useNavigation은 컨테이너 트리 안에서만 동작 → 전역 시트는 이 ref를 사용.

import { createNavigationContainerRef } from '@react-navigation/native';
import type { RootStackParamList } from './types';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();
