"use client"

import type React from "react"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Navigation } from "@/components/navigation"
import { AppHeader } from "@/components/app-header"
import { UserProfileSection } from "@/components/user-profile-section"
import { DeleteAccountModal } from "@/components/delete-account-modal"
import { useState, useEffect } from "react"
import { useSettings } from "@/hooks/use-settings"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, Check, Loader2 } from "lucide-react"

export default function SettingsPage() {
  const { settings, saveSettings, debouncedSave, isLoading, isSaving } = useSettings()
  const [formData, setFormData] = useState(settings)
  const [saved, setSaved] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)

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
      setTimeout(() => setSaved(false), 3000)
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
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
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
        <main className="p-4 md:p-6 lg:p-8 max-w-5xl mx-auto w-full">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Settings</h1>
            <p className="text-muted-foreground">Manage your preferences and account settings</p>
          </div>

          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8 bg-muted/30 p-1 rounded-lg border border-border">
              <TabsTrigger value="profile" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Profile & Security
              </TabsTrigger>
              <TabsTrigger value="preferences" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Preferences
              </TabsTrigger>
              <TabsTrigger value="danger" className="data-[state=active]:bg-destructive data-[state=active]:text-destructive-foreground">
                Danger Zone
              </TabsTrigger>
            </TabsList>

            {/* Profile & Security Tab */}
            <TabsContent value="profile" className="space-y-6">
              <UserProfileSection />
            </TabsContent>

            {/* Preferences Tab */}
            <TabsContent value="preferences" className="space-y-4">
              <Card className="p-6 bg-card border border-border">
                <div className="space-y-6">
                  {/* App Name */}
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">App Name</label>
                    <input
                      type="text"
                      name="appName"
                      value={formData.appName || ""}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-input rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    />
                  </div>

                  {/* Business Name */}
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">Business Name</label>
                    <input
                      type="text"
                      name="businessName"
                      value={formData.businessName || ""}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-input rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email || ""}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-input rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone || ""}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-input rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    />
                  </div>

                  {/* Currency & Theme */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">Currency</label>
                      <select
                        name="currency"
                        value={formData.currency || "INR"}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-input rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all cursor-pointer"
                      >
                        <option value="INR">INR (₹)</option>
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="JPY">JPY (¥)</option>
                        <option value="CNY">CNY (¥)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">Theme</label>
                      <select
                        name="theme"
                        value={formData.theme || "light"}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-input rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all cursor-pointer"
                      >
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                        <option value="system">System</option>
                      </select>
                    </div>
                  </div>

                  {/* Language */}
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">Language</label>
                    <div className="flex items-center gap-3">
                      <select
                        disabled
                        className="flex-1 px-4 py-2.5 border border-input rounded-lg bg-muted text-muted-foreground text-sm cursor-not-allowed opacity-50"
                      >
                        <option value="en">English</option>
                      </select>
                      <span className="text-xs font-semibold bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 px-3 py-1.5 rounded-full whitespace-nowrap">
                        Coming Soon
                      </span>
                    </div>
                  </div>

                  {/* Offline Settings */}
                  <div className="border-t border-border pt-6 mt-6">
                    <h3 className="text-lg font-bold text-foreground mb-4">Offline & Network</h3>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border hover:border-primary/50 transition-colors">
                        <div>
                          <label className="block text-sm font-semibold text-foreground mb-1">Live Network Check</label>
                          <p className="text-xs text-muted-foreground">Monitor your internet connection status in real-time</p>
                        </div>
                        <input
                          type="checkbox"
                          name="liveNetworkCheck"
                          checked={formData.liveNetworkCheck || false}
                          onChange={handleChange}
                          className="w-5 h-5 cursor-pointer accent-primary"
                        />
                      </div>

                      <div
                        className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
                          formData.liveNetworkCheck
                            ? "bg-muted/30 border-border hover:border-primary/50"
                            : "bg-muted/10 border-border/50 opacity-50 cursor-not-allowed"
                        }`}
                      >
                        <div>
                          <label
                            className={`block text-sm font-semibold ${formData.liveNetworkCheck ? "text-foreground" : "text-muted-foreground"} mb-1`}
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
                          className="w-5 h-5 cursor-pointer accent-primary disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Data Management Info */}
                  <div className="border-t border-border pt-6 mt-6">
                    <h3 className="text-lg font-bold text-foreground mb-4">Sync & Data Management</h3>
                    <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                      <div className="flex gap-3">
                        <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">Offline-First Architecture</p>
                          <p className="text-xs text-blue-800 dark:text-blue-200 mt-1">
                            All your data is stored locally and synced automatically. You can work offline, and changes will sync when you're back online. Your data is automatically synced every 1 minute.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Save Status */}
                  <div className="flex items-center gap-2 pt-4">
                    {isSaving && (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-primary" />
                        <p className="text-sm text-muted-foreground">Saving...</p>
                      </div>
                    )}
                    {saved && !isSaving && (
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-secondary" />
                        <p className="text-sm text-secondary font-medium">Settings saved successfully!</p>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* Danger Zone Tab */}
            <TabsContent value="danger" className="space-y-4">
              <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
                <div className="mb-6">
                  <h2 className="text-lg font-bold text-foreground mb-2">Danger Zone</h2>
                  <p className="text-sm text-muted-foreground">Irreversible and destructive actions</p>
                </div>

                <div className="space-y-4">
                  {/* Delete Account */}
                  <Card className="p-4 bg-destructive/5 border border-destructive/20 hover:border-destructive/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-foreground">Delete Account</h3>
                        <p className="text-xs text-muted-foreground mt-1">Permanently delete your account and all associated data</p>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setDeleteModalOpen(true)}
                      >
                        Delete Account
                      </Button>
                    </div>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
      
      <DeleteAccountModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
      />
    </div>
  )
}
