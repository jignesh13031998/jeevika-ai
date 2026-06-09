import React from 'react'
import { Signal } from '../lib/types'
import { groupByPriorityBand } from '../lib/filtering'
import { bandColor, categoryLabel, formatDate } from '../lib/scoring-display'

interface Props {
  signals: Signal[]
}

export default function StrategicSignals({ signals }: Props) {
  const { HIGH, MEDIUM, LOW } = groupByPriorityBand(signals)

  return (
    <section className="max-w-[1600px] mx-auto px-4 py-6">
      <div className="flex items-baseline gap-3 mb-4">
        <h2 className="font-display text-2xl font-semibold text-stone-100">Strategic Signals</h2>
        <span className="text-sm text-stone-500">grouped by priority band</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <BandColumn label="HIGH" signals={HIGH} color="#EA580C" description="Immediate attention required" />
        <BandColumn label="MEDIUM" signals={MEDIUM} color="#D97706" description="Monitor closely this week" />
        <BandColumn label="LOW" signals={LOW} color="#16A34A" description="Awareness — no immediate action" />
      </div>
    </section>
  )
}

function BandColumn({ label, signals, color, description }: {
  label: string; signals: Signal[]; color: string; description: string
}) {
  return (
    <div className="bg-surface rounded-lg border border-border">
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
          <span className="font-semibold text-stone-100">{label}</span>
          <span className="ml-auto text-stone-500 text-sm">{signals.length}</span>
        </div>
        <p className="text-xs text-stone-600 mt-1">{description}</p>
      </div>
      <div className="divide-y divide-border/50 max-h-96 overflow-y-auto">
        {signals.length === 0 && (
          <div className="p-4 text-xs text-stone-600 italic">No signals in this band.</div>
        )}
        {signals.map(sig => (
          <div key={sig.id} className="p-3 hover:bg-surface-2 transition-colors">
            <div className="flex items-start gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1 mb-1 flex-wrap">
                  <span className="text-[10px] font-semibold text-stone-400">{sig.brand}</span>
                  <span className="text-[10px] text-stone-600">·</span>
                  <span className="text-[10px] text-stone-600">{categoryLabel(sig.category)}</span>
                </div>
                <p className="text-xs text-stone-200 leading-snug mb-1">{sig.headline}</p>
                <div className="text-[10px] text-stone-600 italic">{sig.classification_rationale}</div>
                <div className="mt-1 text-[10px] text-stone-600">
                  <a
                    href={sig.source.url_original || sig.source.url_fallback}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-accent-secondary underline"
                  >
                    {sig.source.publisher}
                  </a>
                  {' · '}{formatDate(sig.published_at)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
