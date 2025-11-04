"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { useContactStats } from "@/hooks/use-contact-stats"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { format } from "date-fns"

interface ContactDetailModalProps {
  contactId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  contact: any
}

export function ContactDetailModal({ contactId, open, onOpenChange, contact }: ContactDetailModalProps) {
  const stats = useContactStats(contactId || "")

  if (!contact || !contactId) return null

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  // Prepare chart data from transaction history
  const chartData = stats.transactionHistory
    .slice()
    .reverse()
    .map((t) => ({
      date: format(new Date(t.date), "MMM dd"),
      Gave: t.you_give || 0,
      Got: t.you_got || 0,
    }))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Contact Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Profile Section */}
          <div className="flex items-start gap-4 pb-4 border-b border-border">
            <Avatar className="size-16">
              {contact.profile_pic && (
                <AvatarImage src={contact.profile_pic || "/placeholder.svg"} alt={contact.name} />
              )}
              <AvatarFallback>{getInitials(contact.name)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-foreground">{contact.name}</h2>
              <p className="text-sm text-muted-foreground">
                Customer since {format(new Date(stats.createdAt), "MMM dd, yyyy")}
              </p>
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Phone</p>
              <p className="text-foreground">{contact.phone || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p className="text-foreground">{contact.email || "N/A"}</p>
            </div>
            <div className="col-span-2">
              <p className="text-sm font-medium text-muted-foreground">Address</p>
              <p className="text-foreground">{contact.address || "N/A"}</p>
            </div>
            <div className="col-span-2">
              <p className="text-sm font-medium text-muted-foreground">Notes</p>
              <p className="text-foreground">{contact.notes || "No notes"}</p>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="p-4 bg-card border border-border">
              <p className="text-xs font-medium text-muted-foreground mb-1">Running Balance</p>
              <p className={`text-lg font-bold ${stats.balance >= 0 ? "text-secondary" : "text-destructive"}`}>
                ₹{stats.balance.toFixed(2)}
              </p>
            </Card>
            <Card className="p-4 bg-card border border-border">
              <p className="text-xs font-medium text-muted-foreground mb-1">You Gave</p>
              <p className="text-lg font-bold text-destructive">₹{stats.totalGave.toFixed(2)}</p>
            </Card>
            <Card className="p-4 bg-card border border-border">
              <p className="text-xs font-medium text-muted-foreground mb-1">You Got</p>
              <p className="text-lg font-bold text-secondary">₹{stats.totalGot.toFixed(2)}</p>
            </Card>
          </div>

          {/* Transaction Summary */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4 bg-card border border-border">
              <p className="text-sm font-medium text-muted-foreground mb-2">Transaction Details</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Transactions:</span>
                  <span className="font-medium">{stats.totalTransactions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Transaction:</span>
                  <span className="font-medium">
                    {stats.lastTransactionDate ? format(new Date(stats.lastTransactionDate), "MMM dd, yyyy") : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Amount:</span>
                  <span className="font-medium">₹{(stats.lastTransactionAmount || 0).toFixed(2)}</span>
                </div>
              </div>
            </Card>
            <Card className="p-4 bg-card border border-border">
              <p className="text-sm font-medium text-muted-foreground mb-2">Amount Summary</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Gave:</span>
                  <span className="font-medium text-destructive">₹{stats.totalGave.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Got:</span>
                  <span className="font-medium text-secondary">₹{stats.totalGot.toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-border">
                  <span className="text-muted-foreground">Current Balance:</span>
                  <span className={`font-medium ${stats.balance >= 0 ? "text-secondary" : "text-destructive"}`}>
                    ₹{stats.balance.toFixed(2)}
                  </span>
                </div>
              </div>
            </Card>
          </div>

          {/* Chart */}
          {chartData.length > 0 && (
            <Card className="p-4 bg-card border border-border">
              <p className="text-sm font-medium text-muted-foreground mb-4">Transaction Trend</p>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Got" fill="hsl(var(--color-secondary))" />
                  <Bar dataKey="Gave" fill="hsl(var(--color-destructive))" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
