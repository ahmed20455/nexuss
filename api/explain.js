/* global process, console */
import { GoogleGenAI } from '@google/genai'
import { z } from 'zod'

const ALLOWED_CHAINS = [1, 8453, 42161, 10]

const Body = z
  .object({
    chainId: z.number().refine((id) => ALLOWED_CHAINS.includes(id)),
    flags: z
      .object({
        honeypot: z.boolean(),
        buyTax: z.number().min(0).max(1),
        sellTax: z.number().min(0).max(1),
        openSource: z.boolean(),
        proxy: z.boolean(),
      })
      .strict(),
  })
  .strict()

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return res.status(503).json({ error: 'Explanation unavailable' })
  }

  const parsed = Body.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid input' })
  }

  try {
    const ai = new GoogleGenAI({ apiKey })
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents:
        'Explain this token risk data to a retail crypto user in at most 2 plain sentences. ' +
        'Taxes are fractions (0.1 means 10%). Do not give financial advice. Data: ' +
        JSON.stringify(parsed.data),
    })
    return res.status(200).json({ summary: response.text ?? '' })
  } catch (err) {
    console.error('Gemini call failed:', err?.message ?? err)
    return res.status(502).json({ error: 'Explanation unavailable' })
  }
}