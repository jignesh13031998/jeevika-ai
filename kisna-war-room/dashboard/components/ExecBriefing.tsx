import React from 'react'
import { Signal } from '../lib/types'
import { getHeroItems, getWatchIndicators, getActionOfDay } from '../lib/filtering'
import { categoryLabel, formatDate } from '../lib/scoring-display'

interface Props { signals: Signal[] }

const BAND_STYLES: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  HIGH:   { bg: '#FEE2E2', text: '#991B1B', border: '#FCA5A5', dot: '#C41E3A' },
  MEDIUM: { bg: '#FEF3C7', text: '#92400E', border: '#FCD34D', dot: '#D97706' },
  LOW:    { bg: '#D1FAE5', text: '#065F46', border: '#6EE7B7', dot: '#059669' },
}

export default function ExecBriefing({ signals }: Props) {
  const hero = getHeroItems(signals)
  const heroIds = new Set(hero.map(s => s.id))
  const watch = getWatchIndicators(signals, heroIds)
  const action = getActionOfDay(hero)
  const threats = signals.filter(s => s.flags.includes('THREAT_ALERT'))
  const opps   = signals.filter(s => s.flags.includes('OPPORTUNITY_ALERT'))

  return (
    <section className="max-w-[1600px] mx-auto px-4 py-6">
      <div className="section-header flex items-baseline gap-3">
        <h2 className="font-display text-3xl font-bold" style={{ color: '#8E1B2E' }}>Executive Briefing</h2>
        <span className="text-sm" style={{ color: '#9E7A82' }}>Your 3-minute CMO read — {signals.length} signals this week</span>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

        {/* Key observations — left 2 cols */}
        <div className="xl:col-span-2 card rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="font-display text-xl font-semibold" style={{ color: '#1A0A0D' }}>Key Observations</span>
            <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: '#FEE2E2', color: '#991B1B' }}>{hero.length} significant</span>
          </div>

          <ol className="space-y-4">
            {hero.map((sig, i) => {
              const bs = BAND_STYLES[sig.priority_band] ?? BAND_STYLES.LOW
              return (
                <li key={sig.id} className="flex gap-3 pb-4 border-b last:border-0 last:pb-0" style={{ borderColor: '#F3EDE8' }}>
                  <span className="font-display text-2xl font-light w-7 flex-shrink-0" style={{ color: '#C9B8AD' }}>{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2 mb-1 flex-wrap">
                      <span className="w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0" style={{ background: bs.dot }} />
                      <a href={sig.source.url_original} target="_blank" rel="noopener noreferrer"
                        className="font-semibold text-sm hover:underline" style={{ color: '#1A0A0D' }}>
                        {sig.headline}
                      </a>
                    </div>
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="text-xs font-bold" style={{ color: '#8E1B2E' }}>{sig.brand}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded font-medium" style={{ background: bs.bg, color: bs.text, border: `1px solid ${bs.border}` }}>
                        {sig.priority_band}
                      </span>
                      <span className="text-[10px]" style={{ color: '#9E7A82' }}>{categoryLabel(sig.category)}</span>
                    </div>
                    {sig.analysis?.why_it_matters_to_kisna && (
                      <div className="kisna-rail text-xs italic py-1" style={{ color: '#5C3D45' }}>
                        {sig.analysis.why_it_matters_to_kisna}
                      </div>
                    )}
                    <div className="mt-1.5 text-[10px]" style={{ color: '#9E7A82' }}>
                      <a href={sig.source.url_original} target="_blank" rel="noopener noreferrer"
                        className="hover:underline font-medium" style={{ color: '#8E1B2E' }}>
                        {sig.source.publisher}
                      </a>
                      {' · '}{formatDate(sig.published_at)} · {sig.confidence_label} confidence
                    </div>
                  </div>
                </li>
              )
            })}
          </ol>
        </div>

        {/* Right panel: alerts + action */}
        <div className="flex flex-col gap-4">

          {/* Threat Alerts */}
          <div className="card rounded-xl p-4" style={{ borderLeft: '4px solid #C41E3A' }}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">⚠️</span>
              <span className="font-semibold text-sm" style={{ color: '#991B1B' }}>Threat Alerts ({threats.length})</span>
            </div>
            {threats.length === 0 ? <p className="text-xs" style={{ color: '#9E7A82' }}>No active threat alerts.</p> :
              <ul className="space-y-2">
                {threats.slice(0, 4).map(sig => (
                  <li key={sig.id} className="text-xs">
                    <a href={sig.source.url_original} target="_blank" rel="noopener noreferrer"
                      className="font-medium hover:underline" style={{ color: '#1A0A0D' }}>
                      {sig.brand}
                    </a>
                    <span style={{ color: '#5C3D45' }}> — {sig.headline.slice(0, 60)}…</span>
                  </li>
                ))}
              </ul>
            }
          </div>

          {/* Opportunities */}
          <div className="card rounded-xl p-4" style={{ borderLeft: '4px solid #059669' }}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">✅</span>
              <span className="font-semibold text-sm" style={{ color: '#065F46' }}>Opportunities ({opps.length})</span>
            </div>
            {opps.length === 0 ? <p className="text-xs" style={{ color: '#9E7A82' }}>No opportunity alerts triggered.</p> :
              <ul className="space-y-2">
                {opps.map(sig => (
                  <li key={sig.id} className="text-xs">
                    <a href={sig.source.url_original} target="_blank" rel="noopener noreferrer"
                      className="font-medium hover:underline" style={{ color: '#1A0A0D' }}>{sig.brand}</a>
                    <span style={{ color: '#5C3D45' }}> — {sig.headline.slice(0, 60)}…</span>
                  </li>
                ))}
              </ul>
            }
          </div>

          {/* Watch indicators */}
          {watch.length > 0 && (
            <div className="card rounded-xl p-4" style={{ borderLeft: '4px solid #0369A1' }}>
              <div className="font-semibold text-sm mb-3" style={{ color: '#0369A1' }}>👁 Watch Closely</div>
              <ul className="space-y-2">
                {watch.map(sig => (
                  <li key={sig.id} className="text-xs">
                    <span className="font-medium" style={{ color: '#1A0A0D' }}>{sig.brand}</span>
                    <span style={{ color: '#5C3D45' }}> — {sig.headline.slice(0, 65)}…</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Action of the day */}
          <div className="card rounded-xl p-4" style={{ background: '#8E1B2E', border: 'none' }}>
            <div className="text-[10px] uppercase tracking-widest font-bold mb-2" style={{ color: '#E8C98A' }}>⚡ Action of the Day</div>
            <p className="text-sm font-semibold text-white leading-relaxed">{action}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
