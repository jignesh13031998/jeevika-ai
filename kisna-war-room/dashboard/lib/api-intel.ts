import type { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs'
import path from 'path'
import { IntelDataset } from './types'

const LIVE_PATH = path.join(process.cwd(), '..', 'output', 'signals_enriched.json')
const BUNDLED_PATH = path.join(process.cwd(), 'public', 'signals_bundled.json')

export default function handler(req: NextApiRequest, res: NextApiResponse<IntelDataset | { error: string }>) {
  res.setHeader('Cache-Control', 'no-store, max-age=0')

  try {
    // CIW_PREFER_LIVE=1 → serve freshest local run
    const preferLive = process.env.CIW_PREFER_LIVE === '1'

    let dataPath = BUNDLED_PATH

    if (preferLive && fs.existsSync(LIVE_PATH)) {
      dataPath = LIVE_PATH
    } else if (!fs.existsSync(BUNDLED_PATH)) {
      // Last resort: serve from live path if bundled missing
      if (fs.existsSync(LIVE_PATH)) {
        dataPath = LIVE_PATH
      } else {
        return res.status(404).json({ error: 'No dataset found. Run: python run.py --mock to generate one.' })
      }
    }

    const raw = fs.readFileSync(dataPath, 'utf-8')
    const data: IntelDataset = JSON.parse(raw)
    return res.status(200).json(data)
  } catch (err) {
    return res.status(500).json({ error: `Failed to load dataset: ${(err as Error).message}` })
  }
}
