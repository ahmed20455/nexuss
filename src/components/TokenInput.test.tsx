import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it, vi } from 'vitest'
import { TokenInput } from './TokenInput'

const token = { symbol: 'ETH', name: 'Ethereum', decimals: 18, address: null, coingeckoId: 'ethereum' }

it('shows the USD value', () => {
  render(<TokenInput label='You pay' token={token} amount='1' usdValue={3000} onSelectToken={() => {}} />)
  expect(screen.getByText('≈ $3,000.00')).toBeInTheDocument()
})

it('blocks invalid characters', async () => {
  const onChange = vi.fn()
  render(<TokenInput label='You pay' token={token} amount='' onAmountChange={onChange} onSelectToken={() => {}} />)
  await userEvent.type(screen.getByLabelText('You pay amount'), 'abc')
  expect(onChange).not.toHaveBeenCalled()
})