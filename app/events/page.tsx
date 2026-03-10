// Server Component — SSR 取得工廠初始快照後傳給 EventsClient
import { fetchFactoryInit } from '@/lib/api/factory'
import { EventsClient } from './events-client'

export default async function EventsPage() {
  const initialData = await fetchFactoryInit()
  return <EventsClient initialData={initialData} />
}
