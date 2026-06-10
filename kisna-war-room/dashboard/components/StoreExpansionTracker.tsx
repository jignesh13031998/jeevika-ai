import React, { useState } from 'react'
import { gnews } from './Watchlist'

// Store Expansion Tracker — openings / upcoming / closures (refreshed each engine run)
type StoreEvent = {
  brand: string; city: string; state: string; date: string
  format: string; location: 'Mall' | 'High Street'
  status: 'OPENED' | 'UPCOMING' | 'CLOSED'
}

const STORE_EVENTS: StoreEvent[] = [
  { brand: 'Tanishq',          city: 'Indore',     state: 'Madhya Pradesh', date: '2026-06-04', format: 'Flagship 8,000 sqft', location: 'High Street', status: 'OPENED' },
  { brand: 'Kalyan Jewellers', city: 'Nagpur',     state: 'Maharashtra',    date: '2026-06-02', format: 'FOCO franchise',      location: 'High Street', status: 'OPENED' },
  { brand: 'Malabar Gold',     city: 'Lucknow',    state: 'Uttar Pradesh',  date: '2026-05-30', format: 'Company-owned',       location: 'Mall',        status: 'OPENED' },
  { brand: 'BlueStone',        city: 'Surat',      state: 'Gujarat',        date: '2026-05-28', format: 'Franchise 1,500 sqft', location: 'Mall',        status: 'OPENED' },
  { brand: 'Senco Gold',       city: 'Guwahati',   state: 'Assam',          date: '2026-05-25', format: 'Franchise',           location: 'High Street', status: 'OPENED' },
  { brand: 'Tanishq',          city: 'Rajkot',     state: 'Gujarat',        date: '2026-07-15', format: 'Flagship',            location: 'High Street', status: 'UPCOMING' },
  { brand: 'Kalyan Jewellers', city: 'Pune',       state: 'Maharashtra',    date: '2026-07-01', format: 'FOCO franchise',      location: 'Mall',        status: 'UPCOMING' },
  { brand: 'Indriya',          city: 'Ahmedabad',  state: 'Gujarat',        date: '2026-08-01', format: 'Premium 5,000 sqft',  location: 'High Street', status: 'UPCOMING' },
  { brand: 'Senco Gold',       city: 'Bhubaneswar', state: 'Odisha',        date: '2026-07-20', format: 'Franchise',           location: 'High Street', status: 'UPCOMING' },
  { brand: 'PNG Jewellers',    city: 'Nashik',     state: 'Maharashtra',    date: '2026-08-10', format: 'Franchise',           location: 'High Street', status: 'UPCOMING' },
  { brand: 'PC Jewellers',     city: 'Kanpur',     state: 'Uttar Pradesh',  date: '2026-05-15', format: 'Consolidation',       location: 'High Street', status: 'CLOSED' },
  { brand: 'Joyalukkas',       city: 'Mumbai',     state: 'Maharashtra',    date: '2026-05-10', format: 'Relocation',          location: 'Mall',        status: 'CLOSED' },
]

const KISNA_OVERLAP = new Set(['Maharashtra', 'Gujarat', 'Rajasthan', 'Madhya Pradesh'])

const STATUS_META = {
  OPENED:   { label: '🟢 New Openings',  bg: '#ECFDF5', color: '#065F46' },
  UPCOMING: { label: '🟡 Upcoming',      bg: '#FEF3C7', color: '#92400E' },
  CLOSED:   { label: '🔴 Closures',      bg: '#FEE2E2', color: '#991B1B' },
}

export default function StoreExpansionTracker() {
  const [tab, setTab] = useState<'OPENED' | 'UPCOMING' | 'CLOSED'>('OPENED')
  const events = STORE_EVENTS.filter(e => e.status === tab)
  const overlapCount = STORE_EVENTS.filter(e => e.status !== 'CLOSED' && KISNA_OVERLAP.has(e.state)).length

  return (
    <section className="max-w-[1600px] mx-auto px-4 pt-6 pb-2">
      <div className="flex items-baseline gap-3 mb-4" style={{ borderBottom: '2px solid #B8DFC4', paddingBottom: '10px' }}>
        <h2 className="font-display text-3xl font-bold" style={{ color: '#1A5C2A' }}>Store Expansion Tracker</h2>
        <span className="text-sm" style={{ color: '#4A8C5C' }}>openings · upcoming · closures — vs KISNA network</span>
      </div>

      {/* KISNA overlap alert */}
      {overlapCount > 0 && (
        <div className="rounded-xl p-3 mb-4 flex items-center gap-3" style={{ background: '#FEE2E2', border: '1px solid #FCA5A5' }}>
          <span className="text-2xl">🚨</span>
          <div>
            <span className="text-sm font-bold" style={{ color: '#991B1B' }}>
              {overlapCount} store moves in KISNA home states
            </span>
            <span className="text-xs ml-2" style={{ color: '#B91C1C' }}>
              (Maharashtra · Gujarat · Rajasthan · MP) — competitors entering your turf
            </span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {(Object.keys(STATUS_META) as Array<keyof typeof STATUS_META>).map(s => {
          const m = STATUS_META[s]
          const count = STORE_EVENTS.filter(e => e.status === s).length
          return (
            <button key={s} onClick={() => setTab(s)}
              className="text-sm px-4 py-2 rounded-lg font-bold border-2 transition-all"
              style={{
                background: tab === s ? m.color : m.bg,
                color: tab === s ? 'white' : m.color,
                borderColor: m.color,
              }}>
              {m.label} ({count})
            </button>
          )
        })}
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-white overflow-x-auto" style={{ borderColor: '#B8DFC4' }}>
        <table className="w-full text-sm min-w-[700px]">
          <thead>
            <tr style={{ background: '#F0F7F2', borderBottom: '1px solid #B8DFC4' }}>
              {['Brand', 'City', 'State', 'Date', 'Format', 'Location', 'News'].map(h => (
                <th key={h} className="text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider" style={{ color: '#4A8C5C' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {events.map((e, i) => {
              const overlap = KISNA_OVERLAP.has(e.state)
              return (
                <tr key={i} style={{
                  borderBottom: i < events.length - 1 ? '1px solid #E8F2EB' : 'none',
                  background: overlap ? '#FFF5F5' : 'transparent',
                }}>
                  <td className="px-4 py-2.5 font-bold text-xs" style={{ color: '#1A5C2A' }}>{e.brand}</td>
                  <td className="px-4 py-2.5 text-xs" style={{ color: '#1A0A0D' }}>{e.city}</td>
                  <td className="px-4 py-2.5 text-xs">
                    <span style={{ color: overlap ? '#991B1B' : '#1A0A0D', fontWeight: overlap ? 700 : 400 }}>
                      {overlap && '⚠ '}{e.state}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-xs" style={{ color: '#6B7280' }}>{e.date}</td>
                  <td className="px-4 py-2.5 text-xs" style={{ color: '#6B7280' }}>{e.format}</td>
                  <td className="px-4 py-2.5 text-xs" style={{ color: '#6B7280' }}>{e.location}</td>
                  <td className="px-4 py-2.5">
                    <a href={gnews(`${e.brand} new store ${e.city}`)} target="_blank" rel="noopener noreferrer"
                      className="text-[10px] font-bold hover:underline" style={{ color: '#1A5C2A' }}>🔗 Source</a>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Hiring signals */}
      <div className="rounded-xl border bg-white p-4 mt-4" style={{ borderColor: '#B8DFC4' }}>
        <div className="text-[11px] font-bold uppercase tracking-wide mb-2" style={{ color: '#1A5C2A' }}>
          👔 Recruitment Signals — hiring often reveals strategy before press releases
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            ['Retail expansion heads', 'jewellery retail expansion head hiring India'],
            ['Franchise development roles', 'jewellery franchise development manager jobs India'],
            ['Category heads', 'jewellery category head hiring India'],
            ['Regional managers (West)', 'jewellery regional manager Maharashtra Gujarat jobs'],
          ].map(([label, q]) => (
            <a key={label} href={gnews(q)} target="_blank" rel="noopener noreferrer"
              className="text-[10px] px-3 py-1.5 rounded-full border font-bold hover:underline"
              style={{ borderColor: '#1A5C2A', color: '#1A5C2A' }}>
              {label} →
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
