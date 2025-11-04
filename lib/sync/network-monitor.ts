type NetworkStatusCallback = (isOnline: boolean) => void

class NetworkMonitor {
  private listeners: Set<NetworkStatusCallback> = new Set()
  private _isOnline: boolean = true

  constructor() {
    if (typeof window !== 'undefined') {
      this._isOnline = navigator.onLine
      window.addEventListener('online', this.handleOnline)
      window.addEventListener('offline', this.handleOffline)
    }
  }

  private handleOnline = () => {
    this._isOnline = true
    this.notifyListeners(true)
  }

  private handleOffline = () => {
    this._isOnline = false
    this.notifyListeners(false)
  }

  private notifyListeners(isOnline: boolean) {
    this.listeners.forEach(listener => listener(isOnline))
  }

  get isOnline(): boolean {
    return this._isOnline
  }

  subscribe(callback: NetworkStatusCallback) {
    this.listeners.add(callback)
    return () => {
      this.listeners.delete(callback)
    }
  }

  destroy() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', this.handleOnline)
      window.removeEventListener('offline', this.handleOffline)
    }
    this.listeners.clear()
  }
}

export const networkMonitor = new NetworkMonitor()
