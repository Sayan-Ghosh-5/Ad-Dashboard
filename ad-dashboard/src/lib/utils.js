// Tiny classnames helper
export function cx(...args) {
  return args.filter(Boolean).join(' ')
}

// Compact number formatting: 12345 -> "12,345"
export function formatNumber(n) {
  if (n === null || n === undefined || Number.isNaN(n)) return '—'
  return new Intl.NumberFormat('en-US').format(n)
}

// CTR = clicks / impressions * 100
export function calcCTR(clicks, impressions) {
  if (!impressions) return 0
  return (clicks / impressions) * 100
}

// Build a JSON array of randomized events for the load generator.
export function buildEvents(type, volume, campaignId = 'camp_1') {
  const events = new Array(volume)
  for (let i = 0; i < volume; i++) {
    events[i] = {
      type,
      campaign_id: campaignId,
      user_id: `u_${Math.random().toString(36).slice(2, 10)}`,
    }
  }
  return events
}
