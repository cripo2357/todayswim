// 수영장 마커 오른쪽 프로필 스택 — Figma 173:13595 / 13735 / 13797.
//
// 레이아웃(Figma 메타데이터 기준): 컨테이너 110×100. 아바타 20×20,
// 가로 스텝 18(2px 겹침), 6열 × 5행, 행 높이 20(세로 비겹침).
// 맨 왼쪽 아래부터 6명씩 위로 쌓음. 최대 29명 + 우상단 "… more"(30번째 칸).
// 순서·cap·overflow 는 buildPoolProfileStacks 가 확정해 넘김.

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Avatar } from '@/components/ui/Avatar';
import type { StackEntry } from '@/lib/mapProfileStacks';
import { tokens } from '@/styles/tokens';

const AV = 20; // 아바타 지름 (Figma 173:13711)
const STEP = 17; // 가로 배치 간격 (3px 겹침 — 사용자 튜닝)
const ROW_H = 20; // 행 높이 (세로 비겹침)
const COLS = 6;
const ROWS = 5;

/** 스택 컨테이너 폭/높이 (MapScreen anchor 계산에 사용). */
export const STACK_W = (COLS - 1) * STEP + AV; // 110
export const STACK_H = ROWS * ROW_H; // 100

/** index → 셀 위치. r=0 이 맨 아래 행, 행 안에서는 왼→오.
 *  레이어(사용자 확정): 한 줄 6명 중 맨 오른쪽(c=5)이 최상단,
 *  왼쪽으로 갈수록 한 단계씩 아래, 맨 왼쪽(c=0)이 최하단.
 *  → zIndex=c. 렌더 순서도 왼→오라 오른쪽이 마지막에 그려져
 *  paint 순서로도 동일(캡처 방식 무관 결정적). Figma 173:13745
 *  flex + mr-[-2px] 와 일치. */
function cellPos(i: number): { left: number; top: number; z: number } {
  const r = Math.floor(i / COLS);
  const c = i % COLS;
  return { left: c * STEP, top: STACK_H - AV - r * ROW_H, z: c };
}

export function MapProfileStack({
  entries,
  overflow,
}: {
  entries: StackEntry[];
  overflow: boolean;
}) {
  return (
    <View style={styles.box}>
      {entries.map((e, i) => {
        const { left, top, z } = cellPos(i);
        return (
          <View
            key={e.userId}
            style={[styles.cell, { left, top, zIndex: z }]}
          >
            <Avatar photoUri={e.photoUri} size={AV} relation={e.relation} />
          </View>
        );
      })}
      {overflow ? (
        // 30번째 칸(맨 윗줄 6번째 = 우상단). Figma 173:13752 —
        // pd-mint 원 + 점 3개("… more"). bg=pd-mint(Figma 확정).
        <View
          style={[
            styles.cell,
            styles.more,
            { left: (COLS - 1) * STEP, top: 0, zIndex: 0 },
          ]}
        >
          <View style={styles.moreDot} />
          <View style={styles.moreDot} />
          <View style={styles.moreDot} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { width: STACK_W, height: STACK_H },
  cell: { position: 'absolute', width: AV, height: AV },
  more: {
    borderRadius: AV / 2,
    backgroundColor: tokens.color.pdMint,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  moreDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: tokens.color.white,
  },
});
