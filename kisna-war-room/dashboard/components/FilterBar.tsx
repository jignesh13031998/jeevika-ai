import React from 'react'
import { Filters } from '../lib/types'

interface Props {
  filters: Filters
  brands: string[]
  categories: string[]
  regions: string[]
  onFilter: (f: Filters) => void
}

export default function FilterBar({ filters, brands, categories, regions, onFilter }: Props) {
  const set = (patch: Partial<Filters>) => onFilter({ ...filters, ...patch })

  return (
    <div className="sticky top-[57px] z-40 bg-canvas/95 backdrop-blur border-b border-border no-print">
      <div className="max-w-[1600px] mx-auto px-4 py-2 flex flex-wrap gap-2 items-center">

        {/* Tier */}
        <Select
          label="Tier"
          value={filters.tier === null ? '' : String(filters.tier)}
          onChange={v => set({ tier: v ? Number(v) as 1|2|3 : null })}
          options={[
            { value: '', label: 'All Tiers' },
            { value: '1', label: 'Tier 1 — Apex' },
            { value: '2', label: 'Tier 2 — Scale' },
            { value: '3', label: 'Tier 3 — Regional' },
          ]}
        />

        {/* Competitor */}
        <Select
          label="Competitor"
          value={filters.competitor ?? ''}
          onChange={v => set({ competitor: v || null })}
          options={[{ value: '', label: 'All Brands' }, ...brands.map(b => ({ value: b, label: b }))]}
        />

        {/* Region */}
        <Select
          label="Region"
          value={filters.region ?? ''}
          onChange={v => set({ region: v || null })}
          options={[{ value: '', label: 'All Regions' }, ...regions.map(r => ({ value: r, label: r }))]}
        />

        {/* Period */}
        <Select
          label="Period"
          value={filters.period}
          onChange={v => set({ period: v as Filters['period'] })}
          options={[
            { value: '7d', label: 'Last 7 days' },
            { value: 'today', label: 'Today' },
            { value: '30d', label: 'Last 30 days' },
          ]}
        />

        {/* Category multi-select */}
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-stone-500 uppercase tracking-wide">Category</span>
          <select
            multiple
            value={filters.categories}
            onChange={e => {
              const selected = Array.from(e.target.selectedOptions).map(o => o.value)
              set({ categories: selected })
            }}
            className="bg-surface border border-border text-stone-300 text-xs rounded px-2 py-1 max-h-8 focus:outline-none focus:border-accent-secondary"
            size={1}
            title="Hold Ctrl/Cmd to select multiple"
          >
            {categories.map(c => (
              <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>
            ))}
          </select>
        </div>

        {/* Reset */}
        {(filters.tier || filters.competitor || filters.region || filters.categories.length || filters.period !== '7d') && (
          <button
            onClick={() => onFilter({ tier: null, competitor: null, region: null, state: null, categories: [], period: '7d' })}
            className="text-xs text-accent-secondary hover:text-accent-secondary/70 underline ml-2"
          >
            Reset
          </button>
        )}
      </div>
    </div>
  )
}

function Select({ label, value, onChange, options }: {
  label: string
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-[10px] text-stone-500 uppercase tracking-wide">{label}</span>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="bg-surface border border-border text-stone-300 text-xs rounded px-2 py-1 focus:outline-none focus:border-accent-secondary"
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  )
}
