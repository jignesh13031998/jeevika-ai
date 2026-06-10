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


def _google_news_url(brand: str, topic: str) -> str:
    """Return a real, working Google News search URL for a brand + topic."""
    import urllib.parse
    query = f"{brand} {topic} India"
    params = urllib.parse.urlencode({"q": query, "hl": "en-IN", "gl": "IN", "ceid": "IN:en"})
    return f"https://news.google.com/search?{params}"


def _generate_mock_signals(competitors: list[dict], kw_cfg: dict, settings: dict) -> list[dict]:
    """
    Generate mock signals covering ALL 9 competitors with real Google News search URLs.
    Each competitor gets multiple signals across different categories and states.
    """
    import hashlib
    from datetime import timedelta

    # Per-brand curated signal templates: (headline, category, summary, reliability, geo_state, geo_region, city, search_topic)
    brand_signals: dict[str, list[tuple]] = {
        "Tanishq": [
            ("Tanishq launches 'Utsav' festive campaign featuring Deepika Padukone", "CAMPAIGN_LAUNCH", "Tanishq unveils its largest festive brand campaign ahead of Diwali, featuring Deepika Padukone in a new brand film across digital and TV channels.", "B", "Maharashtra", "West", "Mumbai", "Tanishq festive campaign"),
            ("Tanishq opens 10th store in Maharashtra, eyes 50 new outlets by FY27", "STORE_OPENING", "Tanishq inaugurates its 10th showroom in Pune's Aundh locality, reinforcing its West India dominance with plans for 50 new outlets.", "B", "Maharashtra", "West", "Pune", "Tanishq new store Maharashtra"),
            ("CaratLane by Tanishq expands to 300+ stores, adds Tier-2 cities", "FRANCHISE_EXPANSION", "CaratLane, Titan's digital-first diamond brand, crosses 300 stores milestone and accelerates expansion into Tier-2 cities including Nashik, Surat, and Vadodara.", "B", "Gujarat", "West", "Surat", "CaratLane expansion franchise"),
            ("Tanishq introduces lab-grown diamond sub-brand 'Origin'", "LAB_GROWN_DIAMOND_MOVE", "Tanishq quietly launches 'Origin', a dedicated lab-grown diamond collection priced 60–70% below natural diamond equivalents, targeting GenZ buyers.", "B", "Delhi", "North", "Delhi", "Tanishq lab grown diamond"),
            ("Tanishq Gold Harvest Scheme revamped with 1% additional benefit", "PRICING_OR_SCHEME", "Titan revamps Tanishq's flagship Gold Harvest Scheme adding a 1% additional benefit for 11-month subscribers, targeting festival season conversions.", "B", "Tamil Nadu", "South", "Chennai", "Tanishq Gold Harvest Scheme"),
        ],
        "CaratLane": [
            ("CaratLane signs Alia Bhatt for 'Everyday Fine' campaign", "CELEBRITY_AMBASSADOR", "CaratLane appoints Alia Bhatt as brand face for its new 'Everyday Fine' everyday-wear diamond jewellery campaign targeting millennial women.", "B", "Maharashtra", "West", "Mumbai", "CaratLane Alia Bhatt ambassador"),
            ("CaratLane launches try-at-home service in 15 cities", "DIGITAL_DTC_MOVE", "CaratLane expands its home-try-on service to 15 Indian cities, powered by a new logistics partnership, enabling customers to try 5 pieces before purchase.", "B", "Karnataka", "South", "Bangalore", "CaratLane try at home service"),
            ("CaratLane opens franchise outlet in Ahmedabad's Prahlad Nagar", "STORE_OPENING", "CaratLane opens a new franchise partner outlet in Ahmedabad's premium Prahlad Nagar area, its 8th store in Gujarat.", "B", "Gujarat", "West", "Ahmedabad", "CaratLane Ahmedabad store"),
            ("CaratLane reports 35% revenue growth in Q3 FY26", "FINANCIAL_RESULTS", "CaratLane, a Titan subsidiary, posts 35% revenue growth in Q3 FY26, driven by lightweight diamond jewellery and strong festive demand.", "B", "Tamil Nadu", "South", "Chennai", "CaratLane quarterly results revenue"),
        ],
        "BlueStone": [
            ("BlueStone opens 20 new stores in Q4, targets 350 by March 2026", "STORE_OPENING", "BlueStone, freshly listed on BSE, accelerates post-IPO expansion adding 20 stores in Q4 FY26 with West India, North India focus.", "B", "Rajasthan", "West", "Jaipur", "BlueStone new store opening expansion"),
            ("BlueStone launches franchise partner programme for Tier-2 cities", "FRANCHISE_OPPORTUNITY", "BlueStone announces open franchise partner calls for Tier-2 cities, inviting investors with ₹80 lakh–1.2 Cr investment range, directly competing with KISNA's FOFO model.", "B", "Uttar Pradesh", "North", "Lucknow", "BlueStone franchise opportunity partner"),
            ("BlueStone deploys ₹400 Cr IPO proceeds toward store expansion", "FUNDING_IPO_QIP", "BlueStone's post-IPO deployment plan allocates ₹400 Cr from the ₹1,540 Cr raised toward new store openings and digital infrastructure in FY26–27.", "B", "Maharashtra", "West", "Mumbai", "BlueStone IPO funds expansion"),
            ("BlueStone platinum jewellery segment grows 45% YoY", "COLLECTION_LAUNCH", "BlueStone's platinum jewellery vertical reports 45% year-on-year growth, driven by engagement rings and couple band segment targeting younger urban buyers.", "B", "Delhi", "North", "Delhi", "BlueStone platinum collection"),
        ],
        "Indriya": [
            ("Indriya by Aditya Birla crosses 50 stores in 10 months, targets 100 by Dec", "STORE_OPENING", "Indriya, Novel Jewels' luxury jewellery brand, crosses 50 operational stores in just 10 months since launch, on track for 100 stores by December 2025.", "B", "Maharashtra", "West", "Mumbai", "Indriya Aditya Birla store opening"),
            ("Indriya signs Katrina Kaif as brand ambassador for pan-India campaign", "CELEBRITY_AMBASSADOR", "Indriya appoints Katrina Kaif as its first national brand ambassador in a multi-year deal, signalling aggressive brand building alongside rapid expansion.", "B", "Delhi", "North", "Delhi", "Indriya Katrina Kaif ambassador campaign"),
            ("Indriya invites franchise partners with Aditya Birla Group backing", "FRANCHISE_OPPORTUNITY", "Novel Jewels' Indriya brand opens franchise partner enquiries backed by Aditya Birla Group's ₹5,000 Cr commitment, offering assured returns and brand support.", "B", "Gujarat", "West", "Ahmedabad", "Indriya franchise partner opportunity"),
            ("Indriya enters Hyderabad with 3 flagship stores in 30 days", "GEO_ENTRY", "Indriya accelerates South India entry with 3 flagship stores in Hyderabad within 30 days, targeting the premium bridal and diamond segment.", "B", "Telangana", "South", "Hyderabad", "Indriya Hyderabad expansion"),
        ],
        "Malabar Gold & Diamonds": [
            ("Malabar Gold launches 'Mine' diamond brand campaign in UAE and India simultaneously", "CAMPAIGN_LAUNCH", "Malabar Gold's dedicated diamond brand 'Mine' runs simultaneous brand campaigns in UAE and South India, targeting NRI buyers and South Indian diaspora.", "B", None, "GCC", "Dubai", "Malabar Gold Mine diamond campaign"),
            ("Malabar Gold opens 5 new outlets in Kerala and Karnataka", "STORE_OPENING", "Malabar Gold opens 5 new showrooms across Kerala and Karnataka in a single week, reinforcing its South India and home-state dominance.", "B", "Kerala", "South", "Kochi", "Malabar Gold new store Kerala"),
            ("Malabar Gold targets ₹10,000 Cr revenue in GCC markets by FY27", "FINANCIAL_RESULTS", "Malabar Gold's GCC business sees 28% growth, with the group targeting ₹10,000 Cr from UAE, Saudi Arabia, Kuwait, Qatar and Oman by FY27.", "B", None, "GCC", "Dubai", "Malabar Gold GCC revenue target"),
        ],
        "Kalyan Jewellers": [
            ("Kalyan Jewellers opens 15 FOCO franchises in North and West India in Q3", "FRANCHISE_EXPANSION", "Kalyan Jewellers adds 15 FOCO franchise outlets in Q3 FY26 across UP, Rajasthan, Gujarat and Maharashtra, staying on track for 100 new stores in FY26.", "B", "Uttar Pradesh", "North", "Lucknow", "Kalyan Jewellers franchise expansion"),
            ("Kalyan Jewellers' Candere reports 40% revenue jump, adds app features", "DIGITAL_DTC_MOVE", "Kalyan's digital arm Candere posts 40% revenue growth aided by new app features including AI-powered ring sizer, virtual try-on and EMI checkout.", "B", "Maharashtra", "West", "Mumbai", "Candere Kalyan digital revenue"),
            ("Kalyan Jewellers reports highest-ever quarterly profit in Q3 FY26", "FINANCIAL_RESULTS", "Kalyan Jewellers posts highest-ever quarterly profit in Q3 FY26 with net profit up 42% YoY, driven by festive demand and FOCO franchise ramp-up.", "B", "Kerala", "South", "Thrissur", "Kalyan Jewellers quarterly profit results"),
        ],
        "Senco Gold": [
            ("Senco Gold's Sennes diamond brand opens first store outside East India", "GEO_ENTRY", "Senco Gold's diamond sub-brand Sennes opens its first store outside its East India home base in Pune, marking a clear national expansion intent.", "B", "Maharashtra", "West", "Pune", "Senco Gold Sennes expansion"),
            ("Senco Gold reports 22% revenue growth, raises outlook for FY26", "FINANCIAL_RESULTS", "Senco Gold posts 22% revenue growth in H1 FY26, upgrades its FY26 outlook citing strong Durga Puja season and higher diamond mix.", "B", "West Bengal", "East", "Kolkata", "Senco Gold revenue results FY26"),
            ("Senco Gold opens franchise outlets in Odisha and Bihar", "FRANCHISE_EXPANSION", "Senco Gold expands its franchise network into Tier-2 cities in Odisha and Bihar, with 8 new franchise stores in Q3 FY26.", "B", "Odisha", "East", "Bhubaneswar", "Senco Gold franchise Odisha Bihar"),
        ],
        "P N Gadgil Jewellers": [
            ("PNG Jewellers opens first store outside Maharashtra in Delhi NCR", "GEO_ENTRY", "P N Gadgil Jewellers marks a watershed expansion move opening its first outlet outside Maharashtra in Delhi's Greater Kailash-2 locality.", "B", "Delhi", "North", "Delhi", "PNG Jewellers Delhi expansion"),
            ("PNG Jewellers launches franchise enquiry for pan-India expansion", "FRANCHISE_OPPORTUNITY", "P N Gadgil Jewellers, fresh from its 2024 IPO, issues formal franchise enquiry inviting partners outside Maharashtra for the first time.", "B", "Maharashtra", "West", "Pune", "PNG Jewellers franchise opportunity India"),
            ("PNG Jewellers posts 18% revenue growth in H1 FY26 post-listing", "FINANCIAL_RESULTS", "P N Gadgil Jewellers reports 18% top-line growth in H1 FY26, its first full half-year as a listed company, with strong Maharashtra market performance.", "B", "Maharashtra", "West", "Mumbai", "PNG Jewellers revenue results listed"),
        ],
        "PC Jewellers": [
            ("PC Jewellers completes debt restructuring, debt cut by 92% in FY26", "FINANCIAL_RESULTS", "PC Jewellers achieves near-complete debt elimination with 92% cut in FY26, posting ₹3,353 Cr revenue. Turnaround widely noted by analysts.", "B", "Delhi", "North", "Delhi", "PC Jewellers debt restructuring turnaround"),
            ("PC Jewellers reopens 12 showrooms in North India after 3-year hiatus", "STORE_OPENING", "PC Jewellers reopens 12 North India showrooms — including Delhi, Haryana and Punjab — as its financial turnaround enables renewed retail expansion.", "B", "Haryana", "North", "Gurugram", "PC Jewellers reopen store North India"),
            ("PC Jewellers appoints new CEO to lead post-turnaround growth phase", "LEADERSHIP_CHANGE", "PC Jewellers appoints a new Group CEO to lead its growth phase after the successful debt turnaround, signalling renewed investor confidence.", "B", "Delhi", "North", "Delhi", "PC Jewellers new CEO leadership"),
        ],
    }

    now = datetime.now(timezone.utc)
    kw_rules = kw_cfg.get("classification_rules", {})
    signals = []

    publisher_map = {"A": "BSE India", "B": "Economic Times", "C": "Indian Jeweller", "D": "News18"}

    for comp in competitors:
        brand = comp["brand"]
        brand_key = brand
        templates = brand_signals.get(brand_key, [])
        if not templates:
            continue

        for idx, (headline, cat, summary, reliability, state, region, city, search_topic) in enumerate(templates):
            hours_ago = (idx * 8 + comp["tier"] * 5) % (6 * 24)
            pub_dt = (now - timedelta(hours=hours_ago)).isoformat()
            cat_cfg = kw_rules.get(cat, {})
            sig_id = hashlib.sha1(f"{brand}|{cat}|{idx}".encode()).hexdigest()[:16]

            gcc = region == "GCC"
            url = _google_news_url(comp["aliases"][0] if comp.get("aliases") else brand, search_topic)

            signals.append({
                "id": sig_id,
                "schema_version": "1.0",
                "ingested_at": now.isoformat(),
                "published_at": pub_dt,
                "freshness": "RECENT",
                "brand": brand,
                "brand_aliases_matched": [brand],
                "tier": comp["tier"],
                "headline": headline,
                "summary_2line": summary,
                "category": cat,
                "category_family": cat_cfg.get("family", "GENERAL"),
                "classification_rationale": f"Matched category: {cat.replace('_',' ').title()}",
                "geo": {"region": region, "state": state, "city": city, "gcc": gcc},
                "source": {
                    "publisher": publisher_map.get(reliability, "Economic Times"),
                    "url_original": url,
                    "url_fallback": url,
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
