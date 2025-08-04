'use client'

import { useState } from 'react'
import { useSonicTransactions } from '@/hooks/useSonicTransactions'
import { useAccount } from 'wagmi'

export default function TrialPage() {
  const [results, setResults] = useState<Record<string, any>>({})
  const [inputs, setInputs] = useState({
    tokenAddress: '0xAF93888cbD250300470A1618206e036E11470149',
    toAddress: '0x7a39037548C388579266657e1e9037613Ee798F1',
    amount: '0.1',
    spender: '0x086D426f8B653b88a2d6D03051C8b4aB8783Be2b',
    depositId: '12345',
    depositBlockNumber: '12345678',
    withdrawalId: '67890',
    withdrawalBlockNumber: '87654321',
    validatorId: '1',
    txHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
  })

  const {
    loading,
    error,
    clearError,
    reset,
    connectWallet,
    disconnectWallet,
    getAccountAddress,
    getNativeBalance,
    getTokenBalance,
    transferToken,
    getTokenAllowance,
    approveToken,
    bridgeToSonic,
    claimOnSonic,
    bridgeToEthereum,
    claimOnEthereum,
    delegate,
    undelegate,
    withdraw,
    pendingRewards,
    claimRewards,
    getBlockNumber,
    getTransactionStatus,
    getTokenInfo,
  } = useSonicTransactions()

  // Get wallet connection state
  const { address, isConnected } = useAccount()

  const handleFunctionCall = async (functionName: string, fn: () => Promise<any>) => {
    try {
      clearError()
      const result = await fn()
      setResults(prev => ({ ...prev, [functionName]: result }))
    } catch (err) {
      setResults(prev => ({ 
        ...prev, 
        [functionName]: { 
          success: false, 
          error: err instanceof Error ? err.message : 'Unknown error' 
        } 
      }))
    }
  }

  const updateInput = (key: string, value: string) => {
    setInputs(prev => ({ ...prev, [key]: value }))
  }

  const FunctionButton = ({ 
    title, 
    onClick, 
    color = 'bg-blue-500 hover:bg-blue-600' 
  }: { 
    title: string
    onClick: () => void
    color?: string
  }) => (
    <button
      onClick={onClick}
      disabled={loading}
      className={`px-4 py-2 rounded-lg text-white font-medium transition-colors ${color} disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {loading ? 'Loading...' : title}
    </button>
  )

  const ResultDisplay = ({ functionName }: { functionName: string }) => {
    const result = results[functionName]
    if (!result) return null

    return (
      <div className="mt-2 p-3 bg-gray-50 rounded-lg">
        <div className="text-sm font-medium text-gray-700 mb-1">
          {functionName} Result:
        </div>
        <pre className="text-xs bg-white p-2 rounded border overflow-auto">
          {JSON.stringify(result, null, 2)}
        </pre>
      </div>
    )
  }

  const InputField = ({ 
    label, 
    value, 
    onChange, 
    placeholder 
  }: { 
    label: string
    value: string
    onChange: (value: string) => void
    placeholder?: string
  }) => (
    <div className="flex flex-col">
      <label className="text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Sonic Transactions Trial
          </h1>

          {/* Wallet Status */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm font-medium text-gray-700">
                  Wallet Status: {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              {isConnected && address && (
                <div className="text-sm text-gray-600">
                  Address: {address.slice(0, 6)}...{address.slice(-4)}
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="text-red-800 font-medium">Error:</div>
              <div className="text-red-600">{error}</div>
              <button
                onClick={clearError}
                className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
              >
                Clear Error
              </button>
            </div>
          )}

          {/* Input Fields */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Input Parameters</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <InputField
                label="Token Address"
                value={inputs.tokenAddress}
                onChange={(value) => updateInput('tokenAddress', value)}
                placeholder="0x..."
              />
              <InputField
                label="To Address"
                value={inputs.toAddress}
                onChange={(value) => updateInput('toAddress', value)}
                placeholder="0x..."
              />
              <InputField
                label="Amount"
                value={inputs.amount}
                onChange={(value) => updateInput('amount', value)}
                placeholder="0.1"
              />
              <InputField
                label="Spender Address"
                value={inputs.spender}
                onChange={(value) => updateInput('spender', value)}
                placeholder="0x..."
              />
              <InputField
                label="Deposit ID"
                value={inputs.depositId}
                onChange={(value) => updateInput('depositId', value)}
                placeholder="12345"
              />
              <InputField
                label="Deposit Block Number"
                value={inputs.depositBlockNumber}
                onChange={(value) => updateInput('depositBlockNumber', value)}
                placeholder="12345678"
              />
              <InputField
                label="Withdrawal ID"
                value={inputs.withdrawalId}
                onChange={(value) => updateInput('withdrawalId', value)}
                placeholder="67890"
              />
              <InputField
                label="Withdrawal Block Number"
                value={inputs.withdrawalBlockNumber}
                onChange={(value) => updateInput('withdrawalBlockNumber', value)}
                placeholder="87654321"
              />
              <InputField
                label="Validator ID"
                value={inputs.validatorId}
                onChange={(value) => updateInput('validatorId', value)}
                placeholder="1"
              />
              <InputField
                label="Transaction Hash"
                value={inputs.txHash}
                onChange={(value) => updateInput('txHash', value)}
                placeholder="0x..."
              />
            </div>
          </div>

          {/* Wallet & Account Functions */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Wallet & Account Functions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <FunctionButton
                  title="Connect Wallet"
                  onClick={() => handleFunctionCall('connectWallet', connectWallet)}
                  color="bg-green-500 hover:bg-green-600"
                />
                <ResultDisplay functionName="connectWallet" />
              </div>
              <div>
                <FunctionButton
                  title="Disconnect Wallet"
                  onClick={() => handleFunctionCall('disconnectWallet', disconnectWallet)}
                  color="bg-red-500 hover:bg-red-600"
                />
                <ResultDisplay functionName="disconnectWallet" />
              </div>
              <div>
                <FunctionButton
                  title="Get Account Address"
                  onClick={() => handleFunctionCall('getAccountAddress', getAccountAddress)}
                  color="bg-green-500 hover:bg-green-600"
                />
                <ResultDisplay functionName="getAccountAddress" />
              </div>
              <div>
                <FunctionButton
                  title="Get Native Balance"
                  onClick={() => handleFunctionCall('getNativeBalance', getNativeBalance)}
                  color="bg-green-500 hover:bg-green-600"
                />
                <ResultDisplay functionName="getNativeBalance" />
              </div>
            </div>
          </div>

          {/* Token Functions */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Token Functions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <FunctionButton
                  title="Get Token Balance"
                  onClick={() => handleFunctionCall('getTokenBalance', () => getTokenBalance(inputs.tokenAddress))}
                  color="bg-purple-500 hover:bg-purple-600"
                />
                <ResultDisplay functionName="getTokenBalance" />
              </div>
              <div>
                <FunctionButton
                  title="Transfer Token"
                  onClick={() => handleFunctionCall('transferToken', () => transferToken(inputs.tokenAddress, inputs.toAddress, inputs.amount))}
                  color="bg-purple-500 hover:bg-purple-600"
                />
                <ResultDisplay functionName="transferToken" />
              </div>
              <div>
                <FunctionButton
                  title="Get Token Allowance"
                  onClick={() => handleFunctionCall('getTokenAllowance', () => getTokenAllowance(inputs.tokenAddress, inputs.spender))}
                  color="bg-purple-500 hover:bg-purple-600"
                />
                <ResultDisplay functionName="getTokenAllowance" />
              </div>
              <div>
                <FunctionButton
                  title="Approve Token"
                  onClick={() => handleFunctionCall('approveToken', () => approveToken(inputs.tokenAddress, inputs.spender, inputs.amount))}
                  color="bg-purple-500 hover:bg-purple-600"
                />
                <ResultDisplay functionName="approveToken" />
              </div>
              <div>
                <FunctionButton
                  title="Get Token Info"
                  onClick={() => handleFunctionCall('getTokenInfo', () => getTokenInfo(inputs.tokenAddress))}
                  color="bg-purple-500 hover:bg-purple-600"
                />
                <ResultDisplay functionName="getTokenInfo" />
              </div>
            </div>
          </div>

          {/* Bridging Functions */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Bridging Functions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <FunctionButton
                  title="Bridge to Sonic"
                  onClick={() => handleFunctionCall('bridgeToSonic', () => bridgeToSonic(inputs.tokenAddress, inputs.amount))}
                  color="bg-orange-500 hover:bg-orange-600"
                />
                <ResultDisplay functionName="bridgeToSonic" />
              </div>
              <div>
                <FunctionButton
                  title="Claim on Sonic"
                  onClick={() => handleFunctionCall('claimOnSonic', () => claimOnSonic(inputs.tokenAddress, inputs.amount))}
                  color="bg-orange-500 hover:bg-orange-600"
                />
                <ResultDisplay functionName="claimOnSonic" />
              </div>
              <div>
                <FunctionButton
                  title="Bridge to Ethereum"
                  onClick={() => handleFunctionCall('bridgeToEthereum', () => bridgeToEthereum(inputs.tokenAddress, inputs.amount))}
                  color="bg-orange-500 hover:bg-orange-600"
                />
                <ResultDisplay functionName="bridgeToEthereum" />
              </div>
              <div>
                <FunctionButton
                  title="Claim on Ethereum"
                  onClick={() => handleFunctionCall('claimOnEthereum', () => claimOnEthereum(inputs.tokenAddress, inputs.amount))}
                  color="bg-orange-500 hover:bg-orange-600"
                />
                <ResultDisplay functionName="claimOnEthereum" />
              </div>
            </div>
          </div>

          {/* Staking Functions */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Staking Functions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <FunctionButton
                  title="Delegate"
                  onClick={() => handleFunctionCall('delegate', () => delegate(inputs.validatorId, inputs.amount))}
                  color="bg-indigo-500 hover:bg-indigo-600"
                />
                <ResultDisplay functionName="delegate" />
              </div>
              <div>
                <FunctionButton
                  title="Undelegate"
                  onClick={() => handleFunctionCall('undelegate', () => undelegate(inputs.validatorId, inputs.amount))}
                  color="bg-indigo-500 hover:bg-indigo-600"
                />
                <ResultDisplay functionName="undelegate" />
              </div>
              <div>
                <FunctionButton
                  title="Withdraw"
                  onClick={() => handleFunctionCall('withdraw', () => withdraw(inputs.validatorId, inputs.withdrawalId))}
                  color="bg-indigo-500 hover:bg-indigo-600"
                />
                <ResultDisplay functionName="withdraw" />
              </div>
              <div>
                <FunctionButton
                  title="Pending Rewards"
                  onClick={() => handleFunctionCall('pendingRewards', () => pendingRewards(inputs.validatorId))}
                  color="bg-indigo-500 hover:bg-indigo-600"
                />
                <ResultDisplay functionName="pendingRewards" />
              </div>
              <div>
                <FunctionButton
                  title="Claim Rewards"
                  onClick={() => handleFunctionCall('claimRewards', () => claimRewards(inputs.validatorId))}
                  color="bg-indigo-500 hover:bg-indigo-600"
                />
                <ResultDisplay functionName="claimRewards" />
              </div>
            </div>
          </div>

          {/* Utility Functions */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Utility Functions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <FunctionButton
                  title="Get Block Number"
                  onClick={() => handleFunctionCall('getBlockNumber', getBlockNumber)}
                  color="bg-teal-500 hover:bg-teal-600"
                />
                <ResultDisplay functionName="getBlockNumber" />
              </div>
              <div>
                <FunctionButton
                  title="Get Transaction Status"
                  onClick={() => handleFunctionCall('getTransactionStatus', () => getTransactionStatus(inputs.txHash))}
                  color="bg-teal-500 hover:bg-teal-600"
                />
                <ResultDisplay functionName="getTransactionStatus" />
              </div>
            </div>
          </div>

          {/* Reset Button */}
          <div className="text-center">
            <button
              onClick={() => {
                reset()
                setResults({})
              }}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
            >
              Reset All
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
