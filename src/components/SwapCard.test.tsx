import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { SwapCard } from './SwapCard'

vi.mock('wagmi', () => ({
  useAccount: () => ({ address: undefined, isConnected: false }),
  useChainId: () => 1,
  useBalance: () => ({ data: undefined }),
}))

vi.mock('../hooks/useTokenPrices', () => ({
  useTokenPrices: () => ({
    data: { ethereum: 3000, 'usd-coin': 1 },
    isError: false,
  }),
}))

describe('SwapCard', () => {
  it('disables the button when no wallet is connected', () => {
    render(<SwapCard />)
    expect(screen.getByRole('button', { name: 'Connect Wallet' })).toBeDisabled()
  })

  it('shows the indicative rate', () => {
    render(<SwapCard />)
    expect(screen.getByText(/1 ETH ≈ 3000 USDC/)).toBeInTheDocument()
  })
})