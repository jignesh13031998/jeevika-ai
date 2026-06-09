import React from 'react'
import { Signal } from '../lib/types'
import { categoryLabel, formatDate } from '../lib/scoring-display'

interface Props { signals: Signal[] }

const SOCIAL_CATS = new Set(['INFLUENCER_CONTENT','SOCIAL_VIRALITY','DIGITAL_DTC_MOVE','CAMPAIGN_LAUNCH','CELEBRITY_AMBASSADOR','BRAND_COLLAB','SENTIMENT_SHIFT','COMPLAINT_CLUSTER'])

const CAT_ICON: Record<string, string> = {
  CAMPAIGN_LAUNCH: '📢', CELEBRITY_AMBASSADOR: '⭐', BRAND_COLLAB: '🤝',
  DIGITAL_DTC_MOVE: '💻', INFLUENCER_CONTENT: '🎬', SOCIAL_VIRALITY: '🔥',
  SENTIMENT_SHIFT: '📊', COMPLAINT_CLUSTER: '⚠️',
}

export default function SocialIntel({ signals }: Props) {
  const social = signals.filter(s => SOCIAL_CATS.has(s.category))

  return (
    <section className="max-w-[1600px] mx-auto px-4 py-6">
      <div className="section-header flex items-baseline gap-3">
        <h2 className="font-display text-3xl font-bold" style={{ color: '#8E1B2E' }}>Brand & Digital Intelligence</h2>
        <span className="text-sm" style={{ color: '#9E7A82' }}>campaigns · ambassadors · digital moves · social signals</span>
      </div>

      {social.length === 0 ? (
        <div className="card rounded-xl p-6 text-sm" style={{ color: '#9E7A82' }}>No brand/digital signals in this filter window.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {social.map(sig => (
            <div key={sig.id} className="card rounded-xl p-4 hover:shadow-hover transition-shadow">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-xl"
                  style={{ background: '#FFF5F5' }}>
                  {CAT_ICON[sig.category] ?? '📰'}
                </div>
                <div>
                  <div className="text-xs font-bold" style={{ color: '#8E1B2E' }}>{sig.brand}</div>
                  <div className="text-[10px]" style={{ color: '#9E7A82' }}>{categoryLabel(sig.category)}</div>
                </div>
                <span className="ml-auto text-[9px] px-2 py-0.5 rounded-full font-semibold" style={{ background: '#FEF3C7', color: '#92400E' }}>
                  C-reliability
                </span>
              </div>

              <a href={sig.source.url_original} target="_blank" rel="noopener noreferrer"
                className="text-sm font-semibold leading-snug hover:underline block mb-2" style={{ color: '#1A0A0D' }}>
                🔗 {sig.headline}
              </a>

              {sig.analysis?.why_it_matters_to_kisna && (
                <div className="kisna-rail text-xs italic py-1 mb-2" style={{ color: '#5C3D45' }}>
                  {sig.analysis.why_it_matters_to_kisna}
                </div>
              )}

              <div className="flex items-center justify-between text-[10px] mt-3">
                <span className="font-semibold" style={{ color: '#8E1B2E' }}>{sig.source.publisher}</span>
                <span style={{ color: '#9E7A82' }}>{formatDate(sig.published_at)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
