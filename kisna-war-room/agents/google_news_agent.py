"""
Google News RSS sweeper — stdlib only (urllib + xml.etree).
Sweep brand × term → parse → attribute reliability → classify → geo-tag → de-dup.
A sweep NEVER throws on a single source failure; it logs and continues.
"""

import hashlib
import json
import re
import time
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


CONFIG_DIR = Path(__file__).parent.parent / "config"


def _load_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def _sha1_id(headline: str, source: str, date: str) -> str:
    raw = f"{headline.strip().lower()}|{source.strip().lower()}|{date[:10]}"
    return hashlib.sha1(raw.encode()).hexdigest()[:16]


def _detect_reliability(publisher: str, sources_cfg: dict) -> str:
    lookup = sources_cfg.get("outlet_reliability_lookup", {})
    # try URL-based match first
    for domain, grade in lookup.items():
        if domain in publisher.lower():
            return grade
    # fall back to name-based check in lists
    rel_lists = sources_cfg.get("outlet_reliability", {})
    for grade, names in rel_lists.items():
        for name in names:
            if name.lower() in publisher.lower():
                return grade
    return "D"


def _geo_tag(text: str, geo_cfg: dict) -> dict:
    text_lower = text.lower()
    gcc_keywords = [k.lower() for k in geo_cfg.get("gcc", [])]
    for kw in gcc_keywords:
        if kw in text_lower:
            return {"region": "GCC", "state": None, "city": None, "gcc": True}

    for region, states in geo_cfg.items():
        if region == "gcc":
            continue
        for state in states:
            if state.lower() in text_lower:
                return {"region": region.capitalize(), "state": state, "city": None, "gcc": False}

    return {"region": None, "state": None, "city": None, "gcc": False}


def _classify(headline: str, summary: str, kw_rules: dict) -> tuple[str, str]:
    """Returns (category, rationale). Rule-first, deterministic."""
    text = (headline + " " + summary).lower()

    best_cat = "GENERAL_NEWS"
    best_rank = 999
    best_rationale = "No specific category matched."

    for cat, rules in kw_rules.items():
        if cat == "GENERAL_NEWS":
            continue
        include = rules.get("include", [])
        exclude = rules.get("exclude", [])
        rank = rules.get("priority_rank", 9)

        # Check excludes first
        if any(ex.lower() in text for ex in exclude):
            continue

        matched = [inc for inc in include if inc.lower() in text]
        if matched and rank < best_rank:
            best_cat = cat
            best_rank = rank
            best_rationale = f"Matched include terms: {', '.join(matched[:3])}"

    return best_cat, best_rationale


def _parse_rss_entry(entry: ET.Element, ns: dict) -> dict | None:
    title_el = entry.find("title")
    link_el = entry.find("link")
    pub_el = entry.find("pubDate")
    source_el = entry.find("source")

    headline = title_el.text.strip() if title_el is not None and title_el.text else ""
    if not headline:
        return None

    link = link_el.text.strip() if link_el is not None and link_el.text else ""
    pub_date = pub_el.text.strip() if pub_el is not None and pub_el.text else ""
    publisher = source_el.text.strip() if source_el is not None and source_el.text else "Unknown"

    try:
        pub_dt = datetime(*time.strptime(pub_date, "%a, %d %b %Y %H:%M:%S %z")[:6], tzinfo=timezone.utc).isoformat()
    except Exception:
        pub_dt = None

    # description = summary proxy
    desc_el = entry.find("description")
    summary = ""
    if desc_el is not None and desc_el.text:
        # strip HTML tags
        summary = re.sub(r"<[^>]+>", "", desc_el.text).strip()[:300]

    return {
        "headline": headline,
        "url": link,
        "publisher": publisher,
        "published_at": pub_dt,
        "raw_summary": summary,
    }


def _fetch_rss(query: str, locale: str, settings: dict) -> list[dict]:
    max_res = settings.get("max_results_per_query", 20)
    params = urllib.parse.urlencode({
        "q": query,
        "hl": "en-IN",
        "gl": locale,
        "ceid": f"{locale}:en",
    })
    url = f"https://news.google.com/rss/search?{params}"

    headers = {
        "User-Agent": "Mozilla/5.0 (compatible; KISNA-WarRoom/1.0; research-bot)",
        "Accept": "application/rss+xml, application/xml",
    }

    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            xml_bytes = resp.read()
    except Exception as e:
        return []  # caller logs

    try:
        root = ET.fromstring(xml_bytes)
    except ET.ParseError:
        return []

    entries = []
    for item in root.findall(".//item")[:max_res]:
        parsed = _parse_rss_entry(item, {})
        if parsed:
            entries.append(parsed)
    return entries


def _build_signal(
    entry: dict,
    brand: str,
    brand_cfg: dict,
    aliases_matched: list[str],
    kw_rules: dict,
    geo_cfg: dict,
    sources_cfg: dict,
    settings: dict,
) -> dict:
    headline = entry["headline"]
    summary = entry.get("raw_summary", "")
    publisher = entry.get("publisher", "Unknown")
    published_at = entry.get("published_at")
    url = entry.get("url", "")

    category, rationale = _classify(headline, summary, kw_rules)
    cat_cfg = kw_rules.get(category, kw_rules.get("GENERAL_NEWS", {}))

    geo = _geo_tag(headline + " " + summary, geo_cfg)
    reliability = _detect_reliability(publisher, sources_cfg)
    # PR-deflation: self-published press releases capped at C
    if any(term in publisher.lower() for term in ["press release", "prnewswire", "businesswire", "globenewswire"]):
        if reliability in ("A", "B"):
            reliability = "C"

    sig_id = _sha1_id(headline, publisher, published_at or "")
    tier = brand_cfg.get("tier", 3)

    # 2-line summary: headline + first part of raw summary
    summary_2line = headline
    if summary and summary[:50].lower() not in headline.lower():
        summary_2line = f"{headline} — {summary[:120]}"

    signal = {
        "id": sig_id,
        "schema_version": "1.0",
        "ingested_at": datetime.now(timezone.utc).isoformat(),
        "published_at": published_at,
        "freshness": "RECENT",  # computed by scorer
        "brand": brand,
        "brand_aliases_matched": aliases_matched,
        "tier": tier,
        "headline": headline,
        "summary_2line": summary_2line[:200],
        "category": category,
        "category_family": cat_cfg.get("family", "GENERAL"),
        "classification_rationale": rationale,
        "geo": geo,
        "source": {
            "publisher": publisher,
            "url_original": url,
            "url_fallback": url,
            "reliability": reliability,
            "credibility": 3,  # default "possibly true, single source"
        },
        "corroboration_count": 1,
        "scores": {"threat": 0, "opportunity": 0, "confidence": 0, "cmo_salience": 0, "composite_priority": 0},
        "flags": [],
        "priority_band": "LOW",
        "analysis": {},
        "analysis_engine": "rules",
        "last_verified_at": datetime.now(timezone.utc).isoformat(),
    }
    return signal


def sweep(competitors: list[dict], kw_cfg: dict, sources_cfg: dict, settings: dict, log: list) -> list[dict]:
    """
    Main sweep: for each brand × query template × locale, fetch RSS and parse.
    Returns raw (unscored) signals. Never raises on a per-brand failure.
    """
    templates = kw_cfg.get("query_templates", [])
    geo_cfg = kw_cfg.get("geo_states", {})
    kw_rules = kw_cfg.get("classification_rules", {})
    rss_cfg = sources_cfg.get("google_news_rss", {})
    locales = rss_cfg.get("locales", ["IN"])
    rate_limit = rss_cfg.get("rate_limit_seconds", 2)

    all_signals: dict[str, dict] = {}  # id → signal for de-dup

    for brand_cfg in competitors:
        brand = brand_cfg["brand"]
        aliases = brand_cfg.get("aliases", [brand])
        tier = brand_cfg.get("tier", 3)

        for template in templates:
            query = template.replace("{brand}", brand)

            for locale in locales[:3]:  # limit to first 3 locales for speed in phase 1
                try:
                    entries = _fetch_rss(query, locale, rss_cfg)
                    log.append({"brand": brand, "query": query, "locale": locale, "fetched": len(entries)})
                except Exception as e:
                    log.append({"brand": brand, "query": query, "locale": locale, "error": str(e)})
                    entries = []

                for entry in entries:
                    headline = entry.get("headline", "")
                    # Verify at least one alias appears in headline or summary
                    text = (headline + " " + entry.get("raw_summary", "")).lower()
                    matched_aliases = [a for a in aliases if a.lower() in text]
                    if not matched_aliases:
                        continue  # not actually about this brand

                    signal = _build_signal(
                        entry, brand, brand_cfg, matched_aliases,
                        kw_rules, geo_cfg, sources_cfg, settings
                    )
                    sig_id = signal["id"]

                    if sig_id in all_signals:
                        # De-dup: increment corroboration
                        all_signals[sig_id]["corroboration_count"] += 1
                        existing_rel = all_signals[sig_id]["source"]["reliability"]
                        new_rel = signal["source"]["reliability"]
                        # Upgrade reliability if new source is better
                        if "ABCDEF".index(new_rel) < "ABCDEF".index(existing_rel):
                            all_signals[sig_id]["source"]["reliability"] = new_rel
                            all_signals[sig_id]["source"]["publisher"] += f" + {signal['source']['publisher']}"
                    else:
                        all_signals[sig_id] = signal

                time.sleep(rate_limit)

    return list(all_signals.values())
