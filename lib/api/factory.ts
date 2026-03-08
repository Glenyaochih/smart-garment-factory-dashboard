// --- 工廠 API 工具函式 ---
// fetchFactoryInit: 供 Server Component 使用（SSR）
// fetchWsTicket / buildWsUrl: 供 Client Hook 使用

import type { ApiResponse, FactoryInitResponse } from '@/lib/types/factory'

// NEXT_PUBLIC_ 開頭的環境變數在 server/client 兩端均可存取
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000'

export async function fetchFactoryInit(): Promise<FactoryInitResponse> {
  const res = await fetch(`${API_BASE}/api/v1/factory/init`, {
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`Factory init failed: ${res.status}`)
  const json: ApiResponse<FactoryInitResponse> = await res.json()
  if (!json.success || !json.data) throw new Error(json.error ?? 'Unknown error')
  return json.data
}

export async function fetchWsTicket(): Promise<string> {
  const res = await fetch(`${API_BASE}/api/v1/factory/ws-ticket`, {
    method: 'POST',
  })
  if (!res.ok) throw new Error(`WS ticket failed: ${res.status}`)
  const json: ApiResponse<{ ticket: string; ttl_seconds: number }> = await res.json()
  if (!json.success || !json.data) throw new Error(json.error ?? 'Unknown error')
  return json.data.ticket
}

export function buildWsUrl(ticket: string): string {
  // 將 http(s) → ws(s)，預設 ws://localhost:8000
  const wsBase = API_BASE.replace(/^http/, 'ws')
  return `${wsBase}/api/v1/factory/ws/factory/stream?ticket=${ticket}`
}
