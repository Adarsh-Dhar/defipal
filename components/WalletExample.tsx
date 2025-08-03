'use client'

import { useState } from 'react'
import { useAccount } from 'wagmi'
import { useSonicTransactions } from '@/hooks/useSonicTransactions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Wallet, Send, CheckCircle, XCircle, Loader2 } from 'lucide-react'

export function WalletExample() {
  const { address, isConnected } = useAccount()
  const { transferToken, getNativeBalance, loading, error } = useSonicTransactions()
  const [result, setResult] = useState<any>(null)

  const handleGetBalance = async () => {
    if (!isConnected) {
      setResult({ success: false, error: 'Please connect your wallet first' })
      return
    }

    const balanceResult = await getNativeBalance()
    setResult(balanceResult)
  }

  const handleTransfer = async () => {
    if (!isConnected) {
      setResult({ success: false, error: 'Please connect your wallet first' })
      return
    }

    // Example transfer - replace with actual token address and recipient
    const transferResult = await transferToken(
      '0xA0b86a33E6441b6c4C8B8B8B8B8B8B8B8B8B8B8', // Token address
      '0x1234567890123456789012345678901234567890', // Recipient
      '0.1' // Amount
    )
    setResult(transferResult)
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Connected Wallet Example
          </CardTitle>
          <CardDescription>
            This example shows how to use the connected wallet for transactions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Wallet Status */}
          <Alert className={isConnected ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}>
            <Wallet className="h-4 w-4" />
            <AlertDescription className="font-medium">
              {isConnected ? (
                <span className="flex items-center gap-2">
                  Wallet Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
                  <Badge variant="secondary">Ready for transactions</Badge>
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  No wallet connected
                  <Badge variant="outline">Connect wallet to continue</Badge>
                </span>
              )}
            </AlertDescription>
          </Alert>

          {/* Error Display */}
          {error && (
            <Alert className="border-red-200 bg-red-50">
              <XCircle className="h-4 w-4 text-red-600" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              onClick={handleGetBalance}
              disabled={loading || !isConnected}
              variant="outline"
              className="flex items-center gap-2"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wallet className="h-4 w-4" />}
              Get Native Balance
            </Button>
            
            <Button 
              onClick={handleTransfer}
              disabled={loading || !isConnected}
              className="flex items-center gap-2"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Transfer Token
            </Button>
          </div>

          {/* Result Display */}
          {result && (
            <Alert className={result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
              <div className="flex items-center gap-2">
                {result.success ? <CheckCircle className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4 text-red-600" />}
                <AlertDescription className="font-medium">
                  {result.success ? 'Success' : 'Error'}: {result.data || result.error}
                </AlertDescription>
              </div>
            </Alert>
          )}

          {/* Instructions */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-2">How it works:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Connect your wallet using the header button</li>
              <li>• The functions automatically use your connected wallet</li>
              <li>• No private keys needed - transactions are signed by your wallet</li>
              <li>• All transactions require wallet approval</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 