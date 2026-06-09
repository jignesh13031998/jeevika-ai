import { Signal, Freshness, PriorityBand } from './types'

export function freshnessLabel(f: Freshness): string {
  return { NEW: 'Just in', FRESH: 'Today', RECENT: 'This week', ARCHIVE: 'Older' }[f] ?? 'This week'
}

export function freshnessColor(f: Freshness): string {
  return {
    NEW: '#DC2626',
    FRESH: '#DC2626',
    RECENT: '#C9A86A',
    ARCHIVE: '#6B7280',
  }[f] ?? '#6B7280'
}

export function bandColor(band: PriorityBand): string {
  return { HIGH: '#EA580C', MEDIUM: '#D97706', LOW: '#16A34A' }[band] ?? '#6B7280'
}

export function bandBgClass(band: PriorityBand): string {
  return {
    HIGH: 'bg-prio-high/10 text-prio-high border border-prio-high/30',
    MEDIUM: 'bg-prio-medium/10 text-prio-medium border border-prio-medium/30',
    LOW: 'bg-prio-low/10 text-prio-low border border-prio-low/30',
  }[band] ?? ''
}

export function confidenceChipClass(label: string): string {
  return { High: 'chip-high', Medium: 'chip-medium', Low: 'chip-low' }[label] ?? 'chip-medium'
}

export function categoryLabel(cat: string): string {
  return cat.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

export function reliabilityLabel(rel: string): string {
  return {
    A: 'Primary (Exchange/Regulator)',
    B: 'Business Press',
    C: 'Trade/Brand-owned',
    D: 'Aggregator',
    E: 'Social/Unverified',
    F: 'Dubious',
  }[rel] ?? rel
}

export function formatDate(iso: string | null): string {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  } catch {
    return '—'
  }
}

export function scoreBar(score: number): string {
  const pct = Math.round(score)
  if (pct >= 70) return '🔴'
  if (pct >= 45) return '🟡'
  return '🟢'
}

export function isSingleSourceLow(sig: Signal): boolean {
  return sig.corroboration_count === 1 && sig.confidence_label === 'Low'
}
