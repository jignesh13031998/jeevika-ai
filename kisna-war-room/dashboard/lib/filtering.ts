import { Signal, Filters } from './types'

export function applyFilters(signals: Signal[], filters: Filters): Signal[] {
  const now = new Date()

  return signals.filter(sig => {
    if (filters.tier !== null && sig.tier !== filters.tier) return false
    if (filters.competitor && sig.brand !== filters.competitor) return false
    if (filters.region && sig.geo.region !== filters.region) return false
    if (filters.state && sig.geo.state !== filters.state) return false
    if (filters.categories.length > 0 && !filters.categories.includes(sig.category)) return false

    if (filters.period !== '7d' && sig.published_at) {
      const pub = new Date(sig.published_at)
      const diff = (now.getTime() - pub.getTime()) / (1000 * 60 * 60 * 24)
      if (filters.period === 'today' && diff > 1) return false
      if (filters.period === '30d' && diff > 30) return false
    }

    return true
  })
}

export function getHeroItems(signals: Signal[], maxItems = 7, maxPerCompetitor = 2): Signal[] {
  const sorted = [...signals].sort(
    (a, b) => b.scores.composite_priority - a.scores.composite_priority
  )
  const seenBrands: Record<string, number> = {}
  const hero: Signal[] = []

  for (const sig of sorted) {
    const count = seenBrands[sig.brand] ?? 0
    if (count >= maxPerCompetitor) continue
    // Confidence gate: skip single-source Low confidence from hero
    if (sig.corroboration_count === 1 && sig.confidence_label === 'Low') continue
    hero.push(sig)
    seenBrands[sig.brand] = count + 1
    if (hero.length >= maxItems) break
  }

  return hero
}

export function getWatchIndicators(signals: Signal[], heroIds: Set<string>, n = 3): Signal[] {
  return signals
    .filter(s => !heroIds.has(s.id) && ['HIGH', 'MEDIUM'].includes(s.priority_band))
    .slice(0, n)
}

export function getTimelineForBrand(signals: Signal[], brand: string): Signal[] {
  return signals
    .filter(s => s.brand === brand)
    .sort((a, b) => {
      const dateA = a.published_at ? new Date(a.published_at).getTime() : 0
      const dateB = b.published_at ? new Date(b.published_at).getTime() : 0
      return dateB - dateA
    })
}

export function getUniqueBrands(signals: Signal[]): string[] {
  return Array.from(new Set(signals.map(s => s.brand))).sort()
}

export function getUniqueCategories(signals: Signal[]): string[] {
  return Array.from(new Set(signals.map(s => s.category))).sort()
}

export function getUniqueRegions(signals: Signal[]): string[] {
  return Array.from(new Set(signals.map(s => s.geo.region).filter(Boolean) as string[])).sort()
}

export function getActionOfDay(heroItems: Signal[]): string {
  if (!heroItems.length) return 'Review the full feed for emerging developments and brief the team on any Tier-1 competitive moves.'
  const top = heroItems[0]
  return top.analysis?.suggested_action ||
    `Brief the team on ${top.brand}'s latest ${top.category.replace(/_/g, ' ')} development and define KISNA's response this week.`
}

export function groupByPriorityBand(signals: Signal[]) {
  return {
    HIGH: signals.filter(s => s.priority_band === 'HIGH'),
    MEDIUM: signals.filter(s => s.priority_band === 'MEDIUM'),
    LOW: signals.filter(s => s.priority_band === 'LOW'),
  }
}
