import React, { useState } from 'react'
import { Signal } from '../lib/types'
import { categoryLabel, formatDate } from '../lib/scoring-display'

interface Props { signals: Signal[] }

// Franchise-relevant signal categories
const FRANCHISE_CATS = new Set([
  'FRANCHISE_OPPORTUNITY', 'STORE_OPENING', 'STORE_CLOSURE',
  'EXPANSION_PLAN', 'RETAIL_FORMAT_CHANGE', 'NEW_MARKET_ENTRY',
  'OMNICHANNEL_PUSH', 'DIGITAL_DTC_MOVE',
])

const REGIONS: Record<string, { states: string[]; color: string; bg: string; label: string }> = {
  West:    { states: ['Maharashtra','Gujarat','Rajasthan','Goa'],                        color: '#8E1B2E', bg: '#FFF5F5', label: '🏠 West (KISNA Home)' },
  North:   { states: ['Delhi','Haryana','Punjab','Uttar Pradesh','Uttarakhand'],         color: '#0369A1', bg: '#EFF6FF', label: '🏔 North' },
  South:   { states: ['Karnataka','Tamil Nadu','Kerala','Andhra Pradesh','Telangana'],   color: '#059669', bg: '#ECFDF5', label: '🌴 South' },
  East:    { states: ['West Bengal','Odisha','Bihar','Jharkhand','Assam'],              color: '#D97706', bg: '#FFFBEB', label: '🌄 East' },
  Central: { states: ['Madhya Pradesh','Chhattisgarh'],                                color: '#7C3AED', bg: '#F5F3FF', label: '🗺 Central' },
  GCC:     { states: ['UAE','Dubai','Saudi Arabia','Kuwait','Qatar','Oman','Bahrain'],  color: '#C9A86A', bg: '#FFFBEB', label: '✈ GCC / Gulf' },
}

// Franchise blueprint data — known competitor store/franchise footprint
const FRANCHISE_BLUEPRINTS = [
  { brand: 'Tanishq',          stores: 420, franchise: 0,   model: 'Company-Owned Only',     states: ['Maharashtra','Delhi','Karnataka','Tamil Nadu','Gujarat','Rajasthan','West Bengal'], note: 'No franchise; all TATA-owned. Aggressive tier-2 expansion.' },
  { brand: 'CaratLane',        stores: 280, franchise: 0,   model: 'Company-Owned (Digital-first)', states: ['Maharashtra','Delhi','Karnataka','Telangana','Tamil Nadu','Gujarat'], note: 'Tata/Titan subsidiary. 280 stores + strong online channel.' },
  { brand: 'Malabar Gold',     stores: 340, franchise: 0,   model: 'Company-Owned',          states: ['Kerala','Karnataka','Tamil Nadu','Andhra Pradesh','Telangana','Maharashtra','UAE','Dubai','Saudi Arabia'], note: 'GCC-heavy; all company-owned. Rapid South India dominance.' },
  { brand: 'Kalyan Jewellers', stores: 283, franchise: 180, model: 'FOCO Franchise',         states: ['Kerala','Tamil Nadu','Karnataka','Andhra Pradesh','Maharashtra','West Bengal','Delhi','UAE'], note: 'FOCO model: 180 franchise + 103 company-owned. Target 50 new stores FY27.' },
  { brand: 'BlueStone',        stores: 250, franchise: 80,  model: 'Franchise + Online',     states: ['Maharashtra','Delhi','Karnataka','Gujarat','Rajasthan','Uttar Pradesh'], note: 'IPO filed 2025. Franchise model expanding in tier-2 cities.' },
  { brand: 'Senco Gold',       stores: 165, franchise: 80,  model: 'Franchise (East-heavy)', states: ['West Bengal','Odisha','Bihar','Jharkhand','Assam','Odisha'], note: 'MoU for 25 new franchise stores in East & Northeast by FY27.' },
  { brand: 'PNG Jewellers',    stores: 40,  franchise: 15,  model: 'Franchise (West)',       states: ['Maharashtra','Goa','Gujarat'], note: 'Concentrated in Maharashtra. Listed Aug 2024. Expansion into Gujarat.' },
  { brand: 'PC Jewellers',     stores: 95,  franchise: 60,  model: 'Franchise',              states: ['Delhi','Haryana','Punjab','Uttar Pradesh','Rajasthan','Madhya Pradesh'], note: 'North-heavy. Post-debt resolution, resuming franchise sign-ups.' },
  { brand: 'Indriya',          stores: 35,  franchise: 0,   model: 'Company-Owned (New)',    states: ['Maharashtra','Delhi','Karnataka','Tamil Nadu','Gujarat'], note: 'Aditya Birla Group. Launched 2024. Rapid premium positioning push.' },
]

const BRAND_TIER: Record<string, number> = {
  Tanishq: 1, CaratLane: 1, 'Malabar Gold': 1,
  'Kalyan Jewellers': 2, BlueStone: 2, 'Senco Gold': 2,
  'PNG Jewellers': 3, 'PC Jewellers': 3, Indriya: 2,
}
const TIER_COLOR: Record<number, string> = { 1: '#C41E3A', 2: '#D97706', 3: '#0369A1' }

export default function FranchiseMode({ signals }: Props) {
  const [activeRegion, setActiveRegion] = useState<string | null>(null)

  // Filter signals relevant to franchise/expansion
  const franchiseSignals = signals.filter(s => FRANCHISE_CATS.has(s.category))
  // Fallback: if none, show all signals that mention store/franchise/expansion
  const displaySignals = franchiseSignals.length > 0
    ? franchiseSignals
    : signals.filter(s =>
        /franchise|store|expansion|open|retail|outlet/i.test(s.headline + ' ' + (s.classification_rationale ?? ''))
      )

  // State → signals mapping
  const stateSignals: Record<string, Signal[]> = {}
  for (const sig of signals) {
    const key = sig.geo.gcc ? 'GCC' : sig.geo.state
    if (!key) continue
    if (!stateSignals[key]) stateSignals[key] = []
    stateSignals[key].push(sig)
  }

  const activeRegionData = activeRegion ? REGIONS[activeRegion] : null
  const activeStates = activeRegionData?.states ?? []
  const regionSignals = activeStates.flatMap(s => stateSignals[s] ?? [])

  return (
    <div style={{ background: '#F0F7F2' }}>

      {/* ── Franchise Blueprint Grid ─────────────────── */}
      <section className="max-w-[1600px] mx-auto px-4 pt-6 pb-2">
        <div className="flex items-baseline gap-3 mb-4" style={{ borderBottom: '2px solid #B8DFC4', paddingBottom: '10px' }}>
          <h2 className="font-display text-3xl font-bold" style={{ color: '#1A5C2A' }}>Competitor Franchise Blueprint</h2>
          <span className="text-sm" style={{ color: '#4A8C5C' }}>store count · model · geography · expansion signals</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {FRANCHISE_BLUEPRINTS.map(bp => {
            const tier = BRAND_TIER[bp.brand] ?? 3
            const color = TIER_COLOR[tier]
            return (
              <div key={bp.brand} className="rounded-xl overflow-hidden border bg-white" style={{ borderColor: '#B8DFC4' }}>
                <div className="px-4 py-3 flex items-start justify-between" style={{ background: color }}>
                  <div>
                    <div className="font-display font-bold text-lg text-white">{bp.brand}</div>
                    <div className="text-[10px] text-white/80">{bp.model}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-bold text-xl">{bp.stores}</div>
                    <div className="text-[10px] text-white/80">total stores</div>
                  </div>
                </div>

                <div className="px-4 py-3">
                  {bp.franchise > 0 && (
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ background: '#FFF7ED', color: '#92400E' }}>
                        {bp.franchise} franchise
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ background: '#ECFDF5', color: '#065F46' }}>
                        {bp.stores - bp.franchise} company-owned
                      </span>
                    </div>
                  )}

                  <p className="text-xs leading-relaxed mb-2" style={{ color: '#374151' }}>{bp.note}</p>

                  <div className="flex flex-wrap gap-1">
                    {bp.states.map(s => (
                      <span key={s} className="text-[9px] px-1.5 py-0.5 rounded font-medium"
                        style={{ background: '#F0F7F2', color: '#1A5C2A', border: '1px solid #B8DFC4' }}>
                        📍{s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── Region Map ───────────────────────────────── */}
      <section className="max-w-[1600px] mx-auto px-4 py-6">
        <div className="flex items-baseline gap-3 mb-4" style={{ borderBottom: '2px solid #B8DFC4', paddingBottom: '10px' }}>
          <h2 className="font-display text-3xl font-bold" style={{ color: '#1A5C2A' }}>Expansion Map — by Region</h2>
          <span className="text-sm" style={{ color: '#4A8C5C' }}>click a region to see signals from that geography</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Region selector */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 content-start">
            {Object.entries(REGIONS).map(([regionKey, r]) => {
              const count = r.states.reduce((sum, s) => sum + (stateSignals[s]?.length ?? 0), 0)
              const isActive = activeRegion === regionKey
              return (
                <button key={regionKey} onClick={() => setActiveRegion(isActive ? null : regionKey)}
                  className="rounded-xl p-4 border-2 text-left transition-all"
                  style={{
                    background: isActive ? r.color : r.bg,
                    borderColor: r.color,
                    color: isActive ? 'white' : r.color,
                  }}>
                  <div className="font-bold text-sm mb-0.5">{r.label}</div>
                  <div className="text-[11px] opacity-80">{r.states.slice(0,3).join(', ')}{r.states.length > 3 ? '…' : ''}</div>
                  <div className="text-lg font-display font-bold mt-1">{count}</div>
                  <div className="text-[9px] opacity-70">signals</div>
                </button>
              )
            })}
          </div>

          {/* Signals panel */}
          <div className="rounded-xl border bg-white overflow-hidden" style={{ borderColor: '#B8DFC4' }}>
            {!activeRegion ? (
              <div className="p-6 text-center" style={{ color: '#4A8C5C' }}>
                <div className="text-3xl mb-2">🗺</div>
                <div className="font-semibold">Select a region to see competitor signals</div>
              </div>
            ) : (
              <>
                <div className="px-4 py-3 font-bold text-sm text-white"
                  style={{ background: activeRegionData!.color }}>
                  {activeRegionData!.label} — {regionSignals.length} signals
                </div>
                <div className="divide-y overflow-y-auto" style={{ maxHeight: '400px', borderColor: '#B8DFC4' }}>
                  {regionSignals.length === 0 ? (
                    <p className="p-4 text-sm" style={{ color: '#4A8C5C' }}>No signals for this region in current filter.</p>
                  ) : regionSignals.map(sig => (
                    <div key={sig.id} className="px-4 py-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold" style={{ color: TIER_COLOR[sig.tier] ?? '#6B7280' }}>{sig.brand}</span>
                        {sig.geo.state && <span className="text-[10px]" style={{ color: '#4A8C5C' }}>📍{sig.geo.state}</span>}
                      </div>
                      <a href={sig.source.url_original} target="_blank" rel="noopener noreferrer"
                        className="text-xs font-semibold hover:underline block mb-1" style={{ color: '#1A0A0D' }}>
                        🔗 {sig.headline}
                      </a>
                      <div className="text-[10px]" style={{ color: '#6B7280' }}>
                        {categoryLabel(sig.category)} · {formatDate(sig.published_at)}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── Franchise / Expansion Signals from live data ── */}
      {displaySignals.length > 0 && (
        <section className="max-w-[1600px] mx-auto px-4 py-6">
          <div className="flex items-baseline gap-3 mb-4" style={{ borderBottom: '2px solid #B8DFC4', paddingBottom: '10px' }}>
            <h2 className="font-display text-3xl font-bold" style={{ color: '#1A5C2A' }}>Franchise & Expansion Signals</h2>
            <span className="text-sm" style={{ color: '#4A8C5C' }}>live intelligence · store openings · new markets</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {displaySignals.map(sig => (
              <div key={sig.id} className="rounded-xl border bg-white p-4" style={{ borderColor: '#B8DFC4' }}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold" style={{ color: TIER_COLOR[sig.tier] ?? '#6B7280' }}>{sig.brand}</span>
                  <span className="text-[9px] px-2 py-0.5 rounded-full font-bold"
                    style={{
                      background: sig.priority_band === 'HIGH' ? '#FEE2E2' : '#FEF3C7',
                      color: sig.priority_band === 'HIGH' ? '#991B1B' : '#92400E',
                    }}>
                    {sig.priority_band}
                  </span>
                  {sig.geo.state && <span className="text-[10px]" style={{ color: '#4A8C5C' }}>📍{sig.geo.state}</span>}
                </div>
                <a href={sig.source.url_original} target="_blank" rel="noopener noreferrer"
                  className="text-sm font-semibold hover:underline block mb-2" style={{ color: '#1A0A0D' }}>
                  🔗 {sig.headline}
                </a>
                <div className="text-[10px]" style={{ color: '#6B7280' }}>
                  {categoryLabel(sig.category)} · {sig.source.publisher} · {formatDate(sig.published_at)}
                </div>
                {sig.analysis?.why_it_matters_to_kisna && (
                  <div className="mt-2 text-xs italic border-l-2 pl-2" style={{ color: '#1A5C2A', borderColor: '#1A5C2A' }}>
                    {sig.analysis.why_it_matters_to_kisna}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
