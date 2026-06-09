#!/usr/bin/env python3
"""
KISNA CMO War Room — main entry point.
Usage:
    python run.py [--mock] [--tier N] [--max N] [--no-llm] [--resolve-urls]

Options:
    --mock          Use generated mock signals instead of live RSS
    --tier N        Only sweep competitors at tier N (1, 2, or 3)
    --max N         Max signals to process (default: all)
    --no-llm        Force rule-based analyst even if ANTHROPIC_API_KEY is set
    --resolve-urls  Resolve Google News redirect URLs to real publisher URLs
"""

import argparse
import json
import logging
import sys
import traceback
from datetime import datetime, timezone
from pathlib import Path


BASE = Path(__file__).parent
CONFIG_DIR = BASE / "config"
OUTPUT_DIR = BASE / "output"

sys.path.insert(0, str(BASE))


def _load_json(name: str) -> dict:
    return json.loads((CONFIG_DIR / name).read_text(encoding="utf-8"))


def _setup_logging(settings: dict) -> logging.Logger:
    log_cfg = settings.get("logging", {})
    level = getattr(logging, log_cfg.get("level", "INFO"))
    logging.basicConfig(
        format="%(asctime)s [%(levelname)s] %(message)s",
        level=level,
        handlers=[logging.StreamHandler(sys.stdout)]
    )
    return logging.getLogger("kisna_warroom")


def _generate_mock_signals(competitors: list[dict], kw_cfg: dict, settings: dict) -> list[dict]:
    """Generate deterministic mock signals for offline testing."""
    import hashlib
    from datetime import timedelta

    mock_templates = [
        ("opens new flagship showroom in {city}", "STORE_OPENING", "{brand} has inaugurated a new showroom in {city}", "B"),
        ("signs {celeb} as brand ambassador", "CELEBRITY_AMBASSADOR", "Celebrity endorsement announced for {brand}", "B"),
        ("launches lab grown diamond collection", "LAB_GROWN_DIAMOND_MOVE", "{brand} enters lab-grown diamond segment", "B"),
        ("announces franchise expansion plan for 2025", "FRANCHISE_EXPANSION", "{brand} FOFO franchise network growing", "C"),
        ("rolls out festive gold savings scheme", "PRICING_OR_SCHEME", "New gold scheme from {brand} for wedding season", "C"),
        ("reports strong Q4 revenue growth", "FINANCIAL_RESULTS", "{brand} posts quarterly revenue numbers", "B"),
        ("invites franchise partners across South India", "FRANCHISE_OPPORTUNITY", "{brand} opens franchise partner applications", "C"),
        ("faces customer complaints over delayed delivery", "COMPLAINT_CLUSTER", "Social media outrage over {brand} service", "D"),
        ("launches digital-first campaign for GenZ", "CAMPAIGN_LAUNCH", "{brand} targets younger buyers with new campaign", "B"),
        ("enters Karnataka market with 3 new stores", "GEO_ENTRY", "{brand} expands to new geography", "B"),
    ]

    cities = ["Mumbai", "Pune", "Ahmedabad", "Delhi", "Bangalore", "Chennai", "Jaipur", "Hyderabad"]
    celebs = ["Deepika Padukone", "Alia Bhatt", "Ranveer Singh", "Katrina Kaif", "Priyanka Chopra"]

    seed = settings.get("mock", {}).get("seed_items", 25)
    signals = []
    from datetime import timedelta
    now = datetime.now(timezone.utc)

    kw_rules = kw_cfg.get("classification_rules", {})

    i = 0
    for comp in competitors:
        brand = comp["brand"]
        for j, (tmpl, cat, desc_tmpl, reliability) in enumerate(mock_templates):
            if i >= seed:
                break
            city = cities[(i + j) % len(cities)]
            celeb = celebs[(i + j) % len(celebs)]
            hours_ago = ((i * 7 + j * 3) % (7 * 24))
            pub_dt = (now - timedelta(hours=hours_ago)).isoformat()

            headline = tmpl.format(brand=brand, city=city, celeb=celeb)
            desc = desc_tmpl.format(brand=brand, city=city)
            cat_cfg = kw_rules.get(cat, {})

            geo_state = None
            geo_region = None
            for region, states in kw_cfg.get("geo_states", {}).items():
                if region == "gcc":
                    continue
                if city in ["Mumbai", "Pune"] and region == "west":
                    geo_state = "Maharashtra"
                    geo_region = "West"
                    break
                elif city == "Delhi" and region == "north":
                    geo_state = "Delhi"
                    geo_region = "North"
                    break

            sig_id = hashlib.sha1(f"{brand}|{cat}|{j}".encode()).hexdigest()[:16]
            signals.append({
                "id": sig_id,
                "schema_version": "1.0",
                "ingested_at": now.isoformat(),
                "published_at": pub_dt,
                "freshness": "RECENT",
                "brand": brand,
                "brand_aliases_matched": [brand],
                "tier": comp["tier"],
                "headline": f"{brand} {headline}",
                "summary_2line": f"{brand} {desc}. Source: Mock Data — for demo purposes.",
                "category": cat,
                "category_family": cat_cfg.get("family", "GENERAL"),
                "classification_rationale": f"Mock signal for category {cat}",
                "geo": {"region": geo_region, "state": geo_state, "city": city, "gcc": False},
                "source": {
                    "publisher": "Economic Times" if reliability == "B" else "Indian Jeweller",
                    "url_original": f"https://economictimes.indiatimes.com/mock/{sig_id}",
                    "url_fallback": f"https://economictimes.indiatimes.com/mock/{sig_id}",
                    "reliability": reliability,
                    "credibility": 2 if reliability == "B" else 3,
                },
                "corroboration_count": 2 if reliability == "B" else 1,
                "scores": {"threat": 0, "opportunity": 0, "confidence": 0, "cmo_salience": 0, "composite_priority": 0},
                "flags": [],
                "priority_band": "LOW",
                "analysis": {},
                "analysis_engine": "rules",
                "last_verified_at": now.isoformat(),
            })
            i += 1
        if i >= seed:
            break

    return signals


def _write_manifest(manifest: dict) -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    date_str = datetime.now(timezone.utc).strftime("%Y-%m-%d_%H-%M")
    path = OUTPUT_DIR / f"manifest_{date_str}.json"
    path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser(description="KISNA CMO Intelligence War Room")
    parser.add_argument("--mock", action="store_true", help="Use mock data (no live RSS)")
    parser.add_argument("--tier", type=int, choices=[1, 2, 3], help="Only collect for this tier")
    parser.add_argument("--max", type=int, default=0, help="Max signals to process (0 = all)")
    parser.add_argument("--no-llm", action="store_true", help="Force rule-based analyst")
    parser.add_argument("--resolve-urls", action="store_true", help="Resolve Google News redirect URLs")
    args = parser.parse_args()

    # ── Load config ────────────────────────────────────────────────────────────
    try:
        competitors_cfg = _load_json("competitors.json")
        kw_cfg = _load_json("keywords.json")
        sources_cfg = _load_json("sources.json")
        settings = _load_json("settings.json")
    except Exception as e:
        print(f"[FATAL] Failed to load config: {e}")
        sys.exit(1)

    logger = _setup_logging(settings)
    competitors = competitors_cfg["competitors"]

    if args.tier:
        competitors = [c for c in competitors if c["tier"] == args.tier]

    if args.no_llm:
        settings["analysis"]["mode"] = "rules"

    # ── Manifest ──────────────────────────────────────────────────────────────
    manifest = {
        "run_started_at": datetime.now(timezone.utc).isoformat(),
        "mode": "mock" if args.mock else "live",
        "tier_filter": args.tier,
        "max_signals": args.max,
        "llm_enabled": not args.no_llm,
        "competitors": [c["brand"] for c in competitors],
        "sources_swept": [],
        "items_collected": 0,
        "items_processed": 0,
        "items_suppressed": 0,
        "llm_calls": 0,
        "errors_tolerated": [],
    }

    sweep_log: list = []

    # ── Phase 1: Collect ──────────────────────────────────────────────────────
    logger.info("=== KISNA CMO War Room — starting run ===")
    logger.info(f"Mode: {'MOCK' if args.mock else 'LIVE'} | Brands: {len(competitors)}")

    if args.mock:
        raw_signals = _generate_mock_signals(competitors, kw_cfg, settings)
        logger.info(f"Mock mode: generated {len(raw_signals)} signals")
    else:
        from agents.google_news_agent import sweep
        try:
            raw_signals = sweep(competitors, kw_cfg, sources_cfg, settings, sweep_log)
            logger.info(f"Live sweep complete: {len(raw_signals)} unique signals collected")
        except Exception as e:
            logger.error(f"Sweep failed unexpectedly: {e}\n{traceback.format_exc()}")
            raw_signals = []

    manifest["items_collected"] = len(raw_signals)
    manifest["sources_swept"] = sweep_log

    # ── Phase 2: Score ────────────────────────────────────────────────────────
    from scoring.scoring_model import score_signal

    scored = []
    for sig in raw_signals:
        try:
            scored.append(score_signal(sig, kw_cfg, settings))
        except Exception as e:
            logger.warning(f"Scoring failed for signal {sig.get('id','?')}: {e}")
            sig["priority_band"] = "LOW"
            scored.append(sig)

    # Apply recency window filter
    rolling_days = settings.get("rolling_window_days", 7)
    within_window = [s for s in scored if s.get("freshness") != "ARCHIVE"]
    suppressed = len(scored) - len(within_window)
    manifest["items_suppressed"] = suppressed

    if args.max and args.max > 0:
        within_window = within_window[:args.max]

    manifest["items_processed"] = len(within_window)

    # ── Phase 3: Analyze ──────────────────────────────────────────────────────
    from agents.analyst import analyze_signals
    analyzed = analyze_signals(within_window, settings)

    # ── Phase 4: Enrich + Export ──────────────────────────────────────────────
    from bridge.enrich_and_export import enrich_and_export
    export = enrich_and_export(analyzed, kw_cfg, resolve_urls=args.resolve_urls)

    # ── Phase 5: Generate Brief ───────────────────────────────────────────────
    from reports.report_generator import save_brief
    brief_path = save_brief(analyzed, settings)

    # ── Save raw signals ──────────────────────────────────────────────────────
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    raw_path = OUTPUT_DIR / "signals_raw.json"
    raw_path.write_text(json.dumps(within_window, ensure_ascii=False, indent=2), encoding="utf-8")

    manifest["run_ended_at"] = datetime.now(timezone.utc).isoformat()
    _write_manifest(manifest)

    # ── Summary ───────────────────────────────────────────────────────────────
    meta = export["meta"]
    logger.info("=== Run complete ===")
    logger.info(f"Signals processed : {manifest['items_processed']}")
    logger.info(f"Suppressed        : {manifest['items_suppressed']}")
    logger.info(f"HIGH priority     : {meta['high_priority']}")
    logger.info(f"MEDIUM priority   : {meta['medium_priority']}")
    logger.info(f"Threat alerts     : {meta['threat_alerts']}")
    logger.info(f"Opportunity alerts: {meta['opportunity_alerts']}")
    logger.info(f"Brief saved       : {brief_path}")
    logger.info(f"Dataset saved     : {OUTPUT_DIR / 'signals_enriched.json'}")
    logger.info("")
    logger.info("Dashboard: cd dashboard && npm run dev  →  http://localhost:3000")


if __name__ == "__main__":
    main()
