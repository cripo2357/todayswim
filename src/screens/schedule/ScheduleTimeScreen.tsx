// Figma: 5:15381 (시간표 작성하기 - 타임 입력 모달)
//
// 바텀 드로어 모달 — 시작 시간 + duration 칩 (1/2/3/4시간) + 저장.
// presentation: transparentModal로 RootNavigator에 등록되어 있음.

import React from 'react';
import { View, Text, StyleSheet, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Check } from 'lucide-react-native';

import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { Input } from '@/components/ui/Input';
import { useScheduleDraft } from '@/store/scheduleDraft';
import type { RootStackParamList } from '@/navigation/types';
import type { DayOfWeek } from '@/types/schedule';
import { tokens } from '@/styles/tokens';

const DURATIONS = [1, 2, 3, 4];

export function ScheduleTimeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'ScheduleTime'>>();
  const { daySlot } = route.params;

  const addTimeSlot = useScheduleDraft((s) => s.addTimeSlot);

  const [start, setStart] = React.useState('06:00');
  const [hours, setHours] = React.useState(2);

  const onClose = () => navigation.goBack();
  const onSave = () => {
    const [h, m] = start.split(':').map((n) => parseInt(n, 10));
    if (Number.isNaN(h) || Number.isNaN(m)) return;
    const endH = (h + hours) % 24;
    const end = `${String(endH).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    addTimeSlot(daySlot.day as DayOfWeek, { start, end, hours });
    onClose();
  };

  return (
    <View style={styles.root}>
      {/* 백드롭 */}
      <Pressable onPress={onClose} style={styles.backdrop} />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.heading}>
            {daySlot.day}요일 · {daySlot.period}
          </Text>

          <Input
            label="시작 시간"
            value={start}
            onChangeText={setStart}
            placeholder="06:00"
            keyboardType="numbers-and-punctuation"
            maxLength={5}
          />

          <Text style={[styles.heading, { marginTop: tokens.space[5] }]}>운영 시간</Text>
          <View style={styles.row}>
            {DURATIONS.map((h) => (
              <Chip
                key={h}
                label={`${h}시간`}
                active={h === hours}
                onPress={() => setHours(h)}
              />
            ))}
          </View>

          <View style={{ height: tokens.space[6] }} />

          <Button
            label="추가"
            size="lg"
            fullWidth
            onPress={onSave}
            iconRight={<Check size={18} color={tokens.color.white} strokeWidth={2} />}
          />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
  },
  sheet: {
    backgroundColor: tokens.color.bgPaper,
    borderTopLeftRadius: tokens.radius.xl,
    borderTopRightRadius: tokens.radius.xl,
    padding: tokens.space[6],
    paddingBottom: tokens.space[8],
    ...tokens.shadow.pop,
  },
  handle: {
    width: 40, height: 4,
    borderRadius: 2,
    backgroundColor: tokens.color.lineDefault,
    alignSelf: 'center',
    marginBottom: tokens.space[5],
  },
  heading: {
    ...tokens.text.h4,
    color: tokens.color.ink900,
    marginBottom: tokens.space[3],
  },
  row: { flexDirection: 'row', gap: tokens.space[2], flexWrap: 'wrap' },
});
