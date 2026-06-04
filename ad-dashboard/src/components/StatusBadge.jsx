import React from 'react'
import { cx } from '../lib/utils.js'

// status: 'connected' | 'connecting' | 'error'
export function StatusBadge({ status }) {
  const map = {
    connected: {
      label: 'Connected',
      dot: 'bg-emerald-500',
      ring: 'animate-pulse-ring',
      text: 'text-emerald-700',
      bg: 'bg-emerald-50 border-emerald-100',
    },
    connecting: {
      label: 'Connecting…',
      dot: 'bg-amber-400',
      ring: '',
      text: 'text-amber-700',
      bg: 'bg-amber-50 border-amber-100',
    },
    error: {
      label: 'Disconnected',
      dot: 'bg-red-500',
      ring: '',
      text: 'text-red-700',
      bg: 'bg-red-50 border-red-100',
    },
  }
  const s = map[status] || map.connecting
  return (
    <span
      className={cx(
        'inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold',
        s.bg,
        s.text,
      )}
    >
      <span className={cx('h-2 w-2 rounded-full', s.dot, s.ring)} />
      {s.label}
    </span>
  )
}
