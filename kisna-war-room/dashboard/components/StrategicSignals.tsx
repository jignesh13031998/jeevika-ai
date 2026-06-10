import React from 'react'
import { Signal } from '../lib/types'
import { categoryLabel, formatDate } from '../lib/scoring-display'

interface Props { signals: Signal[] }

// Grouped by competitor, not suppressed by band
export default function StrategicSignals({ signals }: Props) {
  const byBrand: Record<string, Signal[]> = {}
  for (const sig of signals) {
    if (!byBrand[sig.brand]) byBrand[sig.brand] = []
    byBrand[sig.brand].push(sig)
  }

  const TIER_COLOR: Record<number, string> = { 1: '#C41E3A', 2: '#D97706', 3: '#0369A1' }
  const TIER_LABEL: Record<number, string> = { 1: '▲ Tier 1', 2: '◆ Tier 2', 3: '● Tier 3' }

  return (
    <section className="max-w-[1600px] mx-auto px-4 py-6">
      <div className="section-header flex items-baseline gap-3">
        <h2 className="font-display text-3xl font-bold" style={{ color: '#8E1B2E' }}>All 9 Competitors</h2>
        <span className="text-sm" style={{ color: '#9E7A82' }}>every signal, grouped by brand</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {Object.entries(byBrand).map(([brand, sigs]) => {
          const tier = sigs[0]?.tier ?? 3
          const color = TIER_COLOR[tier] ?? '#9E7A82'
          const threats = sigs.filter(s => s.flags.includes('THREAT_ALERT')).length
          const opps   = sigs.filter(s => s.flags.includes('OPPORTUNITY_ALERT')).length

          return (
            <div key={brand} className="card rounded-xl overflow-hidden">
              {/* Brand header */}
              <div className="px-4 py-3 flex items-center justify-between" style={{ background: color, color: 'white' }}>
                <div>
                  <div className="font-display text-xl font-bold">{brand}</div>
                  <div className="text-[10px] opacity-80">{TIER_LABEL[tier]} · {sigs[0]?.source?.publisher ?? ''}</div>
                </div>
                <div className="flex gap-2">
                  {threats > 0 && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ background: 'rgba(255,255,255,0.25)', color: 'white' }}>
                      ⚠ {threats}
                    </span>
                  )}
                  {opps > 0 && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ background: 'rgba(255,255,255,0.25)', color: 'white' }}>
                      ✓ {opps}
                    </span>
                  )}
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>
                    {sigs.length} signals
                  </span>
                </div>
              </div>

              {/* Signals list */}
              <div className="divide-y max-h-80 overflow-y-auto" style={{ borderColor: '#F3EDE8' }}>
                {sigs.map(sig => (
                  <div key={sig.id} className="px-4 py-3 hover:bg-surface-2 transition-colors">
                    <div className="flex items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <a href={sig.source.url_original} target="_blank" rel="noopener noreferrer"
                          className="text-xs font-semibold leading-snug hover:underline block mb-1" style={{ color: '#1A0A0D' }}>
                          🔗 {sig.headline}
                        </a>
                        <div className="flex gap-1 flex-wrap text-[10px]">
                          <span className="px-1.5 py-0.5 rounded font-medium" style={{
                            background: sig.priority_band === 'HIGH' ? '#FEE2E2' : sig.priority_band === 'MEDIUM' ? '#FEF3C7' : '#D1FAE5',
                            color: sig.priority_band === 'HIGH' ? '#991B1B' : sig.priority_band === 'MEDIUM' ? '#92400E' : '#065F46',
                          }}>
                            {sig.priority_band}
                          </span>
                          <span style={{ color: '#9E7A82' }}>{categoryLabel(sig.category)}</span>
                          <span style={{ color: '#9E7A82' }}>· {formatDate(sig.published_at)}</span>
                          {sig.geo.state && <span style={{ color: '#9E7A82' }}>· 📍{sig.geo.state}</span>}
                        </div>
                        <div className="text-[10px] italic mt-0.5" style={{ color: '#9E7A82' }}>
                          {sig.classification_rationale}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
