import React, { useState } from 'react'
import { Signal } from '../lib/types'
import { getTimelineForBrand, getUniqueBrands } from '../lib/filtering'
import { categoryLabel, formatDate } from '../lib/scoring-display'

interface Props { signals: Signal[] }

const TIER_COLOR: Record<number, string> = { 1: '#C41E3A', 2: '#D97706', 3: '#0369A1' }

export default function Timeline({ signals }: Props) {
  const brands = getUniqueBrands(signals)
  const [selected, setSelected] = useState<string>(brands[0] ?? '')
  const timeline = selected ? getTimelineForBrand(signals, selected) : []
  const tierColor = TIER_COLOR[timeline[0]?.tier ?? 3] ?? '#9E7A82'

  return (
    <section className="max-w-[1600px] mx-auto px-4 py-6">
      <div className="section-header flex items-baseline gap-3">
        <h2 className="font-display text-3xl font-bold" style={{ color: '#8E1B2E' }}>Competitor Timeline</h2>
        <span className="text-sm" style={{ color: '#9E7A82' }}>7-day activity diary — select a brand</span>
      </div>

      {/* Brand selector */}
      <div className="flex flex-wrap gap-2 mb-4">
        {brands.map(b => {
          const tier = signals.find(s => s.brand === b)?.tier ?? 3
          const tc = TIER_COLOR[tier]
          return (
            <button key={b} onClick={() => setSelected(b)}
              className="text-sm px-3 py-1.5 rounded-lg border font-medium transition-all"
              style={{
                background: b === selected ? tc : 'white',
                color: b === selected ? 'white' : tc,
                borderColor: tc,
              }}>
              {b}
              <span className="ml-1.5 text-[10px] opacity-70">
                ({signals.filter(s => s.brand === b).length})
              </span>
            </button>
          )
        })}
      </div>

      <div className="card rounded-xl p-6">
        {timeline.length === 0 ? (
          <p className="text-sm" style={{ color: '#9E7A82' }}>No signals for selected brand.</p>
        ) : (
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5" style={{ background: '#E2D5CC' }} />
            <div className="space-y-5 pl-12">
              {timeline.map((sig, i) => {
                const dotColor = sig.freshness === 'NEW' ? '#C41E3A' : sig.freshness === 'FRESH' ? '#D97706' : '#C9A86A'
                return (
                  <div key={sig.id} className="relative">
                    {/* Node */}
                    <div className="absolute -left-8 top-1 w-4 h-4 rounded-full border-2 flex items-center justify-center"
                      style={{ background: dotColor, borderColor: 'white', boxShadow: '0 0 0 2px ' + dotColor + '40' }}>
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    </div>

                    <div className="text-[10px] font-semibold mb-1" style={{ color: '#9E7A82' }}>{formatDate(sig.published_at)}</div>
                    <a href={sig.source.url_original} target="_blank" rel="noopener noreferrer"
                      className="text-sm font-semibold leading-snug hover:underline block mb-1" style={{ color: '#1A0A0D' }}>
                      🔗 {sig.headline}
                    </a>
                    <div className="flex items-center gap-2 text-[10px] flex-wrap">
                      <span className="px-1.5 py-0.5 rounded font-medium"
                        style={{ background: sig.priority_band === 'HIGH' ? '#FEE2E2' : sig.priority_band === 'MEDIUM' ? '#FEF3C7' : '#D1FAE5',
                          color: sig.priority_band === 'HIGH' ? '#991B1B' : sig.priority_band === 'MEDIUM' ? '#92400E' : '#065F46' }}>
                        {sig.priority_band}
                      </span>
                      <span style={{ color: '#9E7A82' }}>{categoryLabel(sig.category)}</span>
                      <span style={{ color: '#C9B8AD' }}>·</span>
                      <span style={{ color: '#8E1B2E', fontWeight: 600 }}>{sig.source.publisher}</span>
                      {sig.geo.state && <><span style={{ color: '#C9B8AD' }}>·</span><span style={{ color: '#9E7A82' }}>📍{sig.geo.state}</span></>}
                    </div>
                    {sig.analysis?.why_it_matters_to_kisna && (
                      <div className="kisna-rail mt-2 py-1 text-xs italic" style={{ color: '#5C3D45' }}>
                        {sig.analysis.why_it_matters_to_kisna}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
