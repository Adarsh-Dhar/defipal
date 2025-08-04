"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ThemeToggle"
import { Wallet } from "lucide-react"
import { useAccount, useConnect, useDisconnect } from 'wagmi'

export function Header() {
  const [mounted, setMounted] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const { address, isConnected } = useAccount()
  const { connect, connectors, error } = useConnect()
  const { disconnect } = useDisconnect()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleConnectWallet = async () => {
    if (isConnected) {
      disconnect()
      return
    }

    setIsConnecting(true)
    
    try {
      console.log('Available connectors:', connectors.map(c => ({ id: c.id, name: c.name, ready: c.ready })))
      
      // Check if any wallet is available
      const availableConnectors = connectors.filter(c => c.ready)
      console.log('Ready connectors:', availableConnectors.map(c => ({ id: c.id, name: c.name })))
      
      if (availableConnectors.length === 0) {
        // Try to detect MetaMask specifically
        if (typeof window !== 'undefined' && window.ethereum) {
          console.log('MetaMask detected in window.ethereum')
          // Force connect to MetaMask
          const connector = connectors.find(c => c.id === 'injected')
          if (connector) {
            await connect({ connector })
            return
          }
        }
        
        console.error('No wallet connectors available')
        alert('Please install MetaMask or another Web3 wallet to connect')
        return
      }

      // Try to connect to the first available connector
      const firstConnector = availableConnectors[0]
      console.log('Attempting to connect with:', firstConnector.name)
      await connect({ connector: firstConnector })
      
    } catch (err) {
      console.error('Connection error:', err)
      alert('Failed to connect wallet. Please try again.')
    } finally {
      setIsConnecting(false)
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
          {mounted && (
            <Button
              onClick={handleConnectWallet}
              variant={isConnected ? "secondary" : "default"}
              size="sm"
              className="flex items-center space-x-2"
              disabled={isConnecting}
            >
              <Wallet className="w-4 h-4" />
              <span>
                {isConnecting 
                  ? "Connecting..."
                  : isConnected 
                    ? formatAddress(address!)
                    : "Connect Wallet"
                }
              </span>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
