import React, { useEffect, useState, useCallback } from 'react'
import Head from 'next/head'
import { IntelDataset, Filters } from '../lib/types'
import { applyFilters, getUniqueBrands, getUniqueCategories, getUniqueRegions } from '../lib/filtering'
import { exportCSV, exportMarkdownBrief, exportPDF } from '../lib/export'
import { getHeroItems } from '../lib/filtering'

import Header, { Role } from '../components/Header'
import Ticker from '../components/Ticker'
import FilterBar from '../components/FilterBar'
import StockTicker from '../components/StockTicker'

// CMO components
import ExecBriefing from '../components/ExecBriefing'
import NewsFeed from '../components/NewsFeed'
import JewellerBoxes from '../components/JewellerBoxes'
import StrategicSignals from '../components/StrategicSignals'
import Timeline from '../components/Timeline'
import MarketMap from '../components/MarketMap'
import SocialIntel from '../components/SocialIntel'
import ImpactBoard from '../components/ImpactBoard'

import Watchlist from '../components/Watchlist'
import ActionEngine from '../components/ActionEngine'
import ThreatOpportunityEngine from '../components/ThreatOpportunityEngine'
import LGDWarRoom from '../components/LGDWarRoom'
import IndustryNews from '../components/IndustryNews'

// CFO components
import CFODashboard from '../components/CFODashboard'
import MAWatch from '../components/MAWatch'

// Franchise components
import FranchiseMode from '../components/FranchiseMode'
import StoreExpansionTracker from '../components/StoreExpansionTracker'

const REFRESH_INTERVAL_MS = 5 * 60 * 1000

const DEFAULT_FILTERS: Filters = {
  tier: null, competitor: null, region: null, state: null, categories: [], period: '7d',
}

const TICKER_BG: Record<Role, string> = {
  CMO: '#6B1422', CFO: '#000080', Franchise: '#1A5C2A',
}
const PAGE_BG: Record<Role, string> = {
  CMO: '#F7F2EE', CFO: '#EEF3FA', Franchise: '#F0F7F2',
}

export default function Home() {
  const [dataset, setDataset] = useState<IntelDataset | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<string | null>(null)
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS)
  const [role, setRole] = useState<Role>('CMO')
  const [activeState, setActiveState] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setIsRefreshing(true)
    try {
      const res = await fetch('/signals_bundled.json', { cache: 'no-store' })
      if (!res.ok) { setError('Failed to load data'); return }
      const data: IntelDataset = await res.json()
      setDataset(data)
      setError(null)
      setLastRefresh(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }))
    } catch {
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

  const handleStateClick = (state: string | null) => {
    setActiveState(state)
    setFilters(f => ({ ...f, state, region: null }))
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
        <title>KISNA Intelligence Command</title>
        <meta name="description" content="KISNA Intelligence — CMO · CFO · Franchise" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="noindex,nofollow" />
      </Head>

      <div className="min-h-screen" style={{ background: PAGE_BG[role] }}>
        <Header
          data={dataset}
          lastRefresh={lastRefresh}
          isRefreshing={isRefreshing}
          role={role}
          onRoleChange={setRole}
        />

        {/* Live stock ticker strip — colour matches role */}
        <div style={{ background: TICKER_BG[role] }}>
          <StockTicker theme="dark" />
        </div>

        <Ticker signals={filtered} />

        <FilterBar
          filters={filters}
          brands={brands}
          categories={categories}
          regions={regions}
          totalCount={filtered.length}
          onFilter={f => { setFilters(f); setActiveState(f.state ?? null) }}
        />

        {error && (
          <div className="max-w-[1600px] mx-auto px-4 py-4">
            <div className="rounded p-4 text-sm" style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', color: '#991B1B' }}>
              {error} <button onClick={fetchData} className="ml-4 underline text-xs">Retry</button>
            </div>
          </div>
        )}

        {!dataset && !error && (
          <div className="max-w-[1600px] mx-auto px-4 py-12 text-center">
            <div className="font-display text-2xl animate-pulse" style={{ color: '#C9B8AD' }}>Loading intelligence…</div>
          </div>
        )}

        {dataset && (
          <>
            {/* ── CMO ── */}
            {role === 'CMO' && (
              <>
                <Watchlist />
                <ExecBriefing signals={filtered} />
                <ThreatOpportunityEngine signals={filtered} />
                <ActionEngine signals={filtered} />
                <NewsFeed signals={filtered} />
                <JewellerBoxes signals={filtered} />
                <LGDWarRoom />
                <Timeline signals={filtered} />
                <MarketMap signals={filtered} onStateClick={handleStateClick} activeState={activeState} />
                <SocialIntel signals={filtered} />
                <IndustryNews />
                <ImpactBoard signals={filtered} />
              </>
            )}

            {/* ── CFO ── */}
            {role === 'CFO' && (
              <>
                <CFODashboard />
                <MAWatch />
                <JewellerBoxes signals={filtered} isDark={false} />
                <ImpactBoard signals={filtered} />
              </>
            )}

            {/* ── Franchise ── */}
            {role === 'Franchise' && (
              <>
                <StoreExpansionTracker />
                <FranchiseMode signals={filtered} />
              </>
            )}

            {/* Export bar */}
            <div className="max-w-[1600px] mx-auto px-4 py-6 no-print">
              <div className="flex items-center gap-3 flex-wrap border-t pt-6" style={{ borderColor: '#D1C4BC' }}>
                <span className="text-xs text-stone-500">Export:</span>
                <button onClick={() => exportCSV(filtered)} className="text-xs px-3 py-1.5 border rounded text-stone-500 hover:text-stone-700 transition-colors" style={{ borderColor: '#D1C4BC' }}>CSV</button>
                <button onClick={() => exportMarkdownBrief(filtered, heroItems)} className="text-xs px-3 py-1.5 border rounded text-stone-500 hover:text-stone-700 transition-colors" style={{ borderColor: '#D1C4BC' }}>Markdown Brief</button>
                <button onClick={exportPDF} className="text-xs px-3 py-1.5 border rounded text-stone-500 hover:text-stone-700 transition-colors" style={{ borderColor: '#D1C4BC' }}>Print / PDF</button>
                {dataset.generated_at && (
                  <span className="ml-auto text-[10px] text-stone-400">
                    Dataset: {new Date(dataset.generated_at).toLocaleString('en-IN')} · {filtered.length} signals shown
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
