"""
Bridge: geo enrichment + Google News redirect resolution + dashboard dataset export.
Emits output/signals_enriched.json (the bundled dataset served by the API).
"""

import json
import re
import time
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path


OUTPUT_DIR = Path(__file__).parent.parent / "output"
CONFIG_DIR = Path(__file__).parent.parent / "config"


def _resolve_google_redirect(url: str, timeout: int = 8) -> str:
    """
    Resolve a Google News redirect URL to the real publisher URL.
    Uses HEAD request + follow redirects; falls back to original on any error.
    """
    if not url or "news.google.com" not in url:
        return url
    try:
        req = urllib.request.Request(url, method="HEAD", headers={
            "User-Agent": "Mozilla/5.0 (compatible; KISNA-WarRoom/1.0)"
        })
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return resp.url
    except Exception:
        return url


def _enhance_geo(signal: dict, kw_cfg: dict) -> dict:
    """Improve geo tagging using headline + summary against the geo state lists."""
    geo = signal.get("geo", {})
    if geo.get("state") or geo.get("gcc"):
        return signal  # already tagged

    text = (signal.get("headline", "") + " " + signal.get("summary_2line", "")).lower()
    geo_states = kw_cfg.get("geo_states", {})

    for region, states in geo_states.items():
        if region == "gcc":
            continue
        for state in states:
            if state.lower() in text:
                signal["geo"] = {"region": region.capitalize(), "state": state, "city": None, "gcc": False}
                return signal

    # GCC check
    gcc = kw_cfg.get("geo_states", {}).get("gcc", [])
    for loc in gcc:
        if loc.lower() in text:
            signal["geo"] = {"region": "GCC", "state": None, "city": None, "gcc": True}
            return signal

    return signal


def _set_credibility(signal: dict) -> dict:
    """Set information credibility 1-6 based on corroboration and reliability."""
    corr = signal.get("corroboration_count", 1)
    rel = signal.get("source", {}).get("reliability", "D")

    if rel == "A" and corr >= 1:
        cred = 1
    elif rel == "B" and corr >= 2:
        cred = 2
    elif rel == "B" and corr == 1:
        cred = 3
    elif rel == "C" and corr >= 2:
        cred = 3
    elif corr >= 3:
        cred = 2
    else:
        cred = 4

    signal["source"]["credibility"] = cred
    return signal


def _confidence_label(scores: dict) -> str:
    conf = scores.get("confidence", 0)
    if conf >= 65:
        return "High"
    if conf >= 40:
        return "Medium"
    return "Low"


def enrich_and_export(signals: list[dict], kw_cfg: dict, resolve_urls: bool = False) -> dict:
    """
    Run all enrichments, then write the dashboard-ready bundled dataset.
    Returns the export dict.
    """
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    enriched = []
    for sig in signals:
        sig = _enhance_geo(sig, kw_cfg)
        sig = _set_credibility(sig)
        # Compute confidence_label for UI
        sig["confidence_label"] = _confidence_label(sig.get("scores", {}))

        if resolve_urls:
            orig = sig["source"].get("url_original", "")
            resolved = _resolve_google_redirect(orig)
            sig["source"]["url_original"] = resolved
            time.sleep(0.5)  # polite rate-limit

        enriched.append(sig)

    # Sort by composite_priority desc
    enriched.sort(key=lambda s: s.get("scores", {}).get("composite_priority", 0), reverse=True)

    export = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "rolling_window_days": 7,
        "total_signals": len(enriched),
        "signals": enriched,
        "meta": {
            "brands_tracked": len({s["brand"] for s in enriched}),
            "high_priority": sum(1 for s in enriched if s.get("priority_band") == "HIGH"),
            "medium_priority": sum(1 for s in enriched if s.get("priority_band") == "MEDIUM"),
            "threat_alerts": sum(1 for s in enriched if "THREAT_ALERT" in s.get("flags", [])),
            "opportunity_alerts": sum(1 for s in enriched if "OPPORTUNITY_ALERT" in s.get("flags", [])),
        }
    }

    out_path = OUTPUT_DIR / "signals_enriched.json"
    out_path.write_text(json.dumps(export, ensure_ascii=False, indent=2), encoding="utf-8")
    return export
