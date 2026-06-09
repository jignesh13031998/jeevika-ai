import React from 'react'
import { Signal } from '../lib/types'
import { categoryLabel, formatDate } from '../lib/scoring-display'

interface Props {
  signals: Signal[]
}

const SOCIAL_CATEGORIES = new Set([
  'INFLUENCER_CONTENT', 'SOCIAL_VIRALITY', 'DIGITAL_DTC_MOVE', 'CAMPAIGN_LAUNCH',
  'CELEBRITY_AMBASSADOR', 'BRAND_COLLAB', 'SENTIMENT_SHIFT', 'COMPLAINT_CLUSTER'
])

export default function SocialIntel({ signals }: Props) {
  const social = signals.filter(s => SOCIAL_CATEGORIES.has(s.category))

  return (
    <section className="max-w-[1600px] mx-auto px-4 py-6">
      <div className="flex items-baseline gap-3 mb-4">
        <h2 className="font-display text-2xl font-semibold text-stone-100">Social & Digital Intelligence</h2>
        <span className="text-sm text-stone-500">public brand & campaign signals — C-reliability, deflated</span>
      </div>

      {social.length === 0 ? (
        <div className="bg-surface rounded-lg border border-border p-6 text-stone-500 text-sm">
          No social or digital signals in the current filter window.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {social.map(sig => (
            <div key={sig.id} className="bg-surface rounded-lg border border-border p-4 hover:border-accent-secondary/40 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-semibold text-accent-secondary uppercase tracking-wide">
                  {sig.brand}
                </span>
                <span className="text-[10px] text-stone-600">·</span>
                <span className="text-[10px] text-stone-600">{categoryLabel(sig.category)}</span>
                <span className="ml-auto text-[10px] text-stone-600">C-reliability</span>
              </div>
              <h3 className="text-sm text-stone-100 font-medium leading-snug mb-2">{sig.headline}</h3>
              {sig.analysis?.why_it_matters_to_kisna && (
                <div className="kisna-rail text-xs text-stone-400 italic mb-2">
                  {sig.analysis.why_it_matters_to_kisna}
                </div>
              )}
              <div className="flex items-center justify-between mt-3 text-[10px] text-stone-600">
                <a
                  href={sig.source.url_original || sig.source.url_fallback}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-accent-secondary underline"
                >
                  {sig.source.publisher}
                </a>
                <span>{formatDate(sig.published_at)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
