import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react'
import { CheckCircle2, XCircle, Info, X } from 'lucide-react'
import { cx } from '../lib/utils.js'

const ToastContext = createContext(null)

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>')
  return ctx
}

const ICONS = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
}

const ACCENT = {
  success: 'text-emerald-500',
  error: 'text-red-500',
  info: 'text-brand-500',
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const dismiss = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id))
  }, [])

  const toast = useCallback(
    ({ title, description, type = 'success', duration = 3500 }) => {
      const id = Math.random().toString(36).slice(2)
      setToasts((t) => [...t, { id, title, description, type }])
      if (duration) setTimeout(() => dismiss(id), duration)
      return id
    },
    [dismiss],
  )

  const value = useMemo(() => ({ toast, dismiss }), [toast, dismiss])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-6 right-6 z-50 flex w-full max-w-sm flex-col gap-3">
        {toasts.map((t) => {
          const Icon = ICONS[t.type] || Info
          return (
            <div
              key={t.id}
              className="pointer-events-auto flex items-start gap-3 rounded-xl border border-ink-100 bg-white p-4 shadow-cardhover animate-fade-in-up"
            >
              <Icon className={cx('mt-0.5 h-5 w-5 shrink-0', ACCENT[t.type])} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-ink-900">{t.title}</p>
                {t.description && (
                  <p className="mt-0.5 text-sm text-ink-500">{t.description}</p>
                )}
              </div>
              <button
                onClick={() => dismiss(t.id)}
                className="rounded-md p-1 text-ink-400 transition hover:bg-ink-50 hover:text-ink-600"
                aria-label="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}
