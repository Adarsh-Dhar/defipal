"use client"

import { useEffect, useState } from 'react'
import { useConnect } from 'wagmi'

export function WalletDebug() {
  const { connectors } = useConnect()
  const [walletInfo, setWalletInfo] = useState<any>({})

  useEffect(() => {
    const detectWallets = () => {
      const info: any = {
        windowEthereum: typeof window !== 'undefined' && !!window.ethereum,
        ethereumProviders: [],
        connectors: connectors.map(c => ({
          id: c.id,
          name: c.name,
          ready: c.ready
        }))
      }

      if (typeof window !== 'undefined' && window.ethereum) {
        // Check for specific wallet providers
        if (window.ethereum.isMetaMask) info.ethereumProviders.push('MetaMask')
        if (window.ethereum.isCoinbaseWallet) info.ethereumProviders.push('Coinbase Wallet')
        if (window.ethereum.isTokenPocket) info.ethereumProviders.push('TokenPocket')
        if (window.ethereum.isTrust) info.ethereumProviders.push('Trust Wallet')
      }

      setWalletInfo(info)
    }

    detectWallets()
  }, [connectors])

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs max-w-sm">
      <h3 className="font-bold mb-2">Wallet Debug Info:</h3>
      <div className="space-y-1">
        <div>Window.ethereum: {walletInfo.windowEthereum ? '✅' : '❌'}</div>
        <div>Providers: {walletInfo.ethereumProviders?.join(', ') || 'None'}</div>
        <div>Connectors: {walletInfo.connectors?.length || 0}</div>
        <div>Ready: {walletInfo.connectors?.filter((c: any) => c.ready).length || 0}</div>
      </div>
    </div>
  )
} 