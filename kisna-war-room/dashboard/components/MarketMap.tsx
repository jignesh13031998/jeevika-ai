import React, { useState } from 'react'
import { Signal } from '../lib/types'
import { Filters } from '../lib/types'

interface Props {
  signals: Signal[]
  onStateClick: (state: string | null) => void
  activeState: string | null
}

// State activity heat map — India regions + GCC
const INDIA_REGIONS: Record<string, string[]> = {
  West: ['Maharashtra', 'Gujarat', 'Rajasthan', 'Goa'],
  North: ['Delhi', 'Haryana', 'Punjab', 'Uttar Pradesh', 'Uttarakhand', 'Himachal Pradesh'],
  South: ['Karnataka', 'Tamil Nadu', 'Kerala', 'Andhra Pradesh', 'Telangana'],
  East: ['West Bengal', 'Odisha', 'Bihar', 'Jharkhand', 'Assam'],
  Central: ['Madhya Pradesh', 'Chhattisgarh'],
  GCC: ['UAE', 'Dubai', 'Saudi Arabia', 'Kuwait', 'Qatar'],
}

const REGION_COLORS: Record<string, string> = {
  West: '#8E1B2E',
  North: '#A0522D',
  South: '#6B4226',
  East: '#5C3D2E',
  Central: '#7A3B2E',
  GCC: '#C9A86A',
}

export default function MarketMap({ signals, onStateClick, activeState }: Props) {
  const stateCounts: Record<string, { count: number; threat: number; opportunity: number }> = {}

  for (const sig of signals) {
    const state = sig.geo.state || (sig.geo.gcc ? 'GCC' : null)
    if (!state) continue
    if (!stateCounts[state]) stateCounts[state] = { count: 0, threat: 0, opportunity: 0 }
    stateCounts[state].count++
    stateCounts[state].threat = Math.max(stateCounts[state].threat, sig.scores.threat)
    stateCounts[state].opportunity = Math.max(stateCounts[state].opportunity, sig.scores.opportunity)
  }

  const maxCount = Math.max(...Object.values(stateCounts).map(v => v.count), 1)

  return (
    <section className="max-w-[1600px] mx-auto px-4 py-6">
      <div className="flex items-baseline gap-3 mb-4">
        <h2 className="font-display text-2xl font-semibold text-stone-100">Market Movement Map</h2>
        <span className="text-sm text-stone-500">click a state/region to filter dashboard</span>
        {activeState && (
          <button onClick={() => onStateClick(null)} className="ml-auto text-xs text-accent-secondary underline">
            Clear filter
          </button>
        )}
      </div>

      <div className="bg-surface rounded-lg border border-border p-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Object.entries(INDIA_REGIONS).map(([region, states]) => (
            <div key={region}>
              <div
                className="text-[10px] font-semibold uppercase tracking-wide mb-2 pb-1 border-b"
                style={{ color: REGION_COLORS[region], borderColor: REGION_COLORS[region] + '40' }}
              >
                {region}
              </div>
              <div className="space-y-1.5">
                {states.map(state => {
                  const data = stateCounts[state]
                  const intensity = data ? data.count / maxCount : 0
                  const isActive = activeState === state
                  return (
                    <button
                      key={state}
                      onClick={() => onStateClick(isActive ? null : state)}
                      className={`w-full text-left px-2 py-1 rounded text-xs transition-all ${
                        isActive
                          ? 'bg-accent-primary text-white'
                          : data
                          ? 'hover:bg-surface-2 text-stone-200'
                          : 'text-stone-600 hover:text-stone-400'
                      }`}
                      style={{
                        background: isActive
                          ? '#8E1B2E'
                          : data
                          ? `rgba(142, 27, 46, ${0.1 + intensity * 0.4})`
                          : undefined,
                      }}
                    >
                      <span>{state}</span>
                      {data && (
                        <span className="ml-1 text-[10px] opacity-60">({data.count})</span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-6 pt-4 border-t border-border flex items-center gap-6 text-xs text-stone-500">
          <div className="flex items-center gap-2">
            <div className="w-4 h-2 rounded" style={{ background: 'rgba(142, 27, 46, 0.5)' }} />
            High activity
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-2 rounded" style={{ background: 'rgba(142, 27, 46, 0.15)' }} />
            Low activity
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-2 rounded bg-stone-800" />
            No signals
          </div>
        </div>
      </div>
    </section>
  )
}
