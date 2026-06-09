// Signal v1 — mirrors the Python canonical schema exactly

export interface Geo {
  region: string | null
  state: string | null
  city: string | null
  gcc: boolean
}

export interface Source {
  publisher: string
  url_original: string
  url_fallback: string
  reliability: 'A' | 'B' | 'C' | 'D' | 'E' | 'F'
  credibility: number
}

export interface Scores {
  threat: number
  opportunity: number
  confidence: number
  cmo_salience: number
  composite_priority: number
}

export interface Analysis {
  what_happened: string
  why_it_matters_to_kisna: string
  possible_impact: string
  suggested_action: string
}

export type Freshness = 'NEW' | 'FRESH' | 'RECENT' | 'ARCHIVE'
export type PriorityBand = 'HIGH' | 'MEDIUM' | 'LOW'
export type AnalysisEngine = 'claude' | 'rules'

export interface Signal {
  id: string
  schema_version: string
  ingested_at: string
  published_at: string | null
  freshness: Freshness
  brand: string
  brand_aliases_matched: string[]
  tier: 1 | 2 | 3
  headline: string
  summary_2line: string
  category: string
  category_family: string
  classification_rationale: string
  geo: Geo
  source: Source
  corroboration_count: number
  scores: Scores
  flags: string[]
  priority_band: PriorityBand
  confidence_label: 'High' | 'Medium' | 'Low'
  analysis: Analysis
  analysis_engine: AnalysisEngine
  last_verified_at: string
}

export interface IntelDataset {
  generated_at: string
  rolling_window_days: number
  total_signals: number
  signals: Signal[]
  meta: {
    brands_tracked: number
    high_priority: number
    medium_priority: number
    threat_alerts: number
    opportunity_alerts: number
  }
}

export interface Filters {
  tier: number | null
  competitor: string | null
  region: string | null
  state: string | null
  categories: string[]
  period: '7d' | '30d' | 'today'
}
