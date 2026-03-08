// Server Component — 伺服器端取得工廠初始快照後傳給 DashboardClient
import { fetchFactoryInit } from '@/lib/api/factory'
import { DashboardClient } from './dashboard-client'

export default async function DashboardPage() {
  const initialData = await fetchFactoryInit()
  return <DashboardClient initialData={initialData} />
}
