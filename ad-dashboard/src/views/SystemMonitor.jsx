import React, { useEffect, useRef, useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  YAxis,
} from 'recharts'
import {
  Activity,
  Layers,
  Database,
  AlertTriangle,
  Zap,
  Send,
  Server,
  ArrowRight,
  Cpu,
} from 'lucide-react'
import { getHealth, postEvents } from '../api/client.js'
import { StatCard } from '../components/StatCard.jsx'
import { Card, CardHeader } from '../components/Card.jsx'
import { StatusBadge } from '../components/StatusBadge.jsx'
import { useToast } from '../components/Toast.jsx'
import { formatNumber, buildEvents } from '../lib/utils.js'

const EVENT_TYPES = [
  { value: 'click', label: 'Click' },
  { value: 'impression', label: 'Impression' },
  { value: 'conversion', label: 'Conversion' },
]
const VOLUMES = [100, 500, 1000]
const MAX_POINTS = 40

function HistoryTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-ink-100 bg-white px-2.5 py-1.5 shadow-cardhover">
      <p className="text-xs font-semibold text-ink-700">
        queue: {formatNumber(payload[0].value)}
      </p>
    </div>
  )
}

export default function SystemMonitor() {
  const { toast } = useToast()
  const [eventType, setEventType] = useState('click')
  const [volume, setVolume] = useState(500)
  const [history, setHistory] = useState([])
  const tick = useRef(0)

  const { data, isError, isLoading } = useQuery({
    queryKey: ['health'],
    queryFn: getHealth,
    refetchInterval: 1000, // poll every 1 second
    placeholderData: (prev) => prev,
  })

  // Append every health sample to a rolling buffer for the sparkline.
  const queueDepth = data?.queue_depth ?? 0
  useEffect(() => {
    if (!data) return
    setHistory((h) => {
      const next = [...h, { t: tick.current++, queue: data.queue_depth ?? 0 }]
      return next.length > MAX_POINTS ? next.slice(-MAX_POINTS) : next
    })
  }, [data])

  const generateMutation = useMutation({
    mutationFn: () => postEvents(buildEvents(eventType, volume, 'camp_1')),
    onSuccess: (res) => {
      toast({
        type: 'success',
        title: 'Traffic generated',
        description: `Sent ${formatNumber(volume)} ${eventType} events${
          res?.accepted !== undefined
            ? ` · ${formatNumber(res.accepted)} accepted, ${formatNumber(
                res.dropped ?? 0,
              )} dropped`
            : ''
        }. Watch the queue depth spike and drain.`,
      })
    },
    onError: (err) => {
      toast({
        type: 'error',
        title: 'Traffic generation failed',
        description: err?.message || 'Could not reach POST /events.',
      })
    },
  })

  const status = isError ? 'error' : isLoading ? 'connecting' : 'connected'
  const connectionOk = !isError && data?.status === 'ok'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink-900">
            System Monitor
          </h1>
          <p className="mt-1 text-sm text-ink-500">
            Live backend health from <code className="text-ink-600">/health</code>{' '}
            · polling every 1s
          </p>
        </div>
        <StatusBadge status={status} />
      </div>

      {/* Status cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Connection"
          value={connectionOk ? 'Online' : isError ? 'Offline' : '—'}
          icon={Activity}
          tone={connectionOk ? 'emerald' : 'red'}
          loading={isLoading}
          hint={connectionOk ? 'status: ok' : 'backend unreachable'}
        />
        <StatCard
          label="Queue Depth"
          value={formatNumber(queueDepth)}
          icon={Layers}
          tone="brand"
          loading={isLoading}
          highlight={queueDepth > 0}
          hint="events buffered in channel"
        />
        <StatCard
          label="Stored Events"
          value={formatNumber(data?.stored ?? 0)}
          icon={Database}
          tone="violet"
          loading={isLoading}
          hint="persisted to PostgreSQL"
        />
        <StatCard
          label="Dropped Events"
          value={formatNumber(data?.dropped ?? 0)}
          icon={AlertTriangle}
          tone={(data?.dropped ?? 0) > 0 ? 'amber' : 'slate'}
          loading={isLoading}
          hint="backpressure overflow"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Load generator */}
        <Card className="lg:col-span-1">
          <CardHeader
            title="Load Generator"
            subtitle="Test backpressure handling"
            icon={Zap}
          />
          <div className="space-y-5 p-5">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-400">
                Event Type
              </label>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                className="w-full rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-sm text-ink-900 shadow-card outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
              >
                {EVENT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-400">
                Volume
              </label>
              <select
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="w-full rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-sm text-ink-900 shadow-card outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
              >
                {VOLUMES.map((v) => (
                  <option key={v} value={v}>
                    {v.toLocaleString()} events
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => generateMutation.mutate()}
              disabled={generateMutation.isPending}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white shadow-card transition hover:bg-brand-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Send className="h-4 w-4" />
              {generateMutation.isPending ? 'Sending…' : 'Generate Traffic'}
            </button>

            <p className="text-xs leading-relaxed text-ink-400">
              Sends a JSON array of{' '}
              <span className="font-semibold text-ink-600">
                {volume.toLocaleString()}
              </span>{' '}
              randomized <span className="font-semibold text-ink-600">{eventType}</span>{' '}
              events to <code>POST /events</code>. Watch the{' '}
              <span className="font-semibold text-brand-600">Queue Depth</span>{' '}
              card spike, then drain as workers flush to Postgres.
            </p>
          </div>
        </Card>

        {/* Live queue sparkline + architecture */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader
              title="Live queue depth"
              subtitle="Real-time buffer pressure (last ~40s)"
              icon={Cpu}
            />
            <div className="h-44 w-full px-2 py-3">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={history} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="queueFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3377ff" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#3377ff" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <YAxis
                    hide
                    domain={[0, (max) => Math.max(10, Math.ceil(max * 1.2))]}
                  />
                  <Tooltip content={<HistoryTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="queue"
                    stroke="#1d59f5"
                    strokeWidth={2}
                    fill="url(#queueFill)"
                    isAnimationActive={false}
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card>
            <CardHeader
              title="Architecture"
              subtitle="Request path through the ingestion engine"
              icon={Server}
            />
            <div className="flex flex-wrap items-center gap-2 p-5 text-xs font-medium">
              <FlowNode tone="slate" label="Dashboard" />
              <Arrow />
              <FlowNode tone="brand" label="Go HTTP (chi)" />
              <Arrow />
              <FlowNode tone="brand" label="Worker pool" sub="goroutines" />
              <Arrow />
              <FlowNode tone="red" label="Redis buffer" />
              <Arrow />
              <FlowNode tone="violet" label="PostgreSQL" />
            </div>
            <p className="px-5 pb-5 text-xs text-ink-400">
              Events return <code>202 Accepted</code> immediately and are drained
              concurrently by the worker pool — the queue depth above is the
              live buffer between the HTTP layer and the database.
            </p>
          </Card>
        </div>
      </div>
    </div>
  )
}

function FlowNode({ label, sub, tone = 'slate' }) {
  const tones = {
    slate: 'bg-ink-50 text-ink-700 border-ink-200',
    brand: 'bg-brand-50 text-brand-700 border-brand-200',
    red: 'bg-red-50 text-red-700 border-red-200',
    violet: 'bg-violet-50 text-violet-700 border-violet-200',
  }
  return (
    <span
      className={`rounded-lg border px-3 py-2 ${tones[tone]} whitespace-nowrap`}
    >
      {label}
      {sub && <span className="ml-1 opacity-60">· {sub}</span>}
    </span>
  )
}

function Arrow() {
  return <ArrowRight className="h-4 w-4 shrink-0 text-ink-300" />
}
