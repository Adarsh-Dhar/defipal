"use client"

import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ThemeToggle"
import { Wallet } from "lucide-react"
import { useAccount, useConnect, useDisconnect } from 'wagmi'

export function Header() {
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()

  const handleConnectWallet = () => {
    if (isConnected) {
      disconnect()
    } else {
      // Connect to MetaMask (first connector)
      const connector = connectors[0]
      if (connector.ready) {
        connect({ connector })
      }
    }
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <header className="border-b border-border/40 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">S</span>
          </div>
          <span className="text-xl font-semibold">DeFiPal</span>
        </div>

        <div className="flex items-center space-x-4">
          <ThemeToggle />
          <Button
            onClick={handleConnectWallet}
            variant={isConnected ? "secondary" : "default"}
            size="sm"
            className="flex items-center space-x-2"
          >
            <Wallet className="w-4 h-4" />
            <span>
              {isConnected 
                ? formatAddress(address!)
                : "Connect Wallet"
              }
            </span>
          </Button>
        </div>
      </div>
    </header>
  )
}
