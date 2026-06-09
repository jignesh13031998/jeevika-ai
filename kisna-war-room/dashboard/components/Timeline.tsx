import React, { useState } from 'react'
import { Signal } from '../lib/types'
import { getTimelineForBrand, getUniqueBrands } from '../lib/filtering'
import { categoryLabel, formatDate, freshnessColor } from '../lib/scoring-display'

interface Props {
  signals: Signal[]
}

export default function Timeline({ signals }: Props) {
  const brands = getUniqueBrands(signals)
  const [selected, setSelected] = useState<string>(brands[0] ?? '')

  const timeline = selected ? getTimelineForBrand(signals, selected) : []

  return (
    <section className="max-w-[1600px] mx-auto px-4 py-6">
      <div className="flex items-baseline gap-3 mb-4 flex-wrap">
        <h2 className="font-display text-2xl font-semibold text-stone-100">Competitor Timeline</h2>
        <span className="text-sm text-stone-500">7-day activity diary per brand</span>
        <div className="ml-auto flex flex-wrap gap-1">
          {brands.map(b => (
            <button
              key={b}
              onClick={() => setSelected(b)}
              className={`text-xs px-2 py-1 rounded border transition-colors ${
                b === selected
                  ? 'bg-accent-primary border-accent-primary text-white'
                  : 'bg-surface border-border text-stone-400 hover:border-accent-secondary hover:text-stone-200'
              }`}
            >
              {b}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-surface rounded-lg border border-border p-6">
        {timeline.length === 0 && (
          <p className="text-stone-500 text-sm">No signals for selected brand in the current window.</p>
        )}
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
          <div className="space-y-4 pl-12">
            {timeline.map((sig, i) => (
              <div key={sig.id} className="relative">
                {/* Timeline node */}
                <div
                  className="absolute -left-8 top-1 w-3 h-3 rounded-full border-2 border-canvas"
                  style={{ backgroundColor: sig.freshness === 'NEW' ? '#DC2626' : sig.freshness === 'FRESH' ? '#EA580C' : '#C9A86A' }}
                />
                <div className="text-[10px] text-stone-600 mb-1">{formatDate(sig.published_at)}</div>
                <div className="text-xs text-stone-200 font-medium mb-0.5">{sig.headline}</div>
                <div className="flex gap-2 text-[10px] text-stone-600">
                  <span>{categoryLabel(sig.category)}</span>
                  <span>·</span>
                  <a
                    href={sig.source.url_original || sig.source.url_fallback}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-accent-secondary underline"
                  >
                    {sig.source.publisher}
                  </a>
                  {sig.geo.state && <><span>·</span><span>{sig.geo.state}</span></>}
                </div>
                {sig.analysis?.why_it_matters_to_kisna && (
                  <div className="mt-1 text-[10px] text-stone-500 italic kisna-rail">
                    {sig.analysis.why_it_matters_to_kisna}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
