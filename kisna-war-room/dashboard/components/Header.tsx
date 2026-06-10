import React from 'react'
import { IntelDataset } from '../lib/types'

export type Role = 'CMO' | 'CFO' | 'CFA' | 'Capital_Markets' | 'Call_CFO' | 'Call_CFA' | 'Call_Capital_Market'

const ROLES: { value: Role; label: string; group: string }[] = [
  { value: 'CMO',               label: '🔴 CMO — Marketing Command',       group: 'Executive' },
  { value: 'CFO',               label: '🔵 CFO — Financial Control',        group: 'Executive' },
  { value: 'CFA',               label: '📊 CFA — Investment Analysis',      group: 'Analysis' },
  { value: 'Capital_Markets',   label: '📈 Capital Markets',                group: 'Analysis' },
  { value: 'Call_CFO',          label: '📞 Briefing: CFO',                  group: 'Briefings' },
  { value: 'Call_CFA',          label: '📞 Briefing: CFA',                  group: 'Briefings' },
  { value: 'Call_Capital_Market', label: '📞 Briefing: Capital Market',     group: 'Briefings' },
]

const ROLE_THEME: Record<Role, { bg: string; accent: string; label: string }> = {
  CMO:                { bg: '#8E1B2E', accent: '#E8C98A', label: 'CMO Intelligence War Room' },
  CFO:                { bg: '#000080', accent: '#A8C4E8', label: 'CFO Financial Command Center' },
  CFA:                { bg: '#0A2342', accent: '#7BAAEE', label: 'CFA Investment Analysis Suite' },
  Capital_Markets:    { bg: '#0F3D2E', accent: '#5EC97F', label: 'Capital Markets Intelligence' },
  Call_CFO:           { bg: '#1A0050', accent: '#C4A8F0', label: 'CFO Briefing Mode' },
  Call_CFA:           { bg: '#002040', accent: '#90C8F8', label: 'CFA Briefing Mode' },
  Call_Capital_Market:{ bg: '#003020', accent: '#80E8B0', label: 'Capital Market Briefing' },
}

interface Props {
  data: IntelDataset | null
  lastRefresh: string | null
  isRefreshing: boolean
  role: Role
  onRoleChange: (r: Role) => void
}

export default function Header({ data, lastRefresh, isRefreshing, role, onRoleChange }: Props) {
  const meta = data?.meta
  const theme = ROLE_THEME[role]

  return (
    <header className="sticky top-0 z-50 no-print" style={{ background: theme.bg }}>
      <div className="max-w-[1600px] mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4 flex-wrap">

          {/* Wordmark */}
          <div className="flex items-center gap-4">
            <div className="flex flex-col leading-none">
              <span className="font-display text-3xl font-bold text-white tracking-wider" style={{ letterSpacing: '0.12em' }}>KISNA</span>
              <span className="text-[10px] tracking-widest uppercase" style={{ color: theme.accent, letterSpacing: '0.2em' }}>{theme.label}</span>
            </div>
            <div className="hidden md:block w-px h-10" style={{ background: 'rgba(255,255,255,0.2)' }} />
            <div className="hidden md:flex flex-col">
              <span className="text-[10px] text-white/60 uppercase tracking-wider">H.K. Jewels Pvt. Ltd.</span>
              <span className="text-xs text-white/80">Diamond & Gold Jewellery</span>
            </div>
          </div>

          {/* Decision metrics */}
          {meta && (
            <div className="flex items-center gap-1 bg-white/10 rounded-lg px-3 py-1.5 flex-wrap gap-y-1">
              <Metric label="Competitors" value={meta.brands_tracked} color="white" />
              <div className="w-px h-6 bg-white/20 mx-2" />
              <Metric label="Significant" value={meta.high_priority + meta.medium_priority} color="white" />
              <div className="w-px h-6 bg-white/20 mx-2" />
              <Metric label="Threat Alerts" value={meta.threat_alerts} color={meta.threat_alerts > 0 ? '#FFB3B3' : 'white'} />
              <div className="w-px h-6 bg-white/20 mx-2" />
              <Metric label="Opportunities" value={meta.opportunity_alerts} color={meta.opportunity_alerts > 0 ? '#B3FFD1' : 'white'} />
            </div>
          )}

          {/* Right controls */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs text-white/70">
              <span
                className={`w-2 h-2 rounded-full ${isRefreshing ? 'dot-new' : ''}`}
                style={{ background: isRefreshing ? '#FFD700' : 'rgba(255,255,255,0.4)' }}
              />
              {isRefreshing ? 'Refreshing…' : lastRefresh ? `Updated ${lastRefresh}` : 'Loading…'}
            </div>
            <select
              value={role}
              onChange={e => onRoleChange(e.target.value as Role)}
              className="text-xs rounded px-2 py-1 focus:outline-none border-0 font-semibold"
              style={{ background: 'rgba(255,255,255,0.15)', color: 'white', minWidth: '200px' }}
            >
              {ROLES.map(r => (
                <option key={r.value} value={r.value} style={{ color: '#1A0A0D', background: 'white' }}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Role indicator strip */}
      <div className="h-0.5" style={{ background: theme.accent, opacity: 0.6 }} />
    </header>
  )
}

function Metric({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="text-center px-1">
      <div className="text-xl font-bold font-display" style={{ color }}>{value}</div>
      <div className="text-[9px] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.6)' }}>{label}</div>
    </div>
  )
}
