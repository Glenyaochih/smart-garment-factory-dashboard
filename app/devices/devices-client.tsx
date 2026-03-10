'use client'

// --- 設備列表頁客戶端組件 ---
// 功能：Zone 過濾、狀態過濾、排序、點擊開啟詳情抽屜
// 數據來源：Zustand store（SSR 初始化 + WS 即時更新）

import { memo, useRef, useState, useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'
import {
  Cpu,
  Thermometer,
  Activity,
  Package,
  Gauge,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
} from 'lucide-react'
import { useFactoryStore } from '@/store/factory-store'
import { useFactoryWs } from '@/hooks/use-factory-ws'
import type { AssetSnapshot, FactoryInitResponse } from '@/lib/types/factory'
import { KpiHeader } from '@/components/dashboard/kpi-header'
import {
  DeviceDetailSheet,
  STATUS_ZH,
  STATUS_BADGE_COLORS,
  ZONE_ZH,
} from '@/components/dashboard/device-detail-sheet'

// --- 常數定義 ---
type DeviceStatus = AssetSnapshot['status']
type SortKey = 'name_zh' | 'zone_code' | 'status' | 'temperature' | 'utilization_pct' | 'wip_count'
type SortDir = 'asc' | 'desc'

const ZONES = ['全部', 'CUT', 'BUFFER', 'BRIDGE', 'SEW'] as const
const STATUSES: Array<DeviceStatus | '全部'> = ['全部', 'running', 'warning', 'maintenance', 'offline']

const STATUS_FILTER_COLORS: Record<DeviceStatus, string> = {
  running: 'border-neon-cyan/50 bg-neon-cyan/10 text-neon-cyan',
  warning: 'border-neon-amber/50 bg-neon-amber/10 text-neon-amber',
  maintenance: 'border-neon-red/50 bg-neon-red/10 text-neon-red',
  offline: 'border-border bg-secondary text-muted-foreground',
}

// --- 設備列表卡片（React.memo 優化重渲染）---
const DeviceRow = memo(function DeviceRow({
  asset,
  onClick,
}: {
  asset: AssetSnapshot
  onClick: () => void
}) {
  const status = (asset.status ?? 'offline') as DeviceStatus

  return (
    <tr
      onClick={onClick}
      className="cursor-pointer border-b border-border transition-colors hover:bg-secondary/40"
    >
      {/* 設備名稱 */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <Cpu className="h-3.5 w-3.5 shrink-0 text-neon-cyan/70" />
          <div className="min-w-0">
            <p className="text-sm font-medium text-card-foreground">{asset.name_zh}</p>
            <p className="font-mono text-[11px] text-muted-foreground">{asset.asset_code}</p>
          </div>
        </div>
      </td>

      {/* 區域 */}
      <td className="px-4 py-3">
        <span className="text-xs text-muted-foreground">
          {asset.zone_code ? (ZONE_ZH[asset.zone_code] ?? asset.zone_code) : '—'}
        </span>
      </td>

      {/* 狀態 */}
      <td className="px-4 py-3">
        <span className={`rounded px-2 py-0.5 text-xs font-medium ${STATUS_BADGE_COLORS[status]}`}>
          {STATUS_ZH[status]}
        </span>
      </td>

      {/* 溫度 */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-1">
          <Thermometer className="h-3.5 w-3.5 text-neon-amber/70" />
          <span className="font-mono text-sm text-card-foreground">
            {asset.temperature != null ? `${asset.temperature.toFixed(1)} °C` : '—'}
          </span>
        </div>
      </td>

      {/* 稼動率 */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <Gauge className="h-3.5 w-3.5 text-neon-cyan/70" />
          <div className="flex flex-col gap-0.5 min-w-[80px]">
            <span className="font-mono text-sm text-card-foreground">
              {asset.utilization_pct != null ? `${(asset.utilization_pct * 100).toFixed(1)}%` : '—'}
            </span>
            {asset.utilization_pct != null && (
              <div className="h-1 w-full rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-neon-cyan/70"
                  style={{ width: `${Math.min(asset.utilization_pct * 100, 100)}%` }}
                />
              </div>
            )}
          </div>
        </div>
      </td>

      {/* WIP 在製品 */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-1">
          <Package className="h-3.5 w-3.5 text-neon-green/70" />
          <span className="font-mono text-sm text-card-foreground">
            {asset.wip_count != null ? `${asset.wip_count} 件` : '—'}
          </span>
        </div>
      </td>

      {/* 速度 */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-1">
          <Activity className="h-3.5 w-3.5 text-neon-red/70" />
          <span className="font-mono text-sm text-card-foreground">
            {asset.speed_mps != null ? `${asset.speed_mps.toFixed(2)} m/s` : '—'}
          </span>
        </div>
      </td>

      {/* 最後更新 */}
      <td className="px-4 py-3">
        <span className="font-mono text-xs text-muted-foreground">
          {asset.last_seen_at
            ? new Date(asset.last_seen_at).toLocaleTimeString('zh-TW', { hour12: false })
            : '—'}
        </span>
      </td>
    </tr>
  )
})

// --- 排序圖示 ---
function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) return <ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground/50" />
  return dir === 'asc'
    ? <ChevronUp className="h-3.5 w-3.5 text-neon-cyan" />
    : <ChevronDown className="h-3.5 w-3.5 text-neon-cyan" />
}

// --- 主組件 ---
interface Props {
  initialData: FactoryInitResponse
}

export function DevicesClient({ initialData }: Props) {
  const initialize = useFactoryStore((s) => s.initialize)

  // 同步初始化（避免閃爍空白）
  const initializedRef = useRef(false)
  if (!initializedRef.current) {
    initializedRef.current = true
    initialize(initialData)
  }

  useFactoryWs()

  // 過濾 & 排序狀態
  const [zoneFilter, setZoneFilter] = useState<string>('全部')
  const [statusFilter, setStatusFilter] = useState<DeviceStatus | '全部'>('全部')
  const [sortKey, setSortKey] = useState<SortKey>('name_zh')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [selectedAsset, setSelectedAsset] = useState<AssetSnapshot | null>(null)

  const rawAssets = useFactoryStore(useShallow((s) => Object.values(s.assets)))

  // 當 sheet 開著時，從 store 取得最新數據（WS 即時更新）
  const liveAsset = useFactoryStore((s) =>
    selectedAsset ? (s.assets[selectedAsset.asset_id] ?? selectedAsset) : null
  )

  // 統計各狀態數量
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { 全部: rawAssets.length }
    for (const a of rawAssets) {
      counts[a.status] = (counts[a.status] ?? 0) + 1
    }
    return counts
  }, [rawAssets])

  // 過濾 + 排序
  const filteredAssets = useMemo(() => {
    let list = rawAssets

    if (zoneFilter !== '全部') {
      list = list.filter((a) => a.zone_code === zoneFilter)
    }
    if (statusFilter !== '全部') {
      list = list.filter((a) => a.status === statusFilter)
    }

    list = [...list].sort((a, b) => {
      let av: string | number | null = null
      let bv: string | number | null = null

      switch (sortKey) {
        case 'name_zh': av = a.name_zh; bv = b.name_zh; break
        case 'zone_code': av = a.zone_code; bv = b.zone_code; break
        case 'status': av = a.status; bv = b.status; break
        case 'temperature': av = a.temperature; bv = b.temperature; break
        case 'utilization_pct': av = a.utilization_pct; bv = b.utilization_pct; break
        case 'wip_count': av = a.wip_count; bv = b.wip_count; break
      }

      // null 值排在最後
      if (av == null && bv == null) return 0
      if (av == null) return 1
      if (bv == null) return -1

      const cmp = av < bv ? -1 : av > bv ? 1 : 0
      return sortDir === 'asc' ? cmp : -cmp
    })

    return list
  }, [rawAssets, zoneFilter, statusFilter, sortKey, sortDir])

  // 切換排序
  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const thClass = 'px-4 py-2 text-left text-xs font-medium text-muted-foreground select-none'
  const thSortClass = `${thClass} cursor-pointer hover:text-foreground transition-colors`

  return (
    <>
      <div className="flex min-h-screen flex-col bg-background">
        <KpiHeader />

        <main className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
          {/* 頁面標題 */}
          <div className="flex items-center gap-3">
            <Cpu className="h-5 w-5 text-neon-cyan" />
            <h1 className="text-lg font-semibold text-foreground">設備列表</h1>
            <span className="rounded-full bg-secondary px-2 py-0.5 font-mono text-xs text-muted-foreground">
              {filteredAssets.length} / {rawAssets.length}
            </span>
          </div>

          {/* 過濾列 */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Zone 過濾 */}
            <div className="flex flex-wrap gap-1.5">
              {ZONES.map((zone) => (
                <button
                  key={zone}
                  onClick={() => setZoneFilter(zone)}
                  className={`rounded-md border px-3 py-1 text-xs font-medium transition-colors ${
                    zoneFilter === zone
                      ? 'border-neon-cyan/50 bg-neon-cyan/10 text-neon-cyan'
                      : 'border-border text-muted-foreground hover:border-border/80 hover:text-foreground'
                  }`}
                >
                  {zone === '全部' ? '全部區域' : `${ZONE_ZH[zone] ?? zone} (${zone})`}
                </button>
              ))}
            </div>

            {/* 狀態過濾 */}
            <div className="flex flex-wrap gap-1.5">
              {STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`rounded-md border px-3 py-1 text-xs font-medium transition-colors ${
                    statusFilter === s
                      ? s === '全部'
                        ? 'border-border bg-secondary text-foreground'
                        : STATUS_FILTER_COLORS[s]
                      : 'border-border text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {s === '全部' ? `全部狀態 (${statusCounts['全部'] ?? 0})` : `${STATUS_ZH[s]} (${statusCounts[s] ?? 0})`}
                </button>
              ))}
            </div>
          </div>

          {/* 設備表格 */}
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-border bg-secondary/30">
                  <tr>
                    <th
                      className={thSortClass}
                      onClick={() => handleSort('name_zh')}
                    >
                      <div className="flex items-center gap-1">
                        設備名稱
                        <SortIcon active={sortKey === 'name_zh'} dir={sortDir} />
                      </div>
                    </th>
                    <th
                      className={thSortClass}
                      onClick={() => handleSort('zone_code')}
                    >
                      <div className="flex items-center gap-1">
                        區域
                        <SortIcon active={sortKey === 'zone_code'} dir={sortDir} />
                      </div>
                    </th>
                    <th
                      className={thSortClass}
                      onClick={() => handleSort('status')}
                    >
                      <div className="flex items-center gap-1">
                        狀態
                        <SortIcon active={sortKey === 'status'} dir={sortDir} />
                      </div>
                    </th>
                    <th
                      className={thSortClass}
                      onClick={() => handleSort('temperature')}
                    >
                      <div className="flex items-center gap-1">
                        溫度
                        <SortIcon active={sortKey === 'temperature'} dir={sortDir} />
                      </div>
                    </th>
                    <th
                      className={thSortClass}
                      onClick={() => handleSort('utilization_pct')}
                    >
                      <div className="flex items-center gap-1">
                        稼動率
                        <SortIcon active={sortKey === 'utilization_pct'} dir={sortDir} />
                      </div>
                    </th>
                    <th
                      className={thSortClass}
                      onClick={() => handleSort('wip_count')}
                    >
                      <div className="flex items-center gap-1">
                        WIP
                        <SortIcon active={sortKey === 'wip_count'} dir={sortDir} />
                      </div>
                    </th>
                    <th className={thClass}>速度</th>
                    <th className={thClass}>最後更新</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAssets.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-4 py-12 text-center font-mono text-sm text-muted-foreground"
                      >
                        無符合條件的設備
                      </td>
                    </tr>
                  ) : (
                    filteredAssets.map((asset) => (
                      <DeviceRow
                        key={asset.asset_id}
                        asset={asset}
                        onClick={() => setSelectedAsset(asset)}
                      />
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* 設備詳情抽屜 */}
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
