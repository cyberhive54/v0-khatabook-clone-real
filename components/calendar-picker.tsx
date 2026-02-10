"use client"

import React, { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CalendarPickerProps {
  value: string
  onChange: (date: string) => void
  disabled?: boolean
}

export function CalendarPicker({ value, onChange, disabled = false }: CalendarPickerProps) {
  const date = value ? new Date(value) : new Date()
  const [month, setMonth] = useState(date.getMonth())
  const [year, setYear] = useState(date.getFullYear())
  const [isOpen, setIsOpen] = useState(false)

  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDayOfMonth = new Date(year, month, 1).getDay()
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const emptyDays = Array.from({ length: firstDayOfMonth }, () => null)

  const handleDateClick = (day: number) => {
    const newDate = new Date(year, month, day)
    // Format as YYYY-MM-DD without timezone conversion
    const dateString = newDate.getFullYear() + '-' + 
      String(newDate.getMonth() + 1).padStart(2, '0') + '-' + 
      String(newDate.getDate()).padStart(2, '0')
    onChange(dateString)
    setIsOpen(false)
  }

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (month === 0) {
      setMonth(11)
      setYear(year - 1)
    } else {
      setMonth(month - 1)
    }
  }

  const handleNextMonth = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (month === 11) {
      setMonth(0)
      setYear(year + 1)
    } else {
      setMonth(month + 1)
    }
  }

  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ]

  const currentDate = new Date(date)
  const displayDate = currentDate.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })

  return (
    <div className="relative">
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          !disabled && setIsOpen(!isOpen)
        }}
        disabled={disabled}
        className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
      >
        {displayDate}
      </button>

      {isOpen && !disabled && (
        <div className="absolute top-full left-0 mt-2 bg-background border border-border rounded-lg p-4 shadow-lg z-50 w-72" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-4">
            <button 
              type="button"
              onClick={handlePrevMonth}
              onMouseDown={(e) => e.preventDefault()}
              className="p-1 hover:bg-muted rounded"
            >
              <ChevronLeft size={20} />
            </button>

            <div className="flex gap-2">
              <select
                value={monthNames[month]}
                onChange={(e) => {
                  e.stopPropagation()
                  const newMonth = monthNames.indexOf(e.target.value)
                  setMonth(newMonth)
                }}
                onClick={(e) => e.stopPropagation()}
                className="px-2 py-1 border border-input rounded bg-background text-foreground text-sm"
              >
                {monthNames.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>

              <select
                value={year}
                onChange={(e) => {
                  e.stopPropagation()
                  setYear(parseInt(e.target.value))
                }}
                onClick={(e) => e.stopPropagation()}
                className="px-2 py-1 border border-input rounded bg-background text-foreground text-sm"
              >
                {Array.from({ length: 20 }, (_, i) => year - 10 + i).map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <button 
              type="button"
              onClick={handleNextMonth}
              onMouseDown={(e) => e.preventDefault()}
              className="p-1 hover:bg-muted rounded"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground mb-2">
            <div>Su</div>
            <div>Mo</div>
            <div>Tu</div>
            <div>We</div>
            <div>Th</div>
            <div>Fr</div>
            <div>Sa</div>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {emptyDays.map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {days.map((day) => {
              const isSelected =
                day === currentDate.getDate() &&
                month === currentDate.getMonth() &&
                year === currentDate.getFullYear()

              return (
                <button
                  key={day}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    handleDateClick(day)
                  }}
                  onMouseDown={(e) => e.preventDefault()}
                  className={`p-2 text-sm rounded hover:bg-muted transition-colors ${
                    isSelected ? "bg-primary text-primary-foreground" : ""
                  }`}
                >
                  {day}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
