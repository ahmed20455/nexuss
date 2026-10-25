import { test, expect } from '@playwright/test'

test('shows USD under the amount', async ({ page }) => {
  await page.route('**/coins.llama.fi/**', (route) =>
    route.fulfill({
      json: { coins: { 'coingecko:ethereum': { price: 3000 }, 'coingecko:usd-coin': { price: 1 } } },
    }),
  )
  await page.goto('/')
  await page.getByLabel('You pay amount').fill('1')
  await expect(page.getByText('≈ $3,000.00').first()).toBeVisible()
})