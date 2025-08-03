import { NextRequest, NextResponse } from 'next/server'
import { createPublicClient, http, parseEther, formatEther, parseAbi } from 'viem'
import { readContract } from 'viem/actions'
import { sonicBlazeTestnet } from 'viem/chains'

// Sonic Network Configuration
const SONIC_CHAIN = sonicBlazeTestnet

// Common Token Addresses (replace with actual addresses)
const TOKENS = {
  USDC: '0xA0b86a33E6441b6c4C8B8B8B8B8B8B8B8B8B8B8', // Replace with actual USDC address on Sonic
  WETH: '0xB8B8B8B8B8B8B8B8B8B8B8B8B8B8B8B8B8B8B8B8', // Replace with actual WETH address on Sonic
} as const

// Bridge Contract Addresses
const BRIDGE_CONTRACTS = {
  SONIC_BRIDGE: '0xC8C8C8C8C8C8C8C8C8C8C8C8C8C8C8C8C8C8C8C8', // Replace with actual bridge address
  ETHEREUM_BRIDGE: '0xD8D8D8D8D8D8D8D8D8D8D8D8D8D8D8D8D8D8D8D8', // Replace with actual bridge address
} as const

// Staking Contract Address
const STAKING_CONTRACT = '0xE8E8E8E8E8E8E8E8E8E8E8E8E8E8E8E8E8E8E8E8' // Replace with actual staking contract

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

// Initialize public client for read operations
const publicClient = createPublicClient({
  chain: SONIC_CHAIN,
  transport: http(),
})

// ============================================================================
// 1. WALLET & ACCOUNT FUNCTIONS
// ============================================================================

export async function getNativeBalance(address: string): Promise<string> {
  try {
    const balance = await publicClient.getBalance({ address: address as `0x${string}` })
    return formatEther(balance)
  } catch (error) {
    throw new Error(`Failed to get native balance: ${error}`)
  }
}

// ============================================================================
// 2. TOKEN FUNCTIONS
// ============================================================================

export async function getTokenBalance(address: string, tokenAddress: string): Promise<string> {
  try {
    const balance = await readContract(publicClient, {
      address: tokenAddress as `0x${string}`,
      abi: ERC20_ABI,
      functionName: 'balanceOf',
      args: [address as `0x${string}`],
    })
    
    const decimals = await readContract(publicClient, {
      address: tokenAddress as `0x${string}`,
      abi: ERC20_ABI,
      functionName: 'decimals',
    })
    
    return formatEther(balance as bigint)
  } catch (error) {
    throw new Error(`Failed to get token balance: ${error}`)
  }
}

export async function getTokenAllowance(
  tokenAddress: string,
  owner: string,
  spender: string
): Promise<string> {
  try {
    const allowance = await readContract(publicClient, {
      address: tokenAddress as `0x${string}`,
      abi: ERC20_ABI,
      functionName: 'allowance',
      args: [owner as `0x${string}`, spender as `0x${string}`],
    })
    
    return formatEther(allowance as bigint)
  } catch (error) {
    throw new Error(`Failed to get token allowance: ${error}`)
  }
}

// ============================================================================
// 3. BRIDGING FUNCTIONS (Read-only operations)
// ============================================================================

// Note: Bridge transactions should be handled by the frontend with wallet signing
// These functions are for read-only operations or status checking

// ============================================================================
// 4. STAKING FUNCTIONS (Read-only operations)
// ============================================================================

export async function pendingRewards(
  delegator: string,
  validatorId: string
): Promise<string> {
  try {
    const rewards = await readContract(publicClient, {
      address: STAKING_CONTRACT as `0x${string}`,
      abi: STAKING_ABI,
      functionName: 'pendingRewards',
      args: [delegator as `0x${string}`, BigInt(validatorId)],
    })
    
    return formatEther(rewards as bigint)
  } catch (error) {
    throw new Error(`Failed to get pending rewards: ${error}`)
  }
}

// ============================================================================
// 5. UTILITY & INFO FUNCTIONS
// ============================================================================

export async function getBlockNumber(): Promise<string> {
  try {
    const blockNumber = await publicClient.getBlockNumber()
    return blockNumber.toString()
  } catch (error) {
    throw new Error(`Failed to get block number: ${error}`)
  }
}

export async function getTransactionStatus(txHash: string): Promise<{
  status: 'pending' | 'success' | 'failed'
  blockNumber?: string
  gasUsed?: string
}> {
  try {
    const receipt = await publicClient.getTransactionReceipt({ hash: txHash as `0x${string}` })
    
    return {
      status: receipt.status === 'success' ? 'success' : 'failed',
      blockNumber: receipt.blockNumber.toString(),
      gasUsed: receipt.gasUsed.toString(),
    }
  } catch (error) {
    // If transaction is still pending, it won't have a receipt yet
    return { status: 'pending' }
  }
}

export async function getTokenInfo(tokenAddress: string): Promise<{
  name: string
  symbol: string
  decimals: number
}> {
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
      name: name as string,
      symbol: symbol as string,
      decimals: decimals as number,
    }
  } catch (error) {
    throw new Error(`Failed to get token info: ${error}`)
  }
}

// ============================================================================
// API ROUTE HANDLER
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, ...params } = body

    let result: any

    switch (action) {
      // Wallet & Account Functions
      case 'getNativeBalance':
        result = await getNativeBalance(params.address)
        break

      // Token Functions
      case 'getTokenBalance':
        result = await getTokenBalance(params.address, params.tokenAddress)
        break
      case 'getTokenAllowance':
        result = await getTokenAllowance(params.tokenAddress, params.owner, params.spender)
        break

      // Staking Functions (Read-only)
      case 'pendingRewards':
        result = await pendingRewards(params.delegator, params.validatorId)
        break

      // Utility Functions
      case 'getBlockNumber':
        result = await getBlockNumber()
        break
      case 'getTransactionStatus':
        result = await getTransactionStatus(params.txHash)
        break
      case 'getTokenInfo':
        result = await getTokenInfo(params.tokenAddress)
        break

      default:
        return NextResponse.json({ error: 'Invalid action or action requires wallet signing' }, { status: 400 })
    }

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('Transaction API error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Sonic Transaction API - Read-only operations',
    availableActions: [
      'getNativeBalance',
      'getTokenBalance',
      'getTokenAllowance',
      'pendingRewards',
      'getBlockNumber',
      'getTransactionStatus',
      'getTokenInfo',
    ],
    note: 'Write operations (transfers, approvals, staking) should be handled by the frontend with wallet signing',
  })
}
