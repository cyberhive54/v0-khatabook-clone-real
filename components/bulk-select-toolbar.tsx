"use client"

import { Trash2, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface BulkSelectToolbarProps {
  selectedCount: number
  totalCount: number
  onSelectAll: () => void
  onDeselectAll: () => void
  onDelete: () => void
  isDeleting?: boolean
}

export function BulkSelectToolbar({
  selectedCount,
  totalCount,
  onSelectAll,
  onDeselectAll,
  onDelete,
  isDeleting = false,
}: BulkSelectToolbarProps) {
  if (selectedCount === 0) return null

  return (
    <div className="flex items-center justify-between gap-4 p-4 bg-primary/10 border border-primary/30 rounded-lg mb-4">
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-foreground">
          {selectedCount} selected
        </span>
        {selectedCount < totalCount && (
          <button
            onClick={onSelectAll}
            className="text-sm text-primary hover:underline"
          >
            Select all {totalCount}
          </button>
        )}
        {selectedCount > 0 && (
          <button
            onClick={onDeselectAll}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Clear selection
          </button>
        )}
      </div>

      <div className="flex gap-2">
        <Button
          onClick={onDelete}
          disabled={isDeleting}
          variant="destructive"
          className="gap-2"
        >
          <Trash2 size={16} />
          Delete Selected
        </Button>
      </div>
    </div>
  )
}
