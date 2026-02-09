"use client"

import { Grid3x3, List, LayoutGrid } from "lucide-react"

type ViewType = "card" | "list" | "grid"

interface ViewSwitcherProps {
  currentView: ViewType
  onViewChange: (view: ViewType) => void
}

export function ViewSwitcher({ currentView, onViewChange }: ViewSwitcherProps) {
  return (
    <div className="flex gap-2 p-1 bg-muted/30 rounded-lg border border-border w-fit">
      <button
        onClick={() => onViewChange("card")}
        className={`p-2 rounded-md transition-all ${
          currentView === "card"
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:text-foreground"
        }`}
        title="Card View"
      >
        <Grid3x3 size={18} />
      </button>
      <button
        onClick={() => onViewChange("list")}
        className={`p-2 rounded-md transition-all ${
          currentView === "list"
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:text-foreground"
        }`}
        title="List View"
      >
        <List size={18} />
      </button>
      <button
        onClick={() => onViewChange("grid")}
        className={`p-2 rounded-md transition-all ${
          currentView === "grid"
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:text-foreground"
        }`}
        title="Grid View"
      >
        <LayoutGrid size={18} />
      </button>
    </div>
  )
}
