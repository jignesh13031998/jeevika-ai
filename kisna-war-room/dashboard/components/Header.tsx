import React from 'react'
import { IntelDataset } from '../lib/types'

export type Role = 'CMO' | 'CFO' | 'Franchise'

const ROLE_THEME: Record<Role, { bg: string; accent: string; label: string }> = {
  CMO:       { bg: '#8E1B2E', accent: '#E8C98A', label: 'CMO Intelligence War Room' },
  CFO:       { bg: '#000080', accent: '#A8C4E8', label: 'CFO Financial Command Center' },
  Franchise: { bg: '#1A5C2A', accent: '#90E8A0', label: 'Franchise Intelligence Hub' },
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

          {/* Role switcher + refresh */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs text-white/70">
              <span className={`w-2 h-2 rounded-full ${isRefreshing ? 'dot-new' : ''}`}
                style={{ background: isRefreshing ? '#FFD700' : 'rgba(255,255,255,0.4)' }} />
              {isRefreshing ? 'Refreshing…' : lastRefresh ? `Updated ${lastRefresh}` : 'Loading…'}
            </div>
            <select
              value={role}
              onChange={e => onRoleChange(e.target.value as Role)}
              className="text-sm rounded px-3 py-1.5 focus:outline-none border-0 font-bold"
              style={{ background: 'rgba(255,255,255,0.2)', color: 'white', minWidth: '160px' }}
            >
              <option value="CMO"       style={{ color: '#1A0A0D', background: 'white' }}>🔴 CMO View</option>
              <option value="CFO"       style={{ color: '#1A0A0D', background: 'white' }}>🔵 CFO View</option>
              <option value="Franchise" style={{ color: '#1A0A0D', background: 'white' }}>🟢 Franchise View</option>
            </select>
          </div>
        </div>
      </div>
      <div className="h-0.5" style={{ background: theme.accent, opacity: 0.5 }} />
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
