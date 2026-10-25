import { describe, expect, it } from 'vitest'
import { riskLevel, type SafetyFlags } from './useTokenSafety'

const clean: SafetyFlags = {
  honeypot: false,
  buyTax: 0,
  sellTax: 0,
  openSource: true,
  proxy: false,
}

describe('riskLevel', () => {
  it('flags honeypots as high risk', () => {
    expect(riskLevel({ ...clean, honeypot: true })).toBe('high')
  })
  it('flags a very high sell tax as high risk', () => {
    expect(riskLevel({ ...clean, sellTax: 0.4 })).toBe('high')
  })
  it('flags unverified source or moderate taxes as medium', () => {
    expect(riskLevel({ ...clean, openSource: false })).toBe('medium')
    expect(riskLevel({ ...clean, sellTax: 0.1 })).toBe('medium')
  })
  it('treats a clean token as low risk', () => {
    expect(riskLevel(clean)).toBe('low')
  })
})