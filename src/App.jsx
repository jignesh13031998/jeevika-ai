import { useState } from "react";

// ═══════════════════════════════════════════════════════
// JEEVIKA AI — Free Indian Health Report Translator
// AI: Google Gemini 1.5 Flash (FREE — no credit card)
// Get key: aistudio.google.com → Get API Key
// ═══════════════════════════════════════════════════════

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

const C = {
  bg: "#07071a", card: "#0e0e2a", border: "#1e1e45",
  teal: "#00d4aa", purple: "#7c3aed", purpleLight: "#a855f7",
  purpleDim: "#1a1040", text: "#dde0f0", muted: "#5a5a80",
  danger: "#f04060", warning: "#f59e0b", success: "#10b981", white: "#ffffff",
};

const S = {
  app: { minHeight: "100vh", background: C.bg, fontFamily: "'Segoe UI', Arial, sans-serif", color: C.text },
  content: { maxWidth: 1000, margin: "0 auto", padding: "0 20px 60px" },
  card: { background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 22, marginBottom: 18 },
  cardTitle: { fontSize: 15, fontWeight: 700, color: C.white, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 },
  btn: { width: "100%", padding: 13, background: `linear-gradient(135deg,${C.purple},${C.teal})`, border: "none", borderRadius: 12, color: C.white, fontSize: 14, fontWeight: 700, cursor: "pointer", marginTop: 10 },
  input: { width: "100%", height: 200, background: "#05050f", border: `1px solid ${C.border}`, borderRadius: 12, padding: 14, color: C.text, fontFamily: "inherit", fontSize: 12, lineHeight: 1.6, resize: "vertical", outline: "none", boxSizing: "border-box" },
  tipRow: { display: "flex", gap: 10, padding: "8px 0", borderBottom: `1px solid ${C.border}`, fontSize: 13, color: C.text, lineHeight: 1.5 },
  otcBox: { background: "#08081a", border: `1px solid ${C.border}`, borderRadius: 10, padding: "12px 14px", marginBottom: 8 },
};

const SYSTEM_PROMPT = `You are JeevikaAI — India's free, open-source AI Health Report Translator. You interpret Indian pathology lab reports (Metropolis, Dr. Lal PathLabs, SRL, Thyrocare, AIIMS) for everyday Indian patients — completely free.

Use simple Hindi-English, Indian dietary context (dal, roti, sabzi, chaas, etc.), Indian OTC brands (Shelcal, Limcee, Supradyn, Zincovit, etc.), and ICMR guidelines. Never diagnose. Flag critical values needing immediate doctor visits.

IMPORTANT: Respond ONLY with valid JSON. No markdown. No explanation. No backticks. Just raw JSON.

{
  "healthScore": <integer 0-100>,
  "summary": "<2-3 sentence plain English summary>",
  "critical": [{"marker":"name","value":"reading","meaning":"simple explanation","urgency":"high or medium"}],
  "normal": [{"marker":"name","value":"reading"}],
  "diet": ["Indian diet tip 1","tip 2","tip 3","tip 4"],
  "exercise": ["recommendation 1","rec 2","rec 3"],
  "otc": [{"name":"Indian brand name","reason":"why needed","note":"important caveat"}],
  "followUp": "<when to retest and see doctor>",
  "voiceScript": "<4-5 warm sentences starting with Namaste, explain in simple language as if talking to a family member>",
  "redFlags": ["urgent warning if critical values present, else empty array"]
}`;

const SAMPLE = `METROPOLIS HEALTHCARE — MEDICAL LABORATORY REPORT
Patient: Mr. Rajan Mehta | Age: 48Y | Sex: Male
Date: 21/04/2025 | Doctor: Dr. S. Kulkarni

THYROID PROFILE
T3: 0.72 ng/mL [Ref: 0.84–2.02] LOW
T4: 4.2 µg/dL [Ref: 5.1–14.1] LOW
TSH: 9.8 µIU/mL [Ref: 0.54–5.3] HIGH

COMPLETE BLOOD COUNT
Hemoglobin: 10.2 g/dL [Ref: 13.0–17.0] LOW
WBC: 7200 /µL [Ref: 4000–11000] NORMAL
Platelets: 210000 /µL NORMAL
MCV: 72 fL [Ref: 83–101] LOW

LIPID PROFILE
Total Cholesterol: 218 mg/dL [Ref: <200] HIGH
LDL: 148 mg/dL [Ref: <130] HIGH
HDL: 38 mg/dL [Ref: >40] LOW
Triglycerides: 186 mg/dL [Ref: <150] HIGH

BLOOD SUGAR
Fasting Glucose: 108 mg/dL [Ref: 70–100] PRE-DIABETIC
HbA1c: 5.9% [Ref: <5.7%] PRE-DIABETIC

VITAMINS & MINERALS
Vitamin D3: 14.2 ng/mL [Ref: 30–100] DEFICIENT
Vitamin B12: 198 pg/mL [Ref: ≥211] LOW
Serum Iron: 54 µg/dL [Ref: 60–170] LOW`;

function Spin() {
  const [r, setR] = useState(0);
  useState(() => {
    const id = setInterval(() => setR(p => p + 15), 50);
    return () => clearInterval(id);
  });
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, padding: 40 }}>
      <div style={{ width: 44, height: 44, border: `3px solid ${C.border}`, borderTop: `3px solid ${C.teal}`, borderRadius: "50%", transform: `rotate(${r}deg)` }} />
      <div style={{ color: C.muted, fontSize: 13 }}>🧠 Gemini AI is analyzing your report...</div>
    </div>
  );
}

export default function App() {
  const [text, setText] = useState(SAMPLE);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [speaking, setSpeaking] = useState(false);

  const noKey = !GEMINI_API_KEY || GEMINI_API_KEY === "YOUR_GEMINI_API_KEY_HERE";

  async function analyze() {
    setLoading(true); setError(null); setResult(null);
    try {
      const res = await fetch(GEMINI_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: SYSTEM_PROMPT + "\n\nReport:\n" + text }] }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 2000 }
        })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
      const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      const match = raw.replace(/```json|```/g, "").match(/\{[\s\S]*\}/);
      if (!match) throw new Error("Invalid response format");
      setResult(JSON.parse(match[0]));
    } catch (e) {
      setError(`Error: ${e.message}`);
    }
    setLoading(false);
  }

  function speak() {
    if (!result?.voiceScript) return;
    if (speaking) { window.speechSynthesis.cancel(); setSpeaking(false); return; }
    const u = new SpeechSynthesisUtterance(result.voiceScript);
    u.lang = "en-IN"; u.rate = 0.88;
    const v = window.speechSynthesis.getVoices().find(v => v.lang.includes("IN"));
    if (v) u.voice = v;
    u.onstart = () => setSpeaking(true);
    u.onend = () => setSpeaking(false);
    window.speechSynthesis.speak(u);
  }

  const sc = s => s >= 70 ? C.success : s >= 50 ? C.warning : C.danger;

  return (
    <div style={S.app}>
      <div style={S.content}>

        {/* HEADER */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 0 24px", borderBottom: `1px solid ${C.border}`, marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <svg width="34" height="34" viewBox="0 0 34 34">
              <path d="M17 3C10 3 4 9 4 16c0 6 4 10 13 15 9-5 13-9 13-15 0-7-6-13-13-13z" fill="none" stroke="url(#g)" strokeWidth="2" />
              <path d="M10 16L13 11L17 20L20 12L24 16" stroke="#00d4aa" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              <defs><linearGradient id="g" x1="0" y1="0" x2="34" y2="34"><stop offset="0%" stopColor="#00d4aa" /><stop offset="100%" stopColor="#7c3aed" /></linearGradient></defs>
            </svg>
            <span style={{ fontSize: 22, fontWeight: 800, color: C.white }}>Jeevika<span style={{ color: C.teal }}>AI</span></span>
            <span style={{ background: "rgba(0,212,170,.15)", border: `1px solid rgba(0,212,170,.3)`, color: C.teal, fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 20, letterSpacing: 1 }}>FREE & OPEN SOURCE</span>
          </div>
          <div style={{ fontSize: 11, color: C.muted, background: C.purpleDim, padding: "5px 12px", borderRadius: 20 }}>
            ⚡ Google Gemini 1.5 Flash · Free
          </div>
        </div>

        {/* NO KEY WARNING */}
        {noKey && (
          <div style={{ padding: "16px 20px", background: "rgba(245,158,11,.08)", border: `1px solid rgba(245,158,11,.3)`, borderRadius: 12, marginBottom: 18 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.warning, marginBottom: 6 }}>⚠️ API Key Missing</div>
            <div style={{ fontSize: 12, color: C.text, lineHeight: 1.8 }}>
              Add <code style={{ color: C.teal }}>VITE_GEMINI_API_KEY</code> to your <code style={{ color: C.teal }}>.env</code> file.<br />
              Get free key at: <strong>aistudio.google.com</strong> → Get API Key → No credit card needed.
            </div>
          </div>
        )}

        {/* HERO */}
        <div style={{ background: `linear-gradient(135deg,rgba(0,212,170,.1),rgba(124,58,237,.07))`, border: `1px solid rgba(0,212,170,.2)`, borderRadius: 16, padding: 26, marginBottom: 20, textAlign: "center" }}>
          <div style={{ fontSize: 26, fontWeight: 800, color: C.white, lineHeight: 1.25, marginBottom: 10 }}>
            Your Blood Report, <span style={{ color: C.teal }}>Explained Free</span>
          </div>
          <div style={{ fontSize: 13, color: C.muted, maxWidth: 500, margin: "0 auto 14px" }}>
            Paste any Indian lab report. Get instant plain-language explanation, Indian diet tips, OTC advice, and voice explanation. Free forever.
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
            {["✓ No login", "✓ No paywall", "✓ Any Indian lab", "✓ Hindi voice", "✓ ₹0 cost"].map(f => (
              <span key={f} style={{ fontSize: 11, color: C.text, background: C.purpleDim, padding: "5px 12px", borderRadius: 20 }}>{f}</span>
            ))}
          </div>
        </div>

        {/* INPUT */}
        <div style={S.card}>
          <div style={S.cardTitle}>🧪 Paste Your Lab Report</div>
          <div style={{ fontSize: 11, color: C.muted, marginBottom: 8 }}>Sample: Mr. Rajan Mehta — Metropolis Healthcare (Thyroid + CBC + Lipid + Vitamins)</div>
          <textarea style={S.input} value={text} onChange={e => setText(e.target.value)}
            placeholder="Paste report from Metropolis, Dr. Lal PathLabs, SRL, Thyrocare, AIIMS..." />
          <button style={{ ...S.btn, opacity: loading || noKey ? 0.6 : 1, cursor: loading || noKey ? "not-allowed" : "pointer" }}
            onClick={analyze} disabled={loading || !text.trim() || noKey}>
            {loading ? "⏳ Analyzing..." : "⚡ Analyze — Free"}
          </button>
        </div>

        {loading && <div style={S.card}><Spin /></div>}

        {error && (
          <div style={{ padding: "12px 16px", background: "rgba(240,64,96,.07)", border: `1px solid rgba(240,64,96,.2)`, borderRadius: 10, color: C.danger, fontSize: 13, marginBottom: 14 }}>
            ⚠️ {error}
          </div>
        )}

        {result && <>
          {/* SCORE */}
          <div style={{ ...S.card, background: `linear-gradient(135deg,rgba(124,58,237,.1),rgba(0,212,170,.05))` }}>
            <div style={{ display: "flex", gap: 22, alignItems: "center", flexWrap: "wrap" }}>
              <div style={{ textAlign: "center", flexShrink: 0 }}>
                <div style={{ width: 92, height: 92, borderRadius: "50%", background: `conic-gradient(${sc(result.healthScore)} ${result.healthScore * 3.6}deg,${C.border} 0deg)`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto" }}>
                  <div style={{ width: 74, height: 74, borderRadius: "50%", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: sc(result.healthScore) }}>{result.healthScore}</div>
                    <div style={{ fontSize: 8, color: C.muted, letterSpacing: 1 }}>SCORE</div>
                  </div>
                </div>
                <div style={{ fontSize: 11, fontWeight: 700, color: sc(result.healthScore), marginTop: 6 }}>
                  {result.healthScore >= 70 ? "GOOD" : result.healthScore >= 50 ? "NEEDS ATTENTION" : "CRITICAL"}
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 17, fontWeight: 700, color: C.white, marginBottom: 8 }}>Health Summary</div>
                <div style={{ fontSize: 13, lineHeight: 1.75, color: C.text }}>{result.summary}</div>
                {result.followUp && (
                  <div style={{ marginTop: 10, padding: "7px 12px", background: C.purpleDim, borderRadius: 8, fontSize: 11, color: C.purpleLight }}>
                    📅 {result.followUp}
                  </div>
                )}
              </div>
            </div>
          </div>

          {result.redFlags?.filter(Boolean).length > 0 && (
            <div style={{ padding: "12px 16px", background: "rgba(240,64,96,.07)", border: `1px solid rgba(240,64,96,.2)`, borderRadius: 10, color: C.danger, fontSize: 13, marginBottom: 14 }}>
              🚨 {result.redFlags.join(" | ")}
            </div>
          )}

          {result.critical?.length > 0 && (
            <div style={S.card}>
              <div style={S.cardTitle}>⚠️ Markers Needing Attention</div>
              {result.critical.map((m, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 14px", borderRadius: 10, marginBottom: 8, background: m.urgency === "high" ? "rgba(240,64,96,.07)" : "rgba(245,158,11,.06)", border: `1px solid ${m.urgency === "high" ? "rgba(240,64,96,.2)" : "rgba(245,158,11,.2)"}` }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: m.urgency === "high" ? C.danger : C.warning, marginTop: 5, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                      <span style={{ fontWeight: 600, fontSize: 13, color: C.white }}>{m.marker}</span>
                      <span style={{ fontSize: 11, background: "rgba(255,255,255,.07)", padding: "2px 8px", borderRadius: 20 }}>{m.value}</span>
                    </div>
                    <div style={{ fontSize: 12, color: C.muted, marginTop: 3, lineHeight: 1.5 }}>{m.meaning}</div>
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: m.urgency === "high" ? "rgba(240,64,96,.18)" : "rgba(245,158,11,.18)", color: m.urgency === "high" ? C.danger : C.warning, whiteSpace: "nowrap" }}>
                    {m.urgency?.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          )}

          {result.normal?.length > 0 && (
            <div style={S.card}>
              <div style={S.cardTitle}>✅ Normal Results</div>
              <div style={S.grid2}>
                {result.normal.map((m, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: "rgba(16,185,129,.06)", border: `1px solid rgba(16,185,129,.15)`, borderRadius: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.success, flexShrink: 0 }} />
                    <span style={{ flex: 1, fontSize: 12 }}>{m.marker}</span>
                    <span style={{ fontSize: 11, color: C.success }}>{m.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={S.grid2}>
            <div style={S.card}>
              <div style={S.cardTitle}>🥗 Indian Diet Plan</div>
              {result.diet?.map((t, i) => <div key={i} style={S.tipRow}><span>🍱</span><span>{t}</span></div>)}
            </div>
            <div style={S.card}>
              <div style={S.cardTitle}>🏃 Exercise Plan</div>
              {result.exercise?.map((t, i) => <div key={i} style={S.tipRow}><span>💪</span><span>{t}</span></div>)}
            </div>
          </div>

          {result.otc?.length > 0 && (
            <div style={S.card}>
              <div style={S.cardTitle}>💊 OTC Supplements (Indian brands)</div>
              <div style={S.grid2}>
                {result.otc.map((item, i) => (
                  <div key={i} style={S.otcBox}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: C.teal }}>{item.name}</div>
                    <div style={{ fontSize: 12, color: C.text, marginTop: 4 }}>{item.reason}</div>
                    {item.note && <div style={{ fontSize: 11, color: C.warning, marginTop: 4 }}>⚠️ {item.note}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.voiceScript && (
            <div style={{ background: `linear-gradient(135deg,rgba(0,212,170,.07),rgba(124,58,237,.07))`, border: `1px solid rgba(0,212,170,.2)`, borderRadius: 14, padding: 20, marginBottom: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 12 }}>
                <div>
                  <div style={{ fontWeight: 700, color: C.teal, fontSize: 14 }}>🎙️ Voice Explanation (en-IN)</div>
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>Hear your report explained in Indian English</div>
                </div>
                <button onClick={speak} style={{ background: speaking ? C.danger : C.teal, color: C.bg, border: "none", padding: "9px 20px", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                  {speaking ? "⏹ Stop" : "▶ Play"}
                </button>
              </div>
              <div style={{ fontSize: 13, color: C.text, lineHeight: 1.75, fontStyle: "italic", borderTop: `1px solid ${C.border}`, paddingTop: 12 }}>
                "{result.voiceScript}"
              </div>
            </div>
          )}

          <div style={{ padding: "12px 16px", background: C.purpleDim, border: `1px solid rgba(124,58,237,.25)`, borderRadius: 10, fontSize: 12, color: C.muted, textAlign: "center" }}>
            ⚕️ JeevikaAI is not a substitute for medical advice. Always consult a qualified doctor for diagnosis and treatment.
          </div>
        </>}
      </div>
    </div>
  );
}
