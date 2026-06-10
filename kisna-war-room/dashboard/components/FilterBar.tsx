import React from 'react'
import { Filters } from '../lib/types'

interface Props {
  filters: Filters
  brands: string[]
  categories: string[]
  regions: string[]
  totalCount: number
  onFilter: (f: Filters) => void
}

export default function FilterBar({ filters, brands, categories, regions, totalCount, onFilter }: Props) {
  const set = (patch: Partial<Filters>) => onFilter({ ...filters, ...patch })
  const hasActive = filters.tier || filters.competitor || filters.region || filters.categories.length || filters.period !== '7d' || filters.state

  return (
    <div className="filter-bar sticky top-[57px] z-40 no-print border-b" style={{ background: 'white', borderColor: '#E2D5CC' }}>
      <div className="max-w-[1600px] mx-auto px-4 py-2.5 flex flex-wrap gap-2 items-center">

        <Select label="Tier" value={filters.tier === null ? '' : String(filters.tier)} onChange={v => set({ tier: v ? Number(v) as 1|2|3 : null })}
          options={[{ value: '', label: 'All Tiers' }, { value: '1', label: '🔴 Tier 1 — Apex' }, { value: '2', label: '🟡 Tier 2 — Scale' }, { value: '3', label: '🔵 Tier 3 — Regional' }]} />

        <Select label="Competitor" value={filters.competitor ?? ''} onChange={v => set({ competitor: v || null })}
          options={[{ value: '', label: 'All 9 Brands' }, ...brands.map(b => ({ value: b, label: b }))]} />

        <Select label="Region" value={filters.region ?? ''} onChange={v => set({ region: v || null })}
          options={[{ value: '', label: 'All Regions' }, ...regions.map(r => ({ value: r, label: r }))]} />

        <Select label="Period" value={filters.period} onChange={v => set({ period: v as Filters['period'] })}
          options={[{ value: '7d', label: 'Last 7 days' }, { value: 'today', label: 'Today' }, { value: '30d', label: 'Last 30 days' }]} />

        {/* Category pills */}
        <div className="flex items-center gap-1 flex-wrap">
          {['STORE_OPENING', 'FRANCHISE_OPPORTUNITY', 'LAB_GROWN_DIAMOND_MOVE', 'CAMPAIGN_LAUNCH', 'FINANCIAL_RESULTS'].map(cat => {
            const active = filters.categories.includes(cat)
            return (
              <button key={cat} onClick={() => set({ categories: active ? filters.categories.filter(c => c !== cat) : [...filters.categories, cat] })}
                className="text-[10px] px-2 py-1 rounded-full border transition-all font-medium"
                style={{
                  background: active ? '#8E1B2E' : '#F7F2EE',
                  color: active ? 'white' : '#5C3D45',
                  borderColor: active ? '#8E1B2E' : '#E2D5CC',
                }}
              >
                {cat.replace(/_/g, ' ')}
              </button>
            )
          })}
        </div>

        <div className="ml-auto flex items-center gap-3">
          <span className="text-xs font-medium" style={{ color: '#5C3D45' }}>{totalCount} signals</span>
          {hasActive && (
            <button onClick={() => onFilter({ tier: null, competitor: null, region: null, state: null, categories: [], period: '7d' })}
              className="text-xs underline font-medium" style={{ color: '#8E1B2E' }}>
              Clear filters
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function Select({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[]
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: '#9E7A82' }}>{label}</span>
      <select value={value} onChange={e => onChange(e.target.value)}
        className="text-xs rounded-md px-2 py-1.5 focus:outline-none border font-medium"
        style={{ background: 'white', color: '#1A0A0D', borderColor: '#E2D5CC' }}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  )
}
