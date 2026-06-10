import React from 'react'
import { gnews } from './Watchlist'

// Industry News Monitor — sources + policy/price watch
const SOURCES = [
  { name: 'GJEPC',                  url: 'https://gjepc.org/news.php' },
  { name: 'Rapaport',               url: 'https://rapaport.com/news/' },
  { name: 'Natural Diamond Council', url: 'https://www.naturaldiamonds.com/journal/' },
  { name: 'Retail Jeweller India',  url: 'https://retailjewellerindia.com/' },
  { name: 'Economic Times — Gems',  url: 'https://economictimes.indiatimes.com/industry/cons-products/fashion-/-cosmetics-/-jewellery' },
  { name: 'Business Standard',      url: 'https://www.business-standard.com/topic/jewellery' },
  { name: 'Mint',                   url: 'https://www.livemint.com/Search/Link/Keyword/jewellery' },
]

const POLICY_WATCH = [
  ['Import duty changes',  'gold import duty change India'],
  ['Diamond prices',       'diamond prices India polished rough'],
  ['Gold prices',          'gold price India today MCX'],
  ['Government policies',  'jewellery industry government policy India'],
  ['Hallmarking changes',  'gold hallmarking rules BIS India'],
  ['Customs changes',      'customs duty gems jewellery India'],
]

export default function IndustryNews() {
  return (
    <section className="max-w-[1600px] mx-auto px-4 py-6">
      <div className="flex items-baseline gap-3 mb-4" style={{ borderBottom: '2px solid #E2D5CC', paddingBottom: '10px' }}>
        <h2 className="font-display text-3xl font-bold" style={{ color: '#8E1B2E' }}>Industry News Monitor</h2>
        <span className="text-sm" style={{ color: '#9E7A82' }}>trade press · policy · prices · regulation</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border bg-white p-4" style={{ borderColor: '#E2D5CC' }}>
          <div className="text-[11px] font-bold uppercase tracking-wide mb-3" style={{ color: '#8E1B2E' }}>📰 Trade Sources</div>
          <div className="grid grid-cols-2 gap-2">
            {SOURCES.map(s => (
              <a key={s.name} href={s.url} target="_blank" rel="noopener noreferrer"
                className="text-xs px-3 py-2 rounded-lg border font-medium hover:underline"
                style={{ borderColor: '#E2D5CC', color: '#1A0A0D', background: '#FBF8F5' }}>
                {s.name} →
              </a>
            ))}
          </div>
        </div>

        <div className="rounded-xl border bg-white p-4" style={{ borderColor: '#E2D5CC' }}>
          <div className="text-[11px] font-bold uppercase tracking-wide mb-3" style={{ color: '#8E1B2E' }}>⚖️ Policy & Price Watch</div>
          <div className="grid grid-cols-2 gap-2">
            {POLICY_WATCH.map(([label, q]) => (
              <a key={label} href={gnews(q)} target="_blank" rel="noopener noreferrer"
                className="text-xs px-3 py-2 rounded-lg border font-medium hover:underline"
                style={{ borderColor: '#E2D5CC', color: '#1A0A0D', background: '#FBF8F5' }}>
                {label} →
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
