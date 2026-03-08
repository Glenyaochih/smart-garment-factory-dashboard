// --- 工廠全域狀態管理（Zustand）---
// 單一真相來源：assets、kpi、events、wsStatus
// initialize: SSR 初始化（page.tsx → DashboardClient）
// applyWsUpdates: WS batch_update 合併更新（保留 zone_code）

import { create } from 'zustand'
import type {
  AssetSnapshot,
  EventSnapshot,
  FactoryInitResponse,
  KpiSnapshot,
  WsAssetUpdate,
} from '@/lib/types/factory'

export type WsStatus = 'connecting' | 'connected' | 'disconnected'

interface FactoryState {
  assets: Record<string, AssetSnapshot>   // keyed by asset_id
  kpi: KpiSnapshot | null
  events: EventSnapshot[]
  lastEventId: number
  wsStatus: WsStatus

  initialize: (data: FactoryInitResponse) => void
  applyWsUpdates: (updates: WsAssetUpdate[], eventId: number) => void
  setWsStatus: (status: WsStatus) => void
}

const STATUS_LABEL: Record<string, string> = {
  warning: '警告',
  maintenance: '維護中',
  offline: '離線',
}

export const useFactoryStore = create<FactoryState>((set) => ({
  assets: {},
  kpi: null,
  events: [],
  lastEventId: 0,
  wsStatus: 'disconnected',

  initialize: (data) => {
    const assetsMap: Record<string, AssetSnapshot> = {}
    for (const asset of data.assets) {
      assetsMap[asset.asset_id] = asset
    }
    set({
      assets: assetsMap,
      kpi: data.kpi,
      events: data.recent_events,
      lastEventId: data.last_event_id,
    })
  },

  applyWsUpdates: (updates, eventId) => {
    set((state) => {
      const newAssets = { ...state.assets }
      const syntheticEvents: EventSnapshot[] = []

      for (const update of updates) {
        const existing = newAssets[update.asset_id]

        // 偵測狀態變化 → 產生前端合成事件
        if (
          existing &&
          existing.status !== update.status &&
          STATUS_LABEL[update.status]
        ) {
          syntheticEvents.push({
            id: Date.now() + Math.random(), // 合成 ID，不與後端衝突
            occurred_at: update.last_seen_at ?? new Date().toISOString(),
            event_type: update.status === 'offline' ? 'warning' : (update.status as EventSnapshot['event_type']),
            message_zh: `${update.name_zh} (${update.asset_code}) 狀態變更為 ${STATUS_LABEL[update.status]}`,
            asset_code: update.asset_code,
          })
        }

        // 合併更新：保留 zone_code（WS 不含此欄位）
        newAssets[update.asset_id] = {
          ...update,
          zone_code: existing?.zone_code ?? null,
          status: update.status as AssetSnapshot['status'],
        }
      }

      const events =
        syntheticEvents.length > 0
          ? [...syntheticEvents, ...state.events].slice(0, 50)
          : state.events

      return {
        assets: newAssets,
        events,
        lastEventId: Math.max(state.lastEventId, eventId),
      }
    })
  },

  setWsStatus: (status) => set({ wsStatus: status }),
}))
