import React from 'react'
import { Signal } from '../lib/types'
import { freshnessColor } from '../lib/scoring-display'

interface Props {
  signals: Signal[]
}

export default function Ticker({ signals }: Props) {
  if (!signals.length) return null

  const items = signals
    .filter(s => s.priority_band !== 'LOW')
    .slice(0, 15)

  const text = items.map(s =>
    `${s.brand} — ${s.headline} · ${s.source.publisher}`
  ).join('  ·  ·  ')

  return (
    <div className="bg-surface border-b border-border overflow-hidden no-print" style={{ height: 36 }}>
      <div className="flex items-center h-full">
        <div
          className="flex-shrink-0 px-3 py-1 text-[10px] tracking-widest uppercase font-semibold border-r border-border text-accent-secondary"
          style={{ minWidth: 80 }}
        >
          LIVE
        </div>
        <div className="overflow-hidden flex-1 relative">
          <div className="ticker-track text-xs text-stone-300 gap-8">
            <span>{text}</span>
            <span className="ml-16">{text}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
