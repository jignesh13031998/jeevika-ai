import React, { useState } from 'react'
import { Signal } from '../lib/types'
import { categoryLabel, confidenceChipClass, formatDate } from '../lib/scoring-display'

interface Props { signals: Signal[] }

const TIER_STYLE: Record<number, { bg: string; text: string }> = {
  1: { bg: '#FEE2E2', text: '#9B1C1C' },
  2: { bg: '#FEF3C7', text: '#78350F' },
  3: { bg: '#E0E7FF', text: '#3730A3' },
}

const BAND_LEFT: Record<string, string> = {
  HIGH: '#C41E3A', MEDIUM: '#D97706', LOW: '#059669'
}

const FRESHNESS_DOT: Record<string, string> = {
  NEW: '#C41E3A', FRESH: '#D97706', RECENT: '#A67B2A', ARCHIVE: '#9E7A82'
}

export default function NewsFeed({ signals }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showAll, setShowAll] = useState(false)

  // All signals shown (priority-sorted by scoring engine), no suppression
  const displayed = showAll ? signals : signals.slice(0, 15)

  return (
    <section className="max-w-[1600px] mx-auto px-4 py-6">
      <div className="section-header flex items-center gap-3 flex-wrap">
        <h2 className="font-display text-3xl font-bold" style={{ color: '#8E1B2E' }}>All Competitor News</h2>
        <span className="text-sm" style={{ color: '#9E7A82' }}>All {signals.length} signals · priority-sorted · no suppression</span>
        <div className="ml-auto flex gap-2 flex-wrap">
          {[...new Set(signals.map(s => s.brand))].map(brand => (
            <span key={brand} className="text-[10px] px-2 py-0.5 rounded-full border font-medium" style={{ background: '#F7F2EE', color: '#5C3D45', borderColor: '#E2D5CC' }}>
              {brand}
            </span>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {displayed.map(sig => {
          const isExpanded = expandedId === sig.id
          const ts = TIER_STYLE[sig.tier] ?? { bg: '#F3EDE8', text: '#5C3D45' }
          const dotColor = FRESHNESS_DOT[sig.freshness] ?? '#9E7A82'
          const isNew = sig.freshness === 'NEW' && sig.priority_band === 'HIGH'

          return (
            <article key={sig.id} className="card rounded-xl overflow-hidden"
              style={{ borderLeft: `4px solid ${BAND_LEFT[sig.priority_band] ?? '#E2D5CC'}` }}>
              <div className="p-4">
                <div className="flex items-start gap-3">
                  {/* Freshness dot */}
                  <div className="flex-shrink-0 pt-1">
                    <span className={`block w-2.5 h-2.5 rounded-full ${isNew ? 'dot-new' : ''}`}
                      style={{ background: dotColor }} title={sig.freshness} />
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Tags row */}
                    <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
                      <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ background: '#8E1B2E', color: 'white' }}>
                        {sig.brand}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold" style={{ background: ts.bg, color: ts.text }}>
                        Tier {sig.tier}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded border font-medium" style={{ background: '#F7F2EE', color: '#5C3D45', borderColor: '#E2D5CC' }}>
                        {categoryLabel(sig.category)}
                      </span>
                      {sig.flags.includes('THREAT_ALERT') && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded font-bold" style={{ background: '#FEE2E2', color: '#991B1B' }}>⚠ THREAT</span>
                      )}
                      {sig.flags.includes('OPPORTUNITY_ALERT') && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded font-bold" style={{ background: '#D1FAE5', color: '#065F46' }}>✓ OPPORTUNITY</span>
                      )}
                      {sig.geo.state && (
                        <span className="text-[10px]" style={{ color: '#9E7A82' }}>📍 {sig.geo.city ?? sig.geo.state}{sig.geo.gcc ? ' (GCC)' : ''}</span>
                      )}
                    </div>

                    {/* Headline — always linked to Google News search */}
                    <a href={sig.source.url_original} target="_blank" rel="noopener noreferrer"
                      className="text-sm font-semibold leading-snug hover:underline block mb-2"
                      style={{ color: '#1A0A0D' }}>
                      {sig.headline}
                    </a>

                    {/* Summary */}
                    <p className="text-xs leading-relaxed mb-2" style={{ color: '#5C3D45' }}>{sig.summary_2line}</p>

                    {/* Why it matters */}
                    {sig.analysis?.why_it_matters_to_kisna && (
                      <div className="kisna-rail py-1 mb-2">
                        <span className="text-[9px] font-bold uppercase tracking-wider block mb-0.5" style={{ color: '#8E1B2E' }}>Why It Matters to KISNA</span>
                        <p className="text-xs italic" style={{ color: '#5C3D45' }}>{sig.analysis.why_it_matters_to_kisna}</p>
                      </div>
                    )}

                    {/* Source row */}
                    <div className="flex items-center gap-2 flex-wrap text-[11px]">
                      <a href={sig.source.url_original} target="_blank" rel="noopener noreferrer"
                        className="font-semibold hover:underline" style={{ color: '#8E1B2E' }}>
                        🔗 {sig.source.publisher}
                      </a>
                      <span style={{ color: '#C9B8AD' }}>·</span>
                      <span style={{ color: '#9E7A82' }}>{formatDate(sig.published_at)}</span>
                      <span style={{ color: '#C9B8AD' }}>·</span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${confidenceChipClass(sig.confidence_label)}`}>
                        {sig.confidence_label} confidence
                      </span>
                      <span style={{ color: '#C9B8AD' }}>·</span>
                      <span style={{ color: '#9E7A82' }}>
                        {sig.corroboration_count > 1 ? `${sig.corroboration_count} sources` : 'Single source — verify'}
                      </span>
                    </div>
                  </div>

                  {/* Expand */}
                  <button onClick={() => setExpandedId(isExpanded ? null : sig.id)}
                    className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs transition-colors"
                    style={{ background: isExpanded ? '#8E1B2E' : '#F7F2EE', color: isExpanded ? 'white' : '#9E7A82' }}>
                    {isExpanded ? '▲' : '▼'}
                  </button>
                </div>

                {/* Expanded analysis */}
                {isExpanded && (
                  <div className="mt-4 pt-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3"
                    style={{ borderTop: '1px solid #F3EDE8' }}>
                    <AnalysisBox label="What Happened" text={sig.analysis?.what_happened} />
                    <AnalysisBox label="Why It Matters to KISNA" text={sig.analysis?.why_it_matters_to_kisna} accent />
                    <AnalysisBox label="Possible Impact" text={sig.analysis?.possible_impact} />
                    <AnalysisBox label="Suggested Action" text={sig.analysis?.suggested_action} action />

                    <div className="md:col-span-2 xl:col-span-4 pt-3" style={{ borderTop: '1px solid #F3EDE8' }}>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
                        {(['threat','opportunity','confidence','cmo_salience','composite_priority'] as const).map(k => (
                          <ScoreBar key={k} label={k} value={sig.scores[k]} />
                        ))}
                      </div>
                      <div className="mt-2 text-[10px]" style={{ color: '#9E7A82' }}>
                        Classification: {sig.classification_rationale} · Engine: {sig.analysis_engine}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </article>
          )
        })}
      </div>

      {/* Show more / less */}
      {signals.length > 15 && (
        <div className="text-center mt-4">
          <button onClick={() => setShowAll(!showAll)}
            className="px-6 py-2.5 rounded-lg font-semibold text-sm transition-colors"
            style={{ background: showAll ? '#F7F2EE' : '#8E1B2E', color: showAll ? '#8E1B2E' : 'white', border: `1px solid #8E1B2E` }}>
            {showAll ? `Show fewer ▲` : `Show all ${signals.length} signals ▼`}
          </button>
        </div>
      )}
    </section>
  )
}

function AnalysisBox({ label, text, accent, action }: { label: string; text?: string; accent?: boolean; action?: boolean }) {
  if (!text) return null
  return (
    <div className="rounded-lg p-3" style={{
      background: accent ? '#FFF5F5' : action ? '#FFFBEB' : '#FAFAF8',
      borderLeft: `3px solid ${accent ? '#8E1B2E' : action ? '#A67B2A' : '#E2D5CC'}`
    }}>
      <div className="text-[9px] uppercase tracking-wider font-bold mb-1"
        style={{ color: accent ? '#8E1B2E' : action ? '#A67B2A' : '#9E7A82' }}>{label}</div>
      <p className="text-xs leading-relaxed" style={{ color: '#1A0A0D' }}>{text}</p>
    </div>
  )
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  const pct = Math.round(value)
  const color = pct >= 70 ? '#C41E3A' : pct >= 45 ? '#D97706' : '#059669'
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="capitalize text-[10px] font-medium" style={{ color: '#9E7A82' }}>{label.replace(/_/g,' ')}</span>
        <span className="text-[10px] font-bold" style={{ color }}>{pct}</span>
      </div>
      <div className="h-1.5 rounded-full" style={{ background: '#F3EDE8' }}>
        <div className="h-1.5 rounded-full score-bar-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  )
}
