"""
AI Analyst layer — Claude API primary path + deterministic rule-based fallback.
Token-optimized: only HIGH/MEDIUM signals get LLM analysis; LOW uses rules.
Caches by signal ID to avoid re-analysis on re-runs.
"""

import json
import os
import re
import time
from pathlib import Path


PROMPT_PATH = Path(__file__).parent.parent / "prompts" / "analyst_prompt.md"
CACHE_PATH = Path(__file__).parent.parent / "output" / "analysis_cache.json"

# Slim fields passed to LLM — reduces input tokens by ~60%
LLM_SIGNAL_FIELDS = [
    "id", "brand", "tier", "category", "category_family",
    "headline", "summary_2line", "geo", "freshness",
    "scores", "flags", "priority_band",
    "source",
]


def _load_prompt_template() -> str:
    if PROMPT_PATH.exists():
        return PROMPT_PATH.read_text(encoding="utf-8")
    return "Analyze the signal and return JSON with what_happened, why_it_matters_to_kisna, possible_impact, suggested_action."


def _load_cache() -> dict:
    if CACHE_PATH.exists():
        try:
            return json.loads(CACHE_PATH.read_text(encoding="utf-8"))
        except Exception:
            return {}
    return {}


def _save_cache(cache: dict) -> None:
    CACHE_PATH.parent.mkdir(parents=True, exist_ok=True)
    CACHE_PATH.write_text(json.dumps(cache, ensure_ascii=False, indent=2), encoding="utf-8")


def _slim_signal(signal: dict) -> dict:
    return {k: signal[k] for k in LLM_SIGNAL_FIELDS if k in signal}


def _call_claude(slim_signal: dict, prompt_template: str, settings: dict) -> dict | None:
    """Call Claude API. Returns parsed analysis dict or None on failure."""
    try:
        import anthropic
    except ImportError:
        return None

    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        return None

    prompt = prompt_template.replace("{{SIGNAL_JSON}}", json.dumps(slim_signal, ensure_ascii=False, indent=2))

    try:
        client = anthropic.Anthropic(api_key=api_key)
        analysis_cfg = settings.get("analysis", {})
        response = client.messages.create(
            model="claude-haiku-4-5-20251001",  # cost-efficient for structured extraction
            max_tokens=analysis_cfg.get("llm_max_tokens", 400),
            temperature=analysis_cfg.get("llm_temperature", 0.1),
            messages=[{"role": "user", "content": prompt}],
        )
        raw = response.content[0].text.strip()
        # Strip any accidental markdown fences
        raw = re.sub(r"^```(?:json)?\s*", "", raw)
        raw = re.sub(r"\s*```$", "", raw)
        return json.loads(raw)
    except Exception:
        return None


# ── Rule-based fallback analyst ──────────────────────────────────────────────

_CATEGORY_WHAT: dict[str, str] = {
    "CAMPAIGN_LAUNCH": "launched a new marketing campaign",
    "CELEBRITY_AMBASSADOR": "signed a celebrity brand ambassador",
    "BRAND_COLLAB": "announced a brand collaboration",
    "EXPERIENTIAL_ACTIVATION": "hosted an experiential marketing activation",
    "REPOSITIONING_REBRAND": "undertook a brand repositioning or rebrand",
    "COLLECTION_LAUNCH": "launched a new jewellery collection",
    "LAB_GROWN_DIAMOND_MOVE": "made a move in the lab-grown diamond segment",
    "PRICING_OR_SCHEME": "introduced a new pricing scheme or festive offer",
    "PRODUCT_INNOVATION": "announced a product innovation",
    "STORE_OPENING": "opened a new store",
    "STORE_CLOSURE": "closed one or more stores",
    "FRANCHISE_EXPANSION": "expanded its franchise network",
    "FRANCHISE_OPPORTUNITY": "issued an open call for franchise partners",
    "FORMAT_EXPERIMENT": "launched a new store format or concept",
    "GEO_ENTRY": "entered a new geography",
    "DIGITAL_DTC_MOVE": "made a digital or direct-to-consumer move",
    "INFLUENCER_CONTENT": "ran an influencer marketing initiative",
    "SOCIAL_VIRALITY": "experienced a social media viral moment",
    "MARKETPLACE_QCOMMERCE": "expanded into an online marketplace or quick-commerce",
    "ACQUISITION_MNA": "completed or announced an acquisition",
    "FUNDING_IPO_QIP": "raised capital or announced an IPO/QIP",
    "LEADERSHIP_CHANGE": "announced a leadership change",
    "PARTNERSHIP_JV": "formed a strategic partnership or joint venture",
    "FINANCIAL_RESULTS": "announced financial results",
    "REGULATORY_LEGAL": "faced a regulatory or legal development",
    "SENTIMENT_SHIFT": "experienced a notable shift in customer sentiment",
    "COMPLAINT_CLUSTER": "faced a cluster of customer complaints or backlash",
    "AWARD_RECOGNITION": "received an industry award or recognition",
    "CSR_ESG": "announced a CSR or ESG initiative",
    "GENERAL_NEWS": "made a news development",
}

_CATEGORY_WHY: dict[str, str] = {
    "CAMPAIGN_LAUNCH": "This increases share-of-voice in segments where KISNA competes and may shift consumer attention.",
    "CELEBRITY_AMBASSADOR": "A high-profile ambassador accelerates brand recall and puts pressure on KISNA's ambassador strategy.",
    "BRAND_COLLAB": "Cross-brand visibility could attract consumers outside the competitor's existing base into the jewellery category.",
    "FRANCHISE_OPPORTUNITY": "An open franchise call directly competes for the same investor pool KISNA relies on for FOFO expansion.",
    "LAB_GROWN_DIAMOND_MOVE": "Lab-grown pricing pressure directly challenges KISNA's natural-diamond positioning and consumer value perception.",
    "PRICING_OR_SCHEME": "Aggressive schemes reprice category expectations and may divert purchase decisions away from KISNA.",
    "STORE_OPENING": "Physical expansion increases competitor footprint and brand visibility, particularly relevant if in KISNA's overlap markets.",
    "STORE_CLOSURE": "A store closure may signal financial stress or strategic retreat — a potential opportunity to capture the vacated franchise partners or customers.",
    "FRANCHISE_EXPANSION": "Franchise network growth strengthens a competitor's reach and further strains the pool of available franchise partners.",
    "FUNDING_IPO_QIP": "Additional capital typically accelerates store expansion, marketing spend, and talent acquisition — all areas where KISNA competes.",
    "LEADERSHIP_CHANGE": "Leadership transitions can signal strategic pivots that may intensify competition or open negotiation windows for franchise partners.",
    "COMPLAINT_CLUSTER": "A competitor's reputation crisis is a window to win their customers and franchise partners.",
    "SENTIMENT_SHIFT": "Positive or negative sentiment shifts alter competitive brand equity and consumer consideration sets.",
}

_CATEGORY_ACTION: dict[str, str] = {
    "CAMPAIGN_LAUNCH": "Brief the creative and media team to review competitor creative and identify KISNA's differentiated counter-narrative this week.",
    "CELEBRITY_AMBASSADOR": "Evaluate KISNA's current ambassador pipeline and assess if a comparable or complementary signing is strategically timely.",
    "FRANCHISE_OPPORTUNITY": "Alert the franchise development team immediately — reach out proactively to prospective partners in overlapping markets before competitor closes.",
    "LAB_GROWN_DIAMOND_MOVE": "Convene a product-strategy session to define KISNA's lab-grown stance and prepare a CMO-approved holding statement.",
    "PRICING_OR_SCHEME": "Instruct the commercial team to benchmark the competitor's scheme and prepare KISNA's next festive offer counter-response.",
    "STORE_OPENING": "Instruct the retail team to map the competitor's new location against KISNA's franchise pipeline and adjust city priorities if needed.",
    "STORE_CLOSURE": "Assign BD team to reach out to the competitor's franchise partners and customers in affected markets within 48 hours.",
    "FUNDING_IPO_QIP": "Update competitive war-room with revised expansion timeline projections; brief franchise sales team on likely acceleration.",
    "COMPLAINT_CLUSTER": "Prepare a brand-safety brief and activate customer service monitoring; consider targeted outreach in affected markets.",
    "FRANCHISE_EXPANSION": "Accelerate outreach to uncommitted franchise prospects in cities where the competitor is expanding.",
}


def _rules_analysis(signal: dict) -> dict:
    brand = signal.get("brand", "The competitor")
    cat = signal.get("category", "GENERAL_NEWS")
    headline = signal.get("headline", "")
    confidence = signal.get("scores", {}).get("confidence", 50)
    band = signal.get("priority_band", "MEDIUM")
    geo = signal.get("geo", {})
    geo_str = f"in {geo.get('city') or geo.get('state') or geo.get('region', 'India')}"

    hedge = "If confirmed, " if confidence < 50 else ""
    what_verb = _CATEGORY_WHAT.get(cat, "made a noteworthy development")
    what = f"{brand} {what_verb} {geo_str}. ({headline[:120]}...)" if headline else f"{brand} {what_verb} {geo_str}."

    why = _CATEGORY_WHY.get(cat, f"This development by {brand} (Tier {signal.get('tier',3)}) warrants tracking as it may affect KISNA's competitive position.")

    possible = f"{hedge}{brand}'s action in the {cat.lower().replace('_',' ')} space may affect KISNA's {signal.get('category_family','competitive').lower().replace('_',' ')} landscape, particularly given their Tier {signal.get('tier',3)} status."

    action = _CATEGORY_ACTION.get(cat, f"Flag this {brand} development for the weekly competitive review and assign a team member to monitor follow-up coverage.")

    return {
        "what_happened": what,
        "why_it_matters_to_kisna": why,
        "possible_impact": possible,
        "suggested_action": action,
    }


# ── Public API ────────────────────────────────────────────────────────────────

def analyze_signals(signals: list[dict], settings: dict) -> list[dict]:
    """
    Analyze a list of scored signals. Applies LLM only to HIGH/MEDIUM bands
    (respects llm_bands config) and caches by signal ID.
    Returns signals with analysis and analysis_engine fields populated.
    """
    analysis_cfg = settings.get("analysis", {})
    llm_bands = set(analysis_cfg.get("llm_bands", ["HIGH", "MEDIUM"]))
    use_llm = analysis_cfg.get("mode", "rules") != "rules" or bool(os.environ.get("ANTHROPIC_API_KEY"))
    max_llm = analysis_cfg.get("max_llm_calls_per_run", 30)
    cache_enabled = analysis_cfg.get("cache_analysis", True)

    cache = _load_cache() if cache_enabled else {}
    prompt_template = _load_prompt_template()
    llm_calls = 0
    cache_dirty = False

    for signal in signals:
        sig_id = signal.get("id", "")
        band = signal.get("priority_band", "LOW")

        # Use cache if available
        if cache_enabled and sig_id in cache:
            signal["analysis"] = cache[sig_id]["analysis"]
            signal["analysis_engine"] = cache[sig_id]["engine"]
            continue

        # Decide path
        if use_llm and band in llm_bands and llm_calls < max_llm:
            slim = _slim_signal(signal)
            result = _call_claude(slim, prompt_template, settings)
            if result and all(k in result for k in ("what_happened", "why_it_matters_to_kisna", "possible_impact", "suggested_action")):
                signal["analysis"] = result
                signal["analysis_engine"] = "claude"
                llm_calls += 1
                if cache_enabled:
                    cache[sig_id] = {"analysis": result, "engine": "claude"}
                    cache_dirty = True
                continue

        # Fallback to rules
        signal["analysis"] = _rules_analysis(signal)
        signal["analysis_engine"] = "rules"
        if cache_enabled:
            cache[sig_id] = {"analysis": signal["analysis"], "engine": "rules"}
            cache_dirty = True

    if cache_dirty:
        _save_cache(cache)

    return signals
