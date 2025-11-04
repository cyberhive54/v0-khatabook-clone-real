"use client"

import type React from "react"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Navigation } from "@/components/navigation"
import { AppHeader } from "@/components/app-header"
import { useState, useEffect } from "react"
import { useSettings } from "@/hooks/use-settings"

export default function SettingsPage() {
  const { settings, saveSettings, debouncedSave, isLoading, isSaving } = useSettings()
  const [formData, setFormData] = useState(settings)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setFormData(settings)
  }, [settings])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData((prev) => {
      const updated = {
        ...prev,
        [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
      }
      const { id, ...dataToSave } = updated
      debouncedSave(dataToSave)
      return updated
    })
  }

  const handleManualSave = async () => {
    try {
      const { id, ...dataToSave } = formData
      await saveSettings(dataToSave)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (error) {
      console.error("Error saving settings:", error)
      alert("Failed to save settings")
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col md:flex-row min-h-screen bg-background">
        <Navigation />
        <div className="flex-1">
          <AppHeader />
          <main className="p-4 md:p-8 max-w-2xl mx-auto w-full">
            <p className="text-muted-foreground">Loading settings...</p>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-background">
      <Navigation />
      <div className="flex-1">
        <AppHeader />
        <main className="p-4 md:p-6 lg:p-8 max-w-2xl mx-auto w-full">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-6">Settings</h1>

          <Card className="p-4 md:p-6 bg-card border border-border space-y-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">App Name</label>
              <input
                type="text"
                name="appName"
                value={formData.appName || ""}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-border rounded-lg bg-input text-foreground text-sm md:text-base"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Business Name</label>
              <input
                type="text"
                name="businessName"
                value={formData.businessName || ""}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-border rounded-lg bg-input text-foreground text-sm md:text-base"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email || ""}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-border rounded-lg bg-input text-foreground text-sm md:text-base"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone || ""}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-border rounded-lg bg-input text-foreground text-sm md:text-base"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Currency</label>
              <select
                name="currency"
                value={formData.currency || "INR"}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-border rounded-lg bg-input text-foreground text-sm md:text-base"
              >
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="JPY">JPY (¥)</option>
                <option value="CNY">CNY (¥)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Theme</label>
              <select
                name="theme"
                value={formData.theme || "light"}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-border rounded-lg bg-input text-foreground text-sm md:text-base"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Language</label>
              <div className="flex items-center gap-3">
                <select
                  disabled
                  className="flex-1 px-4 py-2 border border-border rounded-lg bg-input text-foreground text-sm md:text-base opacity-50 cursor-not-allowed"
                >
                  <option value="en">English</option>
                  <option value="hi">Hindi (हिंदी)</option>
                  <option value="es">Spanish (Español)</option>
                  <option value="fr">French (Français)</option>
                </select>
                <span className="text-xs font-semibold bg-accent text-accent-foreground px-2 py-1 rounded whitespace-nowrap">
                  Coming Soon
                </span>
              </div>
            </div>

            <div className="border-t border-border pt-6 mt-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Offline & Network</h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Live Network Check</label>
                    <p className="text-xs text-muted-foreground">
                      Monitor your internet connection status in real-time
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    name="liveNetworkCheck"
                    checked={formData.liveNetworkCheck || false}
                    onChange={handleChange}
                    className="w-5 h-5 cursor-pointer"
                  />
                </div>

                <div
                  className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                    formData.liveNetworkCheck
                      ? "bg-muted/50 border-border"
                      : "bg-muted/20 border-border/50 opacity-50 cursor-not-allowed"
                  }`}
                >
                  <div>
                    <label
                      className={`block text-sm font-medium ${formData.liveNetworkCheck ? "text-foreground" : "text-muted-foreground"} mb-1`}
                    >
                      Offline Mode
                    </label>
                    <p className="text-xs text-muted-foreground">
                      {formData.liveNetworkCheck
                        ? "Save data locally and sync when online"
                        : "Enable Live Network Check first"}
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    name="offlineMode"
                    checked={formData.offlineMode || false}
                    onChange={handleChange}
                    disabled={!formData.liveNetworkCheck}
                    className="w-5 h-5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isSaving && (
                <>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <p className="text-sm text-muted-foreground">Saving...</p>
                </>
              )}
              {saved && !isSaving && <p className="text-secondary text-sm font-medium">Settings saved successfully!</p>}
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-4">
              <Button
                onClick={handleManualSave}
                disabled={isSaving}
                className="bg-secondary text-secondary-foreground hover:bg-secondary/90 disabled:opacity-50 text-sm md:text-base"
              >
                {isSaving ? "Saving..." : "Save Now"}
              </Button>
            </div>
          </Card>
        </main>
      </div>
    </div>
  )
}
