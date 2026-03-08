// --- 工廠 API TypeScript 型別定義 ---
// 對應後端 app/schemas/factory.py

export interface AssetSnapshot {
  asset_id: string
  asset_code: string
  name_zh: string
  zone_code: string | null
  status: 'running' | 'warning' | 'maintenance' | 'offline'
  temperature: number | null
  utilization_pct: number | null
  wip_count: number | null
  speed_mps: number | null
  last_seen_at: string | null
}

export interface KpiSnapshot {
  oee: number | null
  order_completion_rate: number | null
  daily_output: number | null
  system_health: number | null
}

export interface EventSnapshot {
  id: number
  occurred_at: string
  event_type: 'info' | 'warning' | 'critical'
  message_zh: string
  asset_code: string | null
}

export interface FactoryInitResponse {
  last_event_id: number
  kpi: KpiSnapshot
  assets: AssetSnapshot[]
  recent_events: EventSnapshot[]
}

export interface ApiResponse<T> {
  success: boolean
  request_id: string
  data: T | null
  error: string | null
}

// WS 廣播更新（不含 zone_code，由前端從 init 保留）
export interface WsAssetUpdate {
  asset_id: string
  asset_code: string
  name_zh: string
  status: string
  temperature: number | null
  utilization_pct: number | null
  wip_count: number | null
  speed_mps: number | null
  last_seen_at: string | null
}

export type WsMessage =
  | {
      type: 'batch_update'
      event_id: number
      updates: WsAssetUpdate[]
      timestamp: string
    }
  | { type: 'heartbeat' }
