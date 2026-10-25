import type { Address } from 'viem'

export type Token = {
  symbol: string
  name: string
  decimals: number
  address: Address | null // null = native token
  coingeckoId?: string
}

const ETH: Token = {
  symbol: 'ETH',
  name: 'Ethereum',
  decimals: 18,
  address: null,
  coingeckoId: 'ethereum',
}

// Verify every address on the chain's block explorer or the issuer's docs.
export const TOKENS_BY_CHAIN: Record<number, Token[]> = {
  1: [
    ETH,
    { symbol: 'USDC', name: 'USD Coin', decimals: 6, address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', coingeckoId: 'usd-coin' },
    { symbol: 'USDT', name: 'Tether', decimals: 6, address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', coingeckoId: 'tether' },
    { symbol: 'WBTC', name: 'Wrapped Bitcoin', decimals: 8, address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', coingeckoId: 'wrapped-bitcoin' },
  ],
  8453: [
    ETH,
    { symbol: 'USDC', name: 'USD Coin', decimals: 6, address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', coingeckoId: 'usd-coin' },
  ],
  // Add 42161 (Arbitrum) and 10 (Optimism) the same way once you have verified the addresses.
}

export const DEFAULT_CHAIN_ID = 1