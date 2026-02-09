"use client"

import { useState, useMemo } from "react"
import { useContacts } from "@/hooks/use-contacts"
import { useTransactions } from "@/hooks/use-transactions"
import { useSettings } from "@/hooks/use-settings"
import { formatCurrency } from "@/lib/currency-utils"
import { Card } from "@/components/ui/card"
import { Navigation } from "@/components/navigation"
import { AppHeader } from "@/components/app-header"
import { Button } from "@/components/ui/button"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { CalendarIcon } from "lucide-react"
import { CalendarPicker } from "@/components/calendar-picker"

type TimePeriod = "today" | "week" | "2weeks" | "month" | "3months" | "6months" | "yearly" | "all" | "custom"

interface DateRange {
  start: Date
  end: Date
}

export default function ReportsPage() {
  const { contacts } = useContacts()
  const { transactions } = useTransactions()
  const { settings } = useSettings()
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("month")
  const [customDateRange, setCustomDateRange] = useState<DateRange>({
    start: new Date(),
    end: new Date(),
  })
  const [showCustom, setShowCustom] = useState(false)

  const getDateRange = (period: TimePeriod): DateRange => {
    const end = new Date()
    const start = new Date()

    switch (period) {
      case "today":
        start.setHours(0, 0, 0, 0)
        end.setHours(23, 59, 59, 999)
        break
      case "week":
        start.setDate(end.getDate() - 7)
        break
      case "2weeks":
        start.setDate(end.getDate() - 14)
        break
      case "month":
        start.setMonth(end.getMonth() - 1)
        break
      case "3months":
        start.setMonth(end.getMonth() - 3)
        break
      case "6months":
        start.setMonth(end.getMonth() - 6)
        break
      case "yearly":
        start.setFullYear(end.getFullYear() - 1)
        break
      case "all":
        start.setFullYear(1970)
        break
      case "custom":
        return customDateRange
    }

    return { start, end }
  }

  const dateRange = useMemo(() => getDateRange(timePeriod), [timePeriod, customDateRange])

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const transactionDate = new Date(t.date)
      return transactionDate >= dateRange.start && transactionDate <= dateRange.end
    })
  }, [transactions, dateRange])

  const metrics = useMemo(() => {
    const totalGive = filteredTransactions.reduce((sum, t) => sum + (t.you_give || 0), 0)
    const totalGot = filteredTransactions.reduce((sum, t) => sum + (t.you_got || 0), 0)
    const netBalance = totalGot - totalGive
    const transactionCount = filteredTransactions.length

    return {
      transactionCount,
      totalGive,
      totalGot,
      netBalance,
    }
  }, [filteredTransactions])

  const monthlyData = useMemo(() => {
    const monthMap: { [key: string]: { income: number; expense: number } } = {}

    filteredTransactions.forEach((t) => {
      const date = new Date(t.date)
      const monthKey = date.toLocaleDateString("en-US", { year: "numeric", month: "short" })

      if (!monthMap[monthKey]) {
        monthMap[monthKey] = { income: 0, expense: 0 }
      }

      if (t.you_got) {
        monthMap[monthKey].income += t.you_got
      }
      if (t.you_give) {
        monthMap[monthKey].expense += t.you_give
      }
    })

    return Object.entries(monthMap)
      .map(([month, data]) => ({
        month,
        income: data.income,
        expense: data.expense,
      }))
      .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime())
  }, [filteredTransactions])

  const contactsData = useMemo(() => {
    return contacts
      .map((c) => ({
        name: c.name,
        balance: filteredTransactions
          .filter((t) => t.contact_id === c.id)
          .reduce((sum, t) => sum + (t.you_got || 0) - (t.you_give || 0), 0),
      }))
      .filter((c) => c.balance !== 0)
  }, [contacts, filteredTransactions])

  const timePeriodButtons: { label: string; value: TimePeriod }[] = [
    { label: "Today", value: "today" },
    { label: "This Week", value: "week" },
    { label: "Last 2 Weeks", value: "2weeks" },
    { label: "This Month", value: "month" },
    { label: "Last 3 Months", value: "3months" },
    { label: "Last 6 Months", value: "6months" },
    { label: "Yearly", value: "yearly" },
    { label: "All Time", value: "all" },
  ]

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-background">
      <Navigation />
      <div className="flex-1">
        <AppHeader />
        <main className="p-4 md:p-8 max-w-7xl mx-auto w-full">
          <h1 className="text-3xl font-bold text-foreground mb-8">Reports & Analytics</h1>

          <Card className="p-6 bg-card border border-border mb-8">
            <div className="flex items-center gap-2 mb-4">
              <CalendarIcon className="w-5 h-5 text-muted-foreground" />
              <h3 className="text-lg font-semibold text-foreground">Select Period</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {timePeriodButtons.map((btn) => (
                <Button
                  key={btn.value}
                  variant={timePeriod === btn.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setTimePeriod(btn.value)
                    setShowCustom(false)
                  }}
                  className="text-xs md:text-sm"
                >
                  {btn.label}
                </Button>
              ))}
              <Button
                variant={timePeriod === "custom" ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setTimePeriod("custom")
                  setShowCustom(!showCustom)
                }}
                className="text-xs md:text-sm"
              >
                Custom
              </Button>
            </div>

            {showCustom && timePeriod === "custom" && (
              <div className="mt-4 pt-4 border-t border-border grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-3">Start Date</label>
                  <CalendarPicker
                    value={customDateRange.start.toISOString().split("T")[0]}
                    onChange={(date) =>
                      setCustomDateRange({
                        ...customDateRange,
                        start: new Date(date),
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-3">End Date</label>
                  <CalendarPicker
                    value={customDateRange.end.toISOString().split("T")[0]}
                    onChange={(date) =>
                      setCustomDateRange({
                        ...customDateRange,
                        end: new Date(date),
                      })
                    }
                  />
                </div>
              </div>
            )}
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <Card className="p-6 bg-card border border-border">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Transactions</p>
              <p className="text-3xl font-bold text-foreground">{metrics.transactionCount}</p>
            </Card>

            <Card className="p-6 bg-card border border-border">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">You Got</p>
              <p className="text-3xl font-bold text-green-600">{formatCurrency(metrics.totalGot, settings.currency)}</p>
              <p className="text-xs text-muted-foreground mt-1">Amount received</p>
            </Card>

            <Card className="p-6 bg-card border border-border">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">You Give</p>
              <p className="text-3xl font-bold text-red-600">{formatCurrency(metrics.totalGive, settings.currency)}</p>
              <p className="text-xs text-muted-foreground mt-1">Amount given</p>
            </Card>

            <Card className="p-6 bg-card border border-border">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Net Balance</p>
              <p className={`text-3xl font-bold ${metrics.netBalance >= 0 ? "text-green-600" : "text-red-600"}`}>
                {formatCurrency(metrics.netBalance, settings.currency)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {metrics.netBalance >= 0 ? "You are owed" : "You owe"}
              </p>
            </Card>

            <Card className="p-6 bg-card border border-border">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Avg Transaction</p>
              <p className="text-3xl font-bold text-foreground">
                {formatCurrency(
                  metrics.transactionCount > 0 ? (metrics.totalGot + metrics.totalGive) / metrics.transactionCount : 0,
                  settings.currency,
                )}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Per transaction</p>
            </Card>
          </div>

          {monthlyData.length > 0 && (
            <Card className="p-6 bg-card border border-border mb-8">
              <h3 className="text-lg font-semibold mb-4 text-foreground">Monthly Trends</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="month" stroke="var(--color-foreground)" style={{ fontSize: "12px" }} />
                  <YAxis stroke="var(--color-foreground)" style={{ fontSize: "12px" }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "var(--color-card)", border: "1px solid var(--color-border)" }}
                    labelStyle={{ color: "var(--color-foreground)" }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="income"
                    stroke="var(--color-green-600)"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    name="You Got (Income)"
                  />
                  <Line
                    type="monotone"
                    dataKey="expense"
                    stroke="var(--color-red-600)"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    name="You Give (Expense)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          )}

          {contactsData.length > 0 && (
            <Card className="p-6 bg-card border border-border">
              <h3 className="text-lg font-semibold mb-4 text-foreground">Contact Balances</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={contactsData} margin={{ bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis
                    dataKey="name"
                    stroke="var(--color-foreground)"
                    style={{ fontSize: "12px" }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis stroke="var(--color-foreground)" style={{ fontSize: "12px" }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "var(--color-card)", border: "1px solid var(--color-border)" }}
                    labelStyle={{ color: "var(--color-foreground)" }}
                    formatter={(value: any) => `$${value.toFixed(2)}`}
                  />
                  <Bar dataKey="balance" fill="var(--color-primary)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          )}

          {filteredTransactions.length === 0 && (
            <Card className="p-8 bg-card border border-border text-center">
              <p className="text-muted-foreground">No transactions found for the selected period.</p>
            </Card>
          )}
        </main>
      </div>
    </div>
  )
}
