'use client'

import { createConfig, http, WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { injected } from 'wagmi/connectors'
import { sonicBlazeTestnet, mainnet } from 'viem/chains'

const config = createConfig({
  chains: [sonicBlazeTestnet, mainnet],
  transports: {
    [sonicBlazeTestnet.id]: http('https://rpc.blaze.soniclabs.com'),
    [mainnet.id]: http(`https://mainnet.infura.io/v3/${process.env.MAINNET_INFURA_API_KEY}`),
  },
  connectors: [
    injected({
      target: 'metaMask',
      shimDisconnect: true,
    }),
    injected({
      target: 'coinbaseWallet',
      shimDisconnect: true,
    }),
    injected({
      target: 'tokenPocket',
      shimDisconnect: true,
    }),
    injected({
      target: 'trust',
      shimDisconnect: true,
    }),
    // Generic injected connector as fallback
    injected({
      shimDisconnect: true,
    }),
  ],
})

const queryClient = new QueryClient()

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}