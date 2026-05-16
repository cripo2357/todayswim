// 공통 검색-선택 콤보박스 — Figma 122:7490.
// 닫힘: 트리거(선택값 / placeholder + chevron).
// 열림: 트리거 위에 absolute로 "떠서" SearchInput + 결과 리스트 표시 —
//   아래 콘텐츠를 밀지 않아 부모(시트) 높이 불변. 같은 Modal 내 absolute라
//   키보드 정상(중첩 Modal 아님 — [[android_nested_modal_float]]).
// 정렬: 가나다(localeCompare 'ko') / 필터: 대소문자 무시 부분일치.
//
// 사용: <SearchSelect items={pools} value={sel} onChange={...}
//                      keyOf={p=>p.id} labelOf={p=>p.name} placeholder="수영장 이름" />
// 닫힘→열림 리셋이 필요하면 부모에서 key를 바꿔 remount.

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  TextInput,
} from 'react-native';
import IconChevronDown from '@assets/icons/chevron-down.svg';
import { tokens } from '@/styles/tokens';
import { SearchInput } from './SearchInput';

const ITEM_H = 40;
const ITEM_GAP = 4;

interface SearchSelectProps<T> {
  items: T[];
  value: T | null;
  onChange: (item: T) => void;
  keyOf: (item: T) => string;
  labelOf: (item: T) => string;
  /** 트리거 + 검색창 placeholder (예: "수영장 이름") */
  placeholder: string;
  /** 결과 없을 때 문구 (기본 "검색 결과가 없어요.") */
  emptyText?: string;
  /** 한 번에 보일 행 수 (기본 5) */
  visibleRows?: number;
  /** 열림/닫힘 변화 알림 — 부모가 바깥 ScrollView 스크롤 차단 등에 사용 */
  onOpenChange?: (open: boolean) => void;
}

export function SearchSelect<T>({
  items,
  value,
  onChange,
  keyOf,
  labelOf,
  placeholder,
  emptyText = '검색 결과가 없어요.',
  visibleRows = 5,
  onOpenChange,
}: SearchSelectProps<T>) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const inputRef = React.useRef<TextInput>(null);

  const changeOpen = React.useCallback(
    (v: boolean) => {
      setOpen(v);
      onOpenChange?.(v);
    },
    [onOpenChange],
  );

  // 열릴 때 검색창 자동 포커스 (같은 Modal 내 absolute라 키보드 안정).
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

  // 결과 수와 무관하게 카드 높이 일정 (0/1/N개 동일). 행*40 + 간격*4 + 여유4.
  const listHeight =
    visibleRows * ITEM_H + (visibleRows - 1) * ITEM_GAP + ITEM_GAP;

  const pick = (it: T) => {
    onChange(it);
    changeOpen(false);
    setQuery('');
  };

  return (
    <View style={styles.anchor}>
      {/* 트리거는 항상 in-flow(48px 자리 고정) */}
      <Pressable onPress={() => changeOpen(true)} style={styles.trigger}>
        <Text
          style={[styles.triggerText, !value && styles.triggerPlaceholder]}
          numberOfLines={1}
        >
          {value ? labelOf(value) : placeholder}
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
            {filtered.map((it) => (
              <Pressable
                key={keyOf(it)}
                onPress={() => pick(it)}
                style={styles.item}
              >
                <Text style={styles.itemText} numberOfLines={1}>
                  {labelOf(it)}
                </Text>
              </Pressable>
            ))}
            {filtered.length === 0 ? (
              <Text style={styles.empty}>{emptyText}</Text>
            ) : null}
          </ScrollView>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  // 트리거 자리 고정용 relative 컨테이너 — 열림 카드는 이 안에서 absolute로 뜸.
  anchor: { position: 'relative', zIndex: 20 },
  // Figma 122:7490 트리거 — border #CBD5E1 r14 minH48 px12
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
    color: tokens.color.ink900,
  },
  triggerPlaceholder: { color: tokens.color.ink400 },
  // Figma I122:7490;5626:22412 — 흰 카드 border #E2E8F0 r14 p8 gap4 Shadow/lg
  card: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    backgroundColor: tokens.color.white,
    padding: 8,
    gap: 4,
    ...tokens.shadow.lg,
  },
  // 트리거 위(top:0)에 겹쳐 떠서 아래 콘텐츠를 안 밀어 부모 높이 불변.
  // RN 0.83 Fabric은 zIndex로 형제 위 스택 가능 — elevation 제거(elevation은
  // Android에서 boxShadow와 별개로 과한 그림자를 그려 halo가 진해짐).
  cardFloat: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 30,
  },
  listContent: { gap: ITEM_GAP },
  // Figma 5626:22473 — 아이템: 알약 minH40 p8
  item: {
    minHeight: ITEM_H,
    padding: 8,
    borderRadius: 9999,
    justifyContent: 'center',
  },
  // Figma 5544:288 — Medium 16/22 -0.112 #4B5563
  itemText: {
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.112,
    fontFamily: tokens.font.sansMedium,
    color: '#4B5563',
  },
  empty: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: tokens.font.sans,
    color: tokens.color.ink500,
    textAlign: 'center',
    paddingVertical: 16,
  },
});
