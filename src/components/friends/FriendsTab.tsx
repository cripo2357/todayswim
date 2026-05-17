// Figma 134:9837 — 내 정보 > 친구 탭.
//
// 백엔드 미연동 단계 — Figma 샘플 콘텐츠를 그대로 렌더(디자인 임의 생성 금지).
// 아이콘은 lucide 근사치, 아바타/수영장 사진은 실데이터 없어 중립 placeholder
// (가짜 이미지 발명 안 함). 추후 Figma export SVG/실데이터 연동 시 교체.

import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput } from 'react-native';
import {
  X, Check, Users, ChevronDown, Plus, MessageCircle, User,
} from 'lucide-react-native';
import { MOCK_FRIENDS, MOCK_NON_FRIENDS } from '@/lib/mockData';
import { BUNDLE_AVATARS, type AvatarId } from '@/lib/avatars';
import { RejectFriendModal } from '@/components/friends/RejectFriendModal';
import { tokens } from '@/styles/tokens';

// ── 더미 데이터 (mockData) ────────────────────────────────────
// 새 친구 요청: 친구아닌 계정 일부가 친구 요청한 상태(목)
const NEW_REQUESTS = MOCK_NON_FRIENDS.slice(0, 2).map((a, i) => ({
  id: a.id,
  name: a.name,
  avatar: a.avatar,
  time: i === 0 ? '26.05.11 오전 3:23' : '26.05.10 오후 9:12',
  lines: [`${a.name}님이 친구가 되고 싶어합니다.`, '서로 친구로 추가하겠습니까?'],
}));

// 친구들 수영 일정(목) — 친구 닉네임 활용
const SCHEDULES = [
  {
    id: 's1',
    pool: '올림픽 수영장',
    when: '2026년 1월 23일 목요일, 오전 6시00분',
    chip: { label: '친구에게만 일정 공개', kind: 'select' as const },
    me: '내 닉네임',
    friends: MOCK_FRIENDS.slice(0, 4).map((f) => f.nickname),
  },
  {
    id: 's2',
    pool: '강남구민체육센터',
    when: '2026년 1월 24일 금요일, 오후 8시00분',
    chip: { label: '나도 참여', kind: 'join' as const },
    me: '내 닉네임',
    friends: MOCK_FRIENDS.slice(4, 7).map((f) => f.nickname),
  },
];

// 친구 목록 — 친구 10명
const FRIENDS = MOCK_FRIENDS.map((f) => ({
  id: f.id,
  name: f.name,
  status: f.status,
  avatar: f.avatar,
}));

export function FriendsTab() {
  const [query, setQuery] = React.useState('');
  const [requests, setRequests] = React.useState(NEW_REQUESTS);
  // 거절 확인 모달 대상 (요청 1건) — null이면 모달 닫힘
  const [rejectTarget, setRejectTarget] =
    React.useState<(typeof NEW_REQUESTS)[number] | null>(null);

  const confirmReject = () => {
    if (!rejectTarget) return;
    setRequests((prev) => prev.filter((r) => r.id !== rejectTarget.id));
    setRejectTarget(null);
  };

  return (
    <>
    <ScrollView
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* 새 친구 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>새 친구</Text>

        <View style={styles.list}>
          {requests.map((req) => (
            <View key={req.id} style={styles.card}>
              <Avatar size={40} avatarId={req.avatar} />
              <View style={styles.cardBody}>
                <View style={styles.cardHeadGroup}>
                  <View style={styles.cardHead}>
                    <Text style={styles.notifTitle} numberOfLines={1}>
                      {req.name}
                    </Text>
                    <Text style={styles.time}>{req.time}</Text>
                  </View>
                  <View style={styles.lines}>
                    {req.lines.map((l, i) => (
                      <Text key={i} style={styles.line}>
                        {l}
                      </Text>
                    ))}
                  </View>
                </View>
                <View style={styles.actions}>
                  <Pressable
                    style={styles.badgeOutline}
                    onPress={() => setRejectTarget(req)}
                    accessibilityRole="button"
                    accessibilityLabel={`${req.name} 친구 추가 거절`}
                  >
                    <X size={16} color="#4B5563" strokeWidth={2} />
                    <Text style={styles.badgeOutlineLabel}>거절</Text>
                  </Pressable>
                  <Pressable style={styles.badgeOutline}>
                    <Check size={16} color="#4B5563" strokeWidth={2} />
                    <Text style={styles.badgeOutlineLabel}>친구로 등록</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          ))}
        </View>

        <Pressable style={styles.cta}>
          <Text style={styles.ctaLabel}>친구 추가</Text>
          <Users size={20} color={tokens.color.black} strokeWidth={2} />
        </Pressable>
      </View>

      {/* 친구들 수영 일정 (N) */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          친구들 수영 일정 ({SCHEDULES.length})
        </Text>
        <View style={styles.list}>
          {SCHEDULES.map((s) => (
            <ScheduleCard key={s.id} item={s} />
          ))}
        </View>
      </View>

      {/* 친구 목록 */}
      <View style={styles.section}>
        <Text style={styles.dropdownLabel}>친구 목록</Text>
        <View style={styles.searchBox}>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="닉네임 입력"
            placeholderTextColor="#4B5563"
            style={styles.searchInput}
          />
          <ChevronDown size={20} color="#4B5563" strokeWidth={2} />
        </View>

        <View style={styles.list}>
          {FRIENDS.map((f) => (
            <View key={f.id} style={styles.friendRow}>
              <Avatar size={48} avatarId={f.avatar} />
              <View style={styles.friendInfo}>
                <Text style={styles.friendName} numberOfLines={1}>
                  {f.name}
                </Text>
                <View style={styles.friendStatusRow}>
                  <MessageCircle size={20} color="#4B5563" strokeWidth={2} />
                  <Text style={styles.friendStatus} numberOfLines={1}>
                    {f.status}
                  </Text>
                </View>
              </View>
              <Pressable style={styles.detailBtn}>
                <Text style={styles.detailBtnLabel}>자세히 보기</Text>
              </Pressable>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>

    <RejectFriendModal
      visible={rejectTarget !== null}
      name={rejectTarget?.name ?? ''}
      onReject={confirmReject}
      onLater={() => setRejectTarget(null)}
    />
    </>
  );
}

function Avatar({ size, avatarId }: { size: number; avatarId?: AvatarId }) {
  // 번들 프로필 아바타(있으면) / 없으면 user 글리프 fallback. pdMint 2px ring.
  const Bundle = avatarId ? BUNDLE_AVATARS[avatarId] : null;
  return (
    <View
      style={[
        styles.avatar,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
    >
      {Bundle ? (
        <Bundle width={size - 4} height={size - 4} />
      ) : (
        <User size={size * 0.5} color={tokens.color.ink400} strokeWidth={2} />
      )}
    </View>
  );
}

function MiniAvatar({ name, mine }: { name: string; mine?: boolean }) {
  return (
    <View style={styles.miniRow}>
      <View style={[styles.miniAvatar, mine ? styles.miniMine : styles.miniFriend]}>
        <User size={12} color={tokens.color.ink400} strokeWidth={2} />
      </View>
      <Text style={styles.miniName} numberOfLines={1}>
        {name}
      </Text>
    </View>
  );
}

function ScheduleCard({
  item,
}: {
  item: (typeof SCHEDULES)[number];
}) {
  return (
    <View style={styles.schedCard}>
      <View style={styles.schedTop}>
        <View style={styles.schedInfo}>
          <Text style={styles.schedPool} numberOfLines={1}>
            {item.pool}
          </Text>
          <Text style={styles.schedWhen} numberOfLines={1}>
            {item.when}
          </Text>
          <Pressable style={styles.schedChip}>
            <Text style={styles.schedChipLabel}>{item.chip.label}</Text>
            {item.chip.kind === 'join' ? (
              <Plus size={12} color={tokens.color.pdBlue} strokeWidth={2} />
            ) : (
              <ChevronDown size={12} color={tokens.color.pdBlue} strokeWidth={2} />
            )}
          </Pressable>
        </View>
        <View style={styles.schedThumb} />
      </View>

      <View style={styles.schedPeople}>
        <MiniAvatar name={item.me} mine />
        <View style={styles.schedDivider} />
        <View style={styles.schedFriends}>
          {item.friends.map((f, i) => (
            <MiniAvatar key={i} name={f} />
          ))}
        </View>
      </View>
    </View>
  );
}

const SHADOW_MD = {
  shadowColor: '#0F172A',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.06,
  shadowRadius: 8,
  elevation: 2,
} as const;

const styles = StyleSheet.create({
  scroll: { padding: 16, gap: 32 },

  section: { gap: 12 },
  // Section Header — Bold 14/20 -0.084 #1F2937
  sectionTitle: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.084,
    fontFamily: tokens.font.sansBold,
    color: '#1F2937',
  },
  list: { gap: 12 },

  // 새 친구 카드 — white r24 p16 Shadow/md
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: tokens.color.bgPaper,
    borderRadius: 24,
    padding: 16,
    ...SHADOW_MD,
  },
  cardBody: { flex: 1, gap: 12 },
  cardHeadGroup: { gap: 6 },
  cardHead: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  notifTitle: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.084,
    fontFamily: tokens.font.sansSemibold,
    color: '#1F2937',
  },
  time: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: -0.06,
    fontFamily: tokens.font.sans,
    color: '#4B5563',
  },
  lines: { gap: 2 },
  line: {
    fontSize: 14,
    lineHeight: 22,
    fontFamily: tokens.font.sans,
    color: '#4B5563',
  },
  actions: { flexDirection: 'row', gap: 12 },
  badgeOutline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  badgeOutlineLabel: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.084,
    fontFamily: tokens.font.sansMedium,
    color: '#4B5563',
  },

  // 친구 추가 CTA — pdByellow h48 r14
  cta: {
    height: 48,
    borderRadius: 14,
    backgroundColor: tokens.color.pdByellow,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 20,
  },
  ctaLabel: {
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.112,
    fontFamily: tokens.font.sansBold,
    color: tokens.color.black,
  },

  // 아바타 placeholder — pdMint 2px ring
  avatar: {
    borderWidth: 2,
    borderColor: tokens.color.pdMint,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  // 친구들 수영 일정 카드 — white r16 p16 Shadow/lg
  schedCard: {
    backgroundColor: tokens.color.bgPaper,
    borderRadius: 16,
    padding: 16,
    gap: 7,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  },
  schedTop: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  schedInfo: { flex: 1, gap: 10 },
  schedPool: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.084,
    fontFamily: tokens.font.sansBold,
    color: '#1F2937',
  },
  schedWhen: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: -0.06,
    fontFamily: tokens.font.sans,
    color: '#1F2937',
  },
  schedChip: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: tokens.color.pdBlue,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  schedChipLabel: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: -0.06,
    fontFamily: tokens.font.sansMedium,
    color: tokens.color.pdBlue,
  },
  schedThumb: {
    width: 80,
    height: 80,
    borderRadius: 6,
    backgroundColor: '#E2E8F0',
  },
  schedPeople: { gap: 7 },
  schedDivider: { height: 1, backgroundColor: tokens.color.lineDefault },
  schedFriends: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  miniRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    maxWidth: 120,
  },
  miniAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniMine: { borderColor: tokens.color.pdByellow },
  miniFriend: { borderColor: tokens.color.pdMint },
  miniName: {
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: -0.04,
    fontFamily: tokens.font.sansBold,
    color: '#1F2937',
  },

  // 친구 목록 검색 — white border #94A3B8 r14
  dropdownLabel: {
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
    color: '#1F2937',
    padding: 0,
  },

  // 친구 행 — white r24 p12 h72 Shadow/md
  friendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    height: 72,
    padding: 12,
    borderRadius: 24,
    backgroundColor: tokens.color.bgPaper,
    ...SHADOW_MD,
  },
  friendInfo: { flex: 1, gap: 4, justifyContent: 'center' },
  friendName: {
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.112,
    fontFamily: tokens.font.sansSemibold,
    color: '#1F2937',
  },
  friendStatusRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  friendStatus: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.084,
    fontFamily: tokens.font.sans,
    color: '#4B5563',
  },
  detailBtn: {
    backgroundColor: tokens.color.pdMint,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  detailBtnLabel: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: -0.06,
    fontFamily: tokens.font.sansSemibold,
    color: tokens.color.white,
  },
});
