import { useState } from 'react'
import { useAccount, useBalance, useChainId } from 'wagmi'
import { ArrowDownUp } from 'lucide-react'
import { TokenInput } from './TokenInput'
import { TokenSelector } from './TokenSelector'
import { SafetyPanel } from './SafetyPanel'
import { DEFAULT_CHAIN_ID, TOKENS_BY_CHAIN, type Token } from '../config/tokens'
import { useTokenPrices } from '../hooks/useTokenPrices'
import { formatEstimate, getMaxAmount, toUnits } from '../lib/amount'

// Tokens are identified by contract address, never by symbol,
// so an imported scam token named "USDC" can't pass as the real one.
const keyOf = (t: Token) => t.address?.toLowerCase() ?? 'native'

export function SwapCard() {
    const { address, isConnected } = useAccount()
    const chainId = useChainId()
    const tokens = TOKENS_BY_CHAIN[chainId] ?? TOKENS_BY_CHAIN[DEFAULT_CHAIN_ID]

    const [custom, setCustom] = useState<Record<number, Token[]>>({})
    const [fromKey, setFromKey] = useState('native')
    const [toKey, setToKey] = useState<string | null>(null)
    const [fromAmount, setFromAmount] = useState('')
    const [selecting, setSelecting] = useState<'from' | 'to' | null>(null)

    const imports = custom[chainId] ?? []
    const allTokens = [...tokens, ...imports]
    const isImported = (t: Token) => imports.some((i) => keyOf(i) === keyOf(t))

    const fromToken = allTokens.find((t) => keyOf(t) === fromKey) ?? tokens[0]
    const toToken = allTokens.find((t) => keyOf(t) === toKey) ?? tokens[1]

    const { data: balance } = useBalance({
        address,
        token: fromToken.address ?? undefined,
    })

    // Imported tokens have no coingeckoId, so only price the ones that do
    const { data: prices, isError: pricesError } = useTokenPrices(
        [fromToken.coingeckoId, toToken.coingeckoId].filter((x): x is string => !!x),
    )

    const fromPrice = fromToken.coingeckoId ? prices?.[fromToken.coingeckoId] : undefined
    const toPrice = toToken.coingeckoId ? prices?.[toToken.coingeckoId] : undefined
    const hasPriceData = !!fromToken.coingeckoId && !!toToken.coingeckoId

    const fromNumber = Number(fromAmount) || 0
    const fromUsd = fromPrice ? fromNumber * fromPrice : null
    const toNumber = fromPrice && toPrice ? (fromNumber * fromPrice) / toPrice : 0
    const toUsd = toPrice ? toNumber * toPrice : null
    const toAmount = formatEstimate(toNumber)
    const rate = fromPrice && toPrice ? fromPrice / toPrice : null

    const units = toUnits(fromAmount, fromToken.decimals)
    const insufficient = !!balance && units !== null && units > balance.value

    const handleFlip = () => {
        setFromKey(keyOf(toToken))
        setToKey(keyOf(fromToken))
        setFromAmount(toAmount)
    }

    const handleSelect = (token: Token) => {
        // Remember newly imported tokens for this chain
        if (!allTokens.some((t) => keyOf(t) === keyOf(token))) {
            setCustom((c) => ({ ...c, [chainId]: [...(c[chainId] ?? []), token] }))
        }

        if (selecting === 'from') {
            if (keyOf(token) === keyOf(toToken)) setToKey(keyOf(fromToken))
            setFromKey(keyOf(token))
        } else {
            if (keyOf(token) === keyOf(fromToken)) setFromKey(keyOf(toToken))
            setToKey(keyOf(token))
        }
        setSelecting(null)
    }

    const buttonLabel = !isConnected
        ? 'Connect Wallet'
        : !fromNumber
            ? 'Enter an amount'
            : insufficient
                ? 'Insufficient balance'
                : 'Review swap'
    const buttonDisabled = !isConnected || !fromNumber || insufficient

    const rateText = !hasPriceData
        ? 'No price data for imported tokens'
        : pricesError
            ? 'Prices unavailable right now'
            : rate
                ? `1 ${fromToken.symbol} ≈ ${formatEstimate(rate)} ${toToken.symbol} (indicative)`
                : 'Loading prices…'

    return (
        <div className='w-full max-w-md'>
            <div className='bg-zinc-900 border border-zinc-800 rounded-3xl p-4 shadow-xl'>
                <div className='flex items-center justify-between mb-4 px-1'>
                    <h2 className='font-medium text-zinc-300'>Swap</h2>
                </div>

                <TokenInput
                    label='You pay'
                    token={fromToken}
                    amount={fromAmount}
                    onAmountChange={setFromAmount}
                    onSelectToken={() => setSelecting('from')}
                    balanceText={balance ? Number(balance.formatted).toFixed(5) : null}
                    onMax={
                        balance
                            ? () => setFromAmount(getMaxAmount(balance.value, balance.decimals, !fromToken.address))
                            : undefined
                    }
                    usdValue={fromUsd}
                />

                <div className='flex justify-center -my-3 relative z-10'>
                    <button
                        type='button'
                        onClick={handleFlip}
                        aria-label='Flip tokens'
                        className='bg-zinc-800 border-4 border-zinc-900 p-2 rounded-xl hover:bg-zinc-700 transition-colors'
                    >
                        <ArrowDownUp size={18} className='text-zinc-300' />
                    </button>
                </div>

                <TokenInput
                    label='You receive'
                    token={toToken}
                    amount={toAmount}
                    readOnly
                    onSelectToken={() => setSelecting('to')}
                    usdValue={toUsd}
                />

                <div className='mt-3 px-1 text-sm text-zinc-500'>{rateText}</div>

                {[toToken, fromToken].filter(isImported).map((t) => (
                    <SafetyPanel key={keyOf(t)} token={t} />
                ))}

                <button
                    disabled={buttonDisabled}
                    className='w-full mt-4 py-4 rounded-2xl font-semibold text-white bg-violet-600 hover:bg-violet-500 disabled:bg-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed transition-colors'
                >
                    {buttonLabel}
                </button>
            </div>

            {selecting && (
                <TokenSelector tokens={allTokens} onSelect={handleSelect} onClose={() => setSelecting(null)} />
            )}
        </div>
    )
}