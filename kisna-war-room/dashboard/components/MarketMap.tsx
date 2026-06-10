import React, { useState } from 'react'
import { Signal } from '../lib/types'

interface Props {
  signals: Signal[]
  onStateClick: (state: string | null) => void
  activeState: string | null
}

const REGIONS: Record<string, { states: string[]; color: string; bg: string; label: string }> = {
  West:    { states: ['Maharashtra','Gujarat','Rajasthan','Goa'],                       color: '#8E1B2E', bg: '#FFF5F5', label: '🏠 West (KISNA Home)' },
  North:   { states: ['Delhi','Haryana','Punjab','Uttar Pradesh','Uttarakhand'],        color: '#0369A1', bg: '#EFF6FF', label: '🏔 North' },
  South:   { states: ['Karnataka','Tamil Nadu','Kerala','Andhra Pradesh','Telangana'], color: '#059669', bg: '#ECFDF5', label: '🌴 South' },
  East:    { states: ['West Bengal','Odisha','Bihar','Jharkhand','Assam'],             color: '#D97706', bg: '#FFFBEB', label: '🌄 East' },
  Central: { states: ['Madhya Pradesh','Chhattisgarh'],                               color: '#7C3AED', bg: '#F5F3FF', label: '🗺 Central' },
  GCC:     { states: ['UAE','Dubai','Saudi Arabia','Kuwait','Qatar','Oman','Bahrain'], color: '#C9A86A', bg: '#FFFBEB', label: '✈ GCC / Gulf' },
}

export default function MarketMap({ signals, onStateClick, activeState }: Props) {
  const [hoveredState, setHoveredState] = useState<string | null>(null)

  // Count signals + max threat per state
  const stateData: Record<string, { count: number; brands: Set<string>; maxThreat: number; signals: Signal[] }> = {}
  for (const sig of signals) {
    const key = sig.geo.gcc ? 'GCC' : sig.geo.state
    if (!key) continue
    if (!stateData[key]) stateData[key] = { count: 0, brands: new Set(), maxThreat: 0, signals: [] }
    stateData[key].count++
    stateData[key].brands.add(sig.brand)
    stateData[key].maxThreat = Math.max(stateData[key].maxThreat, sig.scores.threat)
    stateData[key].signals.push(sig)
  }

  const maxCount = Math.max(...Object.values(stateData).map(v => v.count), 1)

  const hovered = hoveredState ? stateData[hoveredState] : null

  return (
    <section className="max-w-[1600px] mx-auto px-4 py-6">
      <div className="section-header flex items-baseline gap-3 flex-wrap">
        <h2 className="font-display text-3xl font-bold" style={{ color: '#8E1B2E' }}>Market Movement Map</h2>
        <span className="text-sm" style={{ color: '#9E7A82' }}>click any state to filter the entire dashboard</span>
        {activeState && (
          <button onClick={() => onStateClick(null)}
            className="ml-auto text-sm font-semibold underline" style={{ color: '#8E1B2E' }}>
            Clear filter: {activeState}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Map grid */}
        <div className="lg:col-span-2 card rounded-xl p-5">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(REGIONS).map(([region, cfg]) => (
              <div key={region}>
                <div className="text-[11px] font-bold uppercase tracking-wide mb-2 pb-1.5 border-b"
                  style={{ color: cfg.color, borderColor: cfg.color + '40' }}>
                  {cfg.label}
                </div>
                <div className="space-y-1.5">
                  {cfg.states.map(state => {
                    const data = stateData[state] || stateData['GCC']
                    const actualData = region === 'GCC' ? stateData['GCC'] : stateData[state]
                    const intensity = actualData ? actualData.count / maxCount : 0
                    const isActive = activeState === state || (region === 'GCC' && activeState === 'GCC')
                    const isHovered = hoveredState === state

                    return (
                      <button key={state}
                        onClick={() => onStateClick(isActive ? null : (region === 'GCC' ? 'GCC' : state))}
                        onMouseEnter={() => setHoveredState(region === 'GCC' ? 'GCC' : state)}
                        onMouseLeave={() => setHoveredState(null)}
                        className="w-full text-left px-2 py-1.5 rounded-lg text-xs font-medium transition-all"
                        style={{
                          background: isActive
                            ? cfg.color
                            : actualData
                            ? `${cfg.color}${Math.round(15 + intensity * 35).toString(16).padStart(2, '0')}`
                            : cfg.bg,
                          color: isActive ? 'white' : actualData ? cfg.color : '#C9B8AD',
                          border: `1px solid ${isActive ? cfg.color : actualData ? cfg.color + '60' : '#E2D5CC'}`,
                          transform: isHovered ? 'scale(1.02)' : 'scale(1)',
                        }}>
                        <div className="flex items-center justify-between">
                          <span>{state}</span>
                          {actualData && (
                            <span className="text-[10px] font-bold rounded px-1"
                              style={{ background: isActive ? 'rgba(255,255,255,0.25)' : cfg.color + '25' }}>
                              {actualData.count}
                            </span>
                          )}
                        </div>
                        {actualData && !isActive && (
                          <div className="text-[9px] mt-0.5 opacity-70">
                            {actualData.brands.size} brand{actualData.brands.size > 1 ? 's' : ''}
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="mt-5 pt-4 flex flex-wrap gap-4 text-[11px]" style={{ borderTop: '1px solid #F3EDE8' }}>
            {Object.entries(REGIONS).map(([region, cfg]) => (
              <div key={region} className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded" style={{ background: cfg.color }} />
                <span style={{ color: cfg.color, fontWeight: 600 }}>{region}</span>
              </div>
            ))}
            <div className="ml-auto text-[10px]" style={{ color: '#9E7A82' }}>
              Number = signals in that state this week
            </div>
          </div>
        </div>

        {/* Hover/active detail panel */}
        <div className="card rounded-xl p-5">
          {hoveredState && stateData[hoveredState] ? (
            <>
              <div className="font-display text-2xl font-bold mb-1" style={{ color: '#1A0A0D' }}>{hoveredState}</div>
              <div className="text-xs mb-3" style={{ color: '#9E7A82' }}>
                {stateData[hoveredState].count} signal{stateData[hoveredState].count > 1 ? 's' : ''} · {stateData[hoveredState].brands.size} brands active
              </div>
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {stateData[hoveredState].signals.map(sig => (
                  <a key={sig.id} href={sig.source.url_original} target="_blank" rel="noopener noreferrer"
                    className="block p-2 rounded-lg hover:shadow-sm transition-shadow"
                    style={{ background: '#F7F2EE', border: '1px solid #E2D5CC' }}>
                    <div className="text-[10px] font-bold mb-0.5" style={{ color: '#8E1B2E' }}>{sig.brand}</div>
                    <div className="text-xs leading-snug" style={{ color: '#1A0A0D' }}>{sig.headline}</div>
                    <div className="text-[10px] mt-1" style={{ color: '#9E7A82' }}>{sig.source.publisher}</div>
                  </a>
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full min-h-48 text-center">
              <div className="text-4xl mb-3">🗺️</div>
              <div className="font-display text-xl font-semibold mb-1" style={{ color: '#1A0A0D' }}>Hover a state</div>
              <div className="text-sm" style={{ color: '#9E7A82' }}>to preview signals from that region</div>
              <div className="mt-4 text-xs" style={{ color: '#9E7A82' }}>
                Click any state to filter<br />the entire dashboard
              </div>
              <div className="mt-4 pt-4 w-full" style={{ borderTop: '1px solid #F3EDE8' }}>
                <div className="text-[10px] font-semibold uppercase tracking-wide mb-2" style={{ color: '#8E1B2E' }}>Most Active States</div>
                {Object.entries(stateData).sort((a,b) => b[1].count - a[1].count).slice(0,5).map(([state, d]) => (
                  <button key={state} onClick={() => onStateClick(state)}
                    className="flex items-center justify-between w-full py-1 text-xs hover:underline"
                    style={{ color: '#5C3D45' }}>
                    <span>📍 {state}</span>
                    <span className="font-bold" style={{ color: '#8E1B2E' }}>{d.count}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
