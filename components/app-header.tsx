"use client"

import React, { useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { Settings, LogOut, User, ChevronDown } from "lucide-react"
import { Button } from "./ui/button"

export function AppHeader() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error("Sign out error:", error)
    }
  }

  const handleSettings = () => {
    router.push("/settings")
    setDropdownOpen(false)
  }

  const getUserName = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name
    }
    return user?.email?.split("@")[0] || "User"
  }

  return (
    <header className="bg-card border-b border-border p-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto w-full">
        <h1 className="text-2xl font-bold text-primary">Welcome, {getUserName()}</h1>
        
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2"
          >
            <User size={18} />
            <ChevronDown size={16} />
          </Button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg z-50">
              <button
                onClick={handleSettings}
                className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-muted flex items-center gap-2 transition-colors"
              >
                <Settings size={16} />
                Settings
              </button>
              <button
                onClick={handleSignOut}
                className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-muted flex items-center gap-2 transition-colors border-t border-border"
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
