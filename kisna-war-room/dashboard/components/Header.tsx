import React from 'react'
import { IntelDataset } from '../lib/types'

interface Props {
  data: IntelDataset | null
  lastRefresh: string | null
  isRefreshing: boolean
  role: string
  onRoleChange: (r: string) => void
}

export default function Header({ data, lastRefresh, isRefreshing, role, onRoleChange }: Props) {
  const meta = data?.meta
  const roles = ['CMO', 'Executive Office', 'Admin']

  return (
    <header className="sticky top-0 z-50 bg-canvas/95 backdrop-blur border-b border-border no-print">
      <div className="max-w-[1600px] mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* Wordmark */}
          <div className="flex items-center gap-3">
            <div className="flex flex-col leading-none">
              <span className="font-display text-2xl font-bold text-accent-secondary tracking-wider">KISNA</span>
              <span className="text-[10px] text-stone-400 tracking-widest uppercase">CMO Intelligence War Room</span>
            </div>
          </div>

          {/* Decision metrics */}
          {meta && (
            <div className="flex items-center gap-4 flex-wrap">
              <Metric label="Competitors" value={meta.brands_tracked} />
              <Metric label="Significant today" value={meta.high_priority + meta.medium_priority} />
              <Metric
                label="Threat alerts"
                value={meta.threat_alerts}
                valueClass={meta.threat_alerts > 0 ? 'text-prio-critical' : 'text-stone-300'}
              />
              <Metric
                label="Opportunities"
                value={meta.opportunity_alerts}
                valueClass={meta.opportunity_alerts > 0 ? 'text-prio-low' : 'text-stone-300'}
              />
            </div>
          )}

          {/* Right: live indicator + role switcher */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs text-stone-400">
              <span
                className={`w-2 h-2 rounded-full ${isRefreshing ? 'bg-accent-primary dot-new' : 'bg-stone-600'}`}
              />
              {isRefreshing ? 'Refreshing…' : lastRefresh ? `Updated ${lastRefresh}` : 'Loading…'}
            </div>
            <select
              value={role}
              onChange={e => onRoleChange(e.target.value)}
              className="bg-surface border border-border text-stone-300 text-xs rounded px-2 py-1 focus:outline-none focus:border-accent-secondary"
            >
              {roles.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        </div>
      </div>
    </header>
  )
}

function Metric({ label, value, valueClass = 'text-stone-100' }: {
  label: string; value: number; valueClass?: string
}) {
  return (
    <div className="text-center">
      <div className={`text-xl font-bold font-display ${valueClass}`}>{value}</div>
      <div className="text-[10px] text-stone-500 uppercase tracking-wide">{label}</div>
    </div>
  )
}
