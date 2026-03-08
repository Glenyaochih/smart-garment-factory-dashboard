'use client'

import { useRef, useEffect } from 'react'
import { Terminal, Info, AlertTriangle, XCircle } from 'lucide-react'
import { useFactoryStore } from '@/store/factory-store'
import type { EventSnapshot } from '@/lib/types/factory'

type EventType = EventSnapshot['event_type']

const typeConfig: Record<EventType, { icon: typeof Info; colorClass: string }> = {
  info: { icon: Info, colorClass: 'text-neon-cyan' },
  warning: { icon: AlertTriangle, colorClass: 'text-neon-amber' },
  critical: { icon: XCircle, colorClass: 'text-neon-red' },
}

function formatTime(isoStr: string): string {
  try {
    return new Date(isoStr).toLocaleTimeString('zh-TW', { hour12: false })
  } catch {
    return isoStr
  }
}

export function EventLog() {
  const events = useFactoryStore((s) => s.events)
  const wsStatus = useFactoryStore((s) => s.wsStatus)
  const scrollRef = useRef<HTMLDivElement>(null)

  // 新事件到達時自動滾至頂端
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }, [events.length])

  return (
    <section className="flex flex-col rounded-lg border border-border bg-card" aria-label="系統事件記錄">
      <div className="flex items-center justify-between border-b border-border px-4 py-2">
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4 text-neon-cyan" />
          <h2 className="text-sm font-semibold text-card-foreground">系統事件記錄</h2>
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className={`h-2 w-2 rounded-full ${
              wsStatus === 'connected' ? 'animate-pulse bg-neon-green' : 'bg-neon-red'
            }`}
          />
          <span className={`font-mono text-[10px] ${wsStatus === 'connected' ? 'text-neon-green' : 'text-neon-red'}`}>
            {wsStatus === 'connected' ? '串流中' : '已斷線'}
          </span>
        </div>
      </div>

      <div ref={scrollRef} className="max-h-40 flex-1 overflow-y-auto p-2 lg:max-h-48">
        <div className="space-y-0.5">
          {events.length === 0 ? (
            <p className="px-2 py-4 text-center font-mono text-xs text-muted-foreground">暫無事件</p>
          ) : (
            events.map((event) => {
              const config = typeConfig[event.event_type] ?? typeConfig.info
              const Icon = config.icon
              return (
                <div
                  key={event.id}
                  className="flex items-start gap-2 rounded px-2 py-1 hover:bg-secondary/50"
                >
                  <Icon className={`mt-0.5 h-3 w-3 shrink-0 ${config.colorClass}`} />
                  <span className="shrink-0 font-mono text-[11px] text-muted-foreground">
                    {formatTime(event.occurred_at)}
                  </span>
                  <span className="font-mono text-[11px] text-card-foreground">{event.message_zh}</span>
                </div>
              )
            })
          )}
        </div>
      </div>
    </section>
  )
}
