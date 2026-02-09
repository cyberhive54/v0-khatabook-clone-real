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
    const dateString = newDate.toISOString().split("T")[0]
    onChange(dateString)
    setIsOpen(false)
  }

  const handlePrevMonth = () => {
    if (month === 0) {
      setMonth(11)
      setYear(year - 1)
    } else {
      setMonth(month - 1)
    }
  }

  const handleNextMonth = () => {
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
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
      >
        {displayDate}
      </button>

      {isOpen && !disabled && (
        <div className="absolute top-full left-0 mt-2 bg-background border border-border rounded-lg p-4 shadow-lg z-10 w-72">
          <div className="flex items-center justify-between mb-4">
            <button onClick={handlePrevMonth} className="p-1 hover:bg-muted rounded">
              <ChevronLeft size={20} />
            </button>

            <div className="flex gap-2">
              <select
                value={monthNames[month]}
                onChange={(e) => {
                  const newMonth = monthNames.indexOf(e.target.value)
                  setMonth(newMonth)
                }}
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
                onChange={(e) => setYear(parseInt(e.target.value))}
                className="px-2 py-1 border border-input rounded bg-background text-foreground text-sm"
              >
                {Array.from({ length: 20 }, (_, i) => year - 10 + i).map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <button onClick={handleNextMonth} className="p-1 hover:bg-muted rounded">
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
                  onClick={() => handleDateClick(day)}
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
