"use client"

import { useEffect, useState } from "react"
import { Scissors, Warehouse, ArrowLeftRight, Shirt, ChevronRight } from "lucide-react"

const stages = [
  { id: "cutting", label: "裁片區", icon: Scissors, color: "text-neon-cyan", bg: "bg-neon-cyan/15", borderColor: "border-neon-cyan/40" },
  { id: "elevator-up", label: "升降機", icon: ChevronRight, color: "text-muted-foreground", bg: "bg-secondary", borderColor: "border-border" },
  { id: "skybridge-1", label: "空橋", icon: ArrowLeftRight, color: "text-neon-cyan", bg: "bg-neon-cyan/10", borderColor: "border-neon-cyan/30" },
  { id: "buffer", label: "配料倉", icon: Warehouse, color: "text-neon-amber", bg: "bg-neon-amber/15", borderColor: "border-neon-amber/40" },
  { id: "skybridge-2", label: "空橋", icon: ArrowLeftRight, color: "text-neon-amber", bg: "bg-neon-amber/10", borderColor: "border-neon-amber/30" },
  { id: "elevator-down", label: "升降機", icon: ChevronRight, color: "text-muted-foreground", bg: "bg-secondary", borderColor: "border-border" },
  { id: "sewing", label: "縫製區", icon: Shirt, color: "text-neon-green", bg: "bg-neon-green/15", borderColor: "border-neon-green/40" },
]

export function FlowDiagram() {
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % stages.length)
    }, 1200)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="rounded-lg border border-border bg-card px-4 py-3">
      <div className="mb-2 flex items-center gap-2">
        <span className="text-xs font-semibold text-card-foreground">{'製程流程圖'}</span>
        <span className="rounded bg-primary/15 px-1.5 py-0.5 font-mono text-[10px] text-primary">
          {'循環'}
        </span>
      </div>
      <div className="flex items-center gap-1 overflow-x-auto py-1" role="img" aria-label="從裁片到縫製的製程流程">
        {stages.map((stage, i) => {
          const Icon = stage.icon
          const isActive = i === activeIndex
          return (
            <div key={stage.id} className="flex shrink-0 items-center gap-1">
              <div
                className={`flex items-center gap-1.5 rounded-md border px-2 py-1.5 transition-all duration-300 ${
                  isActive
                    ? `${stage.bg} ${stage.borderColor} shadow-sm`
                    : "border-border bg-secondary/30"
                }`}
              >
                <Icon className={`h-3 w-3 ${isActive ? stage.color : "text-muted-foreground"}`} />
                <span className={`text-[10px] font-medium ${isActive ? stage.color : "text-muted-foreground"}`}>
                  {stage.label}
                </span>
              </div>
              {i < stages.length - 1 && (
                <ChevronRight className={`h-3 w-3 shrink-0 ${
                  i === activeIndex ? "text-primary" : "text-muted-foreground/40"
                }`} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
