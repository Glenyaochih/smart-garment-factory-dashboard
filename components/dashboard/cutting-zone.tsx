'use client'

import { Scissors, Thermometer } from 'lucide-react'
import { useFactoryStore } from '@/store/factory-store'
import type { AssetSnapshot } from '@/lib/types/factory'

type DeviceStatus = AssetSnapshot['status']

const statusColors: Record<DeviceStatus, string> = {
  running: 'bg-neon-cyan/15 text-neon-cyan',
  warning: 'bg-neon-amber/15 text-neon-amber',
  maintenance: 'bg-neon-red/15 text-neon-red',
  offline: 'bg-secondary text-muted-foreground',
}

const STATUS_ZH: Record<DeviceStatus, string> = {
  running: '處理中',
  warning: '警告',
  maintenance: '維護中',
  offline: '離線',
}

function MachineCard({ asset }: { asset: AssetSnapshot }) {
  const status = asset.status as DeviceStatus
  const utilPct = asset.utilization_pct != null ? Math.round(asset.utilization_pct * 100) : null

  return (
    <div className="rounded-md border border-border bg-secondary/50 px-3 py-2">
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs font-semibold text-card-foreground">{asset.asset_code}</span>
        <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${statusColors[status]}`}>
          {STATUS_ZH[status]}
        </span>
      </div>
      <p className="mt-0.5 text-xs text-muted-foreground">{asset.name_zh}</p>
      <div className="mt-2 space-y-1">
        {/* 稼動率進度條 */}
        {utilPct != null && (
          <div className="flex items-center gap-2">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-neon-cyan transition-all duration-500"
                style={{ width: `${utilPct}%` }}
              />
            </div>
            <span className="font-mono text-xs text-neon-cyan">{utilPct}%</span>
          </div>
        )}
        {/* 溫度 */}
        {asset.temperature != null && (
          <div className="flex items-center gap-1">
            <Thermometer className={`h-3 w-3 ${asset.temperature >= 70 ? 'text-neon-amber' : 'text-muted-foreground'}`} />
            <span className={`font-mono text-[11px] ${asset.temperature >= 70 ? 'text-neon-amber' : 'text-muted-foreground'}`}>
              {asset.temperature.toFixed(1)}°C
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

export function CuttingZone() {
  const assets = useFactoryStore((s) => s.assets)
  const cutAssets = Object.values(assets)
    .filter((a) => a.zone_code === 'CUT')
    .sort((a, b) => a.asset_code.localeCompare(b.asset_code))

  const totalWip = cutAssets.reduce((sum, a) => sum + (a.wip_count ?? 0), 0)

  const zoneStatus: DeviceStatus =
    cutAssets.some((a) => a.status === 'warning')
      ? 'warning'
      : cutAssets.some((a) => a.status === 'maintenance')
        ? 'maintenance'
        : cutAssets.some((a) => a.status === 'offline')
          ? 'offline'
          : 'running'

  return (
    <section className="flex flex-col rounded-lg border border-border bg-card" aria-label="裁片區">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <Scissors className="h-4 w-4 text-neon-cyan" />
          <h2 className="text-sm font-semibold text-card-foreground">裁片區</h2>
        </div>
        <span className={`rounded px-2 py-0.5 text-xs font-medium ${statusColors[zoneStatus]}`}>
          {STATUS_ZH[zoneStatus]}
        </span>
      </div>

      <div className="flex-1 space-y-1.5 overflow-auto p-3">
        {cutAssets.length === 0 ? (
          <p className="text-center text-xs text-muted-foreground py-4">載入中…</p>
        ) : (
          cutAssets.map((asset) => <MachineCard key={asset.asset_id} asset={asset} />)
        )}
      </div>

      <div className="flex items-center justify-between border-t border-border px-4 py-2">
        <span className="text-xs text-muted-foreground">在製品數量</span>
        <span className="font-mono text-sm font-bold text-neon-amber">{totalWip}</span>
      </div>
    </section>
  )
}
