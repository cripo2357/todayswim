// 읽지 않은 알림 카운트 — 내 정보 알림 탭 빨간 배지용.
// 알림 탭을 누르면(진입) 전부 읽음 처리되어 0 → 배지 미노출.
// 백엔드 미연동(Phase1) — '최근' 알림 수를 시드로, 메모리 보관.

import { create } from 'zustand';
import { UNREAD_SEED } from '@/components/notifications/NotificationsTab';

interface NotificationsState {
  unread: number;
  markAllRead: () => void;
}

export const useNotifications = create<NotificationsState>((set) => ({
  unread: UNREAD_SEED,
  markAllRead: () => set({ unread: 0 }),
}));
