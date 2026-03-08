'use client'

import { ArrowLeftRight, Gauge, ArrowUpDown } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useFactoryStore } from '@/store/factory-store'

function AnimatedFlow() {
  const [dots, setDots] = useState<{ id: number; position: number; direction: 'right' | 'left' }[]>([])

  useEffect(() => {
    const initial = [
      { id: 1, position: 10, direction: 'right' as const },
      { id: 2, position: 35, direction: 'right' as const },
      { id: 3, position: 65, direction: 'right' as const },
      { id: 4, position: 85, direction: 'left' as const },
      { id: 5, position: 55, direction: 'left' as const },
      { id: 6, position: 20, direction: 'left' as const },
    ]
    setDots(initial)

    const interval = setInterval(() => {
      setDots((prev) =>
        prev.map((dot) => {
          const speed = dot.direction === 'right' ? 1.5 : -1.5
          let newPos = dot.position + speed
          if (newPos > 100) newPos = 0
          if (newPos < 0) newPos = 100
          return { ...dot, position: newPos }
        })
      )
    }, 80)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative">
      <div className="relative mb-2 h-6 overflow-hidden rounded-full border border-border bg-secondary/50">
        <div className="absolute inset-0 flex items-center justify-between px-2">
          <span className="text-[9px] text-muted-foreground">2F</span>
          <span className="text-[9px] text-muted-foreground">3F</span>
        </div>
        {dots.filter((d) => d.direction === 'right').map((dot) => (
          <div
            key={dot.id}
            className="absolute top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-neon-cyan shadow-[0_0_6px_var(--neon-cyan)] transition-all duration-75"
            style={{ left: `${dot.position}%` }}
          />
        ))}
      </div>
      <div className="relative h-6 overflow-hidden rounded-full border border-border bg-secondary/50">
        <div className="absolute inset-0 flex items-center justify-between px-2">
          <span className="text-[9px] text-muted-foreground">2F</span>
          <span className="text-[9px] text-muted-foreground">3F</span>
        </div>
        {dots.filter((d) => d.direction === 'left').map((dot) => (
          <div
            key={dot.id}
            className="absolute top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-neon-amber shadow-[0_0_6px_var(--neon-amber)] transition-all duration-75"
            style={{ left: `${dot.position}%` }}
          />
        ))}
      </div>
      <div className="mt-1.5 flex items-center justify-center gap-4">
        <div className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-neon-cyan" />
          <span className="text-[10px] text-muted-foreground">往縫製區</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-neon-amber" />
          <span className="text-[10px] text-muted-foreground">往配料倉</span>
        </div>
      </div>
    </div>
  )
}

const STATUS_ZH: Record<string, string> = {
  running: '運行中',
  warning: '警告',
  maintenance: '維護中',
  offline: '離線',
}
const statusColor: Record<string, string> = {
  running: 'bg-neon-cyan/15 text-neon-cyan',
  warning: 'bg-neon-amber/15 text-neon-amber',
  maintenance: 'bg-neon-red/15 text-neon-red',
  offline: 'bg-secondary text-muted-foreground',
}

export function Skybridge() {
  const assets = useFactoryStore((s) => s.assets)
  const bridgeAssets = Object.values(assets).filter((a) => a.zone_code === 'BRIDGE')

  // 輸送帶：取平均速度
  const conveyors = bridgeAssets.filter((a) => a.speed_mps != null)
  const avgSpeed =
    conveyors.length > 0
      ? conveyors.reduce((sum, a) => sum + (a.speed_mps ?? 0), 0) / conveyors.length
      : null

  // 升降機整體狀態
  const elevators = bridgeAssets.filter((a) => a.asset_code.startsWith('EL'))
  const elevatorStatus =
    elevators.some((a) => a.status === 'maintenance')
      ? 'maintenance'
      : elevators.some((a) => a.status === 'warning')
        ? 'warning'
        : elevators.some((a) => a.status === 'offline')
          ? 'offline'
          : 'running'

  const zoneStatus =
    bridgeAssets.some((a) => a.status === 'warning')
      ? 'warning'
      : bridgeAssets.some((a) => a.status === 'maintenance')
        ? 'maintenance'
        : bridgeAssets.some((a) => a.status === 'offline')
          ? 'offline'
          : 'running'

  return (
    <section className="flex flex-col rounded-lg border border-border bg-card" aria-label="中央空橋">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <ArrowLeftRight className="h-4 w-4 text-neon-cyan" />
          <h2 className="text-sm font-semibold text-card-foreground">中央空橋</h2>
        </div>
        <span className={`rounded px-2 py-0.5 text-xs font-medium ${statusColor[zoneStatus]}`}>
          {STATUS_ZH[zoneStatus]}
        </span>
      </div>

      <div className="flex-1 p-4">
        <AnimatedFlow />

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-md border border-border bg-secondary/50 px-3 py-2">
            <div className="flex items-center gap-1.5">
              <Gauge className="h-3.5 w-3.5 text-neon-cyan" />
              <span className="text-xs text-muted-foreground">輸送帶速度</span>
            </div>
            <p className="mt-1 font-mono text-lg font-bold text-card-foreground">
              {avgSpeed != null ? avgSpeed.toFixed(2) : '—'}{' '}
              <span className="text-xs font-normal text-muted-foreground">m/s</span>
            </p>
          </div>
          <div className="rounded-md border border-border bg-secondary/50 px-3 py-2">
            <div className="flex items-center gap-1.5">
              <ArrowUpDown className="h-3.5 w-3.5 text-neon-amber" />
              <span className="text-xs text-muted-foreground">升降機</span>
            </div>
            <p className={`mt-1 font-mono text-lg font-bold ${statusColor[elevatorStatus].split(' ')[1]}`}>
              {STATUS_ZH[elevatorStatus]}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
