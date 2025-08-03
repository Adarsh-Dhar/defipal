'use client'

import { createConfig, http, WagmiProvider } from 'wagmi'
import { defineChain } from 'viem'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { injected } from 'wagmi/connectors'
import { sonicBlazeTestnet } from 'viem/chains'


const config = createConfig({
  chains: [sonicBlazeTestnet],
  transports: {
    [sonicBlazeTestnet.id]: http('https://rpc.blaze.soniclabs.com'),
  },
  connectors: [
    injected({
      target: 'metaMask'
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