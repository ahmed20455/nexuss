import { formatUnits, parseUnits } from 'viem'

const GAS_RESERVE = '0.005' // ETH kept back when using Max on a native token

// Returns the input if valid, or null if the change should be rejected.
export function sanitizeAmount(input: string, decimals: number): string | null {
  if (input === '') return ''
  if (!/^[0-9]*[.]?[0-9]*$/.test(input)) return null
  const frac = input.split('.')[1] ?? ''
  return frac.length > decimals ? null : input
}

export function toUnits(amount: string, decimals: number): bigint | null {
  if (!amount || amount === '.') return null
  try {
    return parseUnits(amount, decimals)
  } catch {
    return null
  }
}

export function getMaxAmount(value: bigint, decimals: number, isNative: boolean): string {
  const reserve = isNative ? parseUnits(GAS_RESERVE, decimals) : 0n
  return formatUnits(value > reserve ? value - reserve : 0n, decimals)
}

export function formatEstimate(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return ''
  return n.toFixed(6).replace(/0+$/, '').replace(/[.]$/, '')
}