import React from 'react'
import { Signal } from '../lib/types'

interface Props { signals: Signal[] }

const BAND_COLORS: Record<string, string> = {
  HIGH: '#C41E3A', MEDIUM: '#D97706', LOW: '#059669'
}

export default function Ticker({ signals }: Props) {
  if (!signals.length) return null
  const items = signals.slice(0, 20)

  return (
    <div className="ticker-wrap no-print overflow-hidden border-b" style={{ height: 36, background: '#FDF9F5', borderColor: '#E2D5CC' }}>
      <div className="flex items-center h-full">
        <div className="flex-shrink-0 px-3 h-full flex items-center border-r" style={{ borderColor: '#E2D5CC', background: '#8E1B2E' }}>
          <span className="text-[10px] tracking-widest uppercase font-bold text-white">LIVE</span>
        </div>
        <div className="overflow-hidden flex-1">
          <div className="ticker-track text-xs gap-0">
            {[...items, ...items].map((sig, i) => (
              <span key={i} className="inline-flex items-center gap-2 mr-8">
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: BAND_COLORS[sig.priority_band] ?? '#9E7A82' }} />
                <span className="font-medium" style={{ color: '#5C3D45' }}>{sig.brand}</span>
                <span style={{ color: '#9E7A82' }}>—</span>
                <span style={{ color: '#1A0A0D' }}>{sig.headline}</span>
                <span style={{ color: '#C9B8AD' }}>·</span>
                <span style={{ color: '#9E7A82' }}>{sig.source.publisher}</span>
                <span style={{ color: '#C9B8AD' }} className="mr-4">·</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
