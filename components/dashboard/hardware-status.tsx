'use client'

import { memo, useState } from 'react'
import { Cpu, Thermometer, Activity, Package, Gauge } from 'lucide-react'
import { useShallow } from 'zustand/react/shallow'
import { useFactoryStore } from '@/store/factory-store'
import type { AssetSnapshot } from '@/lib/types/factory'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

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

// 設備詳情 Sheet
function DeviceDetailSheet({
  asset,
  open,
  onClose,
}: {
  asset: AssetSnapshot
  open: boolean
  onClose: () => void
}) {
  const status = (asset.status ?? 'offline') as DeviceStatus

  const metrics = [
    {
      icon: <Thermometer className="h-4 w-4 text-neon-amber" />,
      label: '溫度',
      value: asset.temperature != null ? `${asset.temperature.toFixed(1)} °C` : '—',
    },
    {
      icon: <Gauge className="h-4 w-4 text-neon-cyan" />,
      label: '稼動率',
      value: asset.utilization_pct != null ? `${(asset.utilization_pct * 100).toFixed(1)} %` : '—',
    },
    {
      icon: <Package className="h-4 w-4 text-neon-green" />,
      label: 'WIP 在製品',
      value: asset.wip_count != null ? `${asset.wip_count} 件` : '—',
    },
    {
      icon: <Activity className="h-4 w-4 text-neon-red" />,
      label: '速度',
      value: asset.speed_mps != null ? `${asset.speed_mps.toFixed(2)} m/s` : '—',
    },
  ]

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="w-80">
        <SheetHeader className="mb-4">
          <SheetTitle className="flex items-center gap-2 text-base">
            <Cpu className="h-4 w-4 text-neon-cyan" />
            {asset.name_zh}
          </SheetTitle>
        </SheetHeader>

        <div className="flex items-center gap-2 mb-4">
          <span className={`rounded px-2 py-0.5 text-xs font-medium ${statusBadgeColors[status]}`}>
            {STATUS_ZH[status]}
          </span>
          <span className="text-xs text-muted-foreground">
            {asset.zone_code ? (ZONE_ZH[asset.zone_code] ?? asset.zone_code) : '—'}
          </span>
          <span className="ml-auto text-xs font-mono text-muted-foreground">{asset.asset_code}</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {metrics.map((m) => (
            <div
              key={m.label}
              className="flex flex-col gap-1 rounded-lg border border-border bg-secondary/30 px-3 py-3"
            >
              <div className="flex items-center gap-1.5">
                {m.icon}
                <span className="text-[10px] text-muted-foreground">{m.label}</span>
              </div>
              <span className="font-mono text-sm font-bold text-card-foreground">{m.value}</span>
            </div>
          ))}
        </div>

        {asset.last_seen_at && (
          <p className="mt-4 text-[10px] text-muted-foreground">
            最後更新：{new Date(asset.last_seen_at).toLocaleTimeString('zh-TW', { hour12: false })}
          </p>
        )}
      </SheetContent>
    </Sheet>
  )
}

// React.memo：只有 asset_id / status / name_zh / zone_code 變化時才重新渲染
const HardwareCard = memo(function HardwareCard({
  asset,
  onClick,
}: {
  asset: AssetSnapshot
  onClick: () => void
}) {
  const status = (asset.status ?? 'offline') as DeviceStatus
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1 rounded-md border border-border bg-secondary/30 px-2 py-2 text-left w-full hover:bg-secondary/60 transition-colors cursor-pointer"
    >
      <span className={`rounded px-1.5 py-0.5 text-[9px] font-medium ${statusBadgeColors[status]}`}>
        {STATUS_ZH[status]}
      </span>
      <span className="text-center text-[10px] font-medium text-card-foreground leading-tight">
        {asset.name_zh}
      </span>
      <span className="text-[9px] text-muted-foreground">
        {asset.zone_code ? (ZONE_ZH[asset.zone_code] ?? asset.zone_code) : '—'}
      </span>
    </button>
  )
})

const STATUSES: DeviceStatus[] = ['running', 'warning', 'maintenance', 'offline']

export function HardwareStatus() {
  const [selectedAsset, setSelectedAsset] = useState<AssetSnapshot | null>(null)

  // useShallow：Object.values() 每次都產生新陣列，淺比較避免不必要的重渲染
  const items = useFactoryStore(
    useShallow((s) => Object.values(s.assets))
  )

  // 當 sheet 開著時，從 store 取得最新數據
  const liveAsset = useFactoryStore((s) =>
    selectedAsset ? (s.assets[selectedAsset.asset_id] ?? selectedAsset) : null
  )

  return (
    <>
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
            <HardwareCard key={asset.asset_id} asset={asset} onClick={() => setSelectedAsset(asset)} />
          ))}
        </div>
      </section>

      {liveAsset && (
        <DeviceDetailSheet
          asset={liveAsset}
          open={!!selectedAsset}
          onClose={() => setSelectedAsset(null)}
        />
      )}
    </>
  )
}
