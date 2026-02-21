import { useState, useRef } from "react";

const GEMINI_API_KEY = import.meta.env?.VITE_GEMINI_API_KEY || "";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

const C = {
  bg:"#07071a",card:"#0e0e2a",border:"#1e1e45",teal:"#00d4aa",purple:"#7c3aed",
  purpleLight:"#a855f7",purpleDim:"#1a1040",text:"#dde0f0",muted:"#5a5a80",
  danger:"#f04060",warning:"#f59e0b",success:"#10b981",white:"#ffffff",
};
const S = {
  app:{minHeight:"100vh",background:C.bg,fontFamily:"'Segoe UI',Arial,sans-serif",color:C.text},
  content:{maxWidth:1000,margin:"0 auto",padding:"0 20px 60px"},
  card:{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:22,marginBottom:18},
  cardTitle:{fontSize:15,fontWeight:700,color:C.white,marginBottom:14,display:"flex",alignItems:"center",gap:8},
  grid2:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14},
  btn:{width:"100%",padding:13,background:`linear-gradient(135deg,${C.purple},${C.teal})`,border:"none",borderRadius:12,color:C.white,fontSize:14,fontWeight:700,cursor:"pointer",marginTop:10},
  input:{width:"100%",height:180,background:"#05050f",border:`1px solid ${C.border}`,borderRadius:12,padding:14,color:C.text,fontFamily:"inherit",fontSize:12,lineHeight:1.6,resize:"vertical",outline:"none",boxSizing:"border-box"},
  tipRow:{display:"flex",gap:10,padding:"8px 0",borderBottom:`1px solid ${C.border}`,fontSize:13,color:C.text,lineHeight:1.5},
  otcBox:{background:"#08081a",border:`1px solid ${C.border}`,borderRadius:10,padding:"12px 14px",marginBottom:8},
};

const PROMPT = `You are JeevikaAI — India's free AI Health Report Translator. Interpret Indian pathology lab reports (Metropolis, Dr. Lal PathLabs, SRL, Thyrocare, AIIMS) for Indian patients. Use simple Hindi-English, Indian dietary context (dal, roti, sabzi, chaas), Indian OTC brands (Shelcal, Limcee, Supradyn, Zincovit, Revital), and ICMR guidelines. Never diagnose. Flag critical values needing doctor visits.

IMPORTANT: Respond ONLY with valid raw JSON — no markdown, no backticks, no explanation.

{"healthScore":<0-100>,"summary":"<2-3 sentences>","critical":[{"marker":"name","value":"reading","meaning":"simple explanation","urgency":"high or medium"}],"normal":[{"marker":"name","value":"reading"}],"diet":["tip1","tip2","tip3","tip4"],"exercise":["rec1","rec2","rec3"],"otc":[{"name":"Indian brand","reason":"why","note":"caveat"}],"followUp":"<when to retest>","voiceScript":"<4-5 warm sentences starting with Namaste>","redFlags":["urgent warning or empty"]}`;

const SAMPLE=`METROPOLIS HEALTHCARE — MEDICAL LABORATORY REPORT
Patient: Mr. Rajan Mehta | Age: 48Y | Sex: Male | Date: 21/04/2025

THYROID: T3: 0.72 ng/mL [Ref: 0.84–2.02] LOW | T4: 4.2 µg/dL [Ref: 5.1–14.1] LOW | TSH: 9.8 µIU/mL [Ref: 0.54–5.3] HIGH
CBC: Hemoglobin: 10.2 g/dL [Ref: 13.0–17.0] LOW | WBC: 7200 NORMAL | MCV: 72 fL LOW
LIPID: Cholesterol: 218 mg/dL HIGH | LDL: 148 HIGH | HDL: 38 LOW | TG: 186 HIGH
SUGAR: Fasting Glucose: 108 mg/dL PRE-DIABETIC | HbA1c: 5.9% PRE-DIABETIC
VITAMINS: Vitamin D3: 14.2 ng/mL DEFICIENT | B12: 198 pg/mL LOW | Iron: 54 µg/dL LOW`;

function toBase64(file){return new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result.split(",")[1]);r.onerror=rej;r.readAsDataURL(file);})}

function Spin({msg}){
  const[r,setR]=useState(0);
  useState(()=>{const id=setInterval(()=>setR(p=>p+15),50);return()=>clearInterval(id);});
  return(<div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:14,padding:40}}>
    <div style={{width:44,height:44,border:`3px solid ${C.border}`,borderTop:`3px solid ${C.teal}`,borderRadius:"50%",transform:`rotate(${r}deg)`}}/>
    <div style={{color:C.muted,fontSize:13}}>{msg||"🧠 Analyzing..."}</div>
  </div>);
}

function UploadZone({onFile,file,onClear}){
  const ref=useRef();const[drag,setDrag]=useState(false);
  if(file)return(
    <div style={{border:`1px solid rgba(0,212,170,.3)`,borderRadius:12,padding:16,background:"rgba(0,212,170,.05)",display:"flex",alignItems:"center",gap:14,marginBottom:14}}>
      <div style={{fontSize:32,flexShrink:0}}>{file.type.startsWith("image/")?"🖼️":"📄"}</div>
      <div style={{flex:1}}>
        <div style={{fontSize:13,fontWeight:600,color:C.white}}>{file.name}</div>
        <div style={{fontSize:11,color:C.muted,marginTop:2}}>{(file.size/1024).toFixed(1)} KB · {file.type}</div>
        <div style={{fontSize:11,color:C.teal,marginTop:4}}>✓ Ready to analyze</div>
      </div>
      <button onClick={onClear} style={{background:"rgba(240,64,96,.12)",border:`1px solid rgba(240,64,96,.2)`,color:C.danger,borderRadius:8,padding:"6px 12px",fontSize:12,cursor:"pointer",fontWeight:600}}>✕ Remove</button>
    </div>
  );
  return(
    <div onDragOver={e=>{e.preventDefault();setDrag(true);}} onDragLeave={()=>setDrag(false)} onDrop={e=>{e.preventDefault();setDrag(false);const f=e.dataTransfer.files[0];if(f)onFile(f);}} onClick={()=>ref.current.click()}
      style={{border:`2px dashed ${drag?C.teal:C.border}`,borderRadius:12,padding:"32px 20px",textAlign:"center",background:drag?"rgba(0,212,170,.05)":C.card,cursor:"pointer",transition:"all .2s",marginBottom:14}}>
      <input ref={ref} type="file" accept=".pdf,image/*" onChange={e=>{if(e.target.files[0])onFile(e.target.files[0]);}} style={{display:"none"}}/>
      <div style={{fontSize:36,marginBottom:10}}>📁</div>
      <div style={{fontSize:14,fontWeight:700,color:C.white,marginBottom:6}}>Drop your lab report here</div>
      <div style={{fontSize:12,color:C.muted,marginBottom:14}}>or click to browse — PDF, JPG, PNG supported</div>
      <div style={{display:"flex",gap:8,justifyContent:"center",flexWrap:"wrap"}}>
        {["📄 PDF","🖼️ JPG / PNG","📸 Phone photo of report"].map(t=>(
          <span key={t} style={{fontSize:11,background:C.purpleDim,border:`1px solid ${C.border}`,color:C.muted,padding:"4px 10px",borderRadius:20}}>{t}</span>
        ))}
      </div>
    </div>
  );
}

export default function App(){
  const[mode,setMode]=useState("upload");
  const[text,setText]=useState(SAMPLE);
  const[file,setFile]=useState(null);
  const[preview,setPreview]=useState(null);
  const[loading,setLoading]=useState(false);
  const[loadMsg,setLoadMsg]=useState("");
  const[result,setResult]=useState(null);
  const[error,setError]=useState(null);
  const[speaking,setSpeaking]=useState(false);

  const noKey=!GEMINI_API_KEY||GEMINI_API_KEY==="YOUR_GEMINI_API_KEY_HERE";

  function handleFile(f){
    setFile(f);setResult(null);setError(null);
    if(f.type.startsWith("image/")){setPreview(URL.createObjectURL(f));}else{setPreview(null);}
  }

  async function analyze(){
    setLoading(true);setError(null);setResult(null);
    try{
      let parts=[];
      if(mode==="upload"&&file){
        setLoadMsg("📂 Reading your file...");
        const b64=await toBase64(file);
        setLoadMsg("🧠 Gemini AI reading report...");
        parts=[{inline_data:{mime_type:file.type,data:b64}},{text:PROMPT+"\n\nAnalyze the lab report shown."}];
      }else{
        setLoadMsg("🧠 Analyzing text...");
        parts=[{text:PROMPT+"\n\nReport:\n"+text}];
      }
      setLoadMsg("⚙️ Generating insights...");
      const res=await fetch(GEMINI_URL,{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({contents:[{parts}],generationConfig:{temperature:0.3,maxOutputTokens:2000}})});
      const data=await res.json();
      if(data.error)throw new Error(data.error.message);
      const raw=data.candidates?.[0]?.content?.parts?.[0]?.text||"";
      const match=raw.replace(/```json|```/g,"").match(/\{[\s\S]*\}/);
      if(!match)throw new Error("Could not parse AI response.");
      setResult(JSON.parse(match[0]));
    }catch(e){setError(e.message);}
    setLoading(false);setLoadMsg("");
  }

  function speak(){
    if(!result?.voiceScript)return;
    if(speaking){window.speechSynthesis.cancel();setSpeaking(false);return;}
    const u=new SpeechSynthesisUtterance(result.voiceScript);
    u.lang="en-IN";u.rate=0.88;
    const v=window.speechSynthesis.getVoices().find(v=>v.lang.includes("IN"));
    if(v)u.voice=v;
    u.onstart=()=>setSpeaking(true);u.onend=()=>setSpeaking(false);
    window.speechSynthesis.speak(u);
  }

  const sc=s=>s>=70?C.success:s>=50?C.warning:C.danger;
  const canAnalyze=!loading&&!noKey&&(mode==="paste"?text.trim():file);

  return(
    <div style={S.app}><div style={S.content}>

      {/* HEADER */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"20px 0 24px",borderBottom:`1px solid ${C.border}`,marginBottom:24,flexWrap:"wrap",gap:12}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <svg width="34" height="34" viewBox="0 0 34 34">
            <path d="M17 3C10 3 4 9 4 16c0 6 4 10 13 15 9-5 13-9 13-15 0-7-6-13-13-13z" fill="none" stroke="url(#g)" strokeWidth="2"/>
            <path d="M10 16L13 11L17 20L20 12L24 16" stroke="#00d4aa" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            <defs><linearGradient id="g" x1="0" y1="0" x2="34" y2="34"><stop offset="0%" stopColor="#00d4aa"/><stop offset="100%" stopColor="#7c3aed"/></linearGradient></defs>
          </svg>
          <span style={{fontSize:22,fontWeight:800,color:C.white}}>Jeevika<span style={{color:C.teal}}>AI</span></span>
          <span style={{background:"rgba(0,212,170,.15)",border:`1px solid rgba(0,212,170,.3)`,color:C.teal,fontSize:10,fontWeight:700,padding:"3px 10px",borderRadius:20,letterSpacing:1}}>FREE & OPEN SOURCE</span>
        </div>
        <div style={{fontSize:11,color:C.muted,background:C.purpleDim,padding:"5px 12px",borderRadius:20}}>⚡ Gemini 2.0 Flash · Free</div>
      </div>

      {/* NO KEY WARNING */}
      {noKey&&<div style={{padding:"16px 20px",background:"rgba(245,158,11,.08)",border:`1px solid rgba(245,158,11,.3)`,borderRadius:12,marginBottom:18}}>
        <div style={{fontSize:14,fontWeight:700,color:C.warning,marginBottom:6}}>⚠️ Add Your Free Gemini API Key</div>
        <div style={{fontSize:12,color:C.text,lineHeight:1.9}}>
          1. Go to <strong style={{color:C.teal}}>aistudio.google.com</strong> → Sign in with Google<br/>
          2. Click <strong>"Get API Key"</strong> → Create key → Copy (starts with AIza...)<br/>
          3. In .env file: <code style={{color:C.teal}}>VITE_GEMINI_API_KEY=AIza...</code><br/>
          4. Restart: <code style={{color:C.teal}}>npm run dev</code> — 100% free, no credit card
        </div>
      </div>}

      {/* INPUT CARD */}
      <div style={S.card}>
        <div style={S.cardTitle}>🧪 Upload or Paste Your Lab Report</div>

        {/* MODE TOGGLE */}
        <div style={{display:"flex",gap:4,background:"#05050f",border:`1px solid ${C.border}`,borderRadius:10,padding:4,marginBottom:16}}>
          {[["upload","📁 Upload File (PDF / Photo)"],["paste","📋 Paste Text"]].map(([m,label])=>(
            <button key={m} onClick={()=>{setMode(m);setResult(null);setError(null);}} style={{flex:1,padding:"9px 12px",borderRadius:8,border:"none",cursor:"pointer",fontWeight:600,fontSize:12,fontFamily:"inherit",background:mode===m?C.purple:"transparent",color:mode===m?C.white:C.muted}}>
              {label}
            </button>
          ))}
        </div>

        {mode==="upload"?(
          <>
            <UploadZone onFile={handleFile} file={file} onClear={()=>{setFile(null);setPreview(null);}}/>
            {preview&&<div style={{marginBottom:14,borderRadius:10,overflow:"hidden",border:`1px solid ${C.border}`,maxHeight:300,textAlign:"center"}}>
              <img src={preview} alt="Report preview" style={{maxWidth:"100%",maxHeight:300,objectFit:"contain",background:"#fff"}}/>
            </div>}
            <div style={{fontSize:11,color:C.muted,padding:"10px 14px",background:C.purpleDim,borderRadius:8,lineHeight:1.7}}>
              💡 <strong style={{color:C.text}}>For best results:</strong> Photo should be clear, well-lit, and include all test values. Works with any printed or handwritten Indian lab report.
            </div>
          </>
        ):(
          <>
            <div style={{fontSize:11,color:C.muted,marginBottom:8}}>Sample: Mr. Rajan Mehta — Metropolis Healthcare</div>
            <textarea style={S.input} value={text} onChange={e=>setText(e.target.value)} placeholder="Paste your lab report text here..."/>
          </>
        )}

        <button style={{...S.btn,opacity:canAnalyze?1:0.5,cursor:canAnalyze?"pointer":"not-allowed"}} onClick={analyze} disabled={!canAnalyze}>
          {loading?`⏳ ${loadMsg}`:mode==="upload"?"⚡ Analyze Uploaded Report — Free":"⚡ Analyze Report Text — Free"}
        </button>
      </div>

      {loading&&<div style={S.card}><Spin msg={loadMsg}/></div>}

      {error&&<div style={{padding:"14px 18px",background:"rgba(240,64,96,.07)",border:`1px solid rgba(240,64,96,.2)`,borderRadius:12,color:C.danger,fontSize:13,marginBottom:14,lineHeight:1.6}}>
        <div style={{fontWeight:700,marginBottom:4}}>⚠️ Error</div>
        {error}
        <div style={{marginTop:8,fontSize:11,color:C.muted}}>Check: API key is correct · File is readable · Try paste text mode if upload fails</div>
      </div>}

      {result&&<>
        {/* SCORE */}
        <div style={{...S.card,background:`linear-gradient(135deg,rgba(124,58,237,.1),rgba(0,212,170,.05))`}}>
          <div style={{display:"flex",gap:22,alignItems:"center",flexWrap:"wrap"}}>
            <div style={{textAlign:"center",flexShrink:0}}>
              <div style={{width:92,height:92,borderRadius:"50%",background:`conic-gradient(${sc(result.healthScore)} ${result.healthScore*3.6}deg,${C.border} 0deg)`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto"}}>
                <div style={{width:74,height:74,borderRadius:"50%",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column"}}>
                  <div style={{fontSize:22,fontWeight:800,color:sc(result.healthScore)}}>{result.healthScore}</div>
                  <div style={{fontSize:8,color:C.muted,letterSpacing:1}}>SCORE</div>
                </div>
              </div>
              <div style={{fontSize:11,fontWeight:700,color:sc(result.healthScore),marginTop:6}}>
                {result.healthScore>=70?"GOOD":result.healthScore>=50?"NEEDS ATTENTION":"CRITICAL"}
              </div>
            </div>
            <div style={{flex:1,minWidth:200}}>
              <div style={{fontSize:17,fontWeight:700,color:C.white,marginBottom:8}}>Health Summary</div>
              <div style={{fontSize:13,lineHeight:1.75,color:C.text}}>{result.summary}</div>
              {result.followUp&&<div style={{marginTop:10,padding:"7px 12px",background:C.purpleDim,borderRadius:8,fontSize:11,color:C.purpleLight}}>📅 {result.followUp}</div>}
            </div>
          </div>
        </div>

        {result.redFlags?.filter(Boolean).length>0&&<div style={{padding:"12px 16px",background:"rgba(240,64,96,.07)",border:`1px solid rgba(240,64,96,.2)`,borderRadius:10,color:C.danger,fontSize:13,marginBottom:14,fontWeight:600}}>🚨 {result.redFlags.join(" | ")}</div>}

        {result.critical?.length>0&&<div style={S.card}>
          <div style={S.cardTitle}>⚠️ Markers Needing Attention</div>
          {result.critical.map((m,i)=>(
            <div key={i} style={{display:"flex",alignItems:"flex-start",gap:10,padding:"10px 14px",borderRadius:10,marginBottom:8,background:m.urgency==="high"?"rgba(240,64,96,.07)":"rgba(245,158,11,.06)",border:`1px solid ${m.urgency==="high"?"rgba(240,64,96,.2)":"rgba(245,158,11,.2)"}`}}>
              <div style={{width:8,height:8,borderRadius:"50%",background:m.urgency==="high"?C.danger:C.warning,marginTop:5,flexShrink:0}}/>
              <div style={{flex:1}}>
                <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
                  <span style={{fontWeight:600,fontSize:13,color:C.white}}>{m.marker}</span>
                  <span style={{fontSize:11,background:"rgba(255,255,255,.07)",padding:"2px 8px",borderRadius:20}}>{m.value}</span>
                </div>
                <div style={{fontSize:12,color:C.muted,marginTop:3,lineHeight:1.5}}>{m.meaning}</div>
              </div>
              <span style={{fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:20,background:m.urgency==="high"?"rgba(240,64,96,.18)":"rgba(245,158,11,.18)",color:m.urgency==="high"?C.danger:C.warning,whiteSpace:"nowrap"}}>{m.urgency?.toUpperCase()}</span>
            </div>
          ))}
        </div>}

        {result.normal?.length>0&&<div style={S.card}>
          <div style={S.cardTitle}>✅ Normal Results</div>
          <div style={S.grid2}>
            {result.normal.map((m,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 12px",background:"rgba(16,185,129,.06)",border:`1px solid rgba(16,185,129,.15)`,borderRadius:8}}>
                <div style={{width:8,height:8,borderRadius:"50%",background:C.success,flexShrink:0}}/>
                <span style={{flex:1,fontSize:12}}>{m.marker}</span>
                <span style={{fontSize:11,color:C.success}}>{m.value}</span>
              </div>
            ))}
          </div>
        </div>}

        <div style={S.grid2}>
          <div style={S.card}>
            <div style={S.cardTitle}>🥗 Indian Diet Plan</div>
            {result.diet?.map((t,i)=><div key={i} style={S.tipRow}><span>🍱</span><span>{t}</span></div>)}
          </div>
          <div style={S.card}>
            <div style={S.cardTitle}>🏃 Exercise Plan</div>
            {result.exercise?.map((t,i)=><div key={i} style={S.tipRow}><span>💪</span><span>{t}</span></div>)}
          </div>
        </div>

        {result.otc?.length>0&&<div style={S.card}>
          <div style={S.cardTitle}>💊 OTC Supplements (Indian brands)</div>
          <div style={S.grid2}>
            {result.otc.map((item,i)=>(
              <div key={i} style={S.otcBox}>
                <div style={{fontWeight:700,fontSize:13,color:C.teal}}>{item.name}</div>
                <div style={{fontSize:12,color:C.text,marginTop:4}}>{item.reason}</div>
                {item.note&&<div style={{fontSize:11,color:C.warning,marginTop:4}}>⚠️ {item.note}</div>}
              </div>
            ))}
          </div>
        </div>}

        {result.voiceScript&&<div style={{background:`linear-gradient(135deg,rgba(0,212,170,.07),rgba(124,58,237,.07))`,border:`1px solid rgba(0,212,170,.2)`,borderRadius:14,padding:20,marginBottom:18}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12,marginBottom:12}}>
            <div>
              <div style={{fontWeight:700,color:C.teal,fontSize:14}}>🎙️ Voice Explanation (en-IN)</div>
              <div style={{fontSize:11,color:C.muted,marginTop:2}}>Hear your report in Indian English</div>
            </div>
            <button onClick={speak} style={{background:speaking?C.danger:C.teal,color:C.bg,border:"none",padding:"9px 20px",borderRadius:8,fontWeight:700,fontSize:13,cursor:"pointer"}}>
              {speaking?"⏹ Stop":"▶ Play"}
            </button>
          </div>
          <div style={{fontSize:13,color:C.text,lineHeight:1.75,fontStyle:"italic",borderTop:`1px solid ${C.border}`,paddingTop:12}}>
            "{result.voiceScript}"
          </div>
        </div>}

        <div style={{padding:"12px 16px",background:C.purpleDim,border:`1px solid rgba(124,58,237,.25)`,borderRadius:10,fontSize:12,color:C.muted,textAlign:"center"}}>
          ⚕️ JeevikaAI is for educational purposes only. Always consult a qualified doctor for diagnosis and treatment.
        </div>
      </>}

    </div></div>
  );
}
