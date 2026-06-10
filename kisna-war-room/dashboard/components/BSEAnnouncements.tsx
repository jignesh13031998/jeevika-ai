import React from 'react'

interface Company {
  name: string
  bseCode: string
  nseSymbol: string
}

const LISTED: Company[] = [
  { name: 'Titan Company', bseCode: '500114', nseSymbol: 'TITAN' },
  { name: 'Kalyan Jewellers', bseCode: '543278', nseSymbol: 'KALYANKJIL' },
  { name: 'Senco Gold', bseCode: '543573', nseSymbol: 'SENCO' },
  { name: 'PNG Jewellers', bseCode: '544098', nseSymbol: 'PNGAJ' },
  { name: 'PC Jewellers', bseCode: '534809', nseSymbol: 'PCJEWELLER' },
]

interface Props { isDark?: boolean }

export default function BSEAnnouncements({ isDark = false }: Props) {
  const cardBg = isDark ? '#1A2340' : 'white'
  const cardText = isDark ? '#E8EEF8' : '#1A0A0D'
  const subText = isDark ? '#8899BB' : '#6B7280'
  const borderColor = isDark ? '#2A3A5C' : '#E2D5CC'
  const rowHover = isDark ? '#1E2F4A' : '#F9F5F2'
  const headingColor = isDark ? '#7B9FD4' : '#0A1F5C'

  return (
    <section className="max-w-[1600px] mx-auto px-4 py-6">
      <div className="flex items-baseline gap-3 mb-4" style={{ borderBottom: `2px solid ${borderColor}`, paddingBottom: '12px' }}>
        <h2 className="font-display text-3xl font-bold" style={{ color: headingColor }}>
          NSE / BSE Regulatory Announcements
        </h2>
        <span className="text-sm" style={{ color: subText }}>corporate filings · quarterly results · board meetings</span>
      </div>

      <div className="rounded-xl overflow-hidden border" style={{ background: cardBg, borderColor }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: isDark ? '#0F1A2E' : '#F3EDE8', borderBottom: `1px solid ${borderColor}` }}>
              <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider" style={{ color: subText }}>Company</th>
              <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider" style={{ color: subText }}>BSE Filings</th>
              <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider" style={{ color: subText }}>NSE Announcements</th>
              <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider" style={{ color: subText }}>Financials</th>
            </tr>
          </thead>
          <tbody>
            {LISTED.map((co, i) => (
              <tr key={co.bseCode}
                className="transition-colors"
                style={{
                  borderBottom: i < LISTED.length - 1 ? `1px solid ${borderColor}` : 'none',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = rowHover)}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                <td className="px-4 py-3">
                  <div className="font-semibold" style={{ color: cardText }}>{co.name}</div>
                  <div className="text-[10px]" style={{ color: subText }}>BSE: {co.bseCode}</div>
                </td>
                <td className="px-4 py-3">
                  <a href={`https://www.bseindia.com/corporates/ann.html?scripcd=${co.bseCode}`}
                    target="_blank" rel="noopener noreferrer"
                    className="text-[11px] font-medium hover:underline"
                    style={{ color: isDark ? '#7BAAEE' : '#0A1F5C' }}>
                    📋 BSE Announcements →
                  </a>
                </td>
                <td className="px-4 py-3">
                  <a href={`https://www.nseindia.com/companies-listing/corporate-filings-announcements`}
                    target="_blank" rel="noopener noreferrer"
                    className="text-[11px] font-medium hover:underline"
                    style={{ color: isDark ? '#5EC97F' : '#065F46' }}>
                    📢 NSE Filings →
                  </a>
                </td>
                <td className="px-4 py-3">
                  <a href={`https://www.screener.in/company/${co.nseSymbol}/`}
                    target="_blank" rel="noopener noreferrer"
                    className="text-[11px] font-medium hover:underline"
                    style={{ color: isDark ? '#E8A84A' : '#92400E' }}>
                    📊 Screener.in →
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 text-[10px]" style={{ color: subText }}>
        Links open official exchange portals. Data is public and regulatory-mandated. Tanishq / CaratLane / BlueStone / Malabar / Indriya are unlisted — no exchange filings available.
      </div>
    </section>
  )
}
