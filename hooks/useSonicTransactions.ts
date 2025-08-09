import { useState, useCallback } from 'react'
import { useAccount, useWalletClient, usePublicClient, useConnect, useDisconnect } from 'wagmi'
import { parseEther, formatEther, parseAbi, parseEventLogs, createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'
import { readContract, writeContract } from 'viem/actions'
import { CRV_BRIBE_ADDRESS, CRV_BRIBE_ABI } from '@/lib/contracts/crvBribe'
import { GAUGE_CONTROLLER_ADDRESS, GAUGE_CONTROLLER_ABI } from '@/lib/contracts/gaugeController'

// ============================================================================
// TYPES
// ============================================================================

export interface TransactionResult {
  success: boolean
  data?: any
  error?: string
}

export interface YieldPosition {
  protocol: string
  poolAddress: string
  amount: string
  apy: string
  rewards: string[]
}

export interface ProtocolMetrics {
  protocol: string
  timeframe: string
  tvl: string
  apy: string
  volume: string
}

export interface GaugeBribe {
  gauge: string
  period: string
  weight: string
  bribes: any[]
}

export interface YieldOpportunity {
  protocol: string
  pool: string
  apy: number
  risk: string
  tvl: string
  strategy: string
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

// ============================================================================
// YIELD FARMING CONSTANTS
// ============================================================================

// Yield Farming Protocol Addresses
const PROTOCOL_ADDRESSES = {
  CURVE_FACTORY: '0xB9fC1576AcEF6a36d82dEeB67FFf847D9B51a99A',
  CONVEX_BOOSTER: '0xF403C135812408BFbE8713b5A23a04b3D48AAE31',
  YEARN_REGISTRY: '0x50c1a2eA0a861A967D9d0FFE2AE4012c2E053804',
  BEEFY_VAULT_FACTORY: '0x9dDA6Ef3D919c9bC8885D556A9A83D0b307d86E3',
  GAUGE_CONTROLLER: '0x2F50D53826Fa9F7C3D7C556c6eF7cE8A9B5b4b5c',
  VOTE_ESCROWED_CRV: '0x5f3b5DfEb7B28CDbD7FAba78963EE202a494e2A2',
} as const

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

// Yield Farming ABIs
const CURVE_POOL_ABI = parseAbi([
  'function add_liquidity(uint256[2] amounts, uint256 min_mint_amount) returns (uint256)',
  'function remove_liquidity(uint256 _amount, uint256[2] min_amounts) returns (uint256[2])',
  'function get_virtual_price() view returns (uint256)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address _addr) view returns (uint256)',
])

const GAUGE_ABI = parseAbi([
  'function deposit(uint256 _value) returns (bool)',
  'function withdraw(uint256 _value) returns (bool)',
  'function claim_rewards() returns (bool)',
  'function claimable_reward(address _addr, address _token) view returns (uint256)',
  'function balanceOf(address _addr) view returns (uint256)',
])

const CONVEX_BOOSTER_ABI = parseAbi([
  'function deposit(uint256 _pid, uint256 _amount, bool _stake) returns (bool)',
  'function withdraw(uint256 _pid, uint256 _amount) returns (bool)',
  'function poolInfo(uint256) view returns (address, address, address, address, address, bool)',
])

const VOTE_ESCROW_ABI = parseAbi([
  'function vote_for_gauge_weights(address _gauge_addr, uint256 _user_weight) returns (bool)',
  'function get_gauge_weight(address _gauge) view returns (uint256)',
  'function gauge_relative_weight(address _gauge) view returns (uint256)',
])

const YEARN_VAULT_ABI = parseAbi([
  'function deposit(uint256 _amount) returns (uint256)',
  'function withdraw(uint256 _shares) returns (uint256)',
  'function pricePerShare() view returns (uint256)',
  'function balanceOf(address _addr) view returns (uint256)',
])

// ============================================================================
// HOOK
// ============================================================================

export function useYieldFarming() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const { address, isConnected } = useAccount()
  const { data: walletClient } = useWalletClient()
  const publicClient = usePublicClient()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()

  // Dedicated Ethereum mainnet client for Curve/Convex/Yearn reads
  const ethereumClient = createPublicClient({
    chain: mainnet,
    transport: http('https://cloudflare-eth.com'),
  })

  // ==========================================================================
  // Helpers
  // ==========================================================================

  const extractLatestTvl = (apiData: any): string => {
    try {
      const series = apiData?.tvl
      if (Array.isArray(series) && series.length > 0) {
        const lastPoint = series[series.length - 1]
        if (typeof lastPoint === 'number') return String(lastPoint)
        if (lastPoint && typeof lastPoint === 'object') {
          const value =
            lastPoint.totalLiquidityUSD ??
            lastPoint.tvl ??
            lastPoint.totalLiquidity ??
            (Array.isArray(lastPoint) ? lastPoint[1] : undefined)
          return value != null ? String(value) : '0'
        }
      }
      if (typeof apiData?.tvl === 'number') return String(apiData.tvl)
      return '0'
    } catch {
      return '0'
    }
  }

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
  // 3. YIELD FARMING ANALYTICS FUNCTIONS
  // ============================================================================

  const getProtocolMetrics = useCallback(async (
    protocol: string,
    timeframe: string = '7d'
  ): Promise<TransactionResult> => {
    try {
      setLoading(true)
      
      const response = await fetch(`/api/protocol/${protocol}`)
      if (!response.ok) {
        throw new Error('Failed to fetch protocol data')
      }
      
      const { success, data, error } = await response.json()
      
      if (!success) {
        throw new Error(error || 'Failed to get protocol metrics')
      }
      
      const tvl = extractLatestTvl(data)

      return {
        success: true,
        data: {
          protocol,
          timeframe,
          tvl,
          apy: data.apy?.toString?.() || '0',
          volume: data.volume?.toString?.() || '0',
        },
      }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to get protocol metrics' }
    } finally {
      setLoading(false)
    }
  }, [])

  const getGaugeBribes = useCallback(async (
    gauge: string,
    period: string = 'current_week'
  ): Promise<TransactionResult> => {
    if (!publicClient || !address) {
      return { success: false, error: 'Client or address not available' }
    }

    try {
      // Validate gauge address (basic 0x + 40 hex chars)
      if (!gauge || !/^0x[a-fA-F0-9]{40}$/.test(gauge)) {
        return { success: false, error: 'Please provide a valid Curve gauge address.' }
      }

      // 0) Ensure the gauge is registered on GaugeController
      // try {
      //   const gaugeType = await readContract(ethereumClient, {
      //     address: GAUGE_CONTROLLER_ADDRESS as `0x${string}`,
      //     abi: GAUGE_CONTROLLER_ABI,
      //     functionName: 'gauge_types',
      //     args: [gauge as `0x${string}`],
      //   }) as bigint
      //   // Curve returns -1 for unknown gauge addresses
      //   if (gaugeType < BigInt(0)) {
      //     return { success: false, error: 'Gauge not registered on GaugeController.' }
      //   }
      // } catch (_) {
      //   return { success: false, error: 'Gauge not registered on GaugeController.' }
      // }

      // 1) Try to get reward tokens for the gauge from the Bribe contract
      let rewardTokens: string[] = []
      try {
        const tokens = await readContract(ethereumClient, {
          address: CRV_BRIBE_ADDRESS as `0x${string}`,
          abi: CRV_BRIBE_ABI,
          functionName: 'rewards_per_gauge',
          args: [gauge as `0x${string}`],
        })
        rewardTokens = tokens as string[]
      } catch (_) {
        rewardTokens = []
      }

      // 2) Determine the active epoch timestamp using active_period(gauge, reward_token)
      //    ABI indicates two address args; consistent with reward_per_token(gauge, reward_token)
      let epochTime: bigint
      if (rewardTokens.length > 0) {
        try {
          epochTime = await readContract(ethereumClient, {
            address: CRV_BRIBE_ADDRESS as `0x${string}`,
            abi: CRV_BRIBE_ABI,
            functionName: 'active_period',
            args: [gauge as `0x${string}`, rewardTokens[0] as `0x${string}`],
          }) as bigint
        } catch (_) {
          // Fallback: align to current week
          const WEEK_SECONDS = 7 * 24 * 60 * 60
          const nowSeconds = Math.floor(Date.now() / 1000)
          epochTime = BigInt(Math.floor(nowSeconds / WEEK_SECONDS) * WEEK_SECONDS)
        }
      } else {
        // Fallback: align to current week
        const WEEK_SECONDS = 7 * 24 * 60 * 60
        const nowSeconds = Math.floor(Date.now() / 1000)
        epochTime = BigInt(Math.floor(nowSeconds / WEEK_SECONDS) * WEEK_SECONDS)
      }

      // Clamp epoch time to not exceed current week start
      {
        const WEEK_SECONDS = 7 * 24 * 60 * 60
        const nowSeconds = Math.floor(Date.now() / 1000)
        const nowWeekStart = Math.floor(nowSeconds / WEEK_SECONDS) * WEEK_SECONDS
        if (epochTime > BigInt(nowWeekStart)) {
          epochTime = BigInt(nowWeekStart)
        }
      }

      // 3) Fetch gauge relative weight from GaugeController using current block (no time arg to avoid reverts)
      let gaugeRelativeWeight: bigint = BigInt(0)
      try {
        gaugeRelativeWeight = await readContract(ethereumClient, {
        address: GAUGE_CONTROLLER_ADDRESS as `0x${string}`,
        abi: GAUGE_CONTROLLER_ABI,
          functionName: 'gauge_relative_weight',
          args: [gauge as `0x${string}`],
        }) as bigint
      } catch (_) {
        // As a fallback, try time-parameterized version with clamped epoch
        try {
          gaugeRelativeWeight = await readContract(ethereumClient, {
            address: GAUGE_CONTROLLER_ADDRESS as `0x${string}`,
            abi: GAUGE_CONTROLLER_ABI,
            functionName: 'gauge_relative_weight',
            args: [gauge as `0x${string}`, epochTime],
          }) as bigint
        } catch {
          gaugeRelativeWeight = BigInt(0)
        }
      }

      // 4) For each reward token, read reward_per_token(gauge, reward_token) and user claimable
      let bribeData: Array<{ token: string; amount: string; claimable: string; value: string }> = []
      if (rewardTokens.length > 0) {
        bribeData = await Promise.all(
          rewardTokens.map(async (rewardToken: string) => {
            const [claimable, rewardPerToken] = await Promise.all([
              readContract(ethereumClient, {
                address: CRV_BRIBE_ADDRESS as `0x${string}`,
                abi: CRV_BRIBE_ABI,
                functionName: 'claimable',
                args: [address, gauge as `0x${string}`, rewardToken as `0x${string}`],
              }),
              readContract(ethereumClient, {
                address: CRV_BRIBE_ADDRESS as `0x${string}`,
                abi: CRV_BRIBE_ABI,
                functionName: 'reward_per_token',
                args: [gauge as `0x${string}`, rewardToken as `0x${string}`],
              }),
            ])

            return {
              token: rewardToken,
              amount: (rewardPerToken as bigint).toString(),
              claimable: (claimable as bigint).toString(),
              value: ((rewardPerToken as bigint) * (gaugeRelativeWeight as bigint) / BigInt(1e18)).toString(),
            }
          })
        )
      }

      return {
        success: true,
        data: {
          gauge,
          period,
          weight: {
            relativeWeight: (gaugeRelativeWeight as bigint).toString(),
          },
          bribes: bribeData,
        }
      }

    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to get gauge bribes' }
    }
  }, [publicClient, address])

  const getTVLTrends = useCallback(async (
    protocols: string,
    timeframe: string = '7d'
  ): Promise<TransactionResult> => {
    try {
      setLoading(true)
      
      const response = await fetch(`/api/protocol/${protocols}`)
      if (!response.ok) {
        throw new Error('Failed to fetch protocol data')
      }
      
      const { success, data, error } = await response.json()
      
      if (!success) {
        throw new Error(error || 'Failed to get protocol metrics')
      }

      const tvl = extractLatestTvl(data)
      
      return {
        success: true,
        data: {
          tvl,
        }
      }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to get protocol metrics' }
    } finally {
      setLoading(false)
    }
  }, [])

  const getYieldOpportunities = useCallback(async (
    timeframe: string = '7d',
    minAPY: string = '0', 
    maxRisk: string = 'medium'
  ): Promise<TransactionResult> => {
    try {
      setLoading(true)

      const response = await fetch(`/api/yields?timeframe=${timeframe}&minApy=${minAPY}&maxRisk=${maxRisk}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch yield opportunities')
      }

      const { success, data, error } = await response.json()

      if (!success) {
        throw new Error(error || 'Failed to get yield opportunities')
      }

      return {
        success: true,
        data: data.sort((a: any, b: any) => b.apy - a.apy) // Sort by highest APY
      }

    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to get yield opportunities' }
    } finally {
      setLoading(false)
    }
  }, [])

  // ============================================================================
  // 4. YIELD FARMING EXECUTION FUNCTIONS
  // ============================================================================

  const enterYieldPosition = useCallback(async (
    protocol: string,
    poolAddress: string,
    amount: string,
    strategy: string = 'auto'
  ): Promise<TransactionResult> => {
    if (!address || !walletClient) {
      return { success: false, error: 'Wallet not connected' }
    }

    try {
      setLoading(true)
      const parsedAmount = parseEther(amount)
      
      let hash: string
      
      switch (protocol.toLowerCase()) {
        case 'curve':
          hash = await writeContract(walletClient, {
            address: poolAddress as `0x${string}`,
            abi: CURVE_POOL_ABI,
            functionName: 'add_liquidity',
            args: [[parsedAmount, BigInt(0)], BigInt(0)], // Simplified for single-sided
          })
          break
          
        case 'convex':
          // First deposit to Curve, then stake in Convex
          // This would be a multi-step process in real implementation
          hash = await writeContract(walletClient, {
            address: PROTOCOL_ADDRESSES.CONVEX_BOOSTER as `0x${string}`,
            abi: CONVEX_BOOSTER_ABI,
            functionName: 'deposit',
            args: [BigInt(0), parsedAmount, true], // pid 0, amount, stake
          })
          break
          
        case 'yearn':
          hash = await writeContract(walletClient, {
            address: poolAddress as `0x${string}`,
            abi: YEARN_VAULT_ABI,
            functionName: 'deposit',
            args: [parsedAmount],
          })
          break
          
        default:
          return { success: false, error: `Protocol ${protocol} not supported` }
      }
      
      return { success: true, data: { txHash: hash, protocol, amount } }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to enter yield position' }
    } finally {
      setLoading(false)
    }
  }, [address, walletClient])

  const exitYieldPosition = useCallback(async (
    protocol: string,
    poolAddress: string,
    amount: string
  ): Promise<TransactionResult> => {
    if (!address || !walletClient) {
      return { success: false, error: 'Wallet not connected' }
    }

    try {
      setLoading(true)
      const parsedAmount = parseEther(amount)
      
      let hash: string
      
      switch (protocol.toLowerCase()) {
        case 'curve':
          hash = await writeContract(walletClient, {
            address: poolAddress as `0x${string}`,
            abi: CURVE_POOL_ABI,
            functionName: 'remove_liquidity',
            args: [parsedAmount, [BigInt(0), BigInt(0)]],
          })
          break
          
        case 'convex':
          hash = await writeContract(walletClient, {
            address: PROTOCOL_ADDRESSES.CONVEX_BOOSTER as `0x${string}`,
            abi: CONVEX_BOOSTER_ABI,
            functionName: 'withdraw',
            args: [BigInt(0), parsedAmount], // pid, amount
          })
          break
          
        case 'yearn':
          hash = await writeContract(walletClient, {
            address: poolAddress as `0x${string}`,
            abi: YEARN_VAULT_ABI,
            functionName: 'withdraw',
            args: [parsedAmount],
          })
          break
          
        default:
          return { success: false, error: `Protocol ${protocol} not supported` }
      }
      
      return { success: true, data: { txHash: hash } }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to exit yield position' }
    } finally {
      setLoading(false)
    }
  }, [address, walletClient])

  const claimYieldRewards = useCallback(async (
    gaugeAddress: string
  ): Promise<TransactionResult> => {
    if (!address || !walletClient) {
      return { success: false, error: 'Wallet not connected' }
    }

    try {
      setLoading(true)
      
      const hash = await writeContract(walletClient, {
        address: gaugeAddress as `0x${string}`,
        abi: GAUGE_ABI,
        functionName: 'claim_rewards',
        args: [],
      })
      
      return { success: true, data: { txHash: hash } }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to claim rewards' }
    } finally {
      setLoading(false)
    }
  }, [address, walletClient])

  const voteForGauge = useCallback(async (
    gaugeAddress: string,
    weight: string
  ): Promise<TransactionResult> => {
    if (!address || !walletClient) {
      return { success: false, error: 'Wallet not connected' }
    }

    try {
      setLoading(true)
      const parsedWeight = parseEther(weight)
      
      const hash = await writeContract(walletClient, {
        address: PROTOCOL_ADDRESSES.VOTE_ESCROWED_CRV as `0x${string}`,
        abi: VOTE_ESCROW_ABI,
        functionName: 'vote_for_gauge_weights',
        args: [gaugeAddress as `0x${string}`, parsedWeight],
      })
      
      return { success: true, data: { txHash: hash } }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to vote for gauge' }
    } finally {
      setLoading(false)
    }
  }, [address, walletClient])

  const stakeInGauge = useCallback(async (
    gaugeAddress: string,
    amount: string
  ): Promise<TransactionResult> => {
    if (!address || !walletClient) {
      return { success: false, error: 'Wallet not connected' }
    }

    try {
      setLoading(true)
      const parsedAmount = parseEther(amount)
      
      const hash = await writeContract(walletClient, {
        address: gaugeAddress as `0x${string}`,
        abi: GAUGE_ABI,
        functionName: 'deposit',
        args: [parsedAmount],
      })
      
      return { success: true, data: { txHash: hash } }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to stake in gauge' }
    } finally {
      setLoading(false)
    }
  }, [address, walletClient])

  const unstakeFromGauge = useCallback(async (
    gaugeAddress: string,
    amount: string
  ): Promise<TransactionResult> => {
    if (!address || !walletClient) {
      return { success: false, error: 'Wallet not connected' }
    }

    try {
      setLoading(true)
      const parsedAmount = parseEther(amount)
      
      const hash = await writeContract(walletClient, {
        address: gaugeAddress as `0x${string}`,
        abi: GAUGE_ABI,
        functionName: 'withdraw',
        args: [parsedAmount],
      })
      
      return { success: true, data: { txHash: hash } }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to unstake from gauge' }
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
    
    // Basic wallet functions
    connectWallet,
    disconnectWallet,
    getAccountAddress,
    getNativeBalance,
    getTokenBalance,
    transferToken,
    approveToken,
    
    // Yield Farming Analytics
    getProtocolMetrics,
    getGaugeBribes,
    getTVLTrends,
    getYieldOpportunities,
    
    // Yield Farming Execution
    enterYieldPosition,
    exitYieldPosition,
    claimYieldRewards,
    voteForGauge,
    stakeInGauge,
    unstakeFromGauge,
    
    // Utility Functions
    getBlockNumber,
    getTransactionStatus,
    getTokenInfo,
    clearError,
    reset,
  }
} 

export { useYieldFarming as useSonicTransactions } 