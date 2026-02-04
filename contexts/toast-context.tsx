"use client"

import React, { createContext, useContext, useState, useCallback } from "react"
import { X, CheckCircle, AlertCircle, InfoIcon } from "lucide-react"

export type ToastType = "success" | "error" | "info"

export interface Toast {
  id: string
  message: string
  type: ToastType
  duration?: number
}

interface ToastContextType {
  toasts: Toast[]
  addToast: (message: string, type: ToastType, duration?: number) => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((message: string, type: ToastType, duration = 3000) => {
    const id = Math.random().toString(36).substr(2, 9)
    setToasts((prev) => [...prev, { id, message, type, duration }])

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within ToastProvider")
  }
  return context
}

function ToastContainer() {
  const { toasts, removeToast } = useToast()

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  )
}

function Toast({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const bgColor = {
    success: "bg-green-50 border-green-200",
    error: "bg-red-50 border-red-200",
    info: "bg-blue-50 border-blue-200",
  }[toast.type]

  const textColor = {
    success: "text-green-900",
    error: "text-red-900",
    info: "text-blue-900",
  }[toast.type]

  const Icon = {
    success: CheckCircle,
    error: AlertCircle,
    info: InfoIcon,
  }[toast.type]

  const iconColor = {
    success: "text-green-600",
    error: "text-red-600",
    info: "text-blue-600",
  }[toast.type]

  return (
    <div className={`${bgColor} border rounded-lg p-4 flex items-start gap-3 shadow-lg animate-in fade-in slide-in-from-right-4`}>
      <Icon className={`${iconColor} flex-shrink-0 mt-0.5`} size={20} />
      <p className={`${textColor} flex-1 text-sm font-medium`}>{toast.message}</p>
      <button
        onClick={onClose}
        className={`${textColor} flex-shrink-0 hover:opacity-70 transition-opacity`}
      >
        <X size={18} />
      </button>
    </div>
  )
}
