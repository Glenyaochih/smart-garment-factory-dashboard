// Server Component — SSR 取得工廠初始快照後傳給 DevicesClient
import { fetchFactoryInit } from '@/lib/api/factory'
import { DevicesClient } from './devices-client'

export default async function DevicesPage() {
  const initialData = await fetchFactoryInit()
  return <DevicesClient initialData={initialData} />
}
