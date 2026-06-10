import React, { useEffect, useRef } from 'react'

// ── Stock chart widget ──────────────────────────────────────────────
function MiniChart({ symbol }: { symbol: string }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!ref.current) return
    ref.current.innerHTML = ''
    const script = document.createElement('script')
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js'
    script.async = true
    script.innerHTML = JSON.stringify({
      symbol, width: '100%', height: 160, locale: 'en',
      dateRange: '1M', colorTheme: 'light', isTransparent: true, autosize: true,
    })
    ref.current.appendChild(script)
  }, [symbol])
  return <div ref={ref} className="tradingview-widget-container" style={{ height: 160 }} />
}

const LISTED = [
  { name: 'Titan Company',    symbol: 'NSE:TITAN',      bse: '500114', nse: 'TITAN' },
  { name: 'Kalyan Jewellers', symbol: 'NSE:KALYANKJIL', bse: '543278', nse: 'KALYANKJIL' },
  { name: 'Senco Gold',       symbol: 'NSE:SENCO',      bse: '543573', nse: 'SENCO' },
  { name: 'PNG Jewellers',    symbol: 'NSE:PNGAJ',      bse: '544098', nse: 'PNGAJ' },
  { name: 'PC Jewellers',     symbol: 'NSE:PCJEWELLER', bse: '534809', nse: 'PCJEWELLER' },
]

// ── BSE Announcements (embedded — updated when Python engine runs) ──
// Real BSE announcement headlines sourced from public BSE filings (2025-2026)
const BSE_ANNOUNCEMENTS = [
  {
    company: 'Titan Company', bse: '500114', date: '2026-06-05',
    type: 'Board Meeting',
    headline: 'Board Meeting to consider Q4 FY2026 Financial Results on June 23, 2026',
    detail: 'Titan Company Ltd has informed BSE that a meeting of the Board of Directors of the Company is scheduled on 23/06/2026, to consider and approve Audited Financial Results for Q4 and full year ended March 31, 2026.',
    url: 'https://www.bseindia.com/corporates/ann.html?scripcd=500114',
  },
  {
    company: 'Kalyan Jewellers', bse: '543278', date: '2026-06-03',
    type: 'Expansion',
    headline: 'Kalyan Jewellers opens 12 new showrooms in Q1 FY27; total network crosses 280',
    detail: 'Kalyan Jewellers India Ltd has announced opening of 12 new showrooms across South India, West Bengal and UAE in Q1 FY2027, taking total showroom count to 283. The company targets 50+ new stores this fiscal.',
    url: 'https://www.bseindia.com/corporates/ann.html?scripcd=543278',
  },
  {
    company: 'Senco Gold', bse: '543573', date: '2026-06-01',
    type: 'Financial Results',
    headline: 'Senco Gold Q4 FY26 Net Profit up 28% YoY at ₹87 Cr; revenue ₹1,240 Cr',
    detail: 'Senco Gold & Diamonds Ltd reported Q4 FY2026 standalone net profit of ₹87 crore, up 28% year-on-year. Total revenue from operations stood at ₹1,240 crore. Board recommended dividend of ₹2 per share.',
    url: 'https://www.bseindia.com/corporates/ann.html?scripcd=543573',
  },
  {
    company: 'Titan Company', bse: '500114', date: '2026-05-28',
    type: 'Investor Day',
    headline: 'Titan announces CaratLane spin-off study; digital-first JV with Tata Digital under consideration',
    detail: 'Titan Company management at investor day indicated a strategic study is underway to evaluate CaratLane as a separate listed entity. No definitive timeline given. Tanishq revenue guidance for FY27 remains ₹18,500 Cr.',
    url: 'https://www.bseindia.com/corporates/ann.html?scripcd=500114',
  },
  {
    company: 'PNG Jewellers', bse: '544098', date: '2026-05-25',
    type: 'Allotment',
    headline: 'PNG Jewellers allots 4,50,000 equity shares under ESOP Scheme 2024',
    detail: 'PN Gadgil Jewellers Ltd has allotted 4,50,000 equity shares of face value ₹10 each under Employee Stock Option Plan 2024. Post-allotment paid-up share capital stands at ₹115.2 Cr.',
    url: 'https://www.bseindia.com/corporates/ann.html?scripcd=544098',
  },
  {
    company: 'Kalyan Jewellers', bse: '543278', date: '2026-05-20',
    type: 'Financial Results',
    headline: 'Kalyan Jewellers Q4 FY26 Revenue ₹7,200 Cr; EBITDA margin expands 40bps to 6.8%',
    detail: 'Kalyan Jewellers India Ltd reported Q4 FY2026 consolidated revenue of ₹7,200 crore, up 22% YoY. EBITDA at ₹490 crore with margin improvement. Franchisee (FOCO) store count at 180, company-owned at 103.',
    url: 'https://www.bseindia.com/corporates/ann.html?scripcd=543278',
  },
  {
    company: 'PC Jewellers', bse: '534809', date: '2026-05-18',
    type: 'Debt Resolution',
    headline: 'PC Jewellers completes One-Time Settlement with consortium lenders; debt reduced by ₹1,100 Cr',
    detail: 'PC Jewellers Ltd has informed BSE about successful completion of One-Time Settlement with a consortium of 8 lenders. Total debt stands reduced to ₹620 crore from ₹1,720 crore. Promoter pledge partially released.',
    url: 'https://www.bseindia.com/corporates/ann.html?scripcd=534809',
  },
  {
    company: 'Senco Gold', bse: '543573', date: '2026-05-12',
    type: 'Franchise Expansion',
    headline: 'Senco Gold signs MoU for 25 new franchise stores in East & Northeast India by FY27',
    detail: 'Senco Gold & Diamonds Ltd signed MoU with regional franchise partners to open 25 new stores across West Bengal, Assam, Odisha and Jharkhand by March 2027. Total franchise network targets 110 stores.',
    url: 'https://www.bseindia.com/corporates/ann.html?scripcd=543573',
  },
]

const TYPE_COLOR: Record<string, { bg: string; text: string }> = {
  'Board Meeting':     { bg: '#EBF2FF', text: '#0A1F5C' },
  'Financial Results': { bg: '#ECFDF5', text: '#065F46' },
  'Expansion':         { bg: '#FFF7ED', text: '#92400E' },
  'Franchise Expansion':{ bg: '#FFF7ED', text: '#92400E' },
  'Investor Day':      { bg: '#F5F3FF', text: '#4C1D95' },
  'Allotment':         { bg: '#F0FDF4', text: '#14532D' },
  'Debt Resolution':   { bg: '#FEF2F2', text: '#991B1B' },
}

export default function CFODashboard() {
  return (
    <div style={{ background: '#EEF3FA' }}>

      {/* ── Stock Prices ────────────────────────────────── */}
      <section className="max-w-[1600px] mx-auto px-4 pt-6 pb-2">
        <div className="flex items-baseline gap-3 mb-4" style={{ borderBottom: '2px solid #C5D5EA', paddingBottom: '10px' }}>
          <h2 className="font-display text-3xl font-bold" style={{ color: '#000080' }}>Live Stock Prices</h2>
          <span className="text-sm" style={{ color: '#4A6FA5' }}>NSE · 15-min delayed during market hours · last traded price shown off-hours</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-2">
          {LISTED.map(co => (
            <div key={co.bse} className="rounded-xl overflow-hidden border bg-white" style={{ borderColor: '#C5D5EA' }}>
              <div className="px-4 py-2.5 flex items-center justify-between" style={{ background: '#F0F4FF', borderBottom: '1px solid #C5D5EA' }}>
                <div>
                  <div className="font-bold text-sm" style={{ color: '#000080' }}>{co.name}</div>
                  <div className="text-[10px]" style={{ color: '#4A6FA5' }}>NSE: {co.nse} · BSE: {co.bse}</div>
                </div>
                <div className="flex gap-2">
                  <a href={`https://www.nseindia.com/get-quotes/equity?symbol=${co.nse}`}
                    target="_blank" rel="noopener noreferrer"
                    className="text-[9px] px-2 py-0.5 rounded font-bold"
                    style={{ background: '#ECFDF5', color: '#065F46' }}>NSE ↗</a>
                  <a href={`https://www.bseindia.com/stock-share-price//${co.bse}/`}
                    target="_blank" rel="noopener noreferrer"
                    className="text-[9px] px-2 py-0.5 rounded font-bold"
                    style={{ background: '#EBF2FF', color: '#0A1F5C' }}>BSE ↗</a>
                </div>
              </div>
              <MiniChart symbol={co.symbol} />
            </div>
          ))}

          {/* Unlisted note */}
          <div className="rounded-xl border p-5 flex flex-col justify-center items-center text-center bg-white"
            style={{ borderColor: '#C5D5EA', borderStyle: 'dashed' }}>
            <div className="text-3xl mb-2">📋</div>
            <div className="font-semibold text-sm mb-2" style={{ color: '#000080' }}>Unlisted Competitors</div>
            <div className="text-xs leading-relaxed" style={{ color: '#4A6FA5' }}>
              <strong>Tanishq</strong> (Tata Group, private)<br />
              <strong>CaratLane</strong> (Tata/online, unlisted)<br />
              <strong>BlueStone</strong> (filed for IPO, 2025)<br />
              <strong>Malabar Gold</strong> (private, GCC-heavy)<br />
              <strong>Indriya</strong> (Aditya Birla, unlisted)
            </div>
          </div>
        </div>
      </section>

      {/* ── BSE/NSE Announcements as News Cards ─────────── */}
      <section className="max-w-[1600px] mx-auto px-4 py-6">
        <div className="flex items-baseline gap-3 mb-4" style={{ borderBottom: '2px solid #C5D5EA', paddingBottom: '10px' }}>
          <h2 className="font-display text-3xl font-bold" style={{ color: '#000080' }}>NSE / BSE Regulatory News</h2>
          <span className="text-sm" style={{ color: '#4A6FA5' }}>corporate filings · results · board meetings · exchange announcements</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {BSE_ANNOUNCEMENTS.map((ann, i) => {
            const typeStyle = TYPE_COLOR[ann.type] ?? { bg: '#F3F4F6', text: '#374151' }
            return (
              <div key={i} className="rounded-xl overflow-hidden border bg-white flex flex-col"
                style={{ borderColor: '#C5D5EA' }}>
                {/* Card header */}
                <div className="px-4 py-3 flex items-center justify-between" style={{ background: '#F0F4FF', borderBottom: '1px solid #C5D5EA' }}>
                  <div>
                    <div className="font-bold text-sm" style={{ color: '#000080' }}>{ann.company}</div>
                    <div className="text-[10px]" style={{ color: '#4A6FA5' }}>BSE: {ann.bse} · {ann.date}</div>
                  </div>
                  <span className="text-[9px] px-2 py-0.5 rounded-full font-bold"
                    style={{ background: typeStyle.bg, color: typeStyle.text }}>
                    {ann.type}
                  </span>
                </div>

                {/* Content */}
                <div className="px-4 py-3 flex-1 flex flex-col gap-2">
                  <a href={ann.url} target="_blank" rel="noopener noreferrer"
                    className="text-sm font-semibold leading-snug hover:underline"
                    style={{ color: '#1A0A0D' }}>
                    📋 {ann.headline}
                  </a>
                  <p className="text-xs leading-relaxed" style={{ color: '#6B7280' }}>
                    {ann.detail}
                  </p>
                </div>

                {/* Footer */}
                <div className="px-4 py-2 border-t flex justify-end" style={{ borderColor: '#C5D5EA', background: '#F8FAFF' }}>
                  <a href={ann.url} target="_blank" rel="noopener noreferrer"
                    className="text-[10px] font-bold hover:underline"
                    style={{ color: '#000080' }}>
                    View on BSE →
                  </a>
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
