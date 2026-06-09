"""
Deterministic scoring engine. Pure functions — same input always yields same output.
Four independent 1-100 scores feed one composite priority score.
"""

import math
from datetime import datetime, timezone
from typing import Any


def _clamp(value: float, lo: float = 0.0, hi: float = 100.0) -> float:
    return max(lo, min(hi, value))


def score_threat(signal: dict, config: dict, settings: dict) -> float:
    """
    Threat = category_base × tier_multiplier × geo_overlap × segment_overlap
             × recency_decay × keyword_boost
    """
    kw = config.get("classification_rules", {})
    cat = signal.get("category", "GENERAL_NEWS")
    cat_cfg = kw.get(cat, kw.get("GENERAL_NEWS", {}))
    base = cat_cfg.get("base_weight", 30)

    tier = signal.get("tier", 3)
    tier_mult = settings["scoring"]["tier_multipliers"].get(str(tier), 0.5)

    geo = signal.get("geo", {})
    overlap_states = config.get("kisna_overlap_states", [])
    geo_boost = 1.0
    if geo.get("state") in overlap_states or geo.get("gcc"):
        geo_boost = settings["scoring"]["geo_overlap_boost"]

    seg_overlap = 0.0
    family = cat_cfg.get("family", "")
    if family in ("B_PRODUCT_PRICING", "C_RETAIL_EXPANSION"):
        seg_overlap = settings["scoring"]["segment_overlap_boost"]
    else:
        seg_overlap = 1.0

    freshness = signal.get("freshness", "RECENT")
    decay = settings["scoring"]["recency_decay"].get(freshness, 0.5)

    # keyword_boost: franchise opportunity = highest threat
    kb = 1.0
    if cat == "FRANCHISE_OPPORTUNITY":
        kb = 1.3
    elif cat in ("LAB_GROWN_DIAMOND_MOVE", "PRICING_OR_SCHEME"):
        kb = 1.15
    elif cat == "STORE_OPENING" and (geo.get("state") in overlap_states):
        kb = 1.2

    raw = base * tier_mult * geo_boost * seg_overlap * decay * kb

    # opportunity categories don't score high on threat
    if cat in ("STORE_CLOSURE", "COMPLAINT_CLUSTER", "AWARD_RECOGNITION"):
        raw *= 0.4

    return _clamp(raw)


def score_opportunity(signal: dict, config: dict, settings: dict) -> float:
    """
    Opportunity rises for rival weakness: closures, exits, churn, backlash,
    open franchise calls (a partner KISNA could win instead).
    """
    cat = signal.get("category", "GENERAL_NEWS")
    tier = signal.get("tier", 3)
    tier_mult = settings["scoring"]["tier_multipliers"].get(str(tier), 0.5)

    opportunity_categories = {
        "FRANCHISE_OPPORTUNITY": 90,
        "STORE_CLOSURE": 80,
        "COMPLAINT_CLUSTER": 75,
        "LEADERSHIP_CHANGE": 60,
        "SENTIMENT_SHIFT": 55,
        "REGULATORY_LEGAL": 65,
        "FINANCIAL_RESULTS": 40,
    }

    base = opportunity_categories.get(cat, 15)
    freshness = signal.get("freshness", "RECENT")
    decay = settings["scoring"]["recency_decay"].get(freshness, 0.5)

    raw = base * tier_mult * decay
    return _clamp(raw)


def score_confidence(signal: dict, settings: dict) -> float:
    """
    Confidence = source_reliability × corroboration_count × structural_completeness
    """
    reliability_scores = {"A": 1.0, "B": 0.85, "C": 0.55, "D": 0.35, "E": 0.15, "F": 0.05}
    src = signal.get("source", {})
    rel = src.get("reliability", "D")
    rel_score = reliability_scores.get(rel, 0.35)

    corroboration = min(signal.get("corroboration_count", 1), 5)
    corr_boost = 0.7 + (corroboration - 1) * 0.075  # 0.7 for 1 source → 1.0 for 5 sources
    corr_boost = _clamp(corr_boost, 0.5, 1.0)

    # structural completeness: has published_at, geo state, headline
    completeness = 0.7
    if signal.get("published_at"):
        completeness += 0.1
    if signal.get("geo", {}).get("state"):
        completeness += 0.1
    if signal.get("headline") and len(signal["headline"]) > 20:
        completeness += 0.1

    raw = rel_score * corr_boost * completeness * 100
    return _clamp(raw)


def score_cmo_salience(signal: dict, config: dict, settings: dict) -> float:
    """
    CMO-Salience weights brand/reputation families highest; corporate lowest.
    Configurable via classification_rules[cat].cmo_salience_weight.
    """
    kw = config.get("classification_rules", {})
    cat = signal.get("category", "GENERAL_NEWS")
    cat_cfg = kw.get(cat, kw.get("GENERAL_NEWS", {}))
    base = cat_cfg.get("cmo_salience_weight", 35)

    tier = signal.get("tier", 3)
    tier_mult = settings["scoring"]["tier_multipliers"].get(str(tier), 0.5)

    # tier 1 = full salience; tier 2 = 75%; tier 3 = 50%
    raw = base * (0.6 + tier_mult * 0.4)
    return _clamp(raw)


def compute_composite(scores: dict, settings: dict) -> float:
    w = settings["scoring"]["composite_weights"]
    raw = (
        w["threat"] * scores["threat"]
        + w["opportunity"] * scores["opportunity"]
        + w["cmo_salience"] * scores["cmo_salience"]
        + w["confidence"] * scores["confidence"]
    )
    # confidence gate: cannot be HIGH on threat alone if confidence is Low
    if scores["confidence"] < 40 and scores["threat"] > 60:
        raw *= 0.7
    return _clamp(raw)


def derive_flags(scores: dict, settings: dict) -> list[str]:
    flags = []
    ag = settings["alert_gates"]
    if scores["threat"] >= ag["THREAT_ALERT"]["threat_min"] and scores["confidence"] >= ag["THREAT_ALERT"]["confidence_min"]:
        flags.append("THREAT_ALERT")
    if scores["opportunity"] >= ag["OPPORTUNITY_ALERT"]["opportunity_min"] and scores["confidence"] >= ag["OPPORTUNITY_ALERT"]["confidence_min"]:
        flags.append("OPPORTUNITY_ALERT")
    return flags


def derive_priority_band(composite: float, settings: dict) -> str:
    bands = settings["scoring"]["priority_bands"]
    if composite >= bands["HIGH_min"]:
        return "HIGH"
    if composite >= bands["MEDIUM_min"]:
        return "MEDIUM"
    return "LOW"


def derive_freshness(published_at: str | None, settings: dict) -> str:
    if not published_at:
        return "RECENT"
    try:
        pub = datetime.fromisoformat(published_at.replace("Z", "+00:00"))
        now = datetime.now(timezone.utc)
        hours = (now - pub).total_seconds() / 3600
        fb = settings["freshness_bands"]
        if hours <= fb["NEW_hours"]:
            return "NEW"
        if hours <= fb["FRESH_hours"]:
            return "FRESH"
        if hours <= fb["RECENT_days"] * 24:
            return "RECENT"
        return "ARCHIVE"
    except Exception:
        return "RECENT"


def score_signal(signal: dict, kw_config: dict, settings: dict) -> dict:
    """Compute and attach all four scores + composite + flags + band to signal."""
    freshness = derive_freshness(signal.get("published_at"), settings)
    signal["freshness"] = freshness

    scores = {
        "threat": round(score_threat(signal, kw_config, settings), 1),
        "opportunity": round(score_opportunity(signal, kw_config, settings), 1),
        "confidence": round(score_confidence(signal, settings), 1),
        "cmo_salience": round(score_cmo_salience(signal, kw_config, settings), 1),
        "composite_priority": 0.0,
    }
    scores["composite_priority"] = round(compute_composite(scores, settings), 1)

    signal["scores"] = scores
    signal["flags"] = derive_flags(scores, settings)
    signal["priority_band"] = derive_priority_band(scores["composite_priority"], settings)
    return signal
