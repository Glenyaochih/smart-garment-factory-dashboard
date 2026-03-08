'use client'

import { Activity, Gauge, HeartPulse, PackageCheck } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useFactoryStore } from '@/store/factory-store'

interface KpiCardProps {
  label: string
  value: string
  icon: React.ReactNode
  trend?: string
  color: string
}

function KpiCard({ label, value, icon, trend, color }: KpiCardProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md ${color}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="truncate text-xs font-medium text-muted-foreground">{label}</p>
        <p className="font-mono text-lg font-bold text-card-foreground">{value}</p>
      </div>
      {trend && (
        <span className="ml-auto shrink-0 rounded bg-neon-green/15 px-1.5 py-0.5 font-mono text-xs text-neon-green">
          {trend}
        </span>
      )}
    </div>
  )
}

export function KpiHeader() {
  const [time, setTime] = useState<Date | null>(null)
  const kpi = useFactoryStore((s) => s.kpi)
  const wsStatus = useFactoryStore((s) => s.wsStatus)

  useEffect(() => {
    setTime(new Date())
    const interval = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  const oeeDisplay = kpi?.oee != null ? `${(kpi.oee * 100).toFixed(1)}%` : '—'
  const dailyOutput = kpi?.daily_output != null ? kpi.daily_output.toLocaleString() : '—'
  const healthDisplay =
    kpi?.system_health != null
      ? kpi.system_health >= 0.9
        ? '正常'
        : kpi.system_health >= 0.7
          ? '注意'
          : '異常'
      : '—'
  const healthColor =
    kpi?.system_health != null
      ? kpi.system_health >= 0.9
        ? 'bg-neon-green/15'
        : kpi.system_health >= 0.7
          ? 'bg-neon-amber/15'
          : 'bg-neon-red/15'
      : 'bg-neon-green/15'
  const healthIconColor =
    kpi?.system_health != null
      ? kpi.system_health >= 0.9
        ? 'text-neon-green'
        : kpi.system_health >= 0.7
          ? 'text-neon-amber'
          : 'text-neon-red'
      : 'text-neon-green'

  const wsLabel =
    wsStatus === 'connected' ? '即時' : wsStatus === 'connecting' ? '連線中' : '已斷線'
  const wsDotClass =
    wsStatus === 'connected'
      ? 'bg-neon-green animate-pulse'
      : wsStatus === 'connecting'
        ? 'bg-neon-amber animate-pulse'
        : 'bg-neon-red'
  const wsTextClass =
    wsStatus === 'connected'
      ? 'text-neon-green'
      : wsStatus === 'connecting'
        ? 'text-neon-amber'
        : 'text-neon-red'

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm">
      <div className="flex items-center justify-between px-4 py-2 lg:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-neon-cyan/15">
            <Activity className="h-5 w-5 text-neon-cyan" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-foreground lg:text-base">自動化指揮中心</h1>
            <p className="text-xs text-muted-foreground">智慧成衣工廠</p>
          </div>
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <div className="flex items-center gap-1.5 rounded-full bg-card px-3 py-1 border border-border">
            <span className={`h-2 w-2 rounded-full ${wsDotClass}`} />
            <span className={`font-mono text-xs ${wsTextClass}`}>{wsLabel}</span>
          </div>
          <time className="font-mono text-xs text-muted-foreground">
            {time ? time.toLocaleTimeString('zh-TW', { hour12: false }) : '--:--:--'}
          </time>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 px-4 pb-3 lg:grid-cols-4 lg:px-6">
        <KpiCard
          label="OEE (設備綜合效率)"
          value={oeeDisplay}
          icon={<Gauge className="h-5 w-5 text-neon-cyan" />}
          color="bg-neon-cyan/15"
        />
        <KpiCard
          label="訂單完成率"
          value="—"
          icon={<PackageCheck className="h-5 w-5 text-neon-green" />}
          color="bg-neon-green/15"
        />
        <KpiCard
          label="日產量 (件)"
          value={dailyOutput}
          icon={<Activity className="h-5 w-5 text-neon-amber" />}
          color="bg-neon-amber/15"
        />
        <KpiCard
          label="系統健康狀態"
          value={healthDisplay}
          icon={<HeartPulse className={`h-5 w-5 ${healthIconColor}`} />}
          color={healthColor}
        />
      </div>
    </header>
  )
}
