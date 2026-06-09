import { Signal } from './types'

export function exportCSV(signals: Signal[]): void {
  const headers = [
    'Brand', 'Tier', 'Headline', 'Category', 'Priority', 'Confidence',
    'Threat', 'Opportunity', 'Composite', 'Publisher', 'URL', 'Published', 'Region', 'State'
  ]
  const rows = signals.map(s => [
    s.brand, s.tier, `"${s.headline.replace(/"/g, '""')}"`, s.category,
    s.priority_band, s.confidence_label,
    s.scores.threat, s.scores.opportunity, s.scores.composite_priority,
    s.source.publisher, s.source.url_original,
    s.published_at ?? '', s.geo.region ?? '', s.geo.state ?? ''
  ])
  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
  _download(csv, 'kisna-intel.csv', 'text/csv')
}

export function exportMarkdownBrief(signals: Signal[], heroItems: Signal[]): void {
  const today = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
  const lines: string[] = [
    `# KISNA CMO Intelligence Brief — ${today}`,
    '',
    '## Executive Briefing',
    '',
  ]
  heroItems.forEach((s, i) => {
    lines.push(`### ${i + 1}. ${s.brand} — ${s.headline}`)
    lines.push(`**Why it matters:** ${s.analysis?.why_it_matters_to_kisna ?? ''}`)
    lines.push(`**Impact:** ${s.analysis?.possible_impact ?? ''}`)
    lines.push(`**Action:** ${s.analysis?.suggested_action ?? ''}`)
    lines.push(`*Source: [${s.source.publisher}](${s.source.url_original}) · ${s.confidence_label} confidence*`)
    lines.push('')
  })
  lines.push('---')
  lines.push('*KISNA CMO Intelligence War Room — for internal use only.*')
  _download(lines.join('\n'), 'kisna-brief.md', 'text/markdown')
}

export function exportPDF(): void {
  window.print()
}

function _download(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
