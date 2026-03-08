'use client'

import { Shirt, ArrowDownToLine, Signal } from 'lucide-react'
import { useFactoryStore } from '@/store/factory-store'

const STATUS_ZH: Record<string, string> = {
  running: '運行中',
  warning: '警告',
  maintenance: '維護中',
  offline: '離線',
}
const statusColor: Record<string, string> = {
  running: 'text-neon-green',
  warning: 'text-neon-amber',
  maintenance: 'text-neon-red',
  offline: 'text-muted-foreground',
}

export function SewingArea() {
  const assets = useFactoryStore((s) => s.assets)
  const sewAssets = Object.values(assets)
    .filter((a) => a.zone_code === 'SEW')
    .sort((a, b) => a.asset_code.localeCompare(b.asset_code))

  const totalWip = sewAssets.reduce((sum, a) => sum + (a.wip_count ?? 0), 0)

  const zoneStatus =
    sewAssets.some((a) => a.status === 'warning')
      ? 'warning'
      : sewAssets.some((a) => a.status === 'maintenance')
        ? 'maintenance'
        : sewAssets.some((a) => a.status === 'offline')
          ? 'offline'
          : 'running'

  return (
    <section className="flex flex-col rounded-lg border border-border bg-card" aria-label="縫製區">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <Shirt className="h-4 w-4 text-neon-green" />
          <h2 className="text-sm font-semibold text-card-foreground">縫製區</h2>
        </div>
        <div className="flex items-center gap-2">
          <Signal className={`h-3.5 w-3.5 ${statusColor[zoneStatus]}`} />
          <span className={`font-mono text-xs ${statusColor[zoneStatus]}`}>
            {STATUS_ZH[zoneStatus]}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-3">
        <div className="mb-3 grid grid-cols-2 gap-2">
          <div className="rounded-md border border-border bg-secondary/50 px-3 py-2">
            <span className="text-xs text-muted-foreground">在製品總量</span>
            <p className="font-mono text-xl font-bold text-card-foreground">{totalWip}</p>
          </div>
          <div className="rounded-md border border-border bg-secondary/50 px-3 py-2">
            <div className="flex items-center gap-1">
              <ArrowDownToLine className="h-3 w-3 text-neon-cyan" />
              <span className="text-xs text-muted-foreground">縫製線數</span>
            </div>
            <p className="font-mono text-xl font-bold text-neon-cyan">{sewAssets.length}</p>
          </div>
        </div>

        <div className="space-y-1.5">
          {sewAssets.length === 0 ? (
            <p className="text-center text-xs text-muted-foreground py-4">載入中…</p>
          ) : (
            sewAssets.map((asset) => {
              const utilPct =
                asset.utilization_pct != null ? Math.round(asset.utilization_pct * 100) : 0
              return (
                <div key={asset.asset_id} className="rounded-md border border-border bg-secondary/50 px-3 py-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-card-foreground">
                        {asset.asset_code}
                      </span>
                      <span className="text-xs text-muted-foreground">{asset.name_zh}</span>
                    </div>
                    <span className={`text-[10px] font-medium ${statusColor[asset.status]}`}>
                      {STATUS_ZH[asset.status] ?? asset.status}
                    </span>
                  </div>
                  <div className="mt-1.5 flex items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          utilPct > 80 ? 'bg-neon-amber' : 'bg-neon-green'
                        }`}
                        style={{ width: `${utilPct}%` }}
                      />
                    </div>
                    <span className="font-mono text-[10px] text-muted-foreground">
                      {asset.wip_count ?? 0} WIP · {utilPct}%
                    </span>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-border px-4 py-2">
        <span className="text-xs text-muted-foreground">在製品總量</span>
        <span className="font-mono text-sm font-bold text-neon-green">{totalWip}</span>
      </div>
    </section>
  )
}
