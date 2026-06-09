import React, { useState } from 'react'
import { Signal } from '../lib/types'
import {
  bandColor, categoryLabel, confidenceChipClass,
  formatDate, freshnessColor, isSingleSourceLow
} from '../lib/scoring-display'

interface Props {
  signals: Signal[]
}

export default function NewsFeed({ signals }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  return (
    <section className="max-w-[1600px] mx-auto px-4 py-6">
      <div className="flex items-baseline gap-3 mb-4">
        <h2 className="font-display text-2xl font-semibold text-stone-100">Live Competitor News</h2>
        <span className="text-sm text-stone-500">{signals.length} signals in window</span>
      </div>

      <div className="space-y-3">
        {signals.map(sig => {
          const isExpanded = expandedId === sig.id
          const isNew = sig.freshness === 'NEW' && sig.priority_band === 'HIGH'
          const dotColor = sig.freshness === 'NEW'
            ? '#DC2626'
            : sig.freshness === 'FRESH'
            ? '#DC2626'
            : '#C9A86A'

          return (
            <article key={sig.id} className="bg-surface rounded-lg border border-border hover:border-border/80 transition-colors">
              <div className="p-4">
                {/* Top row */}
                <div className="flex items-start gap-3">
                  {/* Freshness dot */}
                  <div className="flex-shrink-0 mt-1">
                    <span
                      className={`block w-2.5 h-2.5 rounded-full ${isNew ? 'dot-new' : ''}`}
                      style={{ backgroundColor: dotColor }}
                      title={sig.freshness}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Brand + meta */}
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-semibold text-stone-100 text-sm">{sig.brand}</span>
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded"
                        style={{ background: `${bandColor(sig.priority_band)}20`, color: bandColor(sig.priority_band), border: `1px solid ${bandColor(sig.priority_band)}40` }}
                      >
                        T{sig.tier}
                      </span>
                      <span className="text-xs text-stone-500">{categoryLabel(sig.category)}</span>
                      {isSingleSourceLow(sig) && (
                        <span className="text-[10px] text-stone-500 italic">single-source — verify</span>
                      )}
                    </div>

                    {/* Headline */}
                    <h3 className="text-stone-100 text-sm font-medium leading-snug mb-2">
                      {sig.headline}
                    </h3>

                    {/* Summary */}
                    <p className="text-stone-400 text-xs mb-3 leading-relaxed">{sig.summary_2line}</p>

                    {/* Why it matters */}
                    {sig.analysis?.why_it_matters_to_kisna && (
                      <div className="kisna-rail text-xs text-stone-300 italic mb-3">
                        <span className="text-[10px] font-semibold not-italic text-accent-primary uppercase tracking-wide block mb-0.5">Why it matters to KISNA</span>
                        {sig.analysis.why_it_matters_to_kisna}
                      </div>
                    )}

                    {/* Source row */}
                    <div className="flex items-center gap-3 flex-wrap text-xs text-stone-600">
                      <a
                        href={sig.source.url_original || sig.source.url_fallback}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-stone-400 hover:text-accent-secondary underline"
                      >
                        {sig.source.publisher}
                      </a>
                      <span>·</span>
                      <span>{formatDate(sig.published_at)}</span>
                      <span>·</span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] ${confidenceChipClass(sig.confidence_label)}`}
                        title={`Source reliability: ${sig.source.reliability} / Credibility: ${sig.source.credibility} / Corroborated by ${sig.corroboration_count} source(s)`}
                      >
                        {sig.confidence_label} confidence
                      </span>
                      {sig.geo.state && <span className="text-stone-600">{sig.geo.state}{sig.geo.gcc ? ' (GCC)' : ''}</span>}
                    </div>
                  </div>

                  {/* Expand toggle */}
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : sig.id)}
                    className="flex-shrink-0 text-stone-600 hover:text-stone-300 text-xs ml-2 mt-1"
                    aria-expanded={isExpanded}
                  >
                    {isExpanded ? '▲' : '▼'}
                  </button>
                </div>

                {/* Expanded: full analysis + scores */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-border grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      {sig.analysis?.what_happened && (
                        <AnalysisBlock label="What Happened" text={sig.analysis.what_happened} />
                      )}
                      {sig.analysis?.why_it_matters_to_kisna && (
                        <AnalysisBlock label="Why It Matters to KISNA" text={sig.analysis.why_it_matters_to_kisna} accent />
                      )}
                      {sig.analysis?.possible_impact && (
                        <AnalysisBlock label="Possible Impact" text={sig.analysis.possible_impact} />
                      )}
                      {sig.analysis?.suggested_action && (
                        <AnalysisBlock label="Suggested Action" text={sig.analysis.suggested_action} highlight />
                      )}
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="text-stone-500 font-semibold mb-1 uppercase tracking-wide text-[10px]">Scores</div>
                      {(['threat', 'opportunity', 'confidence', 'cmo_salience', 'composite_priority'] as const).map(key => (
                        <ScoreRow key={key} label={key.replace(/_/g, ' ')} value={sig.scores[key]} />
                      ))}
                      <div className="pt-2 text-stone-600">
                        Classification: {sig.classification_rationale}
                      </div>
                      <div className="text-stone-600">
                        Analysis engine: <span className="font-medium">{sig.analysis_engine}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}

function AnalysisBlock({ label, text, accent, highlight }: { label: string; text: string; accent?: boolean; highlight?: boolean }) {
  return (
    <div className={highlight ? 'p-3 rounded border border-accent-secondary/30 bg-accent-secondary/5' : ''}>
      <div className={`text-[10px] uppercase tracking-wide font-semibold mb-1 ${accent ? 'text-accent-primary' : highlight ? 'text-accent-secondary' : 'text-stone-500'}`}>{label}</div>
      <p className="text-xs text-stone-300 leading-relaxed">{text}</p>
    </div>
  )
}

function ScoreRow({ label, value }: { label: string; value: number }) {
  const pct = Math.round(value)
  const color = pct >= 70 ? '#DC2626' : pct >= 45 ? '#D97706' : '#16A34A'
  return (
    <div className="flex items-center gap-2">
      <span className="capitalize w-32 text-stone-500">{label}</span>
      <div className="flex-1 bg-surface-2 rounded-full h-1.5">
        <div className="h-1.5 rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className="w-8 text-right font-mono text-stone-400">{pct}</span>
    </div>
  )
}
