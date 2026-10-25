import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'

const Schema = z.object({
  coins: z.record(z.string(), z.object({ price: z.number() })),
})

export function useTokenPrices(ids: string[]) {
  const unique = [...new Set(ids)].sort()
  return useQuery({
    queryKey: ['prices', unique],
    queryFn: async () => {
      const keys = unique.map((id) => `coingecko:${id}`).join(',')
      const res = await fetch(`https://coins.llama.fi/prices/current/${keys}`)
      if (!res.ok) throw new Error('Price request failed')
      const { coins } = Schema.parse(await res.json())
      return Object.fromEntries(
        unique.map((id) => [id, coins[`coingecko:${id}`]?.price]),
      ) as Record<string, number | undefined>
    },
    staleTime: 30_000,
    refetchInterval: 30_000,
    enabled: unique.length > 0,
  })
}