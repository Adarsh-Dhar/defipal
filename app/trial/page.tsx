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
    // Yield farming + analytics
    protocol: 'Curve',
    timeframe: '7d',
    gaugeAddress: '0xaF01d68714E7eA67f43f08b5947e367126B889b1',
    period: 'current_week',
    poolAddress: '0x0000000000000000000000000000000000000000',
    strategy: 'auto',
    weight: '100',
    protocolsList: 'Curve',
    minAPY: '0',
    maxRisk: 'medium',
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
    approveToken,
    // Analytics
    getProtocolMetrics,
    getGaugeBribes,
    getTVLTrends,
    getYieldOpportunities,
    // Yield farming execution
    enterYieldPosition,
    exitYieldPosition,
    claimYieldRewards,
    voteForGauge,
    stakeInGauge,
    unstakeFromGauge,
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
              {/* Analytics inputs */}
              <InputField
                label="Protocol"
                value={inputs.protocol}
                onChange={(value) => updateInput('protocol', value)}
                placeholder="Curve"
              />
              <InputField
                label="Timeframe"
                value={inputs.timeframe}
                onChange={(value) => updateInput('timeframe', value)}
                placeholder="7d"
              />
              <InputField
                label="Gauge Address"
                value={inputs.gaugeAddress}
                onChange={(value) => updateInput('gaugeAddress', value)}
                placeholder="0x..."
              />
              <InputField
                label="Period"
                value={inputs.period}
                onChange={(value) => updateInput('period', value)}
                placeholder="current_week"
              />
              <InputField
                label="Pool Address"
                value={inputs.poolAddress}
                onChange={(value) => updateInput('poolAddress', value)}
                placeholder="0x..."
              />
              <InputField
                label="Strategy"
                value={inputs.strategy}
                onChange={(value) => updateInput('strategy', value)}
                placeholder="auto"
              />
              <InputField
                label="Weight"
                value={inputs.weight}
                onChange={(value) => updateInput('weight', value)}
                placeholder="100"
              />
              <InputField
                label="Protocols (comma-separated)"
                value={inputs.protocolsList}
                onChange={(value) => updateInput('protocolsList', value)}
                placeholder="Curve,Convex,Yearn"
              />
              <InputField
                label="Min APY"
                value={inputs.minAPY}
                onChange={(value) => updateInput('minAPY', value)}
                placeholder="0"
              />
              <InputField
                label="Max Risk"
                value={inputs.maxRisk}
                onChange={(value) => updateInput('maxRisk', value)}
                placeholder="low | medium | high"
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

          {/* Yield Farming Analytics */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Yield Farming Analytics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <FunctionButton
                  title="Get Protocol Metrics"
                  onClick={() => handleFunctionCall('getProtocolMetrics', () => getProtocolMetrics(inputs.protocol, inputs.timeframe))}
                  color="bg-orange-500 hover:bg-orange-600"
                />
                <ResultDisplay functionName="getProtocolMetrics" />
              </div>
              <div>
                <FunctionButton
                  title="Get Gauge Bribes"
                  onClick={() => handleFunctionCall('getGaugeBribes', () => getGaugeBribes(inputs.gaugeAddress, inputs.period))}
                  color="bg-orange-500 hover:bg-orange-600"
                />
                <ResultDisplay functionName="getGaugeBribes" />
              </div>
              <div>
                <FunctionButton
                  title="Get TVL Trends"
                  onClick={() => handleFunctionCall('getTVLTrends', () => getTVLTrends(inputs.protocolsList, inputs.timeframe))}
                  color="bg-orange-500 hover:bg-orange-600"
                />
                <ResultDisplay functionName="getTVLTrends" />
              </div>
              <div>
                <FunctionButton
                  title="Get Yield Opportunities"
                  onClick={() => handleFunctionCall('getYieldOpportunities', () => getYieldOpportunities(inputs.timeframe, inputs.minAPY, inputs.maxRisk))}
                  color="bg-orange-500 hover:bg-orange-600"
                />
                <ResultDisplay functionName="getYieldOpportunities" />
              </div>
            </div>
          </div>

          {/* Yield Farming Execution */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Yield Farming Execution</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <FunctionButton
                  title="Enter Yield Position"
                  onClick={() => handleFunctionCall('enterYieldPosition', () => enterYieldPosition(inputs.protocol, inputs.poolAddress, inputs.amount, inputs.strategy))}
                  color="bg-indigo-500 hover:bg-indigo-600"
                />
                <ResultDisplay functionName="enterYieldPosition" />
              </div>
              <div>
                <FunctionButton
                  title="Exit Yield Position"
                  onClick={() => handleFunctionCall('exitYieldPosition', () => exitYieldPosition(inputs.protocol, inputs.poolAddress, inputs.amount))}
                  color="bg-indigo-500 hover:bg-indigo-600"
                />
                <ResultDisplay functionName="exitYieldPosition" />
              </div>
              <div>
                <FunctionButton
                  title="Claim Yield Rewards"
                  onClick={() => handleFunctionCall('claimYieldRewards', () => claimYieldRewards(inputs.gaugeAddress))}
                  color="bg-indigo-500 hover:bg-indigo-600"
                />
                <ResultDisplay functionName="claimYieldRewards" />
              </div>
              <div>
                <FunctionButton
                  title="Vote For Gauge"
                  onClick={() => handleFunctionCall('voteForGauge', () => voteForGauge(inputs.gaugeAddress, inputs.weight))}
                  color="bg-indigo-500 hover:bg-indigo-600"
                />
                <ResultDisplay functionName="voteForGauge" />
              </div>
              <div>
                <FunctionButton
                  title="Stake In Gauge"
                  onClick={() => handleFunctionCall('stakeInGauge', () => stakeInGauge(inputs.gaugeAddress, inputs.amount))}
                  color="bg-indigo-500 hover:bg-indigo-600"
                />
                <ResultDisplay functionName="stakeInGauge" />
              </div>
              <div>
                <FunctionButton
                  title="Unstake From Gauge"
                  onClick={() => handleFunctionCall('unstakeFromGauge', () => unstakeFromGauge(inputs.gaugeAddress, inputs.amount))}
                  color="bg-indigo-500 hover:bg-indigo-600"
                />
                <ResultDisplay functionName="unstakeFromGauge" />
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
