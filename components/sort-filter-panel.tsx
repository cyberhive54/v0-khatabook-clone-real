"use client"

import { ChevronDown } from "lucide-react"

type SortBy = "name-az" | "name-za" | "added-latest" | "added-oldest" | "balance-highest" | "balance-lowest" | "transaction-latest" | "transaction-oldest" | "all"

interface SortFilterPanelProps {
  sortBy: SortBy
  onSortChange: (sort: SortBy) => void
}

interface SortOption {
  value: SortBy
  label: string
}

interface SortGroup {
  label: string
  options: SortOption[]
}

type SortOptionType = SortOption | SortGroup

const sortOptions: SortOptionType[] = [
  { value: "all", label: "All" },
  { label: "Name", options: [
    { value: "name-az", label: "A to Z" },
    { value: "name-za", label: "Z to A" },
  ]},
  { label: "Added Date", options: [
    { value: "added-latest", label: "Latest" },
    { value: "added-oldest", label: "Oldest" },
  ]},
  { label: "Balance", options: [
    { value: "balance-highest", label: "Highest" },
    { value: "balance-lowest", label: "Lowest" },
  ]},
  { label: "Transactions", options: [
    { value: "transaction-latest", label: "Latest" },
    { value: "transaction-oldest", label: "Oldest" },
  ]},
]

export function SortFilterPanel({ sortBy, onSortChange }: SortFilterPanelProps) {
  const getCurrentLabel = () => {
    if (sortBy === "all") return "All"
    for (const group of sortOptions) {
      if ("options" in group && group.options) {
        const found = group.options.find((opt) => opt.value === sortBy)
        if (found) return `${group.label}: ${found.label}`
      }
    }
    return "Sort By"
  }

  return (
    <div className="flex items-center gap-2">
      <label className="text-sm font-medium text-foreground">Sort By:</label>
      <div className="relative">
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value as SortBy)}
          className="appearance-none px-4 py-2 border border-border rounded-lg bg-input text-foreground pr-8 text-sm"
        >
          {sortOptions.map((option) => {
            if ("options" in option) {
              return (
                <optgroup key={option.label} label={option.label}>
                  {option.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </optgroup>
              )
            }
            return (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            )
          })}
        </select>
        <ChevronDown
          size={16}
          className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground"
        />
      </div>
    </div>
  )
}
