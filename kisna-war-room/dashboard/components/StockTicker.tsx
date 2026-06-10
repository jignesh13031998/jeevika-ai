import React, { useEffect, useRef } from 'react'

const JEWELLERY_STOCKS = [
  { symbol: 'NSE:TITAN', name: 'Titan' },
  { symbol: 'NSE:KALYANKJIL', name: 'Kalyan' },
  { symbol: 'NSE:SENCO', name: 'Senco' },
  { symbol: 'NSE:PNGAJ', name: 'PNG' },
  { symbol: 'NSE:PCJEWELLER', name: 'PC Jewellers' },
  { symbol: 'BSE:NIFTY50', name: 'NIFTY 50' },
  { symbol: 'NSE:GOLDIAM', name: 'Goldiam' },
]

interface Props { theme?: 'light' | 'dark' }

export default function StockTicker({ theme = 'light' }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return
    containerRef.current.innerHTML = ''

    const script = document.createElement('script')
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js'
    script.async = true
    script.innerHTML = JSON.stringify({
      symbols: JEWELLERY_STOCKS.map(s => ({ proName: s.symbol, title: s.name })),
      showSymbolLogo: true,
      isTransparent: true,
      displayMode: 'adaptive',
      colorTheme: theme,
      locale: 'en',
    })
    containerRef.current.appendChild(script)
  }, [theme])

  return (
    <div className="tradingview-widget-container" ref={containerRef} style={{ height: '46px', overflow: 'hidden' }}>
      <div className="tradingview-widget-container__widget" />
    </div>
  )
}
