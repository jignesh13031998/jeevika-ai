import React from 'react'
import { Signal } from '../lib/types'
import { categoryLabel, formatDate } from '../lib/scoring-display'

interface Props { signals: Signal[] }

type ActionTag = 'IMMEDIATE_ACTION' | 'COUNTERATTACK' | 'REPLICATE' | 'WATCH_CLOSELY' | 'IGNORE'

const TAG_META: Record<ActionTag, { label: string; icon: string; bg: string; color: string; desc: string }> = {
  IMMEDIATE_ACTION: { label: 'Immediate Action', icon: '🚨', bg: '#FEE2E2', color: '#991B1B', desc: 'Requires response this week' },
  COUNTERATTACK:    { label: 'Counterattack',    icon: '⚔️', bg: '#FFF1F2', color: '#BE123C', desc: 'Aggressive competitor move — respond in kind' },
  REPLICATE:        { label: 'Replicate',        icon: '📋', bg: '#ECFDF5', color: '#065F46', desc: 'Successful play worth copying' },
  WATCH_CLOSELY:    { label: 'Watch Closely',    icon: '👁', bg: '#FEF3C7', color: '#92400E', desc: 'Monitor — may escalate' },
  IGNORE:           { label: 'Informational',    icon: '📰', bg: '#F3F4F6', color: '#6B7280', desc: 'Routine — no action needed' },
}

const COUNTERATTACK_CATS = new Set(['PRICE_PROMOTION', 'DISCOUNT_SCHEME', 'GOLD_RATE_OFFER', 'EXCHANGE_OFFER'])
const REPLICATE_CATS = new Set(['CAMPAIGN_LAUNCH', 'COLLECTION_LAUNCH', 'PRODUCT_INNOVATION', 'DIGITAL_DTC_MOVE', 'OMNICHANNEL_PUSH'])
const WATCH_CATS = new Set(['LAB_GROWN_DIAMOND_MOVE', 'FUNDING_IPO_QIP', 'CELEBRITY_AMBASSADOR', 'NEW_MARKET_ENTRY'])
const IMMEDIATE_CATS = new Set(['STORE_OPENING', 'EXPANSION_PLAN', 'FRANCHISE_OPPORTUNITY'])

export function tagSignal(sig: Signal): ActionTag {
  const overlapsKisna = ['Maharashtra', 'Gujarat', 'Rajasthan', 'Madhya Pradesh'].includes(sig.geo.state ?? '')
  if (sig.priority_band === 'HIGH' && (IMMEDIATE_CATS.has(sig.category) || overlapsKisna)) return 'IMMEDIATE_ACTION'
  if (COUNTERATTACK_CATS.has(sig.category)) return 'COUNTERATTACK'
  if (REPLICATE_CATS.has(sig.category) && sig.scores.opportunity >= 40) return 'REPLICATE'
  if (WATCH_CATS.has(sig.category) || sig.priority_band === 'HIGH') return 'WATCH_CLOSELY'
  if (sig.priority_band === 'MEDIUM') return 'WATCH_CLOSELY'
  return 'IGNORE'
}

export default function ActionEngine({ signals }: Props) {
  const buckets: Record<ActionTag, Signal[]> = {
    IMMEDIATE_ACTION: [], COUNTERATTACK: [], REPLICATE: [], WATCH_CLOSELY: [], IGNORE: [],
  }
  for (const sig of signals) buckets[tagSignal(sig)].push(sig)

  const order: ActionTag[] = ['IMMEDIATE_ACTION', 'COUNTERATTACK', 'REPLICATE', 'WATCH_CLOSELY', 'IGNORE']

  return (
    <section className="max-w-[1600px] mx-auto px-4 py-6">
      <div className="flex items-baseline gap-3 mb-1" style={{ borderBottom: '2px solid #E2D5CC', paddingBottom: '10px' }}>
        <h2 className="font-display text-3xl font-bold" style={{ color: '#8E1B2E' }}>Kisna Action Engine</h2>
        <span className="text-sm" style={{ color: '#9E7A82' }}>not the news — what KISNA should do because of it</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 my-4">
        {order.map(tag => {
          const m = TAG_META[tag]
          return (
            <div key={tag} className="rounded-xl p-3 text-center" style={{ background: m.bg }}>
              <div className="text-2xl">{m.icon}</div>
              <div className="font-display text-2xl font-bold" style={{ color: m.color }}>{buckets[tag].length}</div>
              <div className="text-[10px] font-bold" style={{ color: m.color }}>{m.label}</div>
            </div>
          )
        })}
      </div>

      <div className="space-y-4">
        {order.filter(t => t !== 'IGNORE' && buckets[t].length > 0).map(tag => {
          const m = TAG_META[tag]
          return (
            <div key={tag} className="rounded-xl border bg-white overflow-hidden" style={{ borderColor: '#E2D5CC' }}>
              <div className="px-4 py-2.5 flex items-center gap-2" style={{ background: m.bg }}>
                <span>{m.icon}</span>
                <span className="font-bold text-sm" style={{ color: m.color }}>{m.label}</span>
                <span className="text-[10px]" style={{ color: m.color, opacity: 0.8 }}>— {m.desc}</span>
              </div>
              <div className="divide-y" style={{ borderColor: '#F3EDE8' }}>
                {buckets[tag].slice(0, 6).map(sig => (
                  <div key={sig.id} className="px-4 py-3 flex items-start gap-3">
                    <span className="text-xs font-bold flex-shrink-0 w-28" style={{ color: '#8E1B2E' }}>{sig.brand}</span>
                    <div className="flex-1 min-w-0">
                      <a href={sig.source.url_original} target="_blank" rel="noopener noreferrer"
                        className="text-xs font-semibold hover:underline block" style={{ color: '#1A0A0D' }}>
                        🔗 {sig.headline}
                      </a>
                      <div className="text-[10px] mt-0.5" style={{ color: '#9E7A82' }}>
                        {categoryLabel(sig.category)} · {formatDate(sig.published_at)}
                        {sig.geo.state && <> · 📍{sig.geo.state}</>}
                      </div>
                      {sig.analysis?.suggested_action && (
                        <div className="text-[11px] mt-1 font-medium" style={{ color: m.color }}>
                          → {sig.analysis.suggested_action}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
