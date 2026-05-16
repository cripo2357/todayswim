// Figma 126:4726 / 126:7261 / 129:3442 — 친구 초대 ② 친구 선택.
// 한 화면이 3상태(0명/검색리스트/N명 선택)를 다 처리. 백엔드 미연동 — 목 친구 풀.

import React from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView, TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ChevronLeft, CalendarCheck, Clock, Trash2, ChevronDown, Mail, MessageCircle,
} from 'lucide-react-native';

import type { RootStackParamList } from '@/navigation/types';
import { Button } from '@/components/ui/Button';
import { MOCK_FRIENDS } from '@/lib/mockData';
import { BUNDLE_AVATARS } from '@/lib/avatars';
import { tokens } from '@/styles/tokens';

const SCHEDULE = {
  pool: 'ABC 수영장',
  date: '2026년 1월 23일 목요일',
  time: '15:00 ~ 18:00',
};

// 초대 대상 = 내 친구 10명 (mockData)
const FRIEND_POOL = MOCK_FRIENDS.map((f) => ({
  id: f.id,
  name: f.name,
  status: f.status,
  avatar: f.avatar,
}));

export function InviteFriendsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [query, setQuery] = React.useState('');
  const [open, setOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<string[]>([]);

  const selectedFriends = FRIEND_POOL.filter((f) => selected.includes(f.id));
  const results = FRIEND_POOL.filter(
    (f) =>
      !selected.includes(f.id) &&
      (query.trim() === '' || f.name.toLowerCase().includes(query.trim().toLowerCase())),
  );

  const toggle = (id: string) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

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
        keyboardShouldPersistTaps="handled"
      >
        {/* 선택된 일정 */}
        <View style={[styles.card, styles.cardSelected]}>
          <View style={styles.cardInfo}>
            <Text style={styles.poolName} numberOfLines={1}>
              {SCHEDULE.pool}
            </Text>
            <View style={styles.metaRow}>
              <CalendarCheck size={16} color={tokens.color.ink500} strokeWidth={2} />
              <Text style={styles.metaText}>{SCHEDULE.date}</Text>
            </View>
            <View style={styles.metaRow}>
              <Clock size={16} color={tokens.color.ink500} strokeWidth={2} />
              <Text style={styles.metaText}>{SCHEDULE.time}</Text>
            </View>
          </View>
          <View style={styles.thumb} />
          <Pressable
            onPress={() => navigation.goBack()}
            style={styles.deleteBtn}
            accessibilityLabel="일정 삭제"
          >
            <Trash2 size={16} color={tokens.color.white} strokeWidth={2} />
          </Pressable>
        </View>

        <Text style={styles.sectionTitle}>초대 친구({selectedFriends.length})</Text>

        {/* 검색/드롭다운 */}
        <Pressable
          style={styles.searchBox}
          onPress={() => setOpen(true)}
        >
          <TextInput
            value={query}
            onChangeText={(v) => {
              setQuery(v);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            placeholder="이름 또는 친구코드"
            placeholderTextColor={tokens.color.ink400}
            style={styles.searchInput}
          />
          <ChevronDown size={20} color={tokens.color.ink500} strokeWidth={2} />
        </Pressable>

        {open && results.length > 0 && (
          <View style={styles.dropdown}>
            {results.map((f) => (
              <Pressable
                key={f.id}
                onPress={() => {
                  toggle(f.id);
                  setQuery('');
                }}
                style={styles.resultRow}
              >
                <View style={styles.avatar}>
                  {React.createElement(BUNDLE_AVATARS[f.avatar], {
                    width: 30,
                    height: 30,
                  })}
                </View>
                <Text style={styles.resultName} numberOfLines={1}>
                  {f.name}
                </Text>
                <Text style={styles.resultStatus} numberOfLines={1}>
                  {f.status}
                </Text>
              </Pressable>
            ))}
          </View>
        )}

        {/* 선택된 친구 */}
        <View style={styles.list}>
          {selectedFriends.map((f) => (
            <View key={f.id} style={styles.friendRow}>
              <View style={styles.avatarLg}>
                {React.createElement(BUNDLE_AVATARS[f.avatar], {
                  width: 44,
                  height: 44,
                })}
              </View>
              <View style={styles.friendInfo}>
                <Text style={styles.friendName} numberOfLines={1}>
                  {f.name}
                </Text>
                <View style={styles.friendStatusRow}>
                  <MessageCircle size={16} color={tokens.color.ink500} strokeWidth={2} />
                  <Text style={styles.friendStatus} numberOfLines={1}>
                    {f.status}
                  </Text>
                </View>
              </View>
              <Pressable
                onPress={() => toggle(f.id)}
                style={styles.deleteBtn}
                accessibilityLabel={`${f.name} 제외`}
              >
                <Trash2 size={16} color={tokens.color.white} strokeWidth={2} />
              </Pressable>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          label="초대장 보내기"
          variant="pdYellow"
          size="lg"
          fullWidth
          disabled={selectedFriends.length === 0}
          onPress={() =>
            navigation.navigate('InviteDone', { count: selectedFriends.length })
          }
          iconRight={<Mail size={18} color={tokens.color.black} strokeWidth={2} />}
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
  body: { paddingHorizontal: 16, paddingBottom: 24, gap: 16 },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: tokens.color.bgPaper,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: tokens.color.lineDefault,
    padding: 16,
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
  deleteBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: tokens.color.red,
    alignItems: 'center',
    justifyContent: 'center',
  },

  sectionTitle: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.084,
    fontFamily: tokens.font.sansBold,
    color: '#1F2937',
  },

  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 48,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#94A3B8',
    backgroundColor: tokens.color.bgPaper,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.112,
    fontFamily: tokens.font.sans,
    color: tokens.color.ink900,
    padding: 0,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: tokens.color.lineDefault,
    borderRadius: 14,
    backgroundColor: tokens.color.bgPaper,
    overflow: 'hidden',
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: tokens.color.pdMint,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  resultName: {
    fontSize: 16,
    lineHeight: 20,
    fontFamily: tokens.font.sansSemibold,
    color: tokens.color.ink900,
  },
  resultStatus: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: tokens.font.sans,
    color: tokens.color.ink400,
  },

  list: { gap: 12 },
  friendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: tokens.color.bgPaper,
    borderRadius: 24,
    padding: 12,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarLg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F8FAFC',
    borderWidth: 2,
    borderColor: tokens.color.pdMint,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  friendInfo: { flex: 1, gap: 4, justifyContent: 'center' },
  friendName: {
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.112,
    fontFamily: tokens.font.sansSemibold,
    color: tokens.color.ink900,
  },
  friendStatusRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  friendStatus: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: tokens.font.sans,
    color: tokens.color.ink500,
  },

  footer: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 16 },
});
