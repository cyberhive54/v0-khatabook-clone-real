"use client"

import { useState } from "react"
import { ChevronDown, X } from "lucide-react"
import { CalendarPicker } from "@/components/calendar-picker"

type DateFilterType = "today" | "yesterday" | "last-3-days" | "current-week" | "last-week" | "last-7-days" | "current-month" | "last-month" | "last-30-days" | "current-year" | "last-year" | "last-365-days" | "custom" | "all"

export interface DateRange {
  startDate: string | null
  endDate: string | null
}

interface DateFilterDropdownProps {
  selectedFilter: DateFilterType
  onFilterChange: (filter: DateFilterType, range?: DateRange) => void
  dateRange?: DateRange
}

const getDateRange = (filter: DateFilterType): DateRange => {
  const today = new Date()
  const endDate = today.toISOString().split("T")[0]

  switch (filter) {
    case "today":
      return { startDate: endDate, endDate }
    case "yesterday": {
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      const date = yesterday.toISOString().split("T")[0]
      return { startDate: date, endDate: date }
    }
    case "last-3-days": {
      const start = new Date(today)
      start.setDate(start.getDate() - 3)
      return { startDate: start.toISOString().split("T")[0], endDate }
    }
    case "current-week": {
      const start = new Date(today)
      start.setDate(start.getDate() - today.getDay())
      return { startDate: start.toISOString().split("T")[0], endDate }
    }
    case "last-week": {
      const end = new Date(today)
      end.setDate(end.getDate() - today.getDay() - 1)
      const start = new Date(end)
      start.setDate(start.getDate() - 6)
      return { startDate: start.toISOString().split("T")[0], endDate: end.toISOString().split("T")[0] }
    }
    case "last-7-days": {
      const start = new Date(today)
      start.setDate(start.getDate() - 7)
      return { startDate: start.toISOString().split("T")[0], endDate }
    }
    case "current-month": {
      const start = new Date(today.getFullYear(), today.getMonth(), 1)
      return { startDate: start.toISOString().split("T")[0], endDate }
    }
    case "last-month": {
      const start = new Date(today.getFullYear(), today.getMonth() - 1, 1)
      const end = new Date(today.getFullYear(), today.getMonth(), 0)
      return { startDate: start.toISOString().split("T")[0], endDate: end.toISOString().split("T")[0] }
    }
    case "last-30-days": {
      const start = new Date(today)
      start.setDate(start.getDate() - 30)
      return { startDate: start.toISOString().split("T")[0], endDate }
    }
    case "current-year": {
      const start = new Date(today.getFullYear(), 0, 1)
      return { startDate: start.toISOString().split("T")[0], endDate }
    }
    case "last-year": {
      const start = new Date(today.getFullYear() - 1, 0, 1)
      const end = new Date(today.getFullYear() - 1, 11, 31)
      return { startDate: start.toISOString().split("T")[0], endDate: end.toISOString().split("T")[0] }
    }
    case "last-365-days": {
      const start = new Date(today)
      start.setDate(start.getDate() - 365)
      return { startDate: start.toISOString().split("T")[0], endDate }
    }
    default:
      return { startDate: null, endDate: null }
  }
}

export function DateFilterDropdown({ selectedFilter, onFilterChange, dateRange }: DateFilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [customStart, setCustomStart] = useState(dateRange?.startDate || "")
  const [customEnd, setCustomEnd] = useState(dateRange?.endDate || "")

  const handleFilterSelect = (filter: DateFilterType) => {
    if (filter === "custom") {
      setIsOpen(true)
      return
    }
    const range = getDateRange(filter)
    onFilterChange(filter, range)
    setIsOpen(false)
  }

  const handleCustomDateSubmit = () => {
    if (customStart && customEnd) {
      if (new Date(customStart) <= new Date(customEnd)) {
        onFilterChange("custom", { startDate: customStart, endDate: customEnd })
        setIsOpen(false)
      }
    }
  }

  const filterLabels: Record<DateFilterType, string> = {
    "today": "Today",
    "yesterday": "Yesterday",
    "last-3-days": "Last 3 Days",
    "current-week": "Current Week",
    "last-week": "Last Week",
    "last-7-days": "Last 7 Days",
    "current-month": "Current Month",
    "last-month": "Last Month",
    "last-30-days": "Last 30 Days",
    "current-year": "Current Year",
    "last-year": "Last Year",
    "last-365-days": "Last 365 Days",
    "custom": "Custom",
    "all": "All Time",
  }

  return (
    <div className="relative w-full md:w-auto">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 border border-input rounded-lg bg-background text-foreground hover:bg-muted transition-colors text-sm w-full md:w-auto"
      >
        <span>{filterLabels[selectedFilter]}</span>
        <ChevronDown size={16} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-input rounded-lg shadow-xl z-20 min-w-56">
          <div className="p-2 max-h-80 overflow-y-auto space-y-1">
            {/* Quick Filters */}
            <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase">Day</div>
            {["today", "yesterday"].map((f) => (
              <button
                key={f}
                onClick={() => handleFilterSelect(f as DateFilterType)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                  selectedFilter === f ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                }`}
              >
                {filterLabels[f as DateFilterType]}
              </button>
            ))}

            <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase mt-2">Week</div>
            {["last-3-days", "current-week", "last-week", "last-7-days"].map((f) => (
              <button
                key={f}
                onClick={() => handleFilterSelect(f as DateFilterType)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                  selectedFilter === f ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                }`}
              >
                {filterLabels[f as DateFilterType]}
              </button>
            ))}

            <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase mt-2">Month</div>
            {["current-month", "last-month", "last-30-days"].map((f) => (
              <button
                key={f}
                onClick={() => handleFilterSelect(f as DateFilterType)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                  selectedFilter === f ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                }`}
              >
                {filterLabels[f as DateFilterType]}
              </button>
            ))}

            <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase mt-2">Year</div>
            {["current-year", "last-year", "last-365-days"].map((f) => (
              <button
                key={f}
                onClick={() => handleFilterSelect(f as DateFilterType)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                  selectedFilter === f ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                }`}
              >
                {filterLabels[f as DateFilterType]}
              </button>
            ))}

            <div className="border-t border-border my-2" />
            <button
              onClick={() => handleFilterSelect("all")}
              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                selectedFilter === "all" ? "bg-primary text-primary-foreground" : "hover:bg-muted"
              }`}
            >
              {filterLabels["all"]}
            </button>

            <div className="border-t border-border my-2" />
            <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase">Custom Range</div>
            {selectedFilter === "custom" && (
              <div className="p-3 space-y-2 bg-muted/30 rounded-md">
                <div>
                  <label className="text-xs font-medium text-foreground">Start Date</label>
                  <CalendarPicker
                    value={customStart}
                    onChange={setCustomStart}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground">End Date</label>
                  <CalendarPicker
                    value={customEnd}
                    onChange={setCustomEnd}
                  />
                </div>
                <button
                  onClick={handleCustomDateSubmit}
                  className="w-full px-3 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  Apply
                </button>
              </div>
            )}
            <button
              onClick={() => handleFilterSelect("custom")}
              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                selectedFilter === "custom" ? "bg-primary text-primary-foreground" : "hover:bg-muted"
              }`}
            >
              {filterLabels["custom"]}
            </button>
          </div>
        </div>
      )}

      {selectedFilter !== "all" && (
        <button
          onClick={() => onFilterChange("all")}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded transition-colors"
          title="Clear filter"
        >
          <X size={16} />
        </button>
      )}
    </div>
  )
}
