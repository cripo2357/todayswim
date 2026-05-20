// 알림 설정 — 설정 > 알림 > 알림 설정 진입.
//
// v1: 마스터 토글 1개("푸시 알림 받기")만. usePrefs.pushOn ↔ 영속.
//     설정 행 아이콘이 bell(ON) ↔ bell-off(OFF)로 스왑.
//
// 잔여 작업(스펙 §1191 — docs/notification-triggers-spec-v0.5.md):
//  · 트리거 그룹화(친구·초대 / 일정 리마인더 / 내 제보 결과 /
//    서비스 안내 / 수영 리포트) — 카테고리별 토글
//  · 광고성 정보(마케팅 동의) 분리 — 정통망법 §50
//  · 끌 수 없는 P0(약관·운영자) 자물쇠 row
//  · 방해 금지 시간(P2)

import React from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { tokens } from '@/styles/tokens';
import { usePrefs } from '@/store/prefs';
import IconBell from '@assets/icons/settings/bell.svg';
import IconBellOff from '@assets/icons/settings/bell-off.svg';

export function NotificationSettingsScreen() {
  const navigation = useNavigation();
  const pushOn = usePrefs((s) => s.pushOn);
  const setPushOn = usePrefs((s) => s.setPushOn);

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <ScreenHeader
        title="알림 설정"
        onBack={() => navigation.goBack()}
      />
      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <View style={styles.rows}>
            <View style={styles.card}>
              <View style={styles.cardLeft}>
                {pushOn ? (
                  <IconBell width={24} height={24} />
                ) : (
                  <IconBellOff width={24} height={24} />
                )}
                <Text style={styles.rowLabel} numberOfLines={1}>
                  푸시 알림 받기
                </Text>
              </View>
              <Toggle on={pushOn} onToggle={() => setPushOn(!pushOn)} />
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <Pressable
      onPress={onToggle}
      accessibilityRole="switch"
      accessibilityState={{ checked: on }}
      style={[
        styles.toggle,
        { backgroundColor: on ? tokens.color.pdMint : '#CBD5E1' },
      ]}
    >
      <View style={[styles.toggleKnob, on ? styles.knobOn : styles.knobOff]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: tokens.color.bgCream },
  body: { padding: 16, gap: 32 },
  section: { gap: 12 },
  rows: { gap: 12 },

  // Settings Simple 카드 — SettingsScreen 컨벤션과 동일(white, r16, px12 py16, gap12)
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: tokens.color.bgPaper,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minWidth: 0,
  },
  rowLabel: {
    flexShrink: 1,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.084,
    fontFamily: tokens.font.sansSemibold,
    color: '#1F2937',
  },

  // Toggle Only — SettingsScreen과 동일(52x28, r123, knob 24 white)
  toggle: {
    width: 52,
    height: 28,
    borderRadius: 123,
    padding: 2,
    justifyContent: 'center',
  },
  toggleKnob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: tokens.color.white,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  knobOn: { alignSelf: 'flex-end' },
  knobOff: { alignSelf: 'flex-start' },
});
