// Pool's day — 단일 기기 가드. 다른 기기가 로그인하면 이 기기를 자동 로그아웃.
//
// 감지 시점:
//  · 진입(앱 실행) 1회
//  · AppState 'active'(백그라운드→포그라운드)
//  · realtime — 내 profiles row의 active_device 변경(앱 켜진 채로도 즉시)
// 감지되면 안내 후 signOut. App.tsx에서 1회 마운트(로그인 세션 동안 활성).

import React from 'react';
import { AppState } from 'react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/store/auth';
import { useProfile } from '@/store/profile';
import { navigationRef } from '@/navigation/navigationRef';
import { isSupersededByOtherDevice } from '@/lib/singleDevice';

export function useSingleDeviceGuard(): void {
  const user = useAuth((s) => s.user);
  const profileId = useProfile((s) => s.profile?.id);

  React.useEffect(() => {
    if (!user) return;
    let cancelled = false;
    let kicking = false;

    const check = async () => {
      if (cancelled || kicking) return;
      if (await isSupersededByOtherDevice()) {
        if (cancelled || kicking) return;
        kicking = true;
        // 로그아웃 후 안내 화면(Figma 351:5786)으로 reset.
        await useAuth.getState().signOut();
        navigationRef.current?.reset({
          index: 0,
          routes: [{ name: 'OtherDeviceLogin' }],
        });
      }
    };

    void check(); // 진입 시 1회

    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active') void check();
    });

    // realtime — 내 profiles row UPDATE(active_device 변경) 즉시 감지.
    const channel = profileId
      ? supabase
          .channel(`profile-device:${profileId}`)
          .on(
            'postgres_changes' as never,
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'profiles',
              filter: `id=eq.${profileId}`,
            },
            () => void check(),
          )
          .subscribe()
      : null;

    return () => {
      cancelled = true;
      sub.remove();
      if (channel) void supabase.removeChannel(channel);
    };
  }, [user, profileId]);
}
