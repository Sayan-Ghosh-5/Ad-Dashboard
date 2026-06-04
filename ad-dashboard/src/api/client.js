import axios from 'axios'

// Base URL points at the Go backend. Override at build/run time with
// VITE_API_BASE_URL (e.g. VITE_API_BASE_URL=http://192.168.1.10:8080).
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

// ---- Endpoint wrappers ----

// GET /campaigns/{id}/metrics
export async function getCampaignMetrics(campaignId) {
  const { data } = await api.get(
    `/campaigns/${encodeURIComponent(campaignId)}/metrics`,
  )
  return data // { campaign_id, clicks, impressions, conversions }
}

// GET /health
export async function getHealth() {
  const { data } = await api.get('/health')
  return data // { status, queue_depth, stored, dropped }
}

// POST /campaigns/{id}/invalidate
export async function invalidateCampaignCache(campaignId) {
  const { data } = await api.post(
    `/campaigns/${encodeURIComponent(campaignId)}/invalidate`,
  )
  return data
}

// POST /events  — accepts a JSON array of events
export async function postEvents(events) {
  const { data } = await api.post('/events', events)
  return data // { accepted, dropped }
}
