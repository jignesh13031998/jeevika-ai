import React, { useEffect, useState, useCallback, useRef } from 'react'
import Head from 'next/head'
import { IntelDataset, Signal, Filters } from '../lib/types'
import { applyFilters, getUniqueBrands, getUniqueCategories, getUniqueRegions } from '../lib/filtering'
import { exportCSV, exportMarkdownBrief, exportPDF } from '../lib/export'
import { getHeroItems } from '../lib/filtering'

import Header from '../components/Header'
import Ticker from '../components/Ticker'
import FilterBar from '../components/FilterBar'
import ExecBriefing from '../components/ExecBriefing'
import NewsFeed from '../components/NewsFeed'
import StrategicSignals from '../components/StrategicSignals'
import Timeline from '../components/Timeline'
import MarketMap from '../components/MarketMap'
import SocialIntel from '../components/SocialIntel'
import ImpactBoard from '../components/ImpactBoard'

const REFRESH_INTERVAL_MS = 5 * 60 * 1000 // 5 min polling

const DEFAULT_FILTERS: Filters = {
  tier: null,
  competitor: null,
  region: null,
  state: null,
  categories: [],
  period: '7d',
}

export default function Home() {
  const [dataset, setDataset] = useState<IntelDataset | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<string | null>(null)
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS)
  const [role, setRole] = useState('CMO')
  const [activeState, setActiveState] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setIsRefreshing(true)
    try {
      const res = await fetch('/signals_bundled.json', { cache: 'no-store' })
      if (!res.ok) {
        const err = await res.json()
        setError(err.error ?? 'Failed to load data')
        return
      }
      const data: IntelDataset = await res.json()
      setDataset(data)
      setError(null)
      setLastRefresh(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }))
    } catch (e) {
      setError('Network error — retrying...')
    } finally {
      setIsRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, REFRESH_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [fetchData])

  // State filter from map click
  const handleStateClick = (state: string | null) => {
    setActiveState(state)
    setFilters(f => ({ ...f, state, region: null }))
  }

  const handleFilter = (f: Filters) => {
    setFilters(f)
    setActiveState(f.state ?? null)
  }

  const allSignals = dataset?.signals ?? []
  const filtered = applyFilters(allSignals, filters)

  const brands = getUniqueBrands(allSignals)
  const categories = getUniqueCategories(allSignals)
  const regions = getUniqueRegions(allSignals)

  const heroItems = getHeroItems(filtered)

  return (
    <>
      <Head>
        <title>KISNA CMO War Room</title>
        <meta name="description" content="KISNA CMO Intelligence Command Center" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="noindex,nofollow" />
      </Head>

      <div className="min-h-screen" style={{ background: '#F7F2EE' }}>
        <Header
          data={dataset}
          lastRefresh={lastRefresh}
          isRefreshing={isRefreshing}
          role={role}
          onRoleChange={setRole}
        />

        <Ticker signals={filtered} />

        <FilterBar
          filters={filters}
          brands={brands}
          categories={categories}
          regions={regions}
          totalCount={filtered.length}
          onFilter={handleFilter}
        />

        {/* Error state */}
        {error && (
          <div className="max-w-[1600px] mx-auto px-4 py-4">
            <div className="rounded p-4 text-sm" style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', color: '#991B1B' }}>
              {error}
              <button onClick={fetchData} className="ml-4 underline text-xs">Retry</button>
            </div>
          </div>
        )}

        {/* Loading skeleton */}
        {!dataset && !error && (
          <div className="max-w-[1600px] mx-auto px-4 py-12 text-center text-stone-500">
            <div className="font-display text-2xl animate-pulse" style={{ color: '#C9B8AD' }}>Loading intelligence…</div>
          </div>
        )}

        {dataset && (
          <>
            {/* §1 Executive Briefing — the 3-minute CMO read */}
            <ExecBriefing signals={filtered} />

            {/* §2 Live Competitor News Feed */}
            <NewsFeed signals={filtered} />

            {/* §3 Strategic Signals */}
            <StrategicSignals signals={filtered} />

            {/* §4 Timeline */}
            <Timeline signals={filtered} />

            {/* §5 Market Map */}
            <MarketMap
              signals={filtered}
              onStateClick={handleStateClick}
              activeState={activeState}
            />

            {/* §6 Social & Digital Intelligence */}
            <SocialIntel signals={filtered} />

            {/* §7 Executive Impact Analysis — print-ready */}
            <ImpactBoard signals={filtered} />

            {/* Export bar */}
            <div className="max-w-[1600px] mx-auto px-4 py-6 no-print">
              <div className="flex items-center gap-3 flex-wrap border-t border-border pt-6">
                <span className="text-xs text-stone-500">Export:</span>
                <button
                  onClick={() => exportCSV(filtered)}
                  className="text-xs px-3 py-1.5 border border-border rounded hover:border-accent-secondary text-stone-400 hover:text-stone-200 transition-colors"
                >
                  CSV
                </button>
                <button
                  onClick={() => exportMarkdownBrief(filtered, heroItems)}
                  className="text-xs px-3 py-1.5 border border-border rounded hover:border-accent-secondary text-stone-400 hover:text-stone-200 transition-colors"
                >
                  Markdown Brief
                </button>
                <button
                  onClick={exportPDF}
                  className="text-xs px-3 py-1.5 border border-border rounded hover:border-accent-secondary text-stone-400 hover:text-stone-200 transition-colors"
                >
                  Print / PDF
                </button>
                {dataset.generated_at && (
                  <span className="ml-auto text-[10px] text-stone-600">
                    Dataset: {new Date(dataset.generated_at).toLocaleString('en-IN')} ·{' '}
                    {filtered.length} signals shown
                  </span>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  )
}
