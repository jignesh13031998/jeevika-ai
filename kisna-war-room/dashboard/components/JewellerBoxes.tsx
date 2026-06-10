import React from 'react'
import { Signal } from '../lib/types'
import { categoryLabel, formatDate } from '../lib/scoring-display'

interface Props { signals: Signal[]; isDark?: boolean }

const ET_SEARCH = (brand: string) =>
  `https://economictimes.indiatimes.com/search?q=${encodeURIComponent(brand + ' jewellery')}`

const BRANDS_ORDER = [
  'Tanishq', 'CaratLane', 'BlueStone', 'Indriya',
  'Malabar Gold', 'Kalyan Jewellers', 'Senco Gold', 'PNG Jewellers', 'PC Jewellers',
]

const TIER_COLOR: Record<number, string> = { 1: '#C41E3A', 2: '#D97706', 3: '#0369A1' }
const TIER_LABEL: Record<number, string> = { 1: 'Tier 1', 2: 'Tier 2', 3: 'Tier 3' }

export default function JewellerBoxes({ signals, isDark = false }: Props) {
  const cardBg = isDark ? '#1A2340' : 'white'
  const borderColor = isDark ? '#2A3A5C' : '#E2D5CC'
  const subText = isDark ? '#8899BB' : '#9E7A82'
  const bodyText = isDark ? '#E8EEF8' : '#1A0A0D'
  const headingColor = isDark ? '#7B9FD4' : '#8E1B2E'

  const byBrand: Record<string, Signal[]> = {}
  for (const sig of signals) {
    if (!byBrand[sig.brand]) byBrand[sig.brand] = []
    byBrand[sig.brand].push(sig)
  }

  const orderedBrands = [
    ...BRANDS_ORDER.filter(b => byBrand[b]),
    ...Object.keys(byBrand).filter(b => !BRANDS_ORDER.includes(b)),
  ]

  return (
    <section className="max-w-[1600px] mx-auto px-4 py-6">
      <div className="flex items-baseline gap-3 mb-4" style={{ borderBottom: `2px solid ${borderColor}`, paddingBottom: '12px' }}>
        <h2 className="font-display text-3xl font-bold" style={{ color: headingColor }}>
          All 9 Competitors — By Jeweller
        </h2>
        <span className="text-sm" style={{ color: subText }}>each brand's full intelligence in one box</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {orderedBrands.map(brand => {
          const sigs = byBrand[brand]
          const tier = sigs[0]?.tier ?? 3
          const tierColor = TIER_COLOR[tier] ?? '#9E7A82'
          const threats = sigs.filter(s => s.flags.includes('THREAT_ALERT')).length
          const opps = sigs.filter(s => s.flags.includes('OPPORTUNITY_ALERT')).length
          const highCount = sigs.filter(s => s.priority_band === 'HIGH').length

          return (
            <div key={brand} className="rounded-xl overflow-hidden border flex flex-col"
              style={{ background: cardBg, borderColor }}>

              {/* Brand header bar */}
              <div className="px-4 py-3 flex items-start justify-between"
                style={{ background: tierColor }}>
                <div>
                  <div className="font-display text-lg font-bold text-white leading-tight">{brand}</div>
                  <div className="text-[10px] text-white/80 mt-0.5">
                    {TIER_LABEL[tier]} · {sigs[0]?.source?.publisher ?? ''}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div className="flex gap-1 flex-wrap justify-end">
                    {threats > 0 && (
                      <span className="text-[9px] px-2 py-0.5 rounded-full font-bold bg-white/25 text-white">
                        ⚠ {threats} threat{threats > 1 ? 's' : ''}
                      </span>
                    )}
                    {opps > 0 && (
                      <span className="text-[9px] px-2 py-0.5 rounded-full font-bold bg-white/25 text-white">
                        ✓ {opps} opp
                      </span>
                    )}
                  </div>
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/20 text-white">
                    {sigs.length} signals · {highCount} HIGH
                  </span>
                </div>
              </div>

              {/* ET News link */}
              <div className="px-4 py-2 flex items-center justify-between border-b"
                style={{ background: isDark ? '#0F1A2E' : '#F9F5F2', borderColor }}>
                <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: subText }}>
                  ET News Feed
                </span>
                <a href={ET_SEARCH(brand)} target="_blank" rel="noopener noreferrer"
                  className="text-[10px] font-bold hover:underline"
                  style={{ color: isDark ? '#7BAAEE' : tierColor }}>
                  📰 Open Economic Times →
                </a>
              </div>

              {/* Signals list */}
              <div className="flex-1 divide-y overflow-y-auto" style={{ maxHeight: '320px', borderColor }}>
                {sigs.map(sig => (
                  <div key={sig.id} className="px-4 py-3 transition-colors"
                    onMouseEnter={e => (e.currentTarget.style.background = isDark ? '#1E2F4A' : '#F9F5F2')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <div className="flex items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <a href={sig.source.url_original} target="_blank" rel="noopener noreferrer"
                          className="text-xs font-semibold leading-snug hover:underline block mb-1"
                          style={{ color: bodyText }}>
                          🔗 {sig.headline}
                        </a>
                        <div className="flex gap-1 flex-wrap text-[10px] mb-1">
                          <span className="px-1.5 py-0.5 rounded font-medium"
                            style={{
                              background: sig.priority_band === 'HIGH' ? '#FEE2E2' : sig.priority_band === 'MEDIUM' ? '#FEF3C7' : '#D1FAE5',
                              color: sig.priority_band === 'HIGH' ? '#991B1B' : sig.priority_band === 'MEDIUM' ? '#92400E' : '#065F46',
                            }}>
                            {sig.priority_band}
                          </span>
                          <span style={{ color: subText }}>{categoryLabel(sig.category)}</span>
                          <span style={{ color: subText }}>· {formatDate(sig.published_at)}</span>
                          {sig.geo.state && <span style={{ color: subText }}>· 📍{sig.geo.state}</span>}
                        </div>
                        {sig.classification_rationale && (
                          <div className="text-[10px] italic" style={{ color: subText }}>
                            {sig.classification_rationale}
                          </div>
                        )}
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
