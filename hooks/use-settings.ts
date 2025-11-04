"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useTheme } from "next-themes"

export interface Settings {
  id: string
  appName: string
  businessName: string
  email: string
  phone: string
  currency: string
  theme: string
  liveNetworkCheck: boolean
  offlineMode: boolean
}

const DEFAULT_SETTINGS: Settings = {
  id: "default",
  appName: "Khatabook",
  businessName: "",
  email: "",
  phone: "",
  currency: "INR",
  theme: "light",
  liveNetworkCheck: true,
  offlineMode: false,
}

const STORAGE_KEY = "khatabook_settings"

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null)
  const { setTheme } = useTheme()

  useEffect(() => {
    const initializeSettings = async () => {
      try {
        supabaseRef.current = createClient()

        const { data, error: fetchError } = await supabaseRef.current
          .from("settings")
          .select("id, app_name, business_name, email, phone, currency, theme, live_network_check, offline_mode")
          .limit(1)

        if (fetchError) {
          console.warn("[v0] Failed to fetch from Supabase:", fetchError.message)
          const stored = localStorage.getItem(STORAGE_KEY)
          if (stored) {
            const parsedSettings = JSON.parse(stored)
            setSettings(parsedSettings)
            if (setTheme) setTheme(parsedSettings.theme)
          } else {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SETTINGS))
            setSettings(DEFAULT_SETTINGS)
            if (setTheme) setTheme(DEFAULT_SETTINGS.theme)
          }
        } else if (data && data.length > 0) {
          const dbSettings = data[0]
          const mappedSettings: Settings = {
            id: dbSettings.id,
            appName: dbSettings.app_name ?? "",
            businessName: dbSettings.business_name ?? "",
            email: dbSettings.email ?? "",
            phone: dbSettings.phone ?? "",
            currency: dbSettings.currency ?? "INR",
            theme: dbSettings.theme ?? "light",
            liveNetworkCheck: dbSettings.live_network_check ?? true,
            offlineMode: dbSettings.offline_mode ?? false,
          }
          setSettings(mappedSettings)
          localStorage.setItem(STORAGE_KEY, JSON.stringify(mappedSettings))
          if (setTheme) setTheme(mappedSettings.theme)
        } else {
          const { data: insertData, error: insertError } = await supabaseRef.current
            .from("settings")
            .insert([
              {
                app_name: DEFAULT_SETTINGS.appName,
                business_name: DEFAULT_SETTINGS.businessName,
                email: DEFAULT_SETTINGS.email,
                phone: DEFAULT_SETTINGS.phone,
                currency: DEFAULT_SETTINGS.currency,
                theme: DEFAULT_SETTINGS.theme,
                live_network_check: DEFAULT_SETTINGS.liveNetworkCheck,
                offline_mode: DEFAULT_SETTINGS.offlineMode,
              },
            ])
            .select()

          if (insertError) {
            console.warn("[v0] Failed to create default settings:", insertError.message)
            localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SETTINGS))
          } else if (insertData && insertData.length > 0) {
            const newSettings: Settings = {
              id: insertData[0].id,
              appName: insertData[0].app_name,
              businessName: insertData[0].business_name,
              email: insertData[0].email,
              phone: insertData[0].phone,
              currency: insertData[0].currency,
              theme: insertData[0].theme,
              liveNetworkCheck: insertData[0].live_network_check ?? true,
              offlineMode: insertData[0].offline_mode ?? false,
            }
            setSettings(newSettings)
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings))
            if (setTheme) setTheme(newSettings.theme)
          }
        }
      } catch (err) {
        console.error("[v0] Error initializing settings:", err)
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
          const parsedSettings = JSON.parse(stored)
          setSettings(parsedSettings)
          if (setTheme) setTheme(parsedSettings.theme)
        } else {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SETTINGS))
          setSettings(DEFAULT_SETTINGS)
          if (setTheme) setTheme(DEFAULT_SETTINGS.theme)
        }
      } finally {
        setIsLoading(false)
      }
    }

    initializeSettings()
  }, [setTheme])

  const autoSave = useCallback(
    async (settingsToSave: Omit<Settings, "id">) => {
      try {
        setIsSaving(true)
        const updatedSettings: Settings = {
          ...settings,
          ...settingsToSave,
        }

        if (settingsToSave.theme && setTheme) {
          setTheme(settingsToSave.theme)
        }

        if (supabaseRef.current && settings.id !== "default") {
          const dbUpdate = {
            app_name: settingsToSave.appName,
            business_name: settingsToSave.businessName,
            email: settingsToSave.email,
            phone: settingsToSave.phone,
            currency: settingsToSave.currency,
            theme: settingsToSave.theme,
            live_network_check: settingsToSave.liveNetworkCheck,
            offline_mode: settingsToSave.offlineMode,
          }

          const { error: updateError } = await supabaseRef.current
            .from("settings")
            .update(dbUpdate)
            .eq("id", settings.id)

          if (updateError) {
            console.error("[v0] Failed to update Supabase:", updateError.message)
          } else {
            console.log("[v0] Settings saved to Supabase")
          }
        }

        setSettings(updatedSettings)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSettings))
      } catch (err) {
        console.error("[v0] Error saving settings:", err instanceof Error ? err.message : String(err))
        setError(err instanceof Error ? err : new Error("Failed to save settings"))
      } finally {
        setIsSaving(false)
      }
    },
    [settings, setTheme],
  )

  const debouncedSave = useCallback(
    (settingsToSave: Omit<Settings, "id">) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
      debounceTimerRef.current = setTimeout(() => {
        autoSave(settingsToSave)
      }, 1500)
    },
    [autoSave],
  )

  const saveSettings = useCallback(
    async (settingsToSave: Omit<Settings, "id">) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
      await autoSave(settingsToSave)
    },
    [autoSave],
  )

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [])

  return {
    settings,
    isLoading,
    error,
    saveSettings,
    debouncedSave,
    isSaving,
  }
}
