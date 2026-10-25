import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'
import type { Token } from '../config/tokens'

const Schema = z.object({
  result: z.record(
    z.string(),
    z.object({
      is_honeypot: z.string().optional(),
      buy_tax: z.string().optional(),
      sell_tax: z.string().optional(),
      is_open_source: z.string().optional(),
      is_proxy: z.string().optional(),
    }),
  ),
})

export type SafetyFlags = {
  honeypot: boolean
  buyTax: number
  sellTax: number
  openSource: boolean
  proxy: boolean
}

export function useTokenSafety(token: Token, chainId: number) {
  return useQuery({
    queryKey: ['safety', chainId, token.address],
    enabled: !!token.address,
    staleTime: 10 * 60_000,
    queryFn: async (): Promise<SafetyFlags | null> => {
      const url = `https://api.gopluslabs.io/api/v1/token_security/${chainId}?contract_addresses=${token.address}`
      const res = await fetch(url)
      if (!res.ok) throw new Error('Safety scan failed')
      const { result } = Schema.parse(await res.json())
      const r = result[token.address!.toLowerCase()]
      if (!r) return null
      return {
        honeypot: r.is_honeypot === '1',
        buyTax: Number(r.buy_tax || 0),
        sellTax: Number(r.sell_tax || 0),
        openSource: r.is_open_source === '1',
        proxy: r.is_proxy === '1',
      }
    },
  })
}

export function riskLevel(f: SafetyFlags): 'high' | 'medium' | 'low' {
  if (f.honeypot || f.sellTax > 0.3) return 'high'
  if (!f.openSource || f.buyTax > 0.05 || f.sellTax > 0.05) return 'medium'
  return 'low'
}