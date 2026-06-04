import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from 'recharts'
import {
  Eye,
  MousePointerClick,
  Target,
  Percent,
  Trash2,
  RefreshCw,
  Search,
} from 'lucide-react'
import { getCampaignMetrics, invalidateCampaignCache } from '../api/client.js'
import { StatCard } from '../components/StatCard.jsx'
import { Card, CardHeader } from '../components/Card.jsx'
import { StatusBadge } from '../components/StatusBadge.jsx'
import { useToast } from '../components/Toast.jsx'
import { formatNumber, calcCTR } from '../lib/utils.js'

const BAR_COLORS = {
  Impressions: '#3377ff',
  Clicks: '#10b981',
  Conversions: '#8b5cf6',
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-ink-100 bg-white px-3 py-2 shadow-cardhover">
      <p className="text-xs font-semibold text-ink-900">{label}</p>
      <p className="text-sm font-bold text-ink-700">
        {formatNumber(payload[0].value)}
      </p>
    </div>
  )
}

export default function AdvertiserAnalytics() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [campaignId, setCampaignId] = useState('camp_1')
  const [inputValue, setInputValue] = useState('camp_1')

  const metricsKey = ['metrics', campaignId]

  const { data, isLoading, isError, isFetching, dataUpdatedAt } = useQuery({
    queryKey: metricsKey,
    queryFn: () => getCampaignMetrics(campaignId),
    refetchInterval: 3000, // poll every 3 seconds
    placeholderData: (prev) => prev, // keep showing old data while refetching
  })

  const invalidateMutation = useMutation({
    mutationFn: () => invalidateCampaignCache(campaignId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: metricsKey })
      toast({
        type: 'success',
        title: 'Cache cleared',
        description: `Redis cache for "${campaignId}" was invalidated and metrics refetched.`,
      })
    },
    onError: (err) => {
      toast({
        type: 'error',
        title: 'Could not clear cache',
        description: err?.message || 'Request failed.',
      })
    },
  })

  const clicks = data?.clicks ?? 0
  const impressions = data?.impressions ?? 0
  const conversions = data?.conversions ?? 0
  const ctr = calcCTR(clicks, impressions)

  const chartData = [
    { name: 'Impressions', value: impressions },
    { name: 'Clicks', value: clicks },
    { name: 'Conversions', value: conversions },
  ]

  const status = isError ? 'error' : isLoading ? 'connecting' : 'connected'

  function applyCampaign(e) {
    e.preventDefault()
    const v = inputValue.trim()
    if (v) setCampaignId(v)
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink-900">
            Advertiser Analytics
          </h1>
          <p className="mt-1 text-sm text-ink-500">
            Live ad performance for campaign{' '}
            <span className="font-semibold text-ink-700">{campaignId}</span> ·
            polling every 3s
          </p>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={status} />
          <button
            onClick={() => invalidateMutation.mutate()}
            disabled={invalidateMutation.isPending}
            className="inline-flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-3.5 py-2 text-sm font-medium text-ink-700 shadow-card transition hover:bg-ink-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Trash2 className="h-4 w-4" />
            {invalidateMutation.isPending ? 'Clearing…' : 'Clear Cache'}
          </button>
        </div>
      </div>

      {/* Campaign selector */}
      <form onSubmit={applyCampaign} className="flex max-w-md items-center gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Campaign ID (e.g. camp_1)"
            className="w-full rounded-xl border border-ink-200 bg-white py-2.5 pl-9 pr-3 text-sm text-ink-900 shadow-card outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
          />
        </div>
        <button
          type="submit"
          className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-card transition hover:bg-brand-700"
        >
          Load
        </button>
      </form>

      {isError && (
        <Card className="border-red-100 bg-red-50">
          <div className="px-5 py-4 text-sm text-red-700">
            Could not reach the backend at{' '}
            <code className="rounded bg-white px-1.5 py-0.5">
              /campaigns/{campaignId}/metrics
            </code>
            . Make sure the Go service is running on{' '}
            <code className="rounded bg-white px-1.5 py-0.5">
              localhost:8080
            </code>{' '}
            (and CORS is allowed).
          </div>
        </Card>
      )}

      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Impressions"
          value={formatNumber(impressions)}
          icon={Eye}
          tone="brand"
          loading={isLoading}
        />
        <StatCard
          label="Total Clicks"
          value={formatNumber(clicks)}
          icon={MousePointerClick}
          tone="emerald"
          loading={isLoading}
        />
        <StatCard
          label="Total Conversions"
          value={formatNumber(conversions)}
          icon={Target}
          tone="violet"
          loading={isLoading}
        />
        <StatCard
          label="Click-Through Rate"
          value={`${ctr.toFixed(2)}%`}
          icon={Percent}
          tone="amber"
          loading={isLoading}
          hint="Clicks ÷ Impressions × 100"
        />
      </div>

      {/* Chart */}
      <Card>
        <CardHeader
          title="Performance breakdown"
          subtitle="Impressions vs. Clicks vs. Conversions"
          icon={BarChart}
          action={
            <span className="inline-flex items-center gap-1.5 text-xs text-ink-400">
              <RefreshCw
                className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin text-brand-500' : ''}`}
              />
              {dataUpdatedAt
                ? `Updated ${new Date(dataUpdatedAt).toLocaleTimeString()}`
                : 'Waiting…'}
            </span>
          }
        />
        <div className="h-80 w-full px-2 py-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 24, left: 8, bottom: 8 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#eceef2" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fill: '#64748b', fontSize: 13 }}
                axisLine={{ stroke: '#d5dae3' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#94a3b8', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                width={48}
              />
              <Tooltip cursor={{ fill: '#f6f7f9' }} content={<ChartTooltip />} />
              <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={96}>
                {chartData.map((entry) => (
                  <Cell key={entry.name} fill={BAR_COLORS[entry.name]} />
                ))}
                <LabelList
                  dataKey="value"
                  position="top"
                  formatter={(v) => formatNumber(v)}
                  style={{ fill: '#404a5a', fontSize: 12, fontWeight: 600 }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  )
}
