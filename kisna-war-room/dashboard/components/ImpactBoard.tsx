import React from 'react'
import { Signal } from '../lib/types'
import { getHeroItems } from '../lib/filtering'
import { categoryLabel, formatDate } from '../lib/scoring-display'

interface Props { signals: Signal[] }

export default function ImpactBoard({ signals }: Props) {
  const hero = getHeroItems(signals)

  return (
    <section className="max-w-[1600px] mx-auto px-4 py-6 print-break">
      <div className="section-header flex items-baseline gap-3">
        <h2 className="font-display text-3xl font-bold" style={{ color: '#8E1B2E' }}>Executive Impact Analysis</h2>
        <span className="text-sm" style={{ color: '#9E7A82' }}>print-ready board view — top {hero.length} priority events</span>
      </div>

      <div className="space-y-4">
        {hero.map((sig, i) => (
          <div key={sig.id} className="card rounded-xl overflow-hidden">
            {/* Event header */}
            <div className="px-6 py-4 flex items-start gap-4"
              style={{ background: `linear-gradient(135deg, #8E1B2E 0%, #6B1422 100%)` }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>
                <span className="font-display font-bold">{i + 1}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-white font-bold text-sm">{sig.brand}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>
                    Tier {sig.tier}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>
                    {categoryLabel(sig.category)}
                  </span>
                  {sig.geo.state && (
                    <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.7)' }}>📍 {sig.geo.state}</span>
                  )}
                </div>
                <a href={sig.source.url_original} target="_blank" rel="noopener noreferrer"
                  className="font-display text-xl font-semibold text-white hover:underline leading-snug">
                  {sig.headline}
                </a>
                <div className="mt-1 text-[11px]" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  {sig.source.publisher} · {formatDate(sig.published_at)} · {sig.confidence_label} confidence
                </div>
              </div>
            </div>

            {/* 4-block analysis */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
              <ImpactCell num={1} label="What Happened" text={sig.analysis?.what_happened ?? sig.summary_2line}
                accent="#F3EDE8" labelColor="#9E7A82" />
              <ImpactCell num={2} label="Why It Matters to KISNA" text={sig.analysis?.why_it_matters_to_kisna ?? '—'}
                accent="#FFF5F5" labelColor="#8E1B2E" />
              <ImpactCell num={3} label="Possible Impact on KISNA" text={sig.analysis?.possible_impact ?? '—'}
                accent="#FFFBEB" labelColor="#D97706" />
              <ImpactCell num={4} label="Suggested Action" text={sig.analysis?.suggested_action ?? '—'}
                accent="#ECFDF5" labelColor="#059669" />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function ImpactCell({ num, label, text, accent, labelColor }: {
  num: number; label: string; text: string; accent: string; labelColor: string
}) {
  return (
    <div className="p-4 border-t md:border-t-0 md:border-l first:border-l-0" style={{ background: accent, borderColor: '#E2D5CC' }}>
      <div className="flex items-center gap-2 mb-2">
        <span className="w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center text-white"
          style={{ background: labelColor }}>{num}</span>
        <div className="text-[10px] font-bold uppercase tracking-wide" style={{ color: labelColor }}>{label}</div>
      </div>
      <p className="text-xs leading-relaxed" style={{ color: '#1A0A0D' }}>{text}</p>
    </div>
  )
}
