"use client"

import { useState, useEffect } from "react"

export interface ConnectionStatus {
  isOnline: boolean
  status: "online" | "offline"
}

export function useConnectionStatus() {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    isOnline: typeof window !== "undefined" ? navigator.onLine : true,
    status: typeof window !== "undefined" ? (navigator.onLine ? "online" : "offline") : "online",
  })

  useEffect(() => {
    const handleOnline = () => {
      setConnectionStatus({
        isOnline: true,
        status: "online",
      })
    }

    const handleOffline = () => {
      setConnectionStatus({
        isOnline: false,
        status: "offline",
      })
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  return connectionStatus
}
