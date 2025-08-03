import { useState, useCallback } from 'react'
import { useAccount, useWalletClient, usePublicClient } from 'wagmi'
import { parseEther, formatEther, parseAbi } from 'viem'
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
  'function deposit(uint256 amount, address token) returns (uint256)',
  'function claim(uint256 depositId, uint256 blockNumber, address token, uint256 amount) returns (bool)',
  'function withdraw(uint256 amount, address token) returns (uint256)',
  'function claimWithdrawal(uint256 withdrawalId, uint256 blockNumber, address token, uint256 amount) returns (bool)',
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
  SONIC_BRIDGE: '0xC8C8C8C8C8C8C8C8C8C8C8C8C8C8C8C8C8C8C8C8', // Replace with actual bridge address
  ETHEREUM_BRIDGE: '0xD8D8D8D8D8D8D8D8D8D8D8D8D8D8D8D8D8D8D8D8', // Replace with actual bridge address
} as const

// Staking Contract Address
const STAKING_CONTRACT = '0xE8E8E8E8E8E8E8E8E8E8E8E8E8E8E8E8E8E8E8E8' // Replace with actual staking contract

// ============================================================================
// HOOK
// ============================================================================

export function useSonicTransactions() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const { address, isConnected } = useAccount()
  const { data: walletClient } = useWalletClient()
  const publicClient = usePublicClient()

  // ============================================================================
  // 1. WALLET & ACCOUNT FUNCTIONS
  // ============================================================================

  const connectWallet = useCallback(async (): Promise<TransactionResult> => {
    if (!isConnected) {
      return { success: false, error: 'Wallet not connected' }
    }
    return { success: true, data: address }
  }, [isConnected, address])

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
    spender: string
  ): Promise<TransactionResult> => {
    if (!address || !publicClient) {
      return { success: false, error: 'Wallet not connected' }
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
    if (!address || !walletClient) {
      return { success: false, error: 'Wallet not connected' }
    }

    try {
      setLoading(true)
      const parsedAmount = parseEther(amount)
      
      const hash = await writeContract(walletClient, {
        address: BRIDGE_CONTRACTS.ETHEREUM_BRIDGE as `0x${string}`,
        abi: BRIDGE_ABI,
        functionName: 'deposit',
        args: [parsedAmount, tokenAddress as `0x${string}`],
      })
      
      const depositId = Math.floor(Math.random() * 1000000).toString()
      return { success: true, data: { depositId, txHash: hash } }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Bridge failed' }
    } finally {
      setLoading(false)
    }
  }, [address, walletClient])

  const claimOnSonic = useCallback(async (
    depositBlockNumber: string,
    depositId: string,
    tokenAddress: string,
    amount: string
  ): Promise<TransactionResult> => {
    if (!address || !walletClient) {
      return { success: false, error: 'Wallet not connected' }
    }

    try {
      setLoading(true)
      const parsedAmount = parseEther(amount)
      
      const hash = await writeContract(walletClient, {
        address: BRIDGE_CONTRACTS.SONIC_BRIDGE as `0x${string}`,
        abi: BRIDGE_ABI,
        functionName: 'claim',
        args: [
          BigInt(depositId),
          BigInt(depositBlockNumber),
          tokenAddress as `0x${string}`,
          parsedAmount
        ],
      })
      
      return { success: true, data: { txHash: hash } }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Claim failed' }
    } finally {
      setLoading(false)
    }
  }, [address, walletClient])

  const bridgeToEthereum = useCallback(async (
    tokenAddress: string,
    amount: string
  ): Promise<TransactionResult> => {
    if (!address || !walletClient) {
      return { success: false, error: 'Wallet not connected' }
    }

    try {
      setLoading(true)
      const parsedAmount = parseEther(amount)
      
      const hash = await writeContract(walletClient, {
        address: BRIDGE_CONTRACTS.SONIC_BRIDGE as `0x${string}`,
        abi: BRIDGE_ABI,
        functionName: 'withdraw',
        args: [parsedAmount, tokenAddress as `0x${string}`],
      })
      
      const withdrawalId = Math.floor(Math.random() * 1000000).toString()
      return { success: true, data: { withdrawalId, txHash: hash } }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Bridge failed' }
    } finally {
      setLoading(false)
    }
  }, [address, walletClient])

  const claimOnEthereum = useCallback(async (
    withdrawalBlockNumber: string,
    withdrawalId: string,
    tokenAddress: string,
    amount: string
  ): Promise<TransactionResult> => {
    if (!address || !walletClient) {
      return { success: false, error: 'Wallet not connected' }
    }

    try {
      setLoading(true)
      const parsedAmount = parseEther(amount)
      
      const hash = await writeContract(walletClient, {
        address: BRIDGE_CONTRACTS.ETHEREUM_BRIDGE as `0x${string}`,
        abi: BRIDGE_ABI,
        functionName: 'claimWithdrawal',
        args: [
          BigInt(withdrawalId),
          BigInt(withdrawalBlockNumber),
          tokenAddress as `0x${string}`,
          parsedAmount
        ],
      })
      
      return { success: true, data: { txHash: hash } }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Claim failed' }
    } finally {
      setLoading(false)
    }
  }, [address, walletClient])

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
    getAccountAddress,
    getNativeBalance,
    
    // Token Functions
    getTokenBalance,
    transferToken,
    getTokenAllowance,
    approveToken,
    
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