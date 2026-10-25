import { useQuery } from '@tanstack/react-query'
import { useChainId } from 'wagmi'
import type { Token } from '../config/tokens'
import { riskLevel, useTokenSafety, type SafetyFlags } from '../hooks/useTokenSafety'

function describe(f: SafetyFlags) {
  const parts: string[] = []
  if (f.honeypot) parts.push('Flagged as a honeypot: you may not be able to sell it.')
  if (f.sellTax > 0.05) parts.push(`Sell tax is ${(f.sellTax * 100).toFixed(0)}%.`)
  if (f.buyTax > 0.05) parts.push(`Buy tax is ${(f.buyTax * 100).toFixed(0)}%.`)
  if (!f.openSource) parts.push('Contract source is not verified.')
  return parts.length ? parts.join(' ') : 'No major red flags found by the scan.'
}

const styles = {
  high: 'bg-red-500/15 text-red-400',
  medium: 'bg-amber-500/15 text-amber-400',
  low: 'bg-emerald-500/15 text-emerald-400',
}

export function SafetyPanel({ token }: { token: Token }) {
  const chainId = useChainId()
  const scan = useTokenSafety(token, chainId)
  const flags = scan.data

  const explain = useQuery({
    queryKey: ['explain', chainId, token.address, flags],
    enabled: !!flags,
    staleTime: Infinity,
    retry: false,
    queryFn: async () => {
      const res = await fetch('/api/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chainId, flags }),
      })
      if (!res.ok) throw new Error('explain failed')
      const data = (await res.json()) as { summary?: string }
      return data.summary ?? ''
    },
  })

  if (scan.isLoading) {
    return <div className='mt-3 h-14 animate-pulse rounded-xl bg-zinc-800' />
  }
  if (scan.isError || !flags) {
    return (
      <div className='mt-3 rounded-xl border border-zinc-800 p-3 text-sm text-zinc-400'>
        Scan unavailable. Treat {token.symbol} as unverified.
      </div>
    )
  }

  const level = riskLevel(flags)
  return (
    <div className='mt-3 rounded-xl border border-zinc-800 p-3 text-sm'>
      <div className='flex items-center justify-between'>
        <span className='text-zinc-300'>Safety check: {token.symbol}</span>
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${styles[level]}`}>
          {level === 'low' ? 'Low risk' : level === 'medium' ? 'Caution' : 'High risk'}
        </span>
      </div>
      <p className='mt-2 text-zinc-400'>{explain.data || describe(flags)}</p>
      <p className='mt-1 text-xs text-zinc-600'>Automated scan, not a guarantee.</p>
    </div>
  )
}