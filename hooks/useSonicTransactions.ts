import { useState, useCallback } from 'react'

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
// HOOK
// ============================================================================

export function useSonicTransactions() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const executeTransaction = useCallback(async (
    action: string,
    params: Record<string, any> = {}
  ): Promise<TransactionResult> => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/tx', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          ...params,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Transaction failed')
      }

      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }, [])

  // ============================================================================
  // 1. WALLET & ACCOUNT FUNCTIONS
  // ============================================================================

  const connectWallet = useCallback(async (): Promise<TransactionResult> => {
    return executeTransaction('connectWallet')
  }, [executeTransaction])

  const getAccountAddress = useCallback(async (): Promise<TransactionResult> => {
    return executeTransaction('getAccountAddress')
  }, [executeTransaction])

  const getNativeBalance = useCallback(async (address: string): Promise<TransactionResult> => {
    return executeTransaction('getNativeBalance', { address })
  }, [executeTransaction])

  // ============================================================================
  // 2. TOKEN FUNCTIONS
  // ============================================================================

  const getTokenBalance = useCallback(async (
    address: string,
    tokenAddress: string
  ): Promise<TransactionResult> => {
    return executeTransaction('getTokenBalance', { address, tokenAddress })
  }, [executeTransaction])

  const transferToken = useCallback(async (
    tokenAddress: string,
    to: string,
    amount: string,
    privateKey: string
  ): Promise<TransactionResult> => {
    return executeTransaction('transferToken', { tokenAddress, to, amount, privateKey })
  }, [executeTransaction])

  const getTokenAllowance = useCallback(async (
    tokenAddress: string,
    owner: string,
    spender: string
  ): Promise<TransactionResult> => {
    return executeTransaction('getTokenAllowance', { tokenAddress, owner, spender })
  }, [executeTransaction])

  const approveToken = useCallback(async (
    tokenAddress: string,
    spender: string,
    amount: string,
    privateKey: string
  ): Promise<TransactionResult> => {
    return executeTransaction('approveToken', { tokenAddress, spender, amount, privateKey })
  }, [executeTransaction])

  // ============================================================================
  // 3. BRIDGING FUNCTIONS
  // ============================================================================

  const bridgeToSonic = useCallback(async (
    tokenAddress: string,
    amount: string,
    privateKey: string
  ): Promise<TransactionResult> => {
    return executeTransaction('bridgeToSonic', { tokenAddress, amount, privateKey })
  }, [executeTransaction])

  const claimOnSonic = useCallback(async (
    depositBlockNumber: string,
    depositId: string,
    tokenAddress: string,
    amount: string,
    privateKey: string
  ): Promise<TransactionResult> => {
    return executeTransaction('claimOnSonic', {
      depositBlockNumber,
      depositId,
      tokenAddress,
      amount,
      privateKey,
    })
  }, [executeTransaction])

  const bridgeToEthereum = useCallback(async (
    tokenAddress: string,
    amount: string,
    privateKey: string
  ): Promise<TransactionResult> => {
    return executeTransaction('bridgeToEthereum', { tokenAddress, amount, privateKey })
  }, [executeTransaction])

  const claimOnEthereum = useCallback(async (
    withdrawalBlockNumber: string,
    withdrawalId: string,
    tokenAddress: string,
    amount: string,
    privateKey: string
  ): Promise<TransactionResult> => {
    return executeTransaction('claimOnEthereum', {
      withdrawalBlockNumber,
      withdrawalId,
      tokenAddress,
      amount,
      privateKey,
    })
  }, [executeTransaction])

  // ============================================================================
  // 4. STAKING FUNCTIONS
  // ============================================================================

  const delegate = useCallback(async (
    validatorId: string,
    amount: string,
    privateKey: string
  ): Promise<TransactionResult> => {
    return executeTransaction('delegate', { validatorId, amount, privateKey })
  }, [executeTransaction])

  const undelegate = useCallback(async (
    validatorId: string,
    amount: string,
    privateKey: string
  ): Promise<TransactionResult> => {
    return executeTransaction('undelegate', { validatorId, amount, privateKey })
  }, [executeTransaction])

  const withdraw = useCallback(async (
    validatorId: string,
    withdrawalId: string,
    privateKey: string
  ): Promise<TransactionResult> => {
    return executeTransaction('withdraw', { validatorId, withdrawalId, privateKey })
  }, [executeTransaction])

  const pendingRewards = useCallback(async (
    delegator: string,
    validatorId: string
  ): Promise<TransactionResult> => {
    return executeTransaction('pendingRewards', { delegator, validatorId })
  }, [executeTransaction])

  const claimRewards = useCallback(async (
    validatorId: string,
    privateKey: string
  ): Promise<TransactionResult> => {
    return executeTransaction('claimRewards', { validatorId, privateKey })
  }, [executeTransaction])

  // ============================================================================
  // 5. UTILITY & INFO FUNCTIONS
  // ============================================================================

  const getBlockNumber = useCallback(async (): Promise<TransactionResult> => {
    return executeTransaction('getBlockNumber')
  }, [executeTransaction])

  const getTransactionStatus = useCallback(async (txHash: string): Promise<TransactionResult> => {
    return executeTransaction('getTransactionStatus', { txHash })
  }, [executeTransaction])

  const getTokenInfo = useCallback(async (tokenAddress: string): Promise<TransactionResult> => {
    return executeTransaction('getTokenInfo', { tokenAddress })
  }, [executeTransaction])

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