'use client'

import { Warehouse, Package } from 'lucide-react'
import { useFactoryStore } from '@/store/factory-store'

function CircularGauge({ value, label, color }: { value: number; label: string; color: string }) {
  const radius = 32
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (value / 100) * circumference

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="80" height="80" viewBox="0 0 80 80" className="drop-shadow-sm" aria-label={`${label}: ${value}%`}>
        <circle cx="40" cy="40" r={radius} fill="none" stroke="currentColor" className="text-secondary" strokeWidth="5" />
        <circle
          cx="40" cy="40" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 40 40)"
          className="transition-all duration-1000"
        />
        <text x="40" y="40" textAnchor="middle" dominantBaseline="central" className="fill-card-foreground font-mono text-sm font-bold">
          {value}%
        </text>
      </svg>
      <span className="text-center text-[10px] text-muted-foreground">{label}</span>
    </div>
  )
}

// 配料倉儲位格（靜態視覺，後端無此數據）
const storageSlots = [
  { id: 'A1', status: 'full' }, { id: 'A2', status: 'full' }, { id: 'A3', status: 'partial' },
  { id: 'A4', status: 'empty' }, { id: 'B1', status: 'full' }, { id: 'B2', status: 'partial' },
  { id: 'B3', status: 'full' }, { id: 'B4', status: 'full' }, { id: 'C1', status: 'empty' },
  { id: 'C2', status: 'full' }, { id: 'C3', status: 'partial' }, { id: 'C4', status: 'full' },
  { id: 'D1', status: 'full' }, { id: 'D2', status: 'empty' }, { id: 'D3', status: 'full' },
  { id: 'D4', status: 'partial' },
]

const slotColors: Record<string, string> = {
  full: 'bg-neon-cyan/30 border-neon-cyan/50',
  partial: 'bg-neon-amber/30 border-neon-amber/50',
  empty: 'bg-secondary border-border',
}

// 稼動率 → 圓形量表顏色
function utilColor(pct: number): string {
  if (pct >= 80) return 'var(--neon-green)'
  if (pct >= 60) return 'var(--neon-cyan)'
  return 'var(--neon-amber)'
}

export function BufferWarehouse() {
  const assets = useFactoryStore((s) => s.assets)
  const bufferAssets = Object.values(assets)
    .filter((a) => a.zone_code === 'BUFFER')
    .sort((a, b) => a.asset_code.localeCompare(b.asset_code))

  const totalWip = bufferAssets.reduce((sum, a) => sum + (a.wip_count ?? 0), 0)

  return (
    <section className="flex flex-col rounded-lg border border-border bg-card" aria-label="配料倉">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <Warehouse className="h-4 w-4 text-neon-amber" />
          <h2 className="text-sm font-semibold text-card-foreground">配料倉</h2>
        </div>
        <div className="flex items-center gap-1.5">
          <Package className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="font-mono text-xs text-muted-foreground">
            <span className="font-bold text-card-foreground">{totalWip}</span> 組
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-3">
        <p className="mb-2 text-xs font-medium text-muted-foreground">儲位格</p>
        <div className="grid grid-cols-4 gap-1.5">
          {storageSlots.map((slot) => (
            <div
              key={slot.id}
              className={`flex h-8 items-center justify-center rounded border font-mono text-[10px] ${slotColors[slot.status]}`}
              title={`儲位 ${slot.id} - ${slot.status === 'full' ? '已滿' : slot.status === 'partial' ? '部分' : '空置'}`}
            >
              <span className="text-card-foreground">{slot.id}</span>
            </div>
          ))}
        </div>

        <div className="mt-3 flex items-center justify-center gap-3">
          <div className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-sm bg-neon-cyan/30 border border-neon-cyan/50" />
            <span className="text-[10px] text-muted-foreground">已滿</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-sm bg-neon-amber/30 border border-neon-amber/50" />
            <span className="text-[10px] text-muted-foreground">部分</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-sm bg-secondary border border-border" />
            <span className="text-[10px] text-muted-foreground">空置</span>
          </div>
        </div>

        <div className="mt-4">
          <p className="mb-2 text-xs font-medium text-muted-foreground">存取車稼動率</p>
          <div className="flex items-center justify-around">
            {bufferAssets.length === 0 ? (
              <p className="text-xs text-muted-foreground">載入中…</p>
            ) : (
              bufferAssets.map((asset) => {
                const pct = asset.utilization_pct != null ? Math.round(asset.utilization_pct * 100) : 0
                return (
                  <CircularGauge
                    key={asset.asset_id}
                    value={pct}
                    label={asset.name_zh}
                    color={utilColor(pct)}
                  />
                )
              })
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
