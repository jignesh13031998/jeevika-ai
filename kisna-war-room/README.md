# KISNA CMO Intelligence War Room

A production-grade competitive intelligence command center for KISNA Diamond & Gold Jewellery.

## Run commands

### Phase 1 — Python engine (stdlib only, no key required)
```bash
# Mock mode (offline, for demo/testing)
python run.py --mock --no-llm

# Live RSS sweep (public internet, no key)
python run.py --no-llm

# Live with Claude analyst (requires ANTHROPIC_API_KEY)
export ANTHROPIC_API_KEY=sk-ant-...
python run.py
```

### Tests (26 tests, all green)
```bash
python -m unittest tests/test_engine.py -v
```

### Phase 3 — Dashboard
```bash
cd dashboard
npm install
npm run dev      # dev server → http://localhost:3000
npm run build    # production build (Vercel-deployable)
```

### Live data mode (optional)
After running `python run.py --mock`, set `CIW_PREFER_LIVE=1` in the dashboard environment to serve the latest local run:
```bash
cd dashboard
CIW_PREFER_LIVE=1 npm run dev
```

## Deploy to Vercel
```
cd dashboard
vercel deploy
```

## Config (zero code changes for re-tiering)
- `config/competitors.json` — 9 brands, tiers, aliases, geo, segment rationale
- `config/keywords.json` — query templates, classification rules, CMO-salience weights
- `config/sources.json` — RSS locales, outlet reliability grading
- `config/settings.json` — thresholds, alert gates, blink window, LLM caps

## Architecture
See `KISNA_CMO_WAR_ROOM_ARCHITECTURE.md` for the full spec.
