import { useState } from 'react'
import { X } from 'lucide-react'
import { erc20Abi, getAddress, isAddress, zeroAddress } from 'viem'
import { useReadContracts } from 'wagmi'
import type { Token } from '../config/tokens'

type Props = {
  tokens: Token[]
  onSelect: (token: Token) => void
  onClose: () => void
}

const short = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`

export function TokenSelector({ tokens, onSelect, onClose }: Props) {
  const [query, setQuery] = useState('')
  const q = query.trim()
  const valid = isAddress(q)
  const target = valid ? getAddress(q) : zeroAddress

  const { data, isLoading } = useReadContracts({
    contracts: [
      { address: target, abi: erc20Abi, functionName: 'symbol' },
      { address: target, abi: erc20Abi, functionName: 'name' },
      { address: target, abi: erc20Abi, functionName: 'decimals' },
    ],
    query: { enabled: valid },
  })

  const imported: Token | null =
    valid && data && data.every((r) => r.status === 'success')
      ? {
          symbol: String(data[0].result).slice(0, 12),
          name: String(data[1].result).slice(0, 40),
          decimals: Number(data[2].result),
          address: target,
        }
      : null

  const lower = q.toLowerCase()
  const filtered = valid
    ? []
    : tokens.filter(
        (t) => t.symbol.toLowerCase().includes(lower) || t.name.toLowerCase().includes(lower),
      )

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
      <div className='absolute inset-0 bg-black/60 backdrop-blur-sm' onClick={onClose} />
      <div className='relative bg-zinc-900 border border-zinc-700 rounded-3xl w-full max-w-md overflow-hidden'>
        <div className='flex items-center justify-between p-4 border-b border-zinc-800'>
          <h3 className='font-medium'>Select a token</h3>
          <button onClick={onClose} aria-label='Close' className='p-1 hover:bg-zinc-800 rounded-lg'>
            <X size={20} />
          </button>
        </div>

        <div className='p-3'>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder='Search or paste a token address (0x…)'
            aria-label='Search token'
            className='w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm outline-none'
          />
        </div>

        <div className='max-h-80 overflow-y-auto p-2'>
          {filtered.map((token) => (
            <button
              key={token.address ?? 'native'}
              onClick={() => onSelect(token)}
              className='w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-zinc-800 transition-colors text-left'
            >
              <div className='w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-sm font-medium'>
                {token.symbol.slice(0, 2)}
              </div>
              <div>
                <div className='font-medium'>{token.symbol}</div>
                <div className='text-sm text-zinc-400'>
                  {token.name}
                  {token.address ? ` · ${short(token.address)}` : ''}
                </div>
              </div>
            </button>
          ))}

          {valid && isLoading && <p className='p-4 text-sm text-zinc-400'>Reading token…</p>}
          {valid && !isLoading && !imported && (
            <p className='p-4 text-sm text-zinc-400'>
              Not a valid ERC-20 token on this network.
            </p>
          )}
          {imported && (
            <button
              onClick={() => onSelect(imported)}
              className='w-full text-left px-4 py-3 rounded-xl hover:bg-zinc-800'
            >
              <div className='font-medium'>
                Import {imported.symbol}{' '}
                <span className='text-amber-400 text-xs'>Unverified</span>
              </div>
              <div className='text-sm text-zinc-400'>
                {imported.name} · {short(target)}
              </div>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}