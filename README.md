# Nexus

A Web3 swap interface built with React, TypeScript, wagmi, viem and RainbowKit. It connects a wallet, shows balances per chain, validates amounts, displays live USD values, and includes a **Swap Safety Check** that scans imported tokens for scam indicators and explains the result in plain language.

> **Status:** runs locally. It is a read-only interface: prices are indicative and it does not execute swaps.


## Features

- Wallet connection through RainbowKit (MetaMask, WalletConnect and others)
- Per-chain token lists and balances (Ethereum and Base)
- Amount input with validation: rejects invalid characters and more decimals than the token supports
- **Max** button that keeps a small ETH reserve for gas
- Live USD value under each amount and an indicative exchange rate (30-second refresh)
- Token selector with search and **import by contract address**
- **Swap Safety Check** for imported tokens: honeypot flag, buy/sell tax, contract verification, risk badge, and a short AI explanation
- Clear failure states: prices unavailable, scan unavailable, AI unavailable, insufficient balance

## Tech stack

| Area | Tools |
|---|---|
| Frontend | React, TypeScript, Vite, Tailwind CSS |
| Web3 | wagmi 2, viem, RainbowKit |
| Data | TanStack Query, zod |
| External APIs | DefiLlama (prices), GoPlus (token security), Google Gemini (explanations) |
| Testing | Vitest, React Testing Library, Playwright |

## How it works

```text
Browser (React app)
  |-- wallet / balances ----------> wagmi + viem -> chain RPC
  |-- USD prices -----------------> DefiLlama coins API (no key)
  |-- token security scan --------> GoPlus API (no key)
  '-- AI explanation -------------> /api/explain  (local Node server)
                                      '-- Google Gemini (key stays server-side)
```


## Getting started

**Requirements:** Node.js 20.6 or newer, a WalletConnect project ID, and optionally a Gemini API key.

```bash
git clone https://github.com/ahmed20455/nexuss.git
cd nexuss
npm install
cp .env.example .env.local
```

Edit `.env.local` and fill in:

```text
VITE_WALLETCONNECT_PROJECT_ID=your_project_id
GEMINI_API_KEY=your_key         
GEMINI_MODEL=your_model_name    
```

Run the app in two terminals:

```bash
npm run dev:api   # local API server on 127.0.0.1:8787
npm run dev       # app on http://localhost:5173
```


### How to try the Safety Check

1. Connect a wallet and stay on Ethereum.
2. Open the token selector and paste a token contract address.
3. Choose **Import** (the token is marked *Unverified*).
4. The safety panel appears with a risk badge and an explanation.

## Testing

```bash
npm run test:run   # unit and component tests (Vitest)
npm run e2e        # end-to-end test (Playwright, price API mocked)
npm run lint
npx tsc -b
```

| Layer | What it covers |
|---|---|
| Unit | Amount validation, Max with gas reserve, risk scoring |
| Component | Token input and swap card states with wallet and prices mocked |
| End to end | USD value renders in a real browser, with the price API mocked |

## Security decisions

- **No secrets in the browser.** The Gemini key lives only in `.env.local` and is read by the server process. Only `VITE_WALLETCONNECT_PROJECT_ID` is exposed to the frontend, which is designed to be public.
- **Tokens are identified by contract address, never by symbol.** A scam token named "USDC" can never be mistaken for the real one.
- **Prompt-injection resistance.** The AI endpoint accepts only a chain ID from an allowlist and validated booleans and bounded numbers, using strict schemas that reject unknown fields. No free text from token metadata ever reaches the model.
- **Schema validation of every external response** (prices, security scan) with zod, so malformed data fails visibly instead of rendering as `NaN`.
- **Local API bound to 127.0.0.1** with a request body size limit.
- **Safe failure.** If a scan fails, the UI says "Scan unavailable" and never shows a green badge.
- **Money-safe arithmetic.** Amounts are handled as `bigint` through viem's `parseUnits` and `formatUnits`, not floats.
- **Secrets hygiene.** `.env*` files are git-ignored; `.env.example` lists variable names only.

If this were deployed publicly, the next steps would be a Content Security Policy, rate limiting and a spending cap on the AI endpoint, and security headers.

## Dependency audit

`npm audit` reports advisories that are transitive dependencies of the wallet SDKs (WalletConnect/Reown, MetaMask SDK). The only automatic fix is a breaking upgrade to wagmi 3, which the current RainbowKit release does not support. Most findings affect Node-side code paths that do not run in the browser bundle. I did not apply `npm audit fix --force`. The plan is to upgrade the wagmi stack together once RainbowKit supports it.

## Known limitations

- Prices are indicative (from USD prices), not executable quotes. There is no swap execution.
- The safety scan depends on a third-party data source and cannot prove a token is safe. "No red flags" is not a guarantee.
- Imported tokens have no price data.
- Token lists exist for Ethereum and Base only.
- Imported tokens are kept in memory for the session only.


## Project structure

```text
api/explain.js          AI explanation handler (validated input, server-side key)
scripts/dev-api.js      local Node server that hosts the handler
src/components/         SwapCard, TokenInput, TokenSelector, SafetyPanel
src/config/             wagmi setup and per-chain token lists
src/hooks/              price and token safety queries
src/lib/                amount validation and formatting helpers
e2e/                    Playwright tests
```