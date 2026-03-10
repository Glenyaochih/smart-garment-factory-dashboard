'use client'

import { Activity, Gauge, HeartPulse, PackageCheck, Cpu, ScrollText, Sun, Moon } from 'lucide-react'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'
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

const NAV_ITEMS = [
  { href: '/', label: '儀表板', icon: Activity },
  { href: '/devices', label: '設備列表', icon: Cpu },
  { href: '/events', label: '事件記錄', icon: ScrollText },
]

export function KpiHeader() {
  const [time, setTime] = useState<Date | null>(null)
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
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

        {/* 導航連結 */}
        <nav className="hidden items-center gap-1 md:flex">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-neon-cyan/15 text-neon-cyan'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-1.5 rounded-full bg-card px-3 py-1 border border-border lg:flex">
            <span className={`h-2 w-2 rounded-full ${wsDotClass}`} />
            <span className={`font-mono text-xs ${wsTextClass}`}>{wsLabel}</span>
          </div>
          <time className="hidden font-mono text-xs text-muted-foreground lg:block">
            {time ? time.toLocaleTimeString('zh-TW', { hour12: false }) : '--:--:--'}
          </time>
          {/* 主題切換按鈕 */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label="切換深色/淺色模式"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* 手機版導航列 */}
      <nav className="flex items-center gap-1 border-t border-border px-4 py-1.5 md:hidden">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-neon-cyan/15 text-neon-cyan'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="grid grid-cols-2 gap-2 px-4 pb-3 lg:grid-cols-4 lg:px-6">
        <KpiCard
          label="OEE (設備綜合效率)"
          value={oeeDisplay}
          icon={<Gauge className="h-5 w-5 text-neon-cyan" />}
          color="bg-neon-cyan/15"
        />
        <KpiCard
          label="訂單完成率"
          value={kpi?.order_completion_rate != null ? `${(kpi.order_completion_rate * 100).toFixed(1)}%` : '—'}
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
