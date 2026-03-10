'use client'

// --- 設備詳情側抽屜 ---
// 從 hardware-status.tsx 提取為獨立共用組件
// 供 /devices 頁與 HardwareStatus 元件共用

import { Cpu, Thermometer, Activity, Package, Gauge } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import type { AssetSnapshot } from '@/lib/types/factory'

type DeviceStatus = AssetSnapshot['status']

export const STATUS_ZH: Record<DeviceStatus, string> = {
  running: '處理中',
  warning: '警告',
  maintenance: '維護中',
  offline: '離線',
}

export const STATUS_BADGE_COLORS: Record<DeviceStatus, string> = {
  running: 'bg-neon-cyan/15 text-neon-cyan',
  warning: 'bg-neon-amber/15 text-neon-amber',
  maintenance: 'bg-neon-red/15 text-neon-red',
  offline: 'bg-secondary text-muted-foreground',
}

export const STATUS_DOT_COLORS: Record<DeviceStatus, string> = {
  running: 'bg-neon-cyan',
  warning: 'bg-neon-amber',
  maintenance: 'bg-neon-red',
  offline: 'bg-muted-foreground',
}

export const ZONE_ZH: Record<string, string> = {
  CUT: '裁片',
  BUFFER: '配料倉',
  BRIDGE: '空橋',
  SEW: '縫製',
}

interface DeviceDetailSheetProps {
  asset: AssetSnapshot
  open: boolean
  onClose: () => void
}

export function DeviceDetailSheet({ asset, open, onClose }: DeviceDetailSheetProps) {
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
          <span className={`rounded px-2 py-0.5 text-xs font-medium ${STATUS_BADGE_COLORS[status]}`}>
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
