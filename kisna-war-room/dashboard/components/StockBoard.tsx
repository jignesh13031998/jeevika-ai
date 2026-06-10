import React, { useEffect, useRef } from 'react'

interface StockEntry {
  symbol: string
  name: string
  bseCode?: string
}

const STOCKS: StockEntry[] = [
  { symbol: 'NSE:TITAN', name: 'Titan Company', bseCode: '500114' },
  { symbol: 'NSE:KALYANKJIL', name: 'Kalyan Jewellers', bseCode: '543278' },
  { symbol: 'NSE:SENCO', name: 'Senco Gold', bseCode: '543573' },
  { symbol: 'NSE:PNGAJ', name: 'PNG Jewellers', bseCode: '544098' },
  { symbol: 'NSE:PCJEWELLER', name: 'PC Jewellers', bseCode: '534809' },
]

function MiniChart({ symbol, theme }: { symbol: string; theme: 'light' | 'dark' }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!ref.current) return
    ref.current.innerHTML = ''
    const script = document.createElement('script')
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js'
    script.async = true
    script.innerHTML = JSON.stringify({
      symbol,
      width: '100%',
      height: 150,
      locale: 'en',
      dateRange: '1M',
      colorTheme: theme,
      isTransparent: true,
      autosize: true,
      largeChartUrl: '',
    })
    ref.current.appendChild(script)
  }, [symbol, theme])
  return <div ref={ref} className="tradingview-widget-container" style={{ height: 150 }} />
}

interface Props { theme?: 'light' | 'dark' }

export default function StockBoard({ theme = 'light' }: Props) {
  const isDark = theme === 'dark'
  const cardBg = isDark ? '#1A2340' : 'white'
  const cardText = isDark ? '#E8EEF8' : '#1A0A0D'
  const subText = isDark ? '#8899BB' : '#6B7280'
  const borderColor = isDark ? '#2A3A5C' : '#E2D5CC'
  const headerBg = isDark ? '#0F1A2E' : '#F3EDE8'

  return (
    <section className="max-w-[1600px] mx-auto px-4 py-6">
      <div className="flex items-baseline gap-3 mb-4" style={{ borderBottom: `2px solid ${borderColor}`, paddingBottom: '12px' }}>
        <h2 className="font-display text-3xl font-bold" style={{ color: isDark ? '#7B9FD4' : '#0A1F5C' }}>
          Stock Prices — Listed Competitors
        </h2>
        <span className="text-sm" style={{ color: subText }}>NSE/BSE live · 15-min delayed</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {STOCKS.map(s => (
          <div key={s.symbol} className="rounded-xl overflow-hidden border"
            style={{ background: cardBg, borderColor }}>
            <div className="px-4 py-3 flex items-center justify-between" style={{ background: headerBg }}>
              <div>
                <div className="font-bold text-sm" style={{ color: cardText }}>{s.name}</div>
                <div className="text-[10px]" style={{ color: subText }}>{s.symbol}</div>
              </div>
              <div className="flex gap-2">
                {s.bseCode && (
                  <a
                    href={`https://www.bseindia.com/stock-share-price//${s.bseCode}/`}
                    target="_blank" rel="noopener noreferrer"
                    className="text-[9px] px-2 py-0.5 rounded font-bold"
                    style={{ background: isDark ? '#1E3A6E' : '#EBF2FF', color: isDark ? '#7BAAEE' : '#0A1F5C' }}>
                    BSE {s.bseCode}
                  </a>
                )}
                <a
                  href={`https://www.nseindia.com/get-quotes/equity?symbol=${s.symbol.replace('NSE:', '')}`}
                  target="_blank" rel="noopener noreferrer"
                  className="text-[9px] px-2 py-0.5 rounded font-bold"
                  style={{ background: isDark ? '#1A3A2E' : '#ECFDF5', color: isDark ? '#5EC97F' : '#065F46' }}>
                  NSE
                </a>
              </div>
            </div>
            <MiniChart symbol={s.symbol} theme={theme} />
          </div>
        ))}

        {/* Unlisted note */}
        <div className="rounded-xl border p-4 flex flex-col justify-center items-center text-center"
          style={{ background: cardBg, borderColor, borderStyle: 'dashed' }}>
          <div className="text-2xl mb-2">📋</div>
          <div className="font-semibold text-sm mb-1" style={{ color: cardText }}>Unlisted Competitors</div>
          <div className="text-[11px]" style={{ color: subText }}>
            Tanishq (Tata/private) · CaratLane · BlueStone · Malabar · Indriya — not separately listed on NSE/BSE
          </div>
        </div>
      </div>
    </section>
  )
}
