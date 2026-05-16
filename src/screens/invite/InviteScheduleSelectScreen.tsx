// Figma 126:4221 — 친구 초대 ① 초대할 일정 선택.
// 백엔드 미연동 — Figma 샘플 일정 그대로. 라디오 단일 선택 → 다음(친구 선택).

import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, CalendarCheck, Clock, Check } from 'lucide-react-native';

import type { RootStackParamList } from '@/navigation/types';
import { Button } from '@/components/ui/Button';
import { tokens } from '@/styles/tokens';

const SCHEDULES = [
  { id: 'a', pool: 'ABC 수영장', date: '2026년 1월 23일 목요일', time: '15:00 ~ 18:00' },
  { id: 'b', pool: 'ABC 수영장', date: '2026년 1월 23일 목요일', time: '15:00 ~ 18:00' },
];

export function InviteScheduleSelectScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [selected, setSelected] = React.useState<string | null>(SCHEDULES[0].id);

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <View style={styles.headerRow}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8} accessibilityLabel="뒤로">
          <ChevronLeft size={24} color={tokens.color.ink900} strokeWidth={1.5} />
        </Pressable>
      </View>
      <Text style={styles.pageTitle}>친구 초대</Text>

      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>초대할 일정</Text>
        <View style={styles.list}>
          {SCHEDULES.map((s) => {
            const sel = s.id === selected;
            return (
              <Pressable
                key={s.id}
                onPress={() => setSelected(s.id)}
                style={[styles.card, sel && styles.cardSelected]}
              >
                <View style={styles.cardInfo}>
                  <Text style={styles.poolName} numberOfLines={1}>
                    {s.pool}
                  </Text>
                  <View style={styles.metaRow}>
                    <CalendarCheck size={16} color={tokens.color.ink500} strokeWidth={2} />
                    <Text style={styles.metaText}>{s.date}</Text>
                  </View>
                  <View style={styles.metaRow}>
                    <Clock size={16} color={tokens.color.ink500} strokeWidth={2} />
                    <Text style={styles.metaText}>{s.time}</Text>
                  </View>
                </View>
                <View style={styles.thumb} />
                <View style={[styles.radio, sel && styles.radioOn]}>
                  {sel && <Check size={14} color={tokens.color.white} strokeWidth={3} />}
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          label="초대할 일정 선택"
          variant="pdYellow"
          size="lg"
          fullWidth
          disabled={!selected}
          onPress={() => navigation.navigate('InviteFriends')}
          iconRight={<Check size={18} color={tokens.color.black} strokeWidth={2.4} />}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: tokens.color.bgCream },
  headerRow: { paddingHorizontal: 16, paddingVertical: 8, minHeight: 48, justifyContent: 'center' },
  pageTitle: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.56,
    fontFamily: tokens.font.sansBold,
    color: '#1F2937',
  },
  body: { paddingHorizontal: 16, paddingBottom: 24, gap: 12 },
  sectionTitle: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.084,
    fontFamily: tokens.font.sansBold,
    color: '#1F2937',
  },
  list: { gap: 12 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: tokens.color.bgPaper,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: tokens.color.lineDefault,
    padding: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardSelected: { borderColor: tokens.color.pdMint, borderWidth: 1.5 },
  cardInfo: { flex: 1, gap: 6 },
  poolName: {
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.112,
    fontFamily: tokens.font.sansBold,
    color: tokens.color.ink900,
  },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: tokens.font.sans,
    color: tokens.color.ink500,
  },
  thumb: { width: 64, height: 64, borderRadius: 8, backgroundColor: '#E2E8F0' },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    backgroundColor: tokens.color.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOn: {
    backgroundColor: tokens.color.pdMint,
    borderColor: tokens.color.pdMint,
  },
  footer: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 16 },
});
