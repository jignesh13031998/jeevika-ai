import React from 'react'
import { Signal } from '../lib/types'

interface Props { signals: Signal[] }

// Morning answers — computed live from the signal feed
export default function ThreatOpportunityEngine({ signals }: Props) {
  const topThreat = [...signals].sort((a, b) => b.scores.threat - a.scores.threat)[0]
  const topOpp = [...signals].sort((a, b) => b.scores.opportunity - a.scores.opportunity)[0]
  const expansion = signals.filter(s => /STORE_OPENING|EXPANSION_PLAN|NEW_MARKET_ENTRY/.test(s.category))
    .sort((a, b) => b.scores.composite_priority - a.scores.composite_priority)[0]
  const product = signals.filter(s => /COLLECTION_LAUNCH|PRODUCT_INNOVATION/.test(s.category))
    .sort((a, b) => b.scores.composite_priority - a.scores.composite_priority)[0]
  const marketing = signals.filter(s => /CAMPAIGN_LAUNCH|CELEBRITY_AMBASSADOR|INFLUENCER_CONTENT/.test(s.category))
    .sort((a, b) => b.scores.composite_priority - a.scores.composite_priority)[0]
  const franchise = signals.filter(s => /FRANCHISE/.test(s.category))
    .sort((a, b) => b.scores.composite_priority - a.scores.composite_priority)[0]

  const lgdSignals = signals.filter(s => s.category === 'LAB_GROWN_DIAMOND_MOVE')
  const lgdThreat = lgdSignals.length === 0 ? 15
    : Math.min(95, Math.round(lgdSignals.reduce((m, s) => Math.max(m, s.scores.threat), 0) + lgdSignals.length * 5))

  const rows = [
    { q: '1. Biggest Threat to Kisna', sig: topThreat, score: topThreat?.scores.threat ?? 0, color: '#C41E3A' },
    { q: '2. Biggest Opportunity', sig: topOpp, score: topOpp?.scores.opportunity ?? 0, color: '#059669' },
    { q: '3. Expansion Opportunity', sig: expansion, score: expansion?.scores.composite_priority ?? 0, color: '#0369A1' },
    { q: '4. Product Opportunity', sig: product, score: product?.scores.composite_priority ?? 0, color: '#D97706' },
    { q: '5. Marketing Opportunity', sig: marketing, score: marketing?.scores.composite_priority ?? 0, color: '#7C3AED' },
    { q: '6. Franchise Opportunity', sig: franchise, score: franchise?.scores.composite_priority ?? 0, color: '#0F766E' },
  ]

  return (
    <section className="max-w-[1600px] mx-auto px-4 py-6">
      <div className="flex items-baseline gap-3 mb-4" style={{ borderBottom: '2px solid #E2D5CC', paddingBottom: '10px' }}>
        <h2 className="font-display text-3xl font-bold" style={{ color: '#8E1B2E' }}>Threat & Opportunity Engine</h2>
        <span className="text-sm" style={{ color: '#9E7A82' }}>this morning&apos;s seven answers · scored 0–100</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {rows.map(r => (
          <div key={r.q} className="rounded-xl border bg-white p-4 flex items-start gap-4" style={{ borderColor: '#E2D5CC' }}>
            <ScoreRing score={r.score} color={r.color} />
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-bold uppercase tracking-wide mb-1" style={{ color: r.color }}>{r.q}</div>
              {r.sig ? (
                <>
                  <a href={r.sig.source.url_original} target="_blank" rel="noopener noreferrer"
                    className="text-xs font-semibold hover:underline block" style={{ color: '#1A0A0D' }}>
                    {r.sig.brand}: {r.sig.headline}
                  </a>
                  {r.sig.analysis?.why_it_matters_to_kisna && (
                    <div className="text-[10px] italic mt-1" style={{ color: '#9E7A82' }}>{r.sig.analysis.why_it_matters_to_kisna}</div>
                  )}
                </>
              ) : (
                <div className="text-xs" style={{ color: '#9E7A82' }}>No qualifying signal in current window.</div>
              )}
            </div>
          </div>
        ))}

        {/* 7. LGD Threat Level */}
        <div className="rounded-xl border p-4 flex items-start gap-4 md:col-span-2"
          style={{ borderColor: '#C4B5FD', background: '#F5F3FF' }}>
          <ScoreRing score={lgdThreat} color="#7C3AED" />
          <div className="flex-1">
            <div className="text-[11px] font-bold uppercase tracking-wide mb-1" style={{ color: '#7C3AED' }}>7. LGD Threat Level</div>
            <div className="text-xs font-semibold" style={{ color: '#1A0A0D' }}>
              {lgdThreat >= 70 ? '🔴 Critical — lab-grown moves directly threaten natural diamond perception'
                : lgdThreat >= 45 ? '🟠 Elevated — active LGD competitor movement detected this week'
                : '🟢 Low — no major LGD developments in current window'}
            </div>
            <div className="text-[10px] mt-1" style={{ color: '#6B21A8' }}>
              {lgdSignals.length} LGD signal{lgdSignals.length !== 1 ? 's' : ''} in feed · watchlist: Aukera, Fiona, Limelight, Jewelbox, Solitario, Greenlab, GIVA
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function ScoreRing({ score, color }: { score: number; color: string }) {
  const s = Math.round(score)
  return (
    <div className="w-14 h-14 rounded-full flex-shrink-0 flex items-center justify-center"
      style={{ background: `conic-gradient(${color} ${s * 3.6}deg, #F3EDE8 0deg)` }}>
      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
        <span className="font-display font-bold text-sm" style={{ color }}>{s}</span>
      </div>
    </div>
  )
}
