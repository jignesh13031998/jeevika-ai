import React from 'react'
import { gnews } from './Watchlist'

// M&A / Investment Watch — curated from public filings & press (updated each engine run)
const DEALS = [
  { date: '2026-05', type: 'IPO',         party: 'BlueStone',          headline: 'BlueStone IPO — listed on BSE; raised ₹2,100 Cr, valuing company at ₹12,500 Cr', impact: 'War chest for store expansion into KISNA overlap states.' },
  { date: '2026-04', type: 'PE Investment', party: 'Limelight Diamonds', headline: 'Limelight Diamonds raises $25M Series B for LGD retail expansion',               impact: 'Funded LGD player scaling stores — natural diamond perception risk.' },
  { date: '2026-03', type: 'Strategic',   party: 'Titan / CaratLane',  headline: 'Titan evaluates CaratLane separate listing; digital JV with Tata Digital studied', impact: 'A standalone CaratLane would be a pure-play digital competitor with Tata capital.' },
  { date: '2026-02', type: 'JV',          party: 'Indriya (Aditya Birla)', headline: 'Aditya Birla commits ₹5,000 Cr to Indriya jewellery rollout over 5 years',     impact: 'Conglomerate-backed entrant building national premium network from scratch.' },
  { date: '2026-01', type: 'Acquisition', party: 'Senco Gold',          headline: 'Senco acquires regional Bengal chain (14 stores) to consolidate East market',     impact: 'East consolidation play — watch for similar regional roll-ups in West.' },
]

const TYPE_STYLE: Record<string, { bg: string; color: string }> = {
  IPO:             { bg: '#EBF2FF', color: '#0A1F5C' },
  'PE Investment': { bg: '#F5F3FF', color: '#5B21B6' },
  Strategic:       { bg: '#FFF7ED', color: '#92400E' },
  JV:              { bg: '#ECFDF5', color: '#065F46' },
  Acquisition:     { bg: '#FEE2E2', color: '#991B1B' },
}

export default function MAWatch() {
  return (
    <section className="max-w-[1600px] mx-auto px-4 py-6">
      <div className="flex items-baseline gap-3 mb-4" style={{ borderBottom: '2px solid #C5D5EA', paddingBottom: '10px' }}>
        <h2 className="font-display text-3xl font-bold" style={{ color: '#000080' }}>M&A / Investment Watch</h2>
        <span className="text-sm" style={{ color: '#4A6FA5' }}>acquisitions · PE money · IPOs · joint ventures in jewellery</span>
      </div>

      <div className="rounded-xl border bg-white overflow-hidden" style={{ borderColor: '#C5D5EA' }}>
        <div className="divide-y" style={{ borderColor: '#E5EDF8' }}>
          {DEALS.map((d, i) => {
            const ts = TYPE_STYLE[d.type] ?? { bg: '#F3F4F6', color: '#374151' }
            return (
              <div key={i} className="px-4 py-3 flex items-start gap-4">
                <div className="flex-shrink-0 w-16 text-[10px] font-bold pt-0.5" style={{ color: '#4A6FA5' }}>{d.date}</div>
                <span className="text-[9px] px-2 py-0.5 rounded-full font-bold flex-shrink-0 mt-0.5" style={ts}>{d.type}</span>
                <div className="flex-1 min-w-0">
                  <a href={gnews(`${d.party} ${d.type === 'IPO' ? 'IPO' : 'investment acquisition'} jewellery`)}
                    target="_blank" rel="noopener noreferrer"
                    className="text-xs font-semibold hover:underline block" style={{ color: '#1A0A0D' }}>
                    🔗 {d.headline}
                  </a>
                  <div className="text-[11px] mt-1 italic" style={{ color: '#000080' }}>→ {d.impact}</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {[
          ['Jewellery M&A India', 'jewellery acquisition merger India'],
          ['Jewellery PE deals', 'private equity jewellery investment India'],
          ['Jewellery IPO pipeline', 'jewellery IPO DRHP SEBI India'],
        ].map(([label, q]) => (
          <a key={label} href={gnews(q)} target="_blank" rel="noopener noreferrer"
            className="text-[10px] px-3 py-1.5 rounded-full border font-bold hover:underline"
            style={{ borderColor: '#000080', color: '#000080' }}>
            🔍 {label} →
          </a>
        ))}
      </div>
    </section>
  )
}
