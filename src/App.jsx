# JeevikaAI 🫀
### Free & Open Source Indian Health Report Translator

> Paste any Indian lab report — Metropolis, Dr. Lal, Thyrocare, SRL — and get instant plain-language explanation, Indian diet tips, OTC advice, and voice explanation in seconds. **Completely free. Forever.**

![JeevikaAI Banner](https://img.shields.io/badge/JeevikaAI-Free%20%26%20Open%20Source-00d4aa?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-7c3aed?style=for-the-badge)
![Made in India](https://img.shields.io/badge/Made%20in-India%20🇮🇳-f59e0b?style=for-the-badge)

---

## ✨ Features
- 🧠 **AI-powered** report interpretation (Google Gemini 1.5 Flash — free)
- 🎙️ **Voice explanation** in Indian English (en-IN)
- 💊 **Indian OTC supplement** suggestions (Shelcal, Limcee, Supradyn...)
- 🥗 **Indian diet recommendations** (dal, sabzi, ragi, chaas...)
- 📊 **Health Score** (0–100) with visual ring
- 🔬 Works with **Metropolis, Dr. Lal PathLabs, SRL, Thyrocare, AIIMS**
- ✅ No login. No paywall. No credit card.

---

## 🚀 Quick Start (5 minutes)

### 1. Get Free API Key
Go to **[aistudio.google.com](https://aistudio.google.com)** → Get API Key → Create key. Free, no credit card.

### 2. Clone & Install
```bash
git clone https://github.com/YOUR_USERNAME/jeevika-ai
cd jeevika-ai
npm install
```

### 3. Add Your Key
```bash
cp .env.example .env
# Open .env → replace YOUR_GEMINI_API_KEY_HERE with your key
```

### 4. Run Locally
```bash
npm run dev
# Opens at http://localhost:5173
```

---

## 🌐 Deploy to Vercel (Free)
```bash
# Option 1: Via CLI
npx vercel --prod

# Option 2: Via Dashboard
# vercel.com → New Project → Import GitHub repo
# Settings → Environment Variables → add VITE_GEMINI_API_KEY
```

---

## 💰 Cost Breakdown
| Service | Cost |
|---|---|
| Vercel Hosting | Free |
| Google Gemini API | Free (1M tokens/day) |
| Domain (optional) | ~₹800/year |
| **Total** | **₹0 / month** |

---

## 🤝 Contributing
PRs welcome! Some ideas:
- [ ] PDF/image upload with OCR
- [ ] Hindi, Tamil, Bengali UI language
- [ ] Progress tracker across reports
- [ ] WhatsApp bot integration
- [ ] Doctor referral system

---

## ⚕️ Disclaimer
JeevikaAI is not a substitute for medical advice. Always consult a qualified doctor for diagnosis and treatment. This tool is for educational purposes only.

---

## 📄 License
MIT — free to use, modify, distribute.

**#ReportPadhegaINDIA** 🇮🇳
