// 앱 상태(점검 / 강제 업데이트) 단일 행 fetch.
// 부팅 시 Splash에서 1회 호출 (fetchAppStatus). 런타임 폴링은 useAppStatus 훅으로 5분 주기.

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface AppStatus {
  maintenanceActive: boolean;
  maintenanceLabel: string | null;
  minAppVersion: string | null;
  iosStoreUrl: string | null;
  androidStoreUrl: string | null;
  /** 후원 계좌 — 셋 다 있어야 후원 화면 카드 노출(0068). */
  donationBank: string | null;
  donationAccount: string | null;
  donationHolder: string | null;
}

interface AppStatusRow {
  maintenance_active: boolean;
  maintenance_label: string | null;
  min_app_version: string | null;
  ios_store_url: string | null;
  android_store_url: string | null;
  donation_bank: string | null;
  donation_account: string | null;
  donation_holder: string | null;
}

function rowToStatus(row: AppStatusRow): AppStatus {
  return {
    maintenanceActive: row.maintenance_active,
    maintenanceLabel: row.maintenance_label,
    minAppVersion: row.min_app_version,
    iosStoreUrl: row.ios_store_url,
    androidStoreUrl: row.android_store_url,
    donationBank: row.donation_bank,
    donationAccount: row.donation_account,
    donationHolder: row.donation_holder,
  };
}

export async function fetchAppStatus(): Promise<AppStatus | null> {
  const { data, error } = await supabase
    .from('app_status')
    .select(
      'maintenance_active, maintenance_label, min_app_version, ios_store_url, android_store_url, donation_bank, donation_account, donation_holder',
    )
    .eq('id', 1)
    .maybeSingle();
  if (error || !data) return null;
  return rowToStatus(data as AppStatusRow);
}

export function useAppStatus() {
  return useQuery({
    queryKey: ['app_status'],
    queryFn: fetchAppStatus,
    staleTime: 60_000,
    refetchInterval: 5 * 60_000,
  });
}
