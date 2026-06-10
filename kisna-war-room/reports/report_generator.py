"""
Director-ready Intelligence Brief — daily markdown report.
Implements the 5-3-1 surfacing rule: ≤7 hero items, 3 watch indicators, 1 action of day.
"""

import json
from datetime import datetime, timezone
from pathlib import Path


REPORTS_DIR = Path(__file__).parent.parent / "output"


def _emoji_band(band: str) -> str:
    return {"HIGH": "🔴", "MEDIUM": "🟡", "LOW": "🟢"}.get(band, "⚪")


def _select_hero(signals: list[dict], settings: dict) -> list[dict]:
    """Select top signals for the hero briefing per 5-3-1 rule."""
    cfg = settings.get("hero_briefing", {})
    max_items = cfg.get("max_items", 7)
    max_per_competitor = cfg.get("max_items_per_competitor", 2)

    # Confidence gate: hero items must not be single-source Low
    eligible = [
        s for s in signals
        if not (s.get("corroboration_count", 1) == 1 and s.get("confidence_label") == "Low")
    ]

    seen_brands: dict[str, int] = {}
    hero = []
    for sig in eligible:
        brand = sig.get("brand", "")
        count = seen_brands.get(brand, 0)
        if count >= max_per_competitor:
            continue
        hero.append(sig)
        seen_brands[brand] = count + 1
        if len(hero) >= max_items:
            break
    return hero


def _select_watch_indicators(signals: list[dict], hero_ids: set, settings: dict) -> list[dict]:
    """Pick 3 slow-burn watch indicators from non-hero signals."""
    cfg = settings.get("hero_briefing", {})
    n = cfg.get("watch_indicators", 3)

    candidates = [
        s for s in signals
        if s["id"] not in hero_ids
        and s.get("priority_band") in ("HIGH", "MEDIUM")
        and s.get("scores", {}).get("composite_priority", 0) >= 40
    ]
    return candidates[:n]


def _action_of_day(hero: list[dict]) -> str:
    if not hero:
        return "Review the full feed for emerging developments and brief the team on any Tier-1 competitive moves."
    top = hero[0]
    action = top.get("analysis", {}).get("suggested_action", "")
    if action:
        return action
    return f"Brief the team on {top['brand']}'s latest {top.get('category','').replace('_',' ').title()} development and define KISNA's response this week."


def generate_markdown_brief(signals: list[dict], settings: dict) -> str:
    today = datetime.now(timezone.utc).strftime("%d %B %Y")
    all_sorted = sorted(signals, key=lambda s: s.get("scores", {}).get("composite_priority", 0), reverse=True)

    hero = _select_hero(all_sorted, settings)
    hero_ids = {s["id"] for s in hero}
    watch = _select_watch_indicators(all_sorted, hero_ids, settings)
    action = _action_of_day(hero)

    threat_count = sum(1 for s in signals if "THREAT_ALERT" in s.get("flags", []))
    opp_count = sum(1 for s in signals if "OPPORTUNITY_ALERT" in s.get("flags", []))
    sig_count = sum(1 for s in signals if s.get("priority_band") in ("HIGH", "MEDIUM"))

    lines = [
        f"# KISNA CMO Intelligence Brief — {today}",
        f"*{len(set(s['brand'] for s in signals))} competitors tracked · {sig_count} significant developments · {threat_count} threat alerts · {opp_count} opportunity alerts*",
        "",
        "---",
        "",
        "## Executive Summary",
        "",
        f"**{len(hero)} significant developments in the last 7 days.**",
        "",
        "### Key Observations",
        "",
    ]

    for i, sig in enumerate(hero, 1):
        band_icon = _emoji_band(sig.get("priority_band", "LOW"))
        why = sig.get("analysis", {}).get("why_it_matters_to_kisna", "")
        conf = sig.get("confidence_label", "Medium")
        lines.append(f"{i}. {band_icon} **{sig['brand']}** — {sig['headline']}  ")
        if why:
            lines.append(f"   *{why}*  ")
        lines.append(f"   Source: [{sig['source']['publisher']}]({sig['source']['url_original']}) · Confidence: {conf} · {sig.get('category','').replace('_',' ').title()}")
        lines.append("")

    lines += [
        "---",
        "",
        "### Potential Implications for KISNA",
        "",
    ]
    for sig in hero[:3]:
        impact = sig.get("analysis", {}).get("possible_impact", "")
        if impact:
            lines.append(f"- **{sig['brand']}:** {impact}")
    lines.append("")

    if any("THREAT_ALERT" in s.get("flags", []) for s in hero):
        lines += ["### ⚠️ Risk Alerts", ""]
        for sig in hero:
            if "THREAT_ALERT" in sig.get("flags", []):
                lines.append(f"- 🔴 **{sig['brand']}** — {sig['headline']} *(Threat Score: {sig['scores']['threat']})*")
        lines.append("")

    if any("OPPORTUNITY_ALERT" in s.get("flags", []) for s in signals):
        lines += ["### ✅ Opportunities", ""]
        for sig in signals:
            if "OPPORTUNITY_ALERT" in sig.get("flags", []):
                lines.append(f"- 🟢 **{sig['brand']}** — {sig['headline']} *(Opportunity Score: {sig['scores']['opportunity']})*")
        lines.append("")

    lines += [
        "---",
        "",
        "### Recommended Executive Attention (Watch List)",
        "",
    ]
    for sig in watch:
        lines.append(f"- **{sig['brand']}** — {sig['headline']} *({sig.get('category','').replace('_',' ').title()})*")
    if not watch:
        lines.append("- No slow-burn indicators above threshold this period.")
    lines.append("")

    lines += [
        "---",
        "",
        "## ⚡ Action of the Day",
        "",
        f"> **{action}**",
        "",
        "---",
        "",
        "## Full Signal Feed",
        "",
        "| # | Brand | Tier | Headline | Category | Confidence | Priority |",
        "|---|---|---|---|---|---|---|",
    ]
    for i, sig in enumerate(all_sorted[:30], 1):
        cat = sig.get("category", "").replace("_", " ").title()
        conf = sig.get("confidence_label", "Med")
        band = sig.get("priority_band", "LOW")
        lines.append(f"| {i} | {sig['brand']} | {sig['tier']} | [{sig['headline'][:60]}...]({sig['source']['url_original']}) | {cat} | {conf} | {band} |")

    lines += [
        "",
        "---",
        f"*Brief generated {today} · KISNA CMO Intelligence War Room · For internal use only.*",
    ]

    return "\n".join(lines)


def save_brief(signals: list[dict], settings: dict) -> Path:
    REPORTS_DIR.mkdir(parents=True, exist_ok=True)
    date_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    out_path = REPORTS_DIR / f"brief_{date_str}.md"
    out_path.write_text(generate_markdown_brief(signals, settings), encoding="utf-8")
    return out_path
