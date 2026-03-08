'use client'

// --- 儀表板客戶端根組件 ---
// 職責：以 SSR 初始數據填充 Zustand Store，啟動 WebSocket 連線
// 必須是 Client Component 才能使用 hooks

import { useRef } from 'react'
import { useFactoryStore } from '@/store/factory-store'
import { useFactoryWs } from '@/hooks/use-factory-ws'
import type { FactoryInitResponse } from '@/lib/types/factory'

import { KpiHeader } from '@/components/dashboard/kpi-header'
import { CuttingZone } from '@/components/dashboard/cutting-zone'
import { BufferWarehouse } from '@/components/dashboard/buffer-warehouse'
import { Skybridge } from '@/components/dashboard/skybridge'
import { SewingArea } from '@/components/dashboard/sewing-area'
import { FlowDiagram } from '@/components/dashboard/flow-diagram'
import { EventLog } from '@/components/dashboard/event-log'
import { HardwareStatus } from '@/components/dashboard/hardware-status'

interface Props {
  initialData: FactoryInitResponse
}

export function DashboardClient({ initialData }: Props) {
  const initialize = useFactoryStore((s) => s.initialize)

  // 同步初始化（在首次 render 前填充 Store，避免閃爍空白）
  const initializedRef = useRef(false)
  if (!initializedRef.current) {
    initializedRef.current = true
    initialize(initialData)
  }

  // 啟動 WebSocket 連線（自動重連）
  useFactoryWs()

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <KpiHeader />

      <main className="flex flex-1 flex-col gap-3 p-3 lg:p-4">
        <FlowDiagram />

        <div className="grid flex-1 grid-cols-1 gap-3 md:grid-cols-2">
          <CuttingZone />
          <BufferWarehouse />
          <Skybridge />
          <SewingArea />
        </div>

        <HardwareStatus />
        <EventLog />
      </main>
    </div>
  )
}
