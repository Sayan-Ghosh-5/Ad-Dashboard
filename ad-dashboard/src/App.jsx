import React, { useState } from 'react'
import { BarChart3, Activity, Boxes, Github } from 'lucide-react'
import { cx } from './lib/utils.js'
import AdvertiserAnalytics from './views/AdvertiserAnalytics.jsx'
import SystemMonitor from './views/SystemMonitor.jsx'

const NAV = [
  {
    id: 'analytics',
    label: 'Advertiser Analytics',
    sublabel: 'Business view',
    icon: BarChart3,
  },
  {
    id: 'monitor',
    label: 'System Monitor',
    sublabel: 'Engineering view',
    icon: Activity,
  },
]

export default function App() {
  const [view, setView] = useState('analytics')

  return (
    <div className="flex min-h-screen bg-ink-50 text-ink-900">
      {/* Sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-ink-100 bg-white px-4 py-5 md:flex">
        <div className="flex items-center gap-3 px-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm">
            <Boxes className="h-6 w-6" />
          </span>
          <div className="leading-tight">
            <p className="text-sm font-bold text-ink-900">Ingestion Engine</p>
            <p className="text-xs text-ink-400">Ad Event Platform</p>
          </div>
        </div>

        <nav className="mt-8 flex flex-1 flex-col gap-1">
          <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-ink-400">
            Dashboards
          </p>
          {NAV.map((item) => {
            const Icon = item.icon
            const active = view === item.id
            return (
              <button
                key={item.id}
                onClick={() => setView(item.id)}
                className={cx(
                  'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition',
                  active
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-ink-600 hover:bg-ink-50',
                )}
              >
                <Icon
                  className={cx(
                    'h-5 w-5 shrink-0',
                    active ? 'text-brand-600' : 'text-ink-400',
                  )}
                />
                <span className="min-w-0">
                  <span className="block text-sm font-medium">{item.label}</span>
                  <span className="block text-xs text-ink-400">
                    {item.sublabel}
                  </span>
                </span>
              </button>
            )
          })}
        </nav>

        <a
          href="https://github.com/Sayan-Ghosh-5/ad-ingestion-event"
          target="_blank"
          rel="noreferrer"
          className="mt-auto flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-ink-500 transition hover:bg-ink-50 hover:text-ink-800"
        >
          <Github className="h-4 w-4" />
          View repository
        </a>
      </aside>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top nav */}
        <div className="flex items-center gap-2 border-b border-ink-100 bg-white px-4 py-3 md:hidden">
          {NAV.map((item) => {
            const active = view === item.id
            return (
              <button
                key={item.id}
                onClick={() => setView(item.id)}
                className={cx(
                  'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition',
                  active
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-ink-500 hover:bg-ink-50',
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label.split(' ')[0]}
              </button>
            )
          })}
        </div>

        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 md:px-8 md:py-8">
          {view === 'analytics' ? <AdvertiserAnalytics /> : <SystemMonitor />}
        </main>
      </div>
    </div>
  )
}
