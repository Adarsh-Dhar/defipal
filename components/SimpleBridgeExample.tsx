import React, { useState } from 'react'
import { useSonicTransactions } from '../hooks/useSonicTransactions'

export function SimpleBridgeExample() {
  const [tokenAddress, setTokenAddress] = useState('')
  const [amount, setAmount] = useState('')
  const [depositId, setDepositId] = useState('')
  
  const {
    bridgeToSonic,
    claimOnSonic,
    bridgeToEthereum,
    claimOnEthereum,
    loading,
    error
  } = useSonicTransactions()

  const handleBridgeToSonic = async () => {
    if (!tokenAddress || !amount) {
      alert('Please enter token address and amount')
      return
    }

    const result = await bridgeToSonic(tokenAddress, amount)
    
    if (result.success) {
      console.log('Bridge to Sonic successful:', result.data)
      // Store the depositId for later use
      setDepositId(result.data.depositId)
      alert(`Bridge successful! 
        Deposit ID: ${result.data.depositId}
        Block Number: ${result.data.depositBlockNumber}
        TX Hash: ${result.data.txHash}`)
    } else {
      alert(`Bridge failed: ${result.error}`)
    }
  }

  const handleClaimOnSonic = async () => {
    if (!tokenAddress || !amount) {
      alert('Please ensure you have a token address and amount')
      return
    }

    const result = await claimOnSonic(tokenAddress, amount)

    if (result.success) {
      console.log('Claim on Sonic successful:', result.data)
      alert(`Claim successful! 
        TX Hash: ${result.data.txHash}
        Claim Block: ${result.data.claimBlockNumber}`)
    } else {
      alert(`Claim failed: ${result.error}`)
    }
  }

  const handleBridgeToEthereum = async () => {
    if (!tokenAddress || !amount) {
      alert('Please enter token address and amount')
      return
    }

    const result = await bridgeToEthereum(tokenAddress, amount)
    
    if (result.success) {
      console.log('Bridge to Ethereum successful:', result.data)
      alert(`Bridge successful! 
        Withdrawal ID: ${result.data.withdrawalId}
        Block Number: ${result.data.withdrawalBlockNumber}
        TX Hash: ${result.data.txHash}`)
    } else {
      alert(`Bridge failed: ${result.error}`)
    }
  }

  const handleClaimOnEthereum = async () => {
    if (!tokenAddress || !amount) {
      alert('Please ensure you have a token address and amount')
      return
    }

    const result = await claimOnEthereum(tokenAddress, amount)

    if (result.success) {
      console.log('Claim on Ethereum successful:', result.data)
      alert(`Claim successful! 
        TX Hash: ${result.data.txHash}
        Claim Block: ${result.data.claimWithdrawalBlockNumber}`)
    } else {
      alert(`Claim failed: ${result.error}`)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Simple Bridge Example</h1>
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Bridge Form */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Bridge Tokens</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Token Address
            </label>
            <input
              type="text"
              value={tokenAddress}
              onChange={(e) => setTokenAddress(e.target.value)}
              placeholder="0x..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount
            </label>
            <input
              type="text"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex space-x-4">
            <button
              onClick={handleBridgeToSonic}
              disabled={loading}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Bridge to Sonic'}
            </button>
            
            <button
              onClick={handleBridgeToEthereum}
              disabled={loading}
              className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Bridge to Ethereum'}
            </button>
          </div>
        </div>
      </div>

      {/* Claim Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Claim Tokens</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Deposit/Withdrawal ID (from bridge transaction)
            </label>
            <input
              type="text"
              value={depositId}
              onChange={(e) => setDepositId(e.target.value)}
              placeholder="Enter ID from bridge transaction"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex space-x-4">
            <button
              onClick={handleClaimOnSonic}
              disabled={loading || !depositId}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Claim on Sonic'}
            </button>
            
            <button
              onClick={handleClaimOnEthereum}
              disabled={loading || !depositId}
              className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Claim on Ethereum'}
            </button>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <h3 className="font-semibold text-blue-900 mb-2">How it works:</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• <strong>Bridge to Sonic:</strong> Automatically extracts depositId and blockNumber from transaction receipt</li>
          <li>• <strong>Claim on Sonic:</strong> Only requires depositId - no manual blockNumber input needed</li>
          <li>• <strong>Bridge to Ethereum:</strong> Automatically extracts withdrawalId and blockNumber from transaction receipt</li>
          <li>• <strong>Claim on Ethereum:</strong> Only requires withdrawalId - no manual blockNumber input needed</li>
        </ul>
      </div>
    </div>
  )
} 