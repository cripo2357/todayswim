// 새 친구 추가 시트 — Figma 168:7488(닉네임) / 168:9186(선택) / 168:9354(ID).
//
// 공통 BottomSheet 쉘(핸들·r32·헤더 "새 친구 추가"+X) + 세그먼트 탭
// [닉네임으로 찾기 | ID로 찾기] + "새 친구" 라벨/안내 + 검색 + 하단
// "초대장 보내기"(user-double). 전송 = useFriends.sendRequest →
// 부모가 FriendRequestSentModal(169:5727) 노출 (OtherUserProfile 동일 플로우).
//
// Phase-1: friendSearch(목업). 서버 조회/상대 비공개 게이팅은 Phase-2 갭.
// 아바타 외곽선: 비친구라 profile_border_policy 따라 relation="other"(pd-gray).
// (이 Figma는 mint로 그려졌으나 전역 테두리 정책 우선 — 불일치 메모.)

import React from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Search, Check } from 'lucide-react-native';
import IconUserDouble from '@assets/icons/user-double.svg';
import IconChevronDown from '@assets/icons/chevron-down.svg';
import { tokens } from '@/styles/tokens';
import { BottomSheet, SheetCtaButton } from '@/components/ui/BottomSheet';
import { Avatar } from '@/components/ui/Avatar';
import { useFriends } from '@/store/friends';
import {
  searchByNickname,
  findByCode,
  sanitizeCode,
  type FriendSearchUser,
} from '@/lib/friendSearch';

// 시트가 너무 짧고 탭 전환마다 높이가 튀던 문제 — 길게 고정(Figma
// 168:9186 = 화면의 ~78%, 본문 minHeight 로 근사).
const SHEET_MIN_H = Math.round(Dimensions.get('window').height * 0.72);

type Tab = 'nickname' | 'id';

export function AddFriendSheet({
  visible,
  onClose,
  onSent,
}: {
  visible: boolean;
  onClose: () => void;
  /** 요청 전송 완료 — 부모가 완료 모달 노출 */
  onSent: (name: string) => void;
}) {
  const friends = useFriends((s) => s.friends);
  const blocked = useFriends((s) => s.blocked);
  const sendRequest = useFriends((s) => s.sendRequest);

  const opts = React.useMemo(
    () => ({ friendIds: friends.map((f) => f.id), blockedIds: blocked }),
    [friends, blocked],
  );

  const [tab, setTab] = React.useState<Tab>('nickname');
  const [nq, setNq] = React.useState('');
  const [selId, setSelId] = React.useState<string | null>(null);
  const [code, setCode] = React.useState('');
  const [idErr, setIdErr] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!visible) {
      setTab('nickname');
      setNq('');
      setSelId(null);
      setCode('');
      setIdErr(null);
    }
  }, [visible]);

  const results = React.useMemo(
    () => searchByNickname(nq, opts),
    [nq, opts],
  );
  const selected = results.find((r) => r.id === selId) ?? null;

  const send = (u: FriendSearchUser) => {
    sendRequest(u.id);
    onSent(u.name);
  };

  const onCta = () => {
    if (tab === 'nickname') {
      if (selected) send(selected);
      return;
    }
    const u = findByCode(code, opts);
    if (!u) {
      setIdErr('해당 ID의 사용자를 찾을 수 없습니다.');
      return;
    }
    send(u);
  };

  const ctaDisabled =
    tab === 'nickname' ? !selected : code.length !== 6;

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="새 친구 추가"
      contentStyle={styles.sheet}
      minHeight={SHEET_MIN_H}
    >
      {/* 세그먼트 탭 — Figma 168:9196 wrapper px16 py8 (탭 그룹 좌우 인셋) */}
      <View style={styles.tabWrap}>
      <View style={styles.tabGroup}>
        {(['nickname', 'id'] as const).map((t) => {
          const active = tab === t;
          return (
            <Pressable
              key={t}
              onPress={() => {
                setTab(t);
                setIdErr(null);
              }}
              style={[styles.tab, active && styles.tabActive]}
              accessibilityRole="button"
            >
              <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>
                {t === 'nickname' ? '닉네임으로 찾기' : 'ID로 찾기'}
              </Text>
            </Pressable>
          );
        })}
      </View>
      </View>

      {/* "새친구" 라벨 + 안내 + 검색 본문 (Figma 168:9297 gap 8) */}
      <View style={styles.group}>
        <View style={styles.secRow}>
          <Text style={styles.secLabel}>새친구</Text>
          <Text style={styles.secHint} numberOfLines={1}>
            기존 친구와 비공개 사용자는 검색되지 않습니다.
          </Text>
        </View>

        {tab === 'nickname' ? (
          <>
            <View style={styles.pill}>
              <View style={styles.pillInputWrap}>
                <TextInput
                  value={nq}
                  onChangeText={(v) => {
                    setNq(v);
                    setSelId(null);
                  }}
                  style={styles.pillInput}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="search"
                />
                {/* RN Android placeholder 커스텀폰트 미적용 → Pretendard
                    Text 오버레이(앱 공통, 두 탭 동일 디자인). */}
                {nq.length === 0 ? (
                  <Text style={styles.pillPlaceholder} pointerEvents="none">
                    닉네임
                  </Text>
                ) : null}
              </View>
              {/* Figma 168:9305 — 닉네임은 타이프어헤드(드롭다운) caret */}
              <IconChevronDown width={20} height={20} />
            </View>
            {results.length > 0 ? (
              <ScrollView
                style={styles.list}
                keyboardShouldPersistTaps="handled"
                nestedScrollEnabled
              >
                {results.map((u) => {
                  const sel = u.id === selId;
                  return (
                    <Pressable
                      key={u.id}
                      onPress={() => setSelId(u.id)}
                      style={[styles.item, sel && styles.itemSel]}
                      accessibilityRole="button"
                    >
                      <View style={styles.itemLeft}>
                        <Avatar
                          photoUri={u.avatar}
                          size={24}
                          relation="other"
                          borderWidth={1}
                        />
                        <Text style={styles.itemName} numberOfLines={1}>
                          {u.name}
                        </Text>
                      </View>
                      {sel ? (
                        <Check
                          size={16}
                          color={tokens.color.ink700}
                          strokeWidth={2.4}
                        />
                      ) : (
                        <Text style={styles.itemSub} numberOfLines={1}>
                          {u.status}
                        </Text>
                      )}
                    </Pressable>
                  );
                })}
              </ScrollView>
            ) : nq.trim() ? (
              <Text style={styles.empty}>검색 결과가 없습니다.</Text>
            ) : null}
          </>
        ) : (
          <>
            <View style={styles.pill}>
              <View style={styles.pillInputWrap}>
                <TextInput
                  value={code}
                  onChangeText={(v) => {
                    setCode(sanitizeCode(v));
                    setIdErr(null);
                  }}
                  style={styles.pillInput}
                  autoCapitalize="characters"
                  autoCorrect={false}
                  maxLength={6}
                  returnKeyType="search"
                />
                {code.length === 0 ? (
                  <Text style={styles.pillPlaceholder} pointerEvents="none">
                    정확한 ID 6자리
                  </Text>
                ) : null}
              </View>
              {/* ID는 6자리 정확 조회 → 검색 아이콘(168:9354 확인 전 잠정) */}
              <Search size={20} color={tokens.color.ink400} strokeWidth={2} />
            </View>
            {idErr ? <Text style={styles.errText}>{idErr}</Text> : null}
          </>
        )}
      </View>

      <SheetCtaButton
        label="초대장 보내기"
        icon={<IconUserDouble width={20} height={20} />}
        onPress={onCta}
        disabled={ctaDisabled}
      />
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  // Figma 168:7495 — 섹션 간 gap 32 (BottomSheet 기본 24 override)
  sheet: { paddingHorizontal: 16, paddingTop: 24, paddingBottom: 24, gap: 32 },

  // Figma 168:9196 — Tab Group 래퍼: px16 py8 (탭 그룹 좌우 인셋)
  tabWrap: { paddingHorizontal: 16, paddingVertical: 8 },
  // Figma 168:9155 — Tab Group: bg #F1F5F9 r18 p4
  tabGroup: {
    flexDirection: 'row',
    backgroundColor: tokens.color.lineSubtle,
    borderRadius: 18,
    padding: 4,
  },
  tab: {
    flex: 1,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // 활성 탭 — 흰 bg + Shadow/md
  tabActive: {
    backgroundColor: tokens.color.white,
    ...tokens.shadow.md,
  },
  tabLabel: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.084,
    fontFamily: tokens.font.sansSemibold,
    color: tokens.color.ink700,
  },
  tabLabelActive: { color: tokens.color.ink900 },

  // flex:1 — 시트 minHeight 고정 시 본문이 늘어 CTA가 하단에 고정.
  group: { gap: 8, flex: 1 },
  // Figma 168:7500 — "새 친구" + 우측 안내
  secRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  secLabel: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.084,
    fontFamily: tokens.font.sansSemibold,
    color: tokens.color.ink700,
  },
  secHint: {
    flex: 1,
    textAlign: 'right',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: -0.06,
    fontFamily: tokens.font.sans,
    color: tokens.color.ink500,
  },

  // Figma 168:9301 _InputTextBase — 흰 박스, border #94A3B8, r14, minH48,
  // p12, gap12. 닉네임/ID 두 탭 "동일" 컴포넌트(과거 탭별 불일치 통일).
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 48,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#94A3B8',
    borderRadius: 14,
    backgroundColor: tokens.color.white,
  },
  pillInputWrap: { flex: 1, justifyContent: 'center' },
  // Figma Text md/Regular 16/22 #1F2937 입력값
  pillInput: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.112,
    fontFamily: tokens.font.sans,
    color: tokens.color.ink900,
    padding: 0,
  },
  // RN Android placeholder 커스텀폰트 미적용 → Pretendard Text 오버레이
  // (앱 공통, 두 탭 동일). Figma: Regular 16 #4B5563.
  pillPlaceholder: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    textAlignVertical: 'center',
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.112,
    fontFamily: tokens.font.sans,
    color: '#4B5563',
    includeFontPadding: false,
  },
  // Figma 168:9306 — 결과 목록 영역 h200
  list: { maxHeight: 200 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    minHeight: 40,
    paddingHorizontal: 8,
    borderRadius: tokens.radius.pill,
  },
  itemSel: { backgroundColor: tokens.color.lineSubtle },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 1,
  },
  itemName: {
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.112,
    fontFamily: tokens.font.sansMedium,
    color: tokens.color.ink700,
    flexShrink: 1,
  },
  itemSub: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.084,
    fontFamily: tokens.font.sansMedium,
    color: tokens.color.ink400,
  },
  empty: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: tokens.font.sans,
    color: tokens.color.ink400,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  errText: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: tokens.font.sans,
    color: tokens.color.red,
    paddingHorizontal: 4,
  },
});
