import { ChevronDown } from 'lucide-react'
import type { Token } from '../config/tokens'
import { sanitizeAmount } from '../lib/amount'

const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

type Props = {
  label: string
  token: Token
  amount: string
  onAmountChange?: (value: string) => void
  onSelectToken: () => void
  balanceText?: string | null
  onMax?: () => void
  usdValue?: number | null
  readOnly?: boolean
}

export function TokenInput({
  label, token, amount, onAmountChange, onSelectToken,
  balanceText, onMax, usdValue, readOnly,
}: Props) {
  return (
    <div className='bg-zinc-950 border border-zinc-800 rounded-2xl p-4'>
      <div className='flex justify-between text-sm text-zinc-400 mb-3'>
        <span>{label}</span>
        {balanceText && (
          <span>
            Balance: {balanceText}
            {onMax && (
              <button type='button' onClick={onMax} className='text-violet-400 hover:text-violet-300 ml-2'>
                Max
              </button>
            )}
          </span>
        )}
      </div>

      <div className='flex items-center gap-3'>
        <input
          inputMode='decimal'
          placeholder='0'
          value={amount}
          readOnly={readOnly}
          aria-label={`${label} amount`}
          onChange={(e) => {
            const next = sanitizeAmount(e.target.value, token.decimals)
            if (next !== null) onAmountChange?.(next)
          }}
          className='flex-1 min-w-0 bg-transparent text-3xl outline-none placeholder:text-zinc-600'
        />
        <button
          type='button'
          onClick={onSelectToken}
          className='flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 px-3 py-2 rounded-xl transition-colors'
        >
          <span className='font-medium'>{token.symbol}</span>
          <ChevronDown size={16} className='text-zinc-400' />
        </button>
      </div>

      <div className='mt-2 h-5 text-sm text-zinc-500'>
        {usdValue != null && usdValue > 0 ? `≈ ${usd.format(usdValue)}` : ''}
      </div>
    </div>
  )
}