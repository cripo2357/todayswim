// 공통 검색-다중선택 콤보박스 — Figma 150:8692 / 154:3850 / 154:4423.
// SearchSelect의 멀티 버전: 같은 트리거+float 패턴 + SearchInput 재사용.
//  - 닫힘: 트리거(placeholder + chevron) + 선택된 항목 리스트(삭제 버튼).
//  - 열림: 트리거 위 absolute 카드(검색 + 체크 가능한 목록). 선택해도 안 닫힘.
// 같은 Modal 내 absolute라 키보드 정상([[android_nested_modal_float]]).
// 정렬 가나다(localeCompare 'ko') / 대소문자 무시 부분일치.

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  TextInput,
} from 'react-native';
import { Check } from 'lucide-react-native';
import IconChevronDown from '@assets/icons/chevron-down.svg';
import { tokens } from '@/styles/tokens';
import { SearchInput } from './SearchInput';

const ITEM_H = 40;
const ITEM_GAP = 4;

interface SearchMultiSelectProps<T> {
  items: T[];
  selected: T[];
  onChange: (next: T[]) => void;
  keyOf: (it: T) => string;
  labelOf: (it: T) => string;
  /** 보조 라벨(상태/핸들 등) — 행 우측 회색 텍스트 */
  subLabelOf?: (it: T) => string | undefined;
  /** 아바타 렌더 (size px). 원형 보더는 컴포넌트가 감쌈 */
  renderAvatar?: (it: T, size: number) => React.ReactNode;
  /** 트리거 + 검색창 placeholder */
  placeholder: string;
  emptyText?: string;
  /** 열림 목록에 한 번에 보일 행 수 (기본 5) */
  visibleRows?: number;
}

export function SearchMultiSelect<T>({
  items,
  selected,
  onChange,
  keyOf,
  labelOf,
  subLabelOf,
  renderAvatar,
  placeholder,
  emptyText = '검색 결과가 없어요.',
  visibleRows = 5,
}: SearchMultiSelectProps<T>) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const inputRef = React.useRef<TextInput>(null);

  React.useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => inputRef.current?.focus(), 60);
    return () => clearTimeout(t);
  }, [open]);

  const sorted = React.useMemo(
    () => [...items].sort((a, b) => labelOf(a).localeCompare(labelOf(b), 'ko')),
    [items, labelOf],
  );
  const q = query.trim().toLowerCase();
  const filtered = q
    ? sorted.filter((it) => labelOf(it).toLowerCase().includes(q))
    : sorted;

  const selectedKeys = new Set(selected.map(keyOf));
  const listHeight =
    visibleRows * ITEM_H + (visibleRows - 1) * ITEM_GAP + ITEM_GAP;

  const toggle = (it: T) => {
    const k = keyOf(it);
    onChange(
      selectedKeys.has(k)
        ? selected.filter((s) => keyOf(s) !== k)
        : [...selected, it],
    );
  };

  const Avatar = ({ it, size }: { it: T; size: number }) => (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}>
      {renderAvatar?.(it, size)}
    </View>
  );

  return (
    <View style={styles.anchor}>
      {/* 트리거 — 항상 placeholder 표시(선택값은 아래 리스트로) */}
      <Pressable onPress={() => setOpen(true)} style={styles.trigger}>
        <Text style={styles.triggerText} numberOfLines={1}>
          {placeholder}
        </Text>
        <IconChevronDown width={20} height={20} />
      </Pressable>

      {open ? (
        <View style={[styles.card, styles.cardFloat]}>
          <SearchInput
            ref={inputRef}
            value={query}
            onChangeText={setQuery}
            placeholder={placeholder}
            autoFocus
          />
          <ScrollView
            style={{ height: listHeight }}
            contentContainerStyle={styles.listContent}
            nestedScrollEnabled
            keyboardShouldPersistTaps="always"
          >
            {filtered.map((it) => {
              const on = selectedKeys.has(keyOf(it));
              const sub = subLabelOf?.(it);
              return (
                <Pressable
                  key={keyOf(it)}
                  onPress={() => toggle(it)}
                  style={styles.row}
                >
                  <View style={[styles.checkbox, on && styles.checkboxOn]}>
                    {on ? (
                      <Check size={11} color={tokens.color.white} strokeWidth={3} />
                    ) : null}
                  </View>
                  <Avatar it={it} size={24} />
                  <Text style={styles.name} numberOfLines={1}>
                    {labelOf(it)}
                  </Text>
                  {sub ? (
                    <Text style={styles.sub} numberOfLines={1}>
                      {sub}
                    </Text>
                  ) : null}
                </Pressable>
              );
            })}
            {filtered.length === 0 ? (
              <Text style={styles.empty}>{emptyText}</Text>
            ) : null}
          </ScrollView>
        </View>
      ) : selected.length > 0 ? (
        // 닫힘 + 선택 있음 → 선택 목록(삭제 버튼). Figma 154:3850
        <View style={styles.selectedList}>
          {selected.map((it) => {
            const sub = subLabelOf?.(it);
            return (
              <View key={keyOf(it)} style={styles.selectedRow}>
                <Avatar it={it} size={24} />
                <Text style={styles.name} numberOfLines={1}>
                  {labelOf(it)}
                </Text>
                {sub ? (
                  <Text style={styles.sub} numberOfLines={1}>
                    {sub}
                  </Text>
                ) : (
                  <View style={styles.subSpacer} />
                )}
                <Pressable
                  onPress={() => toggle(it)}
                  hitSlop={6}
                  style={({ pressed }) => [
                    styles.removeBtn,
                    pressed && { opacity: 0.7 },
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={`${labelOf(it)} 삭제`}
                >
                  <Text style={styles.removeLabel}>삭제</Text>
                </Pressable>
              </View>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  anchor: { position: 'relative', zIndex: 20 },
  // 트리거 — border #CBD5E1 r14 minH48 px12 (SearchSelect와 동일 톤)
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 14,
    backgroundColor: tokens.color.white,
  },
  triggerText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.112,
    fontFamily: tokens.font.sans,
    color: tokens.color.ink400,
  },
  // Figma 154:4423 — 흰 카드 border #E2E8F0 r15 p8 gap4 Shadow/lg
  card: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 15,
    backgroundColor: tokens.color.white,
    padding: 8,
    gap: 4,
    ...tokens.shadow.lg,
  },
  cardFloat: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 30,
    elevation: 24,
  },
  listContent: { gap: ITEM_GAP },
  // Figma 154:4540 — 행: gap8 minH40 p8 rounded-full
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: ITEM_H,
    padding: 8,
    borderRadius: 9999,
  },
  // Figma 154:4546 — 체크박스 원형 16, 미선택 border #CBD5E1 / 선택 bg pd-mint
  checkbox: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: tokens.color.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxOn: {
    backgroundColor: tokens.color.pdMint,
    borderColor: tokens.color.pdMint,
  },
  // 아바타 — 원형 + pd-mint 보더([[profile_border_policy]] 친구=mint)
  avatar: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: tokens.color.pdMint,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  // Figma 154:4544 — Medium 16/22 -0.112 #4B5563
  name: {
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.112,
    fontFamily: tokens.font.sansMedium,
    color: '#4B5563',
  },
  // Figma 154:4545 — Medium 14/20 -0.084 #94A3B8
  sub: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.084,
    fontFamily: tokens.font.sansMedium,
    color: '#94A3B8',
  },
  subSpacer: { flex: 1 },
  empty: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: tokens.font.sans,
    color: tokens.color.ink500,
    textAlign: 'center',
    paddingVertical: 16,
  },
  // Figma 154:3850 — 선택 목록(닫힘): 행 gap8 + 우측 빨강 "삭제"
  selectedList: { gap: 4, paddingTop: 4 },
  selectedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: ITEM_H,
    padding: 8,
  },
  removeBtn: {
    backgroundColor: tokens.color.red,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeLabel: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: -0.06,
    fontFamily: tokens.font.sansSemibold,
    color: tokens.color.white,
  },
});
