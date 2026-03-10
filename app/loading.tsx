import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header skeleton */}
      <header className="border-b border-border bg-card/50">
        <div className="flex items-center justify-between px-4 py-2 lg:px-6">
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-md" />
            <div className="flex flex-col gap-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
        <div className="grid grid-cols-2 gap-2 px-4 pb-3 lg:grid-cols-4 lg:px-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-lg" />
          ))}
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-3 p-3 lg:p-4">
        {/* Flow diagram skeleton */}
        <Skeleton className="h-14 rounded-lg" />

        {/* Zone cards skeleton */}
        <div className="grid flex-1 grid-cols-1 gap-3 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-lg" />
          ))}
        </div>

        {/* Hardware status skeleton */}
        <div className="rounded-lg border border-border bg-card p-3">
          <Skeleton className="mb-2 h-5 w-24" />
          <div className="grid grid-cols-4 gap-1 xl:grid-cols-7">
            {Array.from({ length: 14 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-md" />
            ))}
          </div>
        </div>

        {/* Event log skeleton */}
        <Skeleton className="h-32 rounded-lg" />
      </main>
    </div>
  )
}
