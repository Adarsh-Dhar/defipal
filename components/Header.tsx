"use client"

import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ThemeToggle"
import { Wallet } from "lucide-react"
import { useState } from "react"
import { connectWallet } from "@/lib/web3"

export function Header() {
  const [isConnected, setIsConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState<string>("")

  const handleConnectWallet = async () => {
    try {
      // TODO: Replace with actual wallet connection
      const address = await connectWallet()
      setWalletAddress(address)
      setIsConnected(true)
    } catch (error) {
      console.error("Failed to connect wallet:", error)
    }
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
            <span>{isConnected ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : "Connect Wallet"}</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
