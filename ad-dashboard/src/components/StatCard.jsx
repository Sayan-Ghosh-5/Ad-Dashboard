import React from 'react'
import { cx } from '../lib/utils.js'

const TONES = {
  brand: { ring: 'bg-brand-50 text-brand-600', value: 'text-ink-900' },
  emerald: { ring: 'bg-emerald-50 text-emerald-600', value: 'text-ink-900' },
  amber: { ring: 'bg-amber-50 text-amber-600', value: 'text-ink-900' },
  violet: { ring: 'bg-violet-50 text-violet-600', value: 'text-ink-900' },
  red: { ring: 'bg-red-50 text-red-600', value: 'text-ink-900' },
  slate: { ring: 'bg-ink-100 text-ink-600', value: 'text-ink-900' },
}

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = 'brand',
  hint,
  loading = false,
  highlight = false,
}) {
  const t = TONES[tone] || TONES.brand
  return (
    <div
      className={cx(
        'group rounded-2xl border bg-white p-5 shadow-card transition hover:shadow-cardhover',
        highlight ? 'border-brand-200 ring-1 ring-brand-100' : 'border-ink-100',
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-ink-500">{label}</p>
        {Icon && (
          <span
            className={cx(
              'flex h-9 w-9 items-center justify-center rounded-lg',
              t.ring,
            )}
          >
            <Icon className="h-5 w-5" />
          </span>
        )}
      </div>
      <div className="mt-3 flex items-end gap-2">
        {loading ? (
          <div className="h-9 w-24 animate-pulse rounded-md bg-ink-100" />
        ) : (
          <span className={cx('text-3xl font-bold tracking-tight', t.value)}>
            {value}
          </span>
        )}
      </div>
      {hint && <p className="mt-1 text-xs text-ink-400">{hint}</p>}
    </div>
  )
}
