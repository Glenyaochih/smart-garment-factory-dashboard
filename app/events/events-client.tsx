'use client'

// --- 事件歷史頁客戶端組件 ---
// 功能：事件類型過濾、設備代號搜尋、時間排序顯示
// 數據來源：Zustand store（SSR 初始化 + WS 即時推送合成事件）

import { useRef, useState, useMemo } from 'react'
import { ScrollText, Info, AlertTriangle, XCircle, Search, X } from 'lucide-react'
import { useFactoryStore } from '@/store/factory-store'
import { useFactoryWs } from '@/hooks/use-factory-ws'
import type { EventSnapshot, FactoryInitResponse } from '@/lib/types/factory'
import { KpiHeader } from '@/components/dashboard/kpi-header'

// --- 常數定義 ---
type EventType = EventSnapshot['event_type']

const EVENT_TYPE_CONFIG: Record<EventType, { icon: typeof Info; label: string; colorClass: string; badgeClass: string }> = {
  info: {
    icon: Info,
    label: '一般資訊',
    colorClass: 'text-neon-cyan',
    badgeClass: 'border-neon-cyan/50 bg-neon-cyan/10 text-neon-cyan',
  },
  warning: {
    icon: AlertTriangle,
    label: '警告',
    colorClass: 'text-neon-amber',
    badgeClass: 'border-neon-amber/50 bg-neon-amber/10 text-neon-amber',
  },
  critical: {
    icon: XCircle,
    label: '嚴重',
    colorClass: 'text-neon-red',
    badgeClass: 'border-neon-red/50 bg-neon-red/10 text-neon-red',
  },
}

const EVENT_TYPES: Array<EventType | '全部'> = ['全部', 'info', 'warning', 'critical']

const EVENT_ROW_BG: Record<EventType, string> = {
  info: 'hover:bg-secondary/40',
  warning: 'hover:bg-neon-amber/5',
  critical: 'hover:bg-neon-red/5',
}

// --- 時間格式化（顯示日期 + 時間）---
function formatDateTime(isoStr: string): { date: string; time: string } {
  try {
    const d = new Date(isoStr)
    return {
      date: d.toLocaleDateString('zh-TW', { month: '2-digit', day: '2-digit' }),
      time: d.toLocaleTimeString('zh-TW', { hour12: false }),
    }
  } catch {
    return { date: '—', time: isoStr }
  }
}

// --- 主組件 ---
interface Props {
  initialData: FactoryInitResponse
}

export function EventsClient({ initialData }: Props) {
  const initialize = useFactoryStore((s) => s.initialize)

  // 同步初始化（避免閃爍空白）
  const initializedRef = useRef(false)
  if (!initializedRef.current) {
    initializedRef.current = true
    initialize(initialData)
  }

  useFactoryWs()

  // 過濾狀態
  const [typeFilter, setTypeFilter] = useState<EventType | '全部'>('全部')
  const [assetSearch, setAssetSearch] = useState('')

  const events = useFactoryStore((s) => s.events)
  const wsStatus = useFactoryStore((s) => s.wsStatus)

  // 統計各類型數量
  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = { 全部: events.length }
    for (const e of events) {
      counts[e.event_type] = (counts[e.event_type] ?? 0) + 1
    }
    return counts
  }, [events])

  // 過濾後的事件列表
  const filteredEvents = useMemo(() => {
    let list = events

    if (typeFilter !== '全部') {
      list = list.filter((e) => e.event_type === typeFilter)
    }

    const query = assetSearch.trim().toLowerCase()
    if (query) {
      list = list.filter(
        (e) =>
          e.asset_code?.toLowerCase().includes(query) ||
          e.message_zh.toLowerCase().includes(query)
      )
    }

    return list
  }, [events, typeFilter, assetSearch])

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <KpiHeader />

      <main className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
        {/* 頁面標題 */}
        <div className="flex items-center gap-3">
          <ScrollText className="h-5 w-5 text-neon-cyan" />
          <h1 className="text-lg font-semibold text-foreground">事件記錄</h1>
          <span className="rounded-full bg-secondary px-2 py-0.5 font-mono text-xs text-muted-foreground">
            {filteredEvents.length} / {events.length}
          </span>
          {/* WS 串流狀態 */}
          <div className="ml-auto flex items-center gap-1.5">
            <span
              className={`h-2 w-2 rounded-full ${
                wsStatus === 'connected' ? 'animate-pulse bg-neon-green' : 'bg-neon-red'
              }`}
            />
            <span
              className={`font-mono text-xs ${
                wsStatus === 'connected' ? 'text-neon-green' : 'text-neon-red'
              }`}
            >
              {wsStatus === 'connected' ? '即時串流' : '已斷線'}
            </span>
          </div>
        </div>

        {/* 過濾列 */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* 事件類型過濾 */}
          <div className="flex flex-wrap gap-1.5">
            {EVENT_TYPES.map((t) => {
              const isActive = typeFilter === t
              const config = t !== '全部' ? EVENT_TYPE_CONFIG[t] : null
              return (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className={`rounded-md border px-3 py-1 text-xs font-medium transition-colors ${
                    isActive
                      ? t === '全部'
                        ? 'border-border bg-secondary text-foreground'
                        : (config?.badgeClass ?? '')
                      : 'border-border text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {t === '全部'
                    ? `全部 (${typeCounts['全部'] ?? 0})`
                    : `${config?.label} (${typeCounts[t] ?? 0})`}
                </button>
              )
            })}
          </div>

          {/* 設備/訊息搜尋 */}
          <div className="relative sm:ml-auto sm:w-64">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={assetSearch}
              onChange={(e) => setAssetSearch(e.target.value)}
              placeholder="搜尋設備代號或訊息…"
              className="w-full rounded-md border border-border bg-card py-1.5 pl-8 pr-8 font-mono text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-neon-cyan/50"
            />
            {assetSearch && (
              <button
                onClick={() => setAssetSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* 事件列表 */}
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          {filteredEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16">
              <ScrollText className="h-8 w-8 text-muted-foreground/30" />
              <p className="font-mono text-sm text-muted-foreground">
                {assetSearch || typeFilter !== '全部' ? '無符合條件的事件' : '暫無事件記錄'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredEvents.map((event) => {
                const config = EVENT_TYPE_CONFIG[event.event_type] ?? EVENT_TYPE_CONFIG.info
                const Icon = config.icon
                const { date, time } = formatDateTime(event.occurred_at)

                return (
                  <div
                    key={event.id}
                    className={`flex items-start gap-3 px-4 py-3 transition-colors ${EVENT_ROW_BG[event.event_type]}`}
                  >
                    {/* 類型圖示 */}
                    <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${config.colorClass}`} />

                    {/* 時間戳記 */}
                    <div className="flex w-28 shrink-0 flex-col">
                      <span className="font-mono text-[11px] text-muted-foreground">{date}</span>
                      <span className="font-mono text-xs text-card-foreground">{time}</span>
                    </div>

                    {/* 事件訊息 */}
                    <p className="flex-1 font-mono text-xs text-card-foreground leading-relaxed">
                      {event.message_zh}
                    </p>

                    {/* 設備代號 */}
                    {event.asset_code && (
                      <span className="shrink-0 rounded bg-secondary px-2 py-0.5 font-mono text-[11px] text-muted-foreground">
                        {event.asset_code}
                      </span>
                    )}

                    {/* 事件類型標籤 */}
                    <span
                      className={`shrink-0 rounded border px-1.5 py-0.5 text-[10px] font-medium ${config.badgeClass}`}
                    >
                      {config.label}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* 尾部提示 */}
        {filteredEvents.length > 0 && (
          <p className="text-center font-mono text-[11px] text-muted-foreground">
            顯示最近 {filteredEvents.length} 筆事件 · WS 即時推送新事件至頂端
          </p>
        )}
      </main>
    </div>
  )
}
