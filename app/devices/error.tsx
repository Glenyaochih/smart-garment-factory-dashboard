'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface Props {
  error: Error & { digest?: string }
  reset: () => void
}

export default function DevicesError({ error, reset }: Props) {
  useEffect(() => {
    console.error('[DevicesError]', error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background p-6">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neon-red/10">
        <AlertTriangle className="h-8 w-8 text-neon-red" />
      </div>
      <div className="text-center">
        <h1 className="text-lg font-semibold text-foreground">設備列表載入失敗</h1>
        <p className="mt-1 font-mono text-sm text-muted-foreground">
          {error.message ?? '無法取得設備資料，請確認後端伺服器狀態'}
        </p>
      </div>
      <button
        onClick={reset}
        className="flex items-center gap-2 rounded-md bg-neon-cyan/15 px-4 py-2 text-sm font-medium text-neon-cyan transition-colors hover:bg-neon-cyan/25"
      >
        <RefreshCw className="h-4 w-4" />
        重新嘗試
      </button>
    </div>
  )
}
