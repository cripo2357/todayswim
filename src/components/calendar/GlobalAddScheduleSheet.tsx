// 시간표 타임 더블탭(useAddScheduleIntent)을 앱 어디서든 소비 — 화면 이동 없이
// (내 정보로 안 감) 모달 닫힌 그 자리에서 바로 일정 등록 시트를 띄운다.
// 앱 루트(App.tsx)에 1회 마운트. RN Modal이라 어느 화면 위에서도 동일하게 표시.

import React from 'react';
import { useAddScheduleIntent } from '@/store/addScheduleIntent';
import { AddScheduleSheet } from './AddScheduleSheet';

export function GlobalAddScheduleSheet() {
  const intent = useAddScheduleIntent((s) => s.intent);
  const clearIntent = useAddScheduleIntent((s) => s.clearIntent);
  const [open, setOpen] = React.useState(false);
  const [prefill, setPrefill] = React.useState<{
    poolId: string;
    date: Date;
    start?: string;
    end?: string;
  } | null>(null);

  // 더블탭이 남긴 의도 소비 → 풀+날짜(+더블탭한 타임) 프리필로 시트 오픈, 즉시 clear.
  React.useEffect(() => {
    if (!intent) return;
    const [y, m, d] = intent.date.split('-').map(Number);
    setPrefill({
      poolId: intent.poolId,
      date: new Date(y, m - 1, d),
      start: intent.start,
      end: intent.end,
    });
    clearIntent();
    // 시간표 모달(ScheduleView)이 goBack으로 닫히는 중 — 닫힘 후 등록 시트를 띄워
    // iOS 모달 전환 레이스(멈춤) 회피. 루트 상주 컴포넌트라 cleanup 불필요.
    setTimeout(() => setOpen(true), 320);
  }, [intent, clearIntent]);

  return (
    <AddScheduleSheet
      visible={open}
      onClose={() => {
        setOpen(false);
        setPrefill(null);
      }}
      initialPoolId={prefill?.poolId}
      initialDate={prefill?.date}
      initialStart={prefill?.start}
      initialEnd={prefill?.end}
    />
  );
}
