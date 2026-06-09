"""
12+ stdlib unit tests for the KISNA CMO War Room engine.
Tests: parse, classify, score, de-dup, gate, geo, freshness, flags, analyst fallback, export.
Run: python -m pytest tests/ -v   OR   python -m unittest tests/test_engine.py -v
"""

import json
import sys
import unittest
from datetime import datetime, timedelta, timezone
from pathlib import Path

BASE = Path(__file__).parent.parent
sys.path.insert(0, str(BASE))

CONFIG_DIR = BASE / "config"


def _load_json(name: str) -> dict:
    return json.loads((CONFIG_DIR / name).read_text(encoding="utf-8"))


KW_CFG = _load_json("keywords.json")
SETTINGS = _load_json("settings.json")
COMPETITORS = _load_json("competitors.json")


def _make_signal(**overrides) -> dict:
    defaults = {
        "id": "test001",
        "schema_version": "1.0",
        "ingested_at": datetime.now(timezone.utc).isoformat(),
        "published_at": datetime.now(timezone.utc).isoformat(),
        "freshness": "NEW",
        "brand": "BlueStone",
        "brand_aliases_matched": ["BlueStone"],
        "tier": 1,
        "headline": "BlueStone opens new flagship store in Mumbai",
        "summary_2line": "BlueStone has inaugurated a new diamond jewellery showroom in Bandra, Mumbai.",
        "category": "STORE_OPENING",
        "category_family": "C_RETAIL_EXPANSION",
        "classification_rationale": "Matched include terms: store opening",
        "geo": {"region": "West", "state": "Maharashtra", "city": "Mumbai", "gcc": False},
        "source": {
            "publisher": "Economic Times",
            "url_original": "https://economictimes.indiatimes.com/test",
            "url_fallback": "https://economictimes.indiatimes.com/test",
            "reliability": "B",
            "credibility": 2,
        },
        "corroboration_count": 2,
        "scores": {"threat": 0, "opportunity": 0, "confidence": 0, "cmo_salience": 0, "composite_priority": 0},
        "flags": [],
        "priority_band": "LOW",
        "analysis": {},
        "analysis_engine": "rules",
        "last_verified_at": datetime.now(timezone.utc).isoformat(),
    }
    defaults.update(overrides)
    return defaults


class TestClassification(unittest.TestCase):

    def test_store_opening_classified(self):
        from agents.google_news_agent import _classify
        cat, rationale = _classify("BlueStone opens new store in Mumbai", "", KW_CFG["classification_rules"])
        self.assertEqual(cat, "STORE_OPENING")
        self.assertIn("Matched", rationale)

    def test_franchise_opportunity_classified(self):
        from agents.google_news_agent import _classify
        cat, _ = _classify("Tanishq invites franchise opportunity applications", "", KW_CFG["classification_rules"])
        self.assertEqual(cat, "FRANCHISE_OPPORTUNITY")

    def test_lab_grown_classified(self):
        from agents.google_news_agent import _classify
        cat, _ = _classify("CaratLane launches lab grown diamond collection", "", KW_CFG["classification_rules"])
        self.assertEqual(cat, "LAB_GROWN_DIAMOND_MOVE")

    def test_fallback_general_news(self):
        from agents.google_news_agent import _classify
        cat, _ = _classify("BlueStone mentions something random", "", KW_CFG["classification_rules"])
        self.assertEqual(cat, "GENERAL_NEWS")

    def test_exclude_overrides_include(self):
        """FRANCHISE_EXPANSION excludes 'franchise opportunity' — check no cross-contamination."""
        from agents.google_news_agent import _classify
        cat, _ = _classify("BlueStone franchise opportunity partner call", "", KW_CFG["classification_rules"])
        self.assertEqual(cat, "FRANCHISE_OPPORTUNITY")


class TestScoring(unittest.TestCase):

    def _score(self, sig: dict) -> dict:
        from scoring.scoring_model import score_signal
        return score_signal(sig, KW_CFG, SETTINGS)

    def test_tier1_threat_higher_than_tier3(self):
        t1 = self._score(_make_signal(tier=1))
        t3 = self._score(_make_signal(tier=3, id="test002"))
        self.assertGreater(t1["scores"]["threat"], t3["scores"]["threat"])

    def test_geo_overlap_boosts_threat(self):
        overlap = self._score(_make_signal(geo={"region": "West", "state": "Maharashtra", "city": "Mumbai", "gcc": False}))
        non_overlap = self._score(_make_signal(id="test003", geo={"region": "East", "state": "West Bengal", "city": "Kolkata", "gcc": False}))
        self.assertGreaterEqual(overlap["scores"]["threat"], non_overlap["scores"]["threat"])

    def test_composite_between_0_100(self):
        sig = self._score(_make_signal())
        for key in ("threat", "opportunity", "confidence", "cmo_salience", "composite_priority"):
            self.assertGreaterEqual(sig["scores"][key], 0)
            self.assertLessEqual(sig["scores"][key], 100)

    def test_threat_alert_gated_by_confidence(self):
        """Low confidence should prevent THREAT_ALERT even with high threat base."""
        sig = _make_signal(
            source={"publisher": "Unknown Blog", "url_original": "http://x.com", "url_fallback": "http://x.com", "reliability": "F", "credibility": 5},
            corroboration_count=1,
            tier=1,
        )
        scored = self._score(sig)
        self.assertNotIn("THREAT_ALERT", scored["flags"])

    def test_opportunity_alert_for_store_closure(self):
        sig = _make_signal(
            id="closure001",
            category="STORE_CLOSURE",
            category_family="C_RETAIL_EXPANSION",
            tier=1,
            corroboration_count=3,
            source={"publisher": "Economic Times", "url_original": "http://et.com", "url_fallback": "http://et.com", "reliability": "B", "credibility": 2},
        )
        scored = self._score(sig)
        self.assertGreater(scored["scores"]["opportunity"], 0)

    def test_franchise_opportunity_high_threat(self):
        sig = _make_signal(id="fran001", category="FRANCHISE_OPPORTUNITY", category_family="C_RETAIL_EXPANSION", tier=1)
        scored = self._score(sig)
        self.assertGreater(scored["scores"]["threat"], 50)

    def test_priority_band_high(self):
        sig = _make_signal(tier=1, category="FRANCHISE_OPPORTUNITY")
        scored = self._score(sig)
        self.assertIn(scored["priority_band"], ("HIGH", "MEDIUM"))


class TestFreshness(unittest.TestCase):

    def test_new_freshness(self):
        from scoring.scoring_model import derive_freshness
        pub = datetime.now(timezone.utc).isoformat()
        self.assertEqual(derive_freshness(pub, SETTINGS), "NEW")

    def test_fresh_freshness(self):
        from scoring.scoring_model import derive_freshness
        pub = (datetime.now(timezone.utc) - timedelta(hours=48)).isoformat()
        self.assertEqual(derive_freshness(pub, SETTINGS), "FRESH")

    def test_archive_freshness(self):
        from scoring.scoring_model import derive_freshness
        pub = (datetime.now(timezone.utc) - timedelta(days=8)).isoformat()
        self.assertEqual(derive_freshness(pub, SETTINGS), "ARCHIVE")

    def test_none_published_at(self):
        from scoring.scoring_model import derive_freshness
        result = derive_freshness(None, SETTINGS)
        self.assertIn(result, ("NEW", "FRESH", "RECENT", "ARCHIVE"))


class TestDeduplication(unittest.TestCase):

    def test_sha1_id_stable(self):
        from agents.google_news_agent import _sha1_id
        id1 = _sha1_id("BlueStone opens store", "Economic Times", "2026-06-09T00:00:00Z")
        id2 = _sha1_id("BlueStone opens store", "Economic Times", "2026-06-09T12:00:00Z")
        self.assertEqual(id1, id2)  # same date portion → same id

    def test_sha1_id_different_for_different_headlines(self):
        from agents.google_news_agent import _sha1_id
        id1 = _sha1_id("BlueStone opens store in Mumbai", "ET", "2026-06-09")
        id2 = _sha1_id("BlueStone opens store in Delhi", "ET", "2026-06-09")
        self.assertNotEqual(id1, id2)


class TestGeoTagging(unittest.TestCase):

    def test_maharashtra_detected(self):
        from agents.google_news_agent import _geo_tag
        geo = _geo_tag("BlueStone opens new store in Pune, Maharashtra", KW_CFG["geo_states"])
        self.assertEqual(geo["state"], "Maharashtra")
        self.assertFalse(geo["gcc"])

    def test_gcc_detected(self):
        from agents.google_news_agent import _geo_tag
        geo = _geo_tag("Malabar Gold expands to Dubai with new showroom", KW_CFG["geo_states"])
        self.assertTrue(geo["gcc"])

    def test_no_geo(self):
        from agents.google_news_agent import _geo_tag
        geo = _geo_tag("Brand announces new ambassador", KW_CFG["geo_states"])
        self.assertIsNone(geo["state"])


class TestAnalystFallback(unittest.TestCase):

    def test_rules_analyst_returns_four_keys(self):
        from agents.analyst import _rules_analysis
        sig = _make_signal()
        result = _rules_analysis(sig)
        for key in ("what_happened", "why_it_matters_to_kisna", "possible_impact", "suggested_action"):
            self.assertIn(key, result)
            self.assertIsInstance(result[key], str)
            self.assertGreater(len(result[key]), 10)

    def test_analyze_signals_no_llm(self):
        """With mode=rules, all signals should be analyzed via rules path."""
        no_llm_settings = json.loads(json.dumps(SETTINGS))
        no_llm_settings["analysis"]["mode"] = "rules"
        no_llm_settings["analysis"]["cache_analysis"] = False

        from agents.analyst import analyze_signals
        sigs = [_make_signal(id=f"t{i}") for i in range(3)]
        result = analyze_signals(sigs, no_llm_settings)
        for sig in result:
            self.assertEqual(sig["analysis_engine"], "rules")
            self.assertIn("what_happened", sig["analysis"])


class TestConfigValidity(unittest.TestCase):

    def test_all_competitors_have_required_fields(self):
        for comp in COMPETITORS["competitors"]:
            for field in ("id", "brand", "tier", "aliases", "segments", "relevance_rationale"):
                self.assertIn(field, comp, f"Missing '{field}' in {comp.get('brand', '?')}")

    def test_tier_values_valid(self):
        for comp in COMPETITORS["competitors"]:
            self.assertIn(comp["tier"], [1, 2, 3])

    def test_settings_weights_sum_to_1(self):
        w = SETTINGS["scoring"]["composite_weights"]
        total = sum(w.values())
        self.assertAlmostEqual(total, 1.0, places=5)


if __name__ == "__main__":
    unittest.main(verbosity=2)
