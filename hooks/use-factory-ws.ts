// --- WebSocket 連線 Hook ---
// 1. 向後端申請一次性 ticket (POST /ws-ticket)
// 2. 建立 WebSocket 連線，驗證後接收即時設備更新
// 3. 斷線後 3 秒自動重連
// 4. heartbeat 訊息直接忽略（由後端負責保活）

import { useEffect, useRef } from 'react'
import { fetchWsTicket, buildWsUrl } from '@/lib/api/factory'
import { useFactoryStore } from '@/store/factory-store'
import type { WsMessage } from '@/lib/types/factory'

const RECONNECT_DELAY_MS = 3000

export function useFactoryWs() {
  const applyWsUpdates = useFactoryStore((s) => s.applyWsUpdates)
  const setWsStatus = useFactoryStore((s) => s.setWsStatus)
  const wsRef = useRef<WebSocket | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true

    async function connect() {
      if (!mountedRef.current) return
      try {
        setWsStatus('connecting')
        const ticket = await fetchWsTicket()
        if (!mountedRef.current) return

        const ws = new WebSocket(buildWsUrl(ticket))
        wsRef.current = ws

        ws.onopen = () => {
          if (mountedRef.current) setWsStatus('connected')
        }

        ws.onmessage = (ev: MessageEvent) => {
          try {
            const msg: WsMessage = JSON.parse(ev.data as string)
            if (msg.type === 'batch_update') {
              applyWsUpdates(msg.updates, msg.event_id)
            }
            // type === 'heartbeat': 無需處理
          } catch {
            // 忽略解析錯誤
          }
        }

        ws.onclose = () => {
          wsRef.current = null
          if (mountedRef.current) {
            setWsStatus('disconnected')
            timerRef.current = setTimeout(connect, RECONNECT_DELAY_MS)
          }
        }

        ws.onerror = () => ws.close()
      } catch {
        if (mountedRef.current) {
          setWsStatus('disconnected')
          timerRef.current = setTimeout(connect, RECONNECT_DELAY_MS)
        }
      }
    }

    connect()

    return () => {
      mountedRef.current = false
      if (timerRef.current) clearTimeout(timerRef.current)
      if (wsRef.current) {
        wsRef.current.onclose = null  // 防止觸發重連
        wsRef.current.close()
        wsRef.current = null
      }
      setWsStatus('disconnected')
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
}
