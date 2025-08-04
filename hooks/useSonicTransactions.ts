import { useState, useCallback } from 'react'
import { useAccount, useWalletClient, usePublicClient, useConnect, useDisconnect } from 'wagmi'
import { parseEther, formatEther, parseAbi, parseEventLogs } from 'viem'
import { readContract, writeContract } from 'viem/actions'

// ============================================================================
// TYPES
// ============================================================================

export interface TransactionResult {
  success: boolean
  data?: any
  error?: string
}

export interface BridgeResult {
  depositId?: string
  withdrawalId?: string
  txHash: string
}

export interface TransactionStatus {
  status: 'pending' | 'success' | 'failed'
  blockNumber?: string
  gasUsed?: string
}

export interface TokenInfo {
  name: string
  symbol: string
  decimals: number
}

export interface StakingResult {
  withdrawalId?: string
  txHash: string
}

export interface SpenderOption {
  address: string
  name: string
  description: string
}

// ============================================================================
// CONSTANTS
// ============================================================================

// ERC-20 ABI for token operations
const ERC20_ABI = parseAbi([
  'function balanceOf(address owner) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
])

// Bridge ABI
const BRIDGE_ABI = parseAbi([
  'function deposit(uint96 uid, address token, uint256 amount) returns (uint256)',
  'function claim(address token, uint256 amount) returns (bool)',
  'function withdraw(uint96 uid, address token, uint256 amount) returns (uint256)',
  'function claimWithdrawal(address token, uint256 amount) returns (bool)',
  'event Deposit(uint256 indexed id, address indexed owner, address token, uint256 amount)',
  'event Claim(uint256 indexed depositId, address indexed token, uint256 amount, uint256 blockNumber)',
  'event Withdrawal(uint256 indexed id, address indexed owner, address token, uint256 amount)',
  'event ClaimWithdrawal(uint256 indexed withdrawalId, address indexed token, uint256 amount, uint256 blockNumber)',
])

// Staking ABI
const STAKING_ABI = parseAbi([
  'function delegate(uint256 validatorId, uint256 amount) returns (bool)',
  'function undelegate(uint256 validatorId, uint256 amount) returns (uint256)',
  'function withdraw(uint256 validatorId, uint256 withdrawalId) returns (bool)',
  'function pendingRewards(address delegator, uint256 validatorId) view returns (uint256)',
  'function claimRewards(uint256 validatorId) returns (bool)',
])

// Bridge Contract Addresses
const BRIDGE_CONTRACTS = {
  SONIC_BRIDGE: '0x9Ef7629F9B930168b76283AdD7120777b3c895b3', // Replace with actual bridge address
  ETHEREUM_BRIDGE: '0xa1E2481a9CD0Cb0447EeB1cbc26F1b3fff3bec20', // Replace with actual bridge address
} as const

// Staking Contract Address
const STAKING_CONTRACT = '0xFC00FACE00000000000000000000000000000000' // Replace with actual staking contract

// Predefined Spender Addresses
export const PREDEFINED_SPENDERS = {
  SONIC_BRIDGE: {
    address: '0x9Ef7629F9B930168b76283AdD7120777b3c895B3',
    name: 'Sonic Bridge',
    description: 'Bridge tokens back to Ethereum - Must approve this contract to withdraw minted ERC‑20 tokens on L2'
  },
  TOKEN_DEPOSIT_L1_BRIDGE: {
    address: '0xa1E2481a9CD0Cb0447EeB1cbc26F1b3fff3bec20',
    name: 'Token Deposit (L1 Bridge)',
    description: 'When bridging from Ethereum → Sonic (on L1), approve here first'
  },
  MULTICALL3: {
    address: '0xcA11bde05977b3631167028862bE2a173976CA11',
    name: 'Multicall3',
    description: 'Utility/meta‑tx services - Rarely needs allowance unless you\'re approving tokens for gas payment flows'
  }
} as const

// ============================================================================
// HOOK
// ============================================================================

export function useSonicTransactions() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const { address, isConnected } = useAccount()
  const { data: walletClient } = useWalletClient()
  const publicClient = usePublicClient()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()

  // ============================================================================
  // 1. WALLET & ACCOUNT FUNCTIONS
  // ============================================================================

  const connectWallet = useCallback(async (): Promise<TransactionResult> => {
    try {
      setLoading(true)
      
      // Try to find available connectors
      const availableConnectors = connectors.filter(connector => connector.ready)
      
      if (availableConnectors.length === 0) {
        return { success: false, error: 'No wallet connectors available. Please install MetaMask or another wallet extension.' }
      }
      
      // Try MetaMask first, then fall back to other available connectors
      let connector = availableConnectors.find(connector => 
        connector.name.toLowerCase().includes('metamask') || 
        connector.name.toLowerCase().includes('injected')
      )
      
      if (!connector) {
        connector = availableConnectors[0] // Use the first available connector
      }
      
      // Connect to wallet
      await connect({ connector })
      
      return { success: true, data: { message: `Connected to ${connector.name}` } }
    } catch (err) {
      console.error('Wallet connection error:', err)
      return { success: false, error: err instanceof Error ? err.message : 'Failed to connect wallet' }
    } finally {
      setLoading(false)
    }
  }, [connect, connectors])

  const disconnectWallet = useCallback(async (): Promise<TransactionResult> => {
    try {
      setLoading(true)
      disconnect()
      return { success: true, data: { message: 'Wallet disconnected successfully' } }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to disconnect wallet' }
    } finally {
      setLoading(false)
    }
  }, [disconnect])

  const getAccountAddress = useCallback(async (): Promise<TransactionResult> => {
    if (!address) {
      return { success: false, error: 'No wallet connected' }
    }
    return { success: true, data: address }
  }, [address])

  const getNativeBalance = useCallback(async (): Promise<TransactionResult> => {
    if (!address || !publicClient) {
      return { success: false, error: 'Wallet not connected' }
    }

    try {
      const balance = await publicClient.getBalance({ address })
      return { success: true, data: formatEther(balance) }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to get balance' }
    }
  }, [address, publicClient])

  // ============================================================================
  // 2. TOKEN FUNCTIONS
  // ============================================================================

  const getTokenBalance = useCallback(async (
    tokenAddress: string
  ): Promise<TransactionResult> => {
    if (!address || !publicClient) {
      return { success: false, error: 'Wallet not connected' }
    }

    try {
      const balance = await readContract(publicClient, {
        address: tokenAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: [address],
      })
      
      return { success: true, data: formatEther(balance as bigint) }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to get token balance' }
    }
  }, [address, publicClient])

  const transferToken = useCallback(async (
    tokenAddress: string,
    to: string,
    amount: string
  ): Promise<TransactionResult> => {
    if (!address || !walletClient) {
      return { success: false, error: 'Wallet not connected' }
    }

    try {
      setLoading(true)
      const parsedAmount = parseEther(amount)
      
      const hash = await writeContract(walletClient, {
        address: tokenAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'transfer',
        args: [to as `0x${string}`, parsedAmount],
      })
      
      return { success: true, data: { txHash: hash } }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Transfer failed' }
    } finally {
      setLoading(false)
    }
  }, [address, walletClient])

  const getTokenAllowance = useCallback(async (
    tokenAddress: string,
    spender?: string
  ): Promise<TransactionResult> => {
    if (!address || !publicClient) {
      return { success: false, error: 'Wallet not connected' }
    }

    // If no spender is provided, return the predefined spender options
    if (!spender) {
      const spenderOptions = Object.values(PREDEFINED_SPENDERS).map(spender => ({
        address: spender.address,
        name: spender.name,
        description: spender.description
      }))
      
      return { 
        success: true, 
        data: {
          message: 'Please select a spender from the predefined options:',
          spenderOptions
        }
      }
    }

    try {
      const allowance = await readContract(publicClient, {
        address: tokenAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'allowance',
        args: [address, spender as `0x${string}`],
      })
      
      return { success: true, data: formatEther(allowance as bigint) }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to get allowance' }
    }
  }, [address, publicClient])

  const getSpenderOptions = useCallback((): SpenderOption[] => {
    return Object.values(PREDEFINED_SPENDERS).map(spender => ({
      address: spender.address,
      name: spender.name,
      description: spender.description
    }))
  }, [])

  const approveToken = useCallback(async (
    tokenAddress: string,
    spender: string,
    amount: string
  ): Promise<TransactionResult> => {
    if (!address || !walletClient) {
      return { success: false, error: 'Wallet not connected' }
    }

    try {
      setLoading(true)
      const parsedAmount = parseEther(amount)
      
      const hash = await writeContract(walletClient, {
        address: tokenAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [spender as `0x${string}`, parsedAmount],
      })
      
      return { success: true, data: { txHash: hash } }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Approval failed' }
    } finally {
      setLoading(false)
    }
  }, [address, walletClient])

  // ============================================================================
  // 3. BRIDGING FUNCTIONS
  // ============================================================================

  const bridgeToSonic = useCallback(async (
    tokenAddress: string,
    amount: string
  ): Promise<TransactionResult> => {
    if (!address || !walletClient || !publicClient) {
      return { success: false, error: 'Wallet not connected' }
    }

    try {
      setLoading(true)
      const parsedAmount = parseEther(amount)
      
      // Generate a unique depositId (using timestamp + random salt)
      const depositId = (Date.now() + Math.floor(Math.random() * 1000)).toString()
      
      const hash = await writeContract(walletClient, {
        address: BRIDGE_CONTRACTS.ETHEREUM_BRIDGE as `0x${string}`,
        abi: BRIDGE_ABI,
        functionName: 'deposit',
        args: [BigInt(depositId), tokenAddress as `0x${string}`, parsedAmount],
      })
      
      const receipt = await publicClient?.waitForTransactionReceipt({ hash: hash as `0x${string}` })
      if (!receipt) {
        return { success: false, error: 'Transaction receipt not found' }
      }

      // Parse the Deposit event from logs to verify the ID
      const depositEvents = parseEventLogs({
        abi: BRIDGE_ABI,
        eventName: 'Deposit',
        logs: receipt.logs
      })
      
      if (!depositEvents || depositEvents.length === 0) {
        return { success: false, error: 'Deposit event not found' }
      }

      // Verify the ID from the event matches our generated ID
      const idFromChain = depositEvents[0].args.id.toString()
      if (idFromChain !== depositId) {
        return { success: false, error: 'ID mismatch: receipt and generated depositId differ' }
      }

      const depositBlockNumber = receipt.blockNumber.toString()

      return { success: true, data: { depositId, depositBlockNumber, txHash: hash } }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Bridge failed' }
    } finally {
      setLoading(false)
    }
  }, [address, walletClient, publicClient])

  const claimOnSonic = useCallback(async (
    tokenAddress: string,
    amount: string
  ): Promise<TransactionResult> => {
    if (!address || !walletClient) {
      return { success: false, error: 'Wallet not connected' }
    }

    if (!tokenAddress || !amount) {
      return { success: false, error: 'Token address and amount are required' }
    }

    try {
      setLoading(true)
      const parsedAmount = parseEther(amount)
      
      const hash = await writeContract(walletClient, {
        address: BRIDGE_CONTRACTS.SONIC_BRIDGE as `0x${string}`,
        abi: BRIDGE_ABI,
        functionName: 'claim',
        args: [
          tokenAddress as `0x${string}`,
          parsedAmount
        ],
      })
      
      const receipt = await publicClient?.waitForTransactionReceipt({ hash: hash as `0x${string}` })
      if (!receipt) {
        return { success: false, error: 'Transaction receipt not found' }
      }

      // Check if transaction was successful
      if (receipt.status !== 'success') {
        return { success: false, error: 'Transaction failed' }
      }

      // Try to parse the Claim event from logs, but don't fail if not found
      let claimBlockNumber = receipt.blockNumber.toString()
      try {
        const claimEvents = parseEventLogs({
          abi: BRIDGE_ABI,
          eventName: 'Claim',
          logs: receipt.logs
        })
        
        if (claimEvents && claimEvents.length > 0) {
          console.log('Claim event found:', claimEvents[0])
        } else {
          console.log('Claim event not found, but transaction succeeded')
        }
      } catch (eventError) {
        console.log('Error parsing Claim event:', eventError)
        // Continue anyway since the transaction succeeded
      }

      return { success: true, data: { txHash: hash, claimBlockNumber } }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Claim failed' }
    } finally {
      setLoading(false)
    }
  }, [address, walletClient, publicClient])

  const bridgeToEthereum = useCallback(async (
    tokenAddress: string,
    amount: string
  ): Promise<TransactionResult> => {
    if (!address || !walletClient || !publicClient) {
      return { success: false, error: 'Wallet not connected' }
    }

    try {
      setLoading(true)
      const parsedAmount = parseEther(amount)
      
      // Generate a unique withdrawalId (using timestamp + random salt)
      const withdrawalId = (Date.now() + Math.floor(Math.random() * 1000)).toString()
      
      const hash = await writeContract(walletClient, {
        address: BRIDGE_CONTRACTS.SONIC_BRIDGE as `0x${string}`,
        abi: BRIDGE_ABI,
        functionName: 'withdraw',
        args: [BigInt(withdrawalId), tokenAddress as `0x${string}`, parsedAmount],
      })
      
      const receipt = await publicClient?.waitForTransactionReceipt({ hash: hash as `0x${string}` })
      if (!receipt) {
        return { success: false, error: 'Transaction receipt not found' }
      }

      // Parse the Withdrawal event from logs to verify the ID
      const withdrawalEvents = parseEventLogs({
        abi: BRIDGE_ABI,
        eventName: 'Withdrawal',
        logs: receipt.logs
      })
      
      if (!withdrawalEvents || withdrawalEvents.length === 0) {
        return { success: false, error: 'Withdrawal event not found' }
      }

      // Verify the ID from the event matches our generated ID
      const idFromChain = withdrawalEvents[0].args.id.toString()
      if (idFromChain !== withdrawalId) {
        return { success: false, error: 'ID mismatch: receipt and generated withdrawalId differ' }
      }

      const withdrawalBlockNumber = receipt.blockNumber.toString()

      return { 
        success: true, 
        data: { 
          withdrawalId, 
          withdrawalBlockNumber,
          txHash: hash 
        } 
      }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Bridge failed' }
    } finally {
      setLoading(false)
    }
  }, [address, walletClient, publicClient])

  const claimOnEthereum = useCallback(async (
    tokenAddress: string,
    amount: string
  ): Promise<TransactionResult> => {
    console.log('claimOnEthereum called with:', { tokenAddress, amount })
    
    if (!address || !walletClient) {
      return { success: false, error: 'Wallet not connected' }
    }

    if (!tokenAddress || !amount) {
      console.log('Missing parameters:', { tokenAddress, amount })
      return { success: false, error: 'Token address and amount are required' }
    }

    try {
      setLoading(true)
      const parsedAmount = parseEther(amount)
      console.log('Parsed amount:', parsedAmount.toString())
      
      const hash = await writeContract(walletClient, {
        address: BRIDGE_CONTRACTS.ETHEREUM_BRIDGE as `0x${string}`,
        abi: BRIDGE_ABI,
        functionName: 'claimWithdrawal',
        args: [
          tokenAddress as `0x${string}`,
          parsedAmount
        ],
      })
      
      console.log('Transaction hash:', hash)
      
      const receipt = await publicClient?.waitForTransactionReceipt({ hash: hash as `0x${string}` })
      if (!receipt) {
        return { success: false, error: 'Transaction receipt not found' }
      }

      console.log('Transaction receipt:', {
        status: receipt.status,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed,
        logsCount: receipt.logs.length
      })

      // Check if transaction was successful
      if (receipt.status !== 'success') {
        return { success: false, error: 'Transaction failed' }
      }

      // Try to parse the ClaimWithdrawal event from logs, but don't fail if not found
      let claimWithdrawalBlockNumber = receipt.blockNumber.toString()
      try {
        console.log('Attempting to parse ClaimWithdrawal event from', receipt.logs.length, 'logs')
        const claimWithdrawalEvents = parseEventLogs({
          abi: BRIDGE_ABI,
          eventName: 'ClaimWithdrawal',
          logs: receipt.logs
        })
        
        if (claimWithdrawalEvents && claimWithdrawalEvents.length > 0) {
          console.log('ClaimWithdrawal event found:', claimWithdrawalEvents[0])
        } else {
          console.log('ClaimWithdrawal event not found, but transaction succeeded')
          // Log all events to see what's available
          console.log('Available logs:', receipt.logs.map(log => ({
            address: log.address,
            topics: log.topics,
            data: log.data
          })))
        }
      } catch (eventError) {
        console.log('Error parsing ClaimWithdrawal event:', eventError)
        // Continue anyway since the transaction succeeded
      }

      return { success: true, data: { txHash: hash, claimWithdrawalBlockNumber } }
    } catch (err) {
      console.error('claimOnEthereum error:', err)
      return { success: false, error: err instanceof Error ? err.message : 'Claim failed' }
    } finally {
      setLoading(false)
    }
  }, [address, walletClient, publicClient])

  // ============================================================================
  // 4. STAKING FUNCTIONS
  // ============================================================================

  const delegate = useCallback(async (
    validatorId: string,
    amount: string
  ): Promise<TransactionResult> => {
    if (!address || !walletClient) {
      return { success: false, error: 'Wallet not connected' }
    }

    try {
      setLoading(true)
      const parsedAmount = parseEther(amount)
      
      const hash = await writeContract(walletClient, {
        address: STAKING_CONTRACT as `0x${string}`,
        abi: STAKING_ABI,
        functionName: 'delegate',
        args: [BigInt(validatorId), parsedAmount],
      })
      
      return { success: true, data: { txHash: hash } }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Delegation failed' }
    } finally {
      setLoading(false)
    }
  }, [address, walletClient])

  const undelegate = useCallback(async (
    validatorId: string,
    amount: string
  ): Promise<TransactionResult> => {
    if (!address || !walletClient) {
      return { success: false, error: 'Wallet not connected' }
    }

    try {
      setLoading(true)
      const parsedAmount = parseEther(amount)
      
      const hash = await writeContract(walletClient, {
        address: STAKING_CONTRACT as `0x${string}`,
        abi: STAKING_ABI,
        functionName: 'undelegate',
        args: [BigInt(validatorId), parsedAmount],
      })
      
      const withdrawalId = Math.floor(Math.random() * 1000000).toString()
      return { success: true, data: { withdrawalId, txHash: hash } }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Undelegation failed' }
    } finally {
      setLoading(false)
    }
  }, [address, walletClient])

  const withdraw = useCallback(async (
    validatorId: string,
    withdrawalId: string
  ): Promise<TransactionResult> => {
    if (!address || !walletClient) {
      return { success: false, error: 'Wallet not connected' }
    }

    try {
      setLoading(true)
      
      const hash = await writeContract(walletClient, {
        address: STAKING_CONTRACT as `0x${string}`,
        abi: STAKING_ABI,
        functionName: 'withdraw',
        args: [BigInt(validatorId), BigInt(withdrawalId)],
      })
      
      return { success: true, data: { txHash: hash } }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Withdrawal failed' }
    } finally {
      setLoading(false)
    }
  }, [address, walletClient])

  const pendingRewards = useCallback(async (
    validatorId: string
  ): Promise<TransactionResult> => {
    if (!address || !publicClient) {
      return { success: false, error: 'Wallet not connected' }
    }

    try {
      const rewards = await readContract(publicClient, {
        address: STAKING_CONTRACT as `0x${string}`,
        abi: STAKING_ABI,
        functionName: 'pendingRewards',
        args: [address, BigInt(validatorId)],
      })
      
      return { success: true, data: formatEther(rewards as bigint) }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to get pending rewards' }
    }
  }, [address, publicClient])

  const claimRewards = useCallback(async (
    validatorId: string
  ): Promise<TransactionResult> => {
    if (!address || !walletClient) {
      return { success: false, error: 'Wallet not connected' }
    }

    try {
      setLoading(true)
      
      const hash = await writeContract(walletClient, {
        address: STAKING_CONTRACT as `0x${string}`,
        abi: STAKING_ABI,
        functionName: 'claimRewards',
        args: [BigInt(validatorId)],
      })
      
      return { success: true, data: { txHash: hash } }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Claim rewards failed' }
    } finally {
      setLoading(false)
    }
  }, [address, walletClient])

  // ============================================================================
  // 5. UTILITY & INFO FUNCTIONS
  // ============================================================================

  const getBlockNumber = useCallback(async (): Promise<TransactionResult> => {
    if (!publicClient) {
      return { success: false, error: 'Client not available' }
    }

    try {
      const blockNumber = await publicClient.getBlockNumber()
      return { success: true, data: blockNumber.toString() }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to get block number' }
    }
  }, [publicClient])

  const getTransactionStatus = useCallback(async (txHash: string): Promise<TransactionResult> => {
    if (!publicClient) {
      return { success: false, error: 'Client not available' }
    }

    try {
      const receipt = await publicClient.getTransactionReceipt({ hash: txHash as `0x${string}` })
      
      return {
        success: true,
        data: {
          status: receipt.status === 'success' ? 'success' : 'failed',
          blockNumber: receipt.blockNumber.toString(),
          gasUsed: receipt.gasUsed.toString(),
        }
      }
    } catch (err) {
      // If transaction is still pending, it won't have a receipt yet
      return { success: true, data: { status: 'pending' } }
    }
  }, [publicClient])

  const getTokenInfo = useCallback(async (tokenAddress: string): Promise<TransactionResult> => {
    if (!publicClient) {
      return { success: false, error: 'Client not available' }
    }

    try {
      const [name, symbol, decimals] = await Promise.all([
        readContract(publicClient, {
          address: tokenAddress as `0x${string}`,
          abi: ERC20_ABI,
          functionName: 'name',
        }),
        readContract(publicClient, {
          address: tokenAddress as `0x${string}`,
          abi: ERC20_ABI,
          functionName: 'symbol',
        }),
        readContract(publicClient, {
          address: tokenAddress as `0x${string}`,
          abi: ERC20_ABI,
          functionName: 'decimals',
        }),
      ])
      
      return {
        success: true,
        data: {
          name: name as string,
          symbol: symbol as string,
          decimals: decimals as number,
        }
      }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to get token info' }
    }
  }, [publicClient])

  // ============================================================================
  // CONVENIENCE FUNCTIONS
  // ============================================================================

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const reset = useCallback(() => {
    setLoading(false)
    setError(null)
  }, [])

  return {
    // State
    loading,
    error,
    
    // Actions
    clearError,
    reset,
    
    // Wallet & Account Functions
    connectWallet,
    disconnectWallet,
    getAccountAddress,
    getNativeBalance,
    
    // Token Functions
    getTokenBalance,
    transferToken,
    getTokenAllowance,
    approveToken,
    getSpenderOptions,
    
    // Bridging Functions
    bridgeToSonic,
    claimOnSonic,
    bridgeToEthereum,
    claimOnEthereum,
    
    // Staking Functions
    delegate,
    undelegate,
    withdraw,
    pendingRewards,
    claimRewards,
    
    // Utility Functions
    getBlockNumber,
    getTransactionStatus,
    getTokenInfo,
  }
} 