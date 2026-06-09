import React from 'react'
import { Signal } from '../lib/types'
import { getHeroItems, getWatchIndicators, getActionOfDay } from '../lib/filtering'
import { bandColor, categoryLabel, formatDate } from '../lib/scoring-display'

interface Props {
  signals: Signal[]
}

export default function ExecBriefing({ signals }: Props) {
  const hero = getHeroItems(signals)
  const heroIds = new Set(hero.map(s => s.id))
  const watch = getWatchIndicators(signals, heroIds)
  const action = getActionOfDay(hero)
  const threats = signals.filter(s => s.flags.includes('THREAT_ALERT'))
  const opps = signals.filter(s => s.flags.includes('OPPORTUNITY_ALERT'))

  return (
    <section className="max-w-[1600px] mx-auto px-4 py-6">
      {/* Section header */}
      <div className="flex items-baseline gap-3 mb-6">
        <h2 className="font-display text-3xl font-semibold text-stone-100">Executive Briefing</h2>
        <span className="text-sm text-stone-500">3-minute CMO overview</span>
      </div>

      <div className="bg-surface rounded-xl border border-border p-6">
        <p className="text-stone-300 text-sm mb-6">
          <span className="font-semibold text-stone-100">{hero.length} significant developments</span> in the last 7 days across {new Set(signals.map(s => s.brand)).size} tracked competitors.
        </p>

        {/* Key Observations */}
        <div className="mb-6">
          <h3 className="font-display text-xl font-semibold text-accent-secondary mb-3">Key Observations</h3>
          <ol className="space-y-4">
            {hero.map((sig, i) => (
              <li key={sig.id} className="flex gap-3">
                <span className="text-stone-500 font-display text-lg w-6 flex-shrink-0">{i + 1}.</span>
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: bandColor(sig.priority_band) }}
                    />
                    <span className="font-semibold text-stone-100">{sig.brand}</span>
                    <span className="text-stone-400">—</span>
                    <a
                      href={sig.source.url_original || sig.source.url_fallback}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-stone-200 hover:text-accent-secondary text-sm underline underline-offset-2"
                    >
                      {sig.headline}
                    </a>
                  </div>
                  {sig.analysis?.why_it_matters_to_kisna && (
                    <div className="kisna-rail text-sm text-stone-400 italic">
                      {sig.analysis.why_it_matters_to_kisna}
                    </div>
                  )}
                  <div className="mt-1 text-xs text-stone-600">
                    {categoryLabel(sig.category)} · {sig.source.publisher} · {formatDate(sig.published_at)} · {sig.confidence_label} confidence
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/* Implications */}
        {hero.some(s => s.analysis?.possible_impact) && (
          <div className="mb-6">
            <h3 className="font-display text-xl font-semibold text-accent-secondary mb-3">Potential Implications for KISNA</h3>
            <ul className="space-y-2">
              {hero.slice(0, 3).map(sig => sig.analysis?.possible_impact && (
                <li key={sig.id} className="flex gap-2 text-sm">
                  <span className="text-stone-600">▸</span>
                  <span><span className="font-medium text-stone-200">{sig.brand}:</span> <span className="text-stone-400">{sig.analysis.possible_impact}</span></span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Risk Alerts */}
        {threats.length > 0 && (
          <div className="mb-6 p-4 rounded-lg border border-prio-critical/30 bg-prio-critical/5">
            <h3 className="font-display text-lg font-semibold text-prio-critical mb-2">⚠ Risk Alerts</h3>
            <ul className="space-y-1">
              {threats.map(sig => (
                <li key={sig.id} className="flex gap-2 text-sm items-start">
                  <span className="text-prio-critical">●</span>
                  <span>
                    <span className="font-medium text-stone-200">{sig.brand}</span>{' — '}
                    <a href={sig.source.url_original || sig.source.url_fallback} target="_blank" rel="noopener noreferrer" className="text-stone-300 hover:text-prio-critical underline">
                      {sig.headline}
                    </a>
                    <span className="text-stone-600 ml-1">(Threat: {sig.scores.threat})</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Opportunities */}
        {opps.length > 0 && (
          <div className="mb-6 p-4 rounded-lg border border-prio-low/30 bg-prio-low/5">
            <h3 className="font-display text-lg font-semibold text-prio-low mb-2">✓ Opportunities</h3>
            <ul className="space-y-1">
              {opps.map(sig => (
                <li key={sig.id} className="flex gap-2 text-sm items-start">
                  <span className="text-prio-low">●</span>
                  <span>
                    <span className="font-medium text-stone-200">{sig.brand}</span>{' — '}
                    <a href={sig.source.url_original || sig.source.url_fallback} target="_blank" rel="noopener noreferrer" className="text-stone-300 hover:text-prio-low underline">
                      {sig.headline}
                    </a>
                    <span className="text-stone-600 ml-1">(Opportunity: {sig.scores.opportunity})</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Watch indicators */}
        {watch.length > 0 && (
          <div className="mb-6">
            <h3 className="font-display text-xl font-semibold text-accent-secondary mb-2">Recommended Executive Attention</h3>
            <ul className="space-y-2">
              {watch.map(sig => (
                <li key={sig.id} className="flex gap-2 text-sm text-stone-400">
                  <span className="text-accent-secondary">◎</span>
                  <span>
                    <span className="text-stone-300 font-medium">{sig.brand}</span> — {sig.headline}
                    <span className="text-stone-600 ml-1">({categoryLabel(sig.category)})</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Action of the day */}
        <div className="p-4 rounded-lg border border-accent-secondary/30 bg-accent-secondary/5">
          <div className="text-[10px] uppercase tracking-widest text-accent-secondary mb-1 font-semibold">⚡ Action of the Day</div>
          <p className="text-stone-100 font-semibold text-sm">{action}</p>
        </div>
      </div>
    </section>
  )
}
