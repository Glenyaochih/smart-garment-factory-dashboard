'use client'

// --- 全域錯誤邊界 ---
// 當 SSR fetchFactoryInit 或其他 Server Component 拋出例外時顯示此頁面
// Next.js App Router 自動捕獲並渲染 error.tsx

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface Props {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: Props) {
  useEffect(() => {
    console.error('[GlobalError]', error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background p-6">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neon-red/10">
        <AlertTriangle className="h-8 w-8 text-neon-red" />
      </div>

      <div className="text-center">
        <h1 className="text-lg font-semibold text-foreground">無法連線至工廠伺服器</h1>
        <p className="mt-1 font-mono text-sm text-muted-foreground">
          {error.message ?? '後端 API 回應異常，請確認伺服器是否正常運作'}
        </p>
      </div>

      <button
        onClick={reset}
        className="flex items-center gap-2 rounded-md bg-neon-cyan/15 px-4 py-2 text-sm font-medium text-neon-cyan transition-colors hover:bg-neon-cyan/25"
      >
        <RefreshCw className="h-4 w-4" />
        重新嘗試
      </button>

      <p className="font-mono text-xs text-muted-foreground">
        確認後端已啟動：<span className="text-foreground">uvicorn app.main:app --port 8000</span>
      </p>
    </div>
  )
}
