import React from 'react'

// KISNA Competitive Intelligence — full watchlist per CI framework
export const TIER1 = ['Tanishq', 'Malabar Gold & Diamonds', 'Kalyan Jewellers', 'BlueStone', 'Senco Gold', 'Thangamayil Jewellery', 'Candere', 'CaratLane']
export const TIER2 = ['Joyalukkas', 'PNG Jewellers', 'Waman Hari Pethe', 'Bhima Jewellers', 'Khazana Jewellery', 'Lalitha Jewellery', 'TBZ', 'ORRA']
export const LGD_WATCHLIST = ['Aukera', 'Fiona Diamonds', 'Limelight Diamonds', 'Jewelbox', 'Solitario', 'Greenlab', 'GIVA']

export const gnews = (q: string) =>
  `https://news.google.com/search?q=${encodeURIComponent(q)}&hl=en-IN&gl=IN`

export default function Watchlist() {
  return (
    <section className="max-w-[1600px] mx-auto px-4 py-4">
      <div className="rounded-xl border bg-white p-4" style={{ borderColor: '#E2D5CC' }}>
        <div className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: '#9E7A82' }}>
          Primary Competitor Watchlist — click any brand for latest news
        </div>
        <div className="space-y-2">
          <WatchRow label="Tier 1 · Direct National" color="#C41E3A" brands={TIER1} suffix="jewellery" />
          <WatchRow label="Tier 2 · Regional & Emerging" color="#D97706" brands={TIER2} suffix="jewellers" />
          <WatchRow label="Lab Grown Diamond Watch" color="#7C3AED" brands={LGD_WATCHLIST} suffix="lab grown diamond" />
        </div>
      </div>
    </section>
  )
}

function WatchRow({ label, color, brands, suffix }: { label: string; color: string; brands: string[]; suffix: string }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="text-[10px] font-bold w-44 flex-shrink-0" style={{ color }}>{label}</span>
      {brands.map(b => (
        <a key={b} href={gnews(`${b} ${suffix}`)} target="_blank" rel="noopener noreferrer"
          className="text-[10px] px-2 py-0.5 rounded-full border font-medium hover:text-white transition-colors"
          style={{ borderColor: color, color }}
          onMouseEnter={e => { e.currentTarget.style.background = color; e.currentTarget.style.color = 'white' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = color }}>
          {b}
        </a>
      ))}
    </div>
  )
}
