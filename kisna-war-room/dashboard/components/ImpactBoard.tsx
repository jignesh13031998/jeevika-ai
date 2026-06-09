import React from 'react'
import { Signal } from '../lib/types'
import { getHeroItems } from '../lib/filtering'
import { categoryLabel, formatDate } from '../lib/scoring-display'

interface Props {
  signals: Signal[]
}

export default function ImpactBoard({ signals }: Props) {
  const hero = getHeroItems(signals)

  return (
    <section className="max-w-[1600px] mx-auto px-4 py-6 print-break">
      <div className="flex items-baseline gap-3 mb-4">
        <h2 className="font-display text-2xl font-semibold text-stone-100">Executive Impact Analysis</h2>
        <span className="text-sm text-stone-500">print-ready · top {hero.length} events</span>
      </div>

      <div className="space-y-4">
        {hero.map((sig, i) => (
          <div key={sig.id} className="bg-surface rounded-xl border border-border p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent-primary/20 border border-accent-primary/40 flex items-center justify-center">
                <span className="font-display text-accent-secondary font-bold">{i + 1}</span>
              </div>
              <div>
                <div className="text-[10px] text-stone-500 uppercase tracking-wide">{sig.brand} · Tier {sig.tier} · {categoryLabel(sig.category)}</div>
                <h3 className="font-display text-xl font-semibold text-stone-100 mt-1">{sig.headline}</h3>
                <div className="text-xs text-stone-600 mt-1">
                  <a
                    href={sig.source.url_original || sig.source.url_fallback}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-accent-secondary underline"
                  >
                    {sig.source.publisher}
                  </a>
                  {' · '}{formatDate(sig.published_at)} · {sig.confidence_label} confidence
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              <ImpactCell
                label="What Happened"
                text={sig.analysis?.what_happened ?? sig.summary_2line}
                labelColor="text-stone-500"
              />
              <ImpactCell
                label="Why It Matters to KISNA"
                text={sig.analysis?.why_it_matters_to_kisna ?? '—'}
                labelColor="text-accent-primary"
                highlight
              />
              <ImpactCell
                label="Possible Impact on KISNA"
                text={sig.analysis?.possible_impact ?? '—'}
                labelColor="text-prio-high"
              />
              <ImpactCell
                label="Suggested Action"
                text={sig.analysis?.suggested_action ?? '—'}
                labelColor="text-accent-secondary"
                action
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function ImpactCell({ label, text, labelColor, highlight, action }: {
  label: string; text: string; labelColor: string; highlight?: boolean; action?: boolean
}) {
  return (
    <div className={`p-4 rounded-lg ${highlight ? 'border border-accent-primary/30 bg-accent-primary/5' : action ? 'border border-accent-secondary/30 bg-accent-secondary/5' : 'border border-border bg-surface-2'}`}>
      <div className={`text-[10px] font-semibold uppercase tracking-wide mb-2 ${labelColor}`}>{label}</div>
      <p className="text-xs text-stone-300 leading-relaxed">{text}</p>
    </div>
  )
}
