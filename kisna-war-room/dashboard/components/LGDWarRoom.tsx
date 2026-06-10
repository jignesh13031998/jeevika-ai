import React from 'react'
import { gnews } from './Watchlist'

// Lab Grown Diamond War Room — special threat watch for natural diamond perception
const LGD_BRANDS = [
  { name: 'Aukera',             owner: 'Titan-backed (Tata)',   focus: 'Premium LGD retail stores',           threat: 'HIGH',   note: 'Tata muscle behind LGD retail — direct premium positioning vs natural.' },
  { name: 'Fiona Diamonds',     owner: 'Independent',           focus: 'Online-first LGD, aggressive pricing', threat: 'MEDIUM', note: 'Price-anchored marketing erodes natural diamond price perception.' },
  { name: 'Limelight Diamonds', owner: 'Independent (funded)',  focus: 'LGD jewellery, celebrity marketing',  threat: 'HIGH',   note: 'Largest LGD jewellery brand by stores; mainstream celebrity campaigns.' },
  { name: 'Jewelbox',           owner: 'Startup (funded)',      focus: 'LGD studs & solitaires, D2C',         threat: 'MEDIUM', note: 'Funded D2C play targeting solitaire entry-point buyers.' },
  { name: 'Solitario',          owner: 'Independent',           focus: 'LGD solitaires, franchise model',     threat: 'MEDIUM', note: 'Franchise-led LGD expansion — same playbook as KISNA distribution.' },
  { name: 'Greenlab',           owner: 'Manufacturer',          focus: 'LGD manufacturing capacity',          threat: 'LOW',    note: 'Supply-side capacity growth lowers LGD prices industry-wide.' },
  { name: 'GIVA',               owner: 'Funded startup',        focus: 'Silver + LGD collections',            threat: 'MEDIUM', note: 'Massive D2C reach now cross-selling LGD to younger buyers.' },
]

const THREAT_STYLE: Record<string, { bg: string; color: string }> = {
  HIGH:   { bg: '#FEE2E2', color: '#991B1B' },
  MEDIUM: { bg: '#FEF3C7', color: '#92400E' },
  LOW:    { bg: '#D1FAE5', color: '#065F46' },
}

export default function LGDWarRoom() {
  return (
    <section className="max-w-[1600px] mx-auto px-4 py-6">
      <div className="flex items-baseline gap-3 mb-4" style={{ borderBottom: '2px solid #DDD6FE', paddingBottom: '10px' }}>
        <h2 className="font-display text-3xl font-bold" style={{ color: '#5B21B6' }}>💎 Lab Grown Diamond War Room</h2>
        <span className="text-sm" style={{ color: '#7C6BA8' }}>brands · funding · capacity · campaigns — anything affecting natural diamond perception</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {LGD_BRANDS.map(b => {
          const ts = THREAT_STYLE[b.threat]
          return (
            <div key={b.name} className="rounded-xl border bg-white overflow-hidden" style={{ borderColor: '#DDD6FE' }}>
              <div className="px-4 py-3 flex items-center justify-between" style={{ background: '#F5F3FF' }}>
                <div>
                  <div className="font-bold text-sm" style={{ color: '#5B21B6' }}>{b.name}</div>
                  <div className="text-[10px]" style={{ color: '#7C6BA8' }}>{b.owner}</div>
                </div>
                <span className="text-[9px] px-2 py-0.5 rounded-full font-bold" style={ts}>
                  {b.threat} THREAT
                </span>
              </div>
              <div className="px-4 py-3">
                <div className="text-xs font-semibold mb-1" style={{ color: '#1A0A0D' }}>{b.focus}</div>
                <p className="text-[11px] leading-relaxed mb-2" style={{ color: '#6B7280' }}>{b.note}</p>
                <a href={gnews(`${b.name} lab grown diamond India`)} target="_blank" rel="noopener noreferrer"
                  className="text-[10px] font-bold hover:underline" style={{ color: '#5B21B6' }}>
                  📰 Latest news →
                </a>
              </div>
            </div>
          )
        })}

        {/* Sector pulse card */}
        <div className="rounded-xl border p-4" style={{ borderColor: '#DDD6FE', background: '#F5F3FF' }}>
          <div className="font-bold text-sm mb-2" style={{ color: '#5B21B6' }}>Sector Pulse — track weekly</div>
          <div className="space-y-1.5 text-[11px]">
            {[
              ['LGD funding rounds', 'lab grown diamond startup funding India'],
              ['New LGD manufacturing capacity', 'lab grown diamond manufacturing capacity India'],
              ['LGD price changes', 'lab grown diamond price drop India'],
              ['Consumer adoption trends', 'lab grown diamond consumer demand India'],
              ['Natural vs LGD perception', 'natural diamond vs lab grown India'],
            ].map(([label, q]) => (
              <a key={label} href={gnews(q)} target="_blank" rel="noopener noreferrer"
                className="block hover:underline" style={{ color: '#6B21A8' }}>
                → {label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
