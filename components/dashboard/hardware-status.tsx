'use client'

import { memo } from 'react'
import { Cpu } from 'lucide-react'
import { useShallow } from 'zustand/react/shallow'
import { useFactoryStore } from '@/store/factory-store'
import type { AssetSnapshot } from '@/lib/types/factory'

type DeviceStatus = AssetSnapshot['status']

const STATUS_ZH: Record<DeviceStatus, string> = {
  running: '處理中',
  warning: '警告',
  maintenance: '維護中',
  offline: '離線',
}

const statusBadgeColors: Record<DeviceStatus, string> = {
  running: 'bg-neon-cyan/15 text-neon-cyan',
  warning: 'bg-neon-amber/15 text-neon-amber',
  maintenance: 'bg-neon-red/15 text-neon-red',
  offline: 'bg-secondary text-muted-foreground',
}

const statusDotColors: Record<DeviceStatus, string> = {
  running: 'bg-neon-cyan',
  warning: 'bg-neon-amber',
  maintenance: 'bg-neon-red',
  offline: 'bg-muted-foreground',
}

const ZONE_ZH: Record<string, string> = {
  CUT: '裁片',
  BUFFER: '配料倉',
  BRIDGE: '空橋',
  SEW: '縫製',
}

// React.memo：只有 asset_id / status / name_zh / zone_code 變化時才重新渲染
const HardwareCard = memo(function HardwareCard({ asset }: { asset: AssetSnapshot }) {
  const status = (asset.status ?? 'offline') as DeviceStatus
  return (
    <div className="flex flex-col items-center gap-1 rounded-md border border-border bg-secondary/30 px-2 py-2">
      <span className={`rounded px-1.5 py-0.5 text-[9px] font-medium ${statusBadgeColors[status]}`}>
        {STATUS_ZH[status]}
      </span>
      <span className="text-center text-[10px] font-medium text-card-foreground leading-tight">
        {asset.name_zh}
      </span>
      <span className="text-[9px] text-muted-foreground">
        {asset.zone_code ? (ZONE_ZH[asset.zone_code] ?? asset.zone_code) : '—'}
      </span>
    </div>
  )
})

const STATUSES: DeviceStatus[] = ['running', 'warning', 'maintenance', 'offline']

export function HardwareStatus() {
  // useShallow：Object.values() 每次都產生新陣列，淺比較避免不必要的重渲染
  const items = useFactoryStore(
    useShallow((s) => Object.values(s.assets))
  )

  return (
    <section className="rounded-lg border border-border bg-card" aria-label="硬體狀態">
      <div className="flex items-center justify-between border-b border-border px-4 py-2">
        <div className="flex items-center gap-2">
          <Cpu className="h-4 w-4 text-neon-cyan" />
          <h2 className="text-sm font-semibold text-card-foreground">硬體狀態</h2>
        </div>
        <div className="flex items-center gap-2">
          {STATUSES.map((s) => (
            <div key={s} className="flex items-center gap-1">
              <span className={`h-2 w-2 rounded-full ${statusDotColors[s]}`} />
              <span className="text-[10px] text-muted-foreground">{STATUS_ZH[s]}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-1 p-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
        {items.map((asset) => (
          <HardwareCard key={asset.asset_id} asset={asset} />
        ))}
      </div>
    </section>
  )
}
