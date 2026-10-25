import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { mainnet, base, arbitrum, optimism } from 'wagmi/chains'

export const config = getDefaultConfig({
  appName: 'Nexus',
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID,
  chains: [mainnet, base, arbitrum, optimism],
  ssr: false,
})