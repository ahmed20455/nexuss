import { describe, expect, it } from 'vitest'
import { getMaxAmount, sanitizeAmount } from './amount'

describe('sanitizeAmount', () => {
  it('accepts valid decimals', () => expect(sanitizeAmount('1.5', 18)).toBe('1.5'))
  it('rejects letters and negatives', () => {
    expect(sanitizeAmount('1e5', 18)).toBeNull()
    expect(sanitizeAmount('-1', 18)).toBeNull()
  })
  it('rejects too many decimals', () => expect(sanitizeAmount('1.1234567', 6)).toBeNull())
})

describe('getMaxAmount', () => {
  it('keeps a gas reserve for native tokens', () => {
    expect(getMaxAmount(10n ** 18n, 18, true)).toBe('0.995')
  })
  it('uses the full balance for ERC-20 tokens', () => {
    expect(getMaxAmount(5_000_000n, 6, false)).toBe('5')
  })
  it('never goes negative', () => expect(getMaxAmount(1n, 18, true)).toBe('0'))
})