import { NextRequest, NextResponse } from 'next/server'
import { createPublicClient, createWalletClient, http, parseEther, formatEther, readContract, writeContract, parseAbi } from 'viem'
import { mainnet, sepolia } from 'viem/chains'
import { privateKeyToAccount } from 'viem/accounts'

// Sonic Network Configuration
const SONIC_CHAIN = {
  id: 1234, // Replace with actual Sonic chain ID
  name: 'Sonic',
  network: 'sonic',
  nativeCurrency: {
    decimals: 18,
    name: 'Sonic',
    symbol: 'S',
  },
  rpcUrls: {
    default: { http: ['https://rpc.soniclabs.com'] },
    public: { http: ['https://rpc.soniclabs.com'] },
  },
} as const

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

// Initialize clients
const publicClient = createPublicClient({
  chain: SONIC_CHAIN,
  transport: http(),
})

const walletClient = createWalletClient({
  chain: SONIC_CHAIN,
  transport: http(),
})

// ============================================================================
// 1. WALLET & ACCOUNT FUNCTIONS
// ============================================================================

export async function connectWallet(): Promise<string> {
  try {
    // This would typically be handled by wagmi in the frontend
    // For API purposes, we'll return a mock address
    return '0x742d35Cc6634C0532925a3b8D4C9db96590b5b8c'
  } catch (error) {
    throw new Error(`Failed to connect wallet: ${error}`)
  }
}

export async function getAccountAddress(): Promise<string> {
  try {
    // In a real implementation, this would get the connected account
    return '0x742d35Cc6634C0532925a3b8D4C9db96590b5b8c'
  } catch (error) {
    throw new Error(`Failed to get account address: ${error}`)
  }
}

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

export async function transferToken(
  tokenAddress: string,
  to: string,
  amount: string,
  privateKey: string
): Promise<string> {
  try {
    const account = privateKeyToAccount(privateKey as `0x${string}`)
    const parsedAmount = parseEther(amount)
    
    const { request } = await publicClient.simulateContract({
      account,
      address: tokenAddress as `0x${string}`,
      abi: ERC20_ABI,
      functionName: 'transfer',
      args: [to as `0x${string}`, parsedAmount],
    })
    
    const hash = await writeContract(walletClient, request)
    return hash
  } catch (error) {
    throw new Error(`Failed to transfer token: ${error}`)
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

export async function approveToken(
  tokenAddress: string,
  spender: string,
  amount: string,
  privateKey: string
): Promise<string> {
  try {
    const account = privateKeyToAccount(privateKey as `0x${string}`)
    const parsedAmount = parseEther(amount)
    
    const { request } = await publicClient.simulateContract({
      account,
      address: tokenAddress as `0x${string}`,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [spender as `0x${string}`, parsedAmount],
    })
    
    const hash = await writeContract(walletClient, request)
    return hash
  } catch (error) {
    throw new Error(`Failed to approve token: ${error}`)
  }
}

// ============================================================================
// 3. BRIDGING FUNCTIONS
// ============================================================================

export async function bridgeToSonic(
  tokenAddress: string,
  amount: string,
  privateKey: string
): Promise<{ depositId: string; txHash: string }> {
  try {
    const account = privateKeyToAccount(privateKey as `0x${string}`)
    const parsedAmount = parseEther(amount)
    
    const { request } = await publicClient.simulateContract({
      account,
      address: BRIDGE_CONTRACTS.ETHEREUM_BRIDGE as `0x${string}`,
      abi: BRIDGE_ABI,
      functionName: 'deposit',
      args: [parsedAmount, tokenAddress as `0x${string}`],
    })
    
    const hash = await writeContract(walletClient, request)
    
    // In a real implementation, you'd get the deposit ID from the transaction receipt
    const depositId = Math.floor(Math.random() * 1000000).toString()
    
    return { depositId, txHash: hash }
  } catch (error) {
    throw new Error(`Failed to bridge to Sonic: ${error}`)
  }
}

export async function claimOnSonic(
  depositBlockNumber: string,
  depositId: string,
  tokenAddress: string,
  amount: string,
  privateKey: string
): Promise<string> {
  try {
    const account = privateKeyToAccount(privateKey as `0x${string}`)
    const parsedAmount = parseEther(amount)
    
    const { request } = await publicClient.simulateContract({
      account,
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
    
    const hash = await writeContract(walletClient, request)
    return hash
  } catch (error) {
    throw new Error(`Failed to claim on Sonic: ${error}`)
  }
}

export async function bridgeToEthereum(
  tokenAddress: string,
  amount: string,
  privateKey: string
): Promise<{ withdrawalId: string; txHash: string }> {
  try {
    const account = privateKeyToAccount(privateKey as `0x${string}`)
    const parsedAmount = parseEther(amount)
    
    const { request } = await publicClient.simulateContract({
      account,
      address: BRIDGE_CONTRACTS.SONIC_BRIDGE as `0x${string}`,
      abi: BRIDGE_ABI,
      functionName: 'withdraw',
      args: [parsedAmount, tokenAddress as `0x${string}`],
    })
    
    const hash = await writeContract(walletClient, request)
    
    // In a real implementation, you'd get the withdrawal ID from the transaction receipt
    const withdrawalId = Math.floor(Math.random() * 1000000).toString()
    
    return { withdrawalId, txHash: hash }
  } catch (error) {
    throw new Error(`Failed to bridge to Ethereum: ${error}`)
  }
}

export async function claimOnEthereum(
  withdrawalBlockNumber: string,
  withdrawalId: string,
  tokenAddress: string,
  amount: string,
  privateKey: string
): Promise<string> {
  try {
    const account = privateKeyToAccount(privateKey as `0x${string}`)
    const parsedAmount = parseEther(amount)
    
    const { request } = await publicClient.simulateContract({
      account,
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
    
    const hash = await writeContract(walletClient, request)
    return hash
  } catch (error) {
    throw new Error(`Failed to claim on Ethereum: ${error}`)
  }
}

// ============================================================================
// 4. STAKING FUNCTIONS
// ============================================================================

export async function delegate(
  validatorId: string,
  amount: string,
  privateKey: string
): Promise<string> {
  try {
    const account = privateKeyToAccount(privateKey as `0x${string}`)
    const parsedAmount = parseEther(amount)
    
    const { request } = await publicClient.simulateContract({
      account,
      address: STAKING_CONTRACT as `0x${string}`,
      abi: STAKING_ABI,
      functionName: 'delegate',
      args: [BigInt(validatorId), parsedAmount],
    })
    
    const hash = await writeContract(walletClient, request)
    return hash
  } catch (error) {
    throw new Error(`Failed to delegate: ${error}`)
  }
}

export async function undelegate(
  validatorId: string,
  amount: string,
  privateKey: string
): Promise<{ withdrawalId: string; txHash: string }> {
  try {
    const account = privateKeyToAccount(privateKey as `0x${string}`)
    const parsedAmount = parseEther(amount)
    
    const { request } = await publicClient.simulateContract({
      account,
      address: STAKING_CONTRACT as `0x${string}`,
      abi: STAKING_ABI,
      functionName: 'undelegate',
      args: [BigInt(validatorId), parsedAmount],
    })
    
    const hash = await writeContract(walletClient, request)
    
    // In a real implementation, you'd get the withdrawal ID from the transaction receipt
    const withdrawalId = Math.floor(Math.random() * 1000000).toString()
    
    return { withdrawalId, txHash: hash }
  } catch (error) {
    throw new Error(`Failed to undelegate: ${error}`)
  }
}

export async function withdraw(
  validatorId: string,
  withdrawalId: string,
  privateKey: string
): Promise<string> {
  try {
    const account = privateKeyToAccount(privateKey as `0x${string}`)
    
    const { request } = await publicClient.simulateContract({
      account,
      address: STAKING_CONTRACT as `0x${string}`,
      abi: STAKING_ABI,
      functionName: 'withdraw',
      args: [BigInt(validatorId), BigInt(withdrawalId)],
    })
    
    const hash = await writeContract(walletClient, request)
    return hash
  } catch (error) {
    throw new Error(`Failed to withdraw: ${error}`)
  }
}

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

export async function claimRewards(
  validatorId: string,
  privateKey: string
): Promise<string> {
  try {
    const account = privateKeyToAccount(privateKey as `0x${string}`)
    
    const { request } = await publicClient.simulateContract({
      account,
      address: STAKING_CONTRACT as `0x${string}`,
      abi: STAKING_ABI,
      functionName: 'claimRewards',
      args: [BigInt(validatorId)],
    })
    
    const hash = await writeContract(walletClient, request)
    return hash
  } catch (error) {
    throw new Error(`Failed to claim rewards: ${error}`)
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
      case 'connectWallet':
        result = await connectWallet()
        break
      case 'getAccountAddress':
        result = await getAccountAddress()
        break
      case 'getNativeBalance':
        result = await getNativeBalance(params.address)
        break

      // Token Functions
      case 'getTokenBalance':
        result = await getTokenBalance(params.address, params.tokenAddress)
        break
      case 'transferToken':
        result = await transferToken(params.tokenAddress, params.to, params.amount, params.privateKey)
        break
      case 'getTokenAllowance':
        result = await getTokenAllowance(params.tokenAddress, params.owner, params.spender)
        break
      case 'approveToken':
        result = await approveToken(params.tokenAddress, params.spender, params.amount, params.privateKey)
        break

      // Bridging Functions
      case 'bridgeToSonic':
        result = await bridgeToSonic(params.tokenAddress, params.amount, params.privateKey)
        break
      case 'claimOnSonic':
        result = await claimOnSonic(params.depositBlockNumber, params.depositId, params.tokenAddress, params.amount, params.privateKey)
        break
      case 'bridgeToEthereum':
        result = await bridgeToEthereum(params.tokenAddress, params.amount, params.privateKey)
        break
      case 'claimOnEthereum':
        result = await claimOnEthereum(params.withdrawalBlockNumber, params.withdrawalId, params.tokenAddress, params.amount, params.privateKey)
        break

      // Staking Functions
      case 'delegate':
        result = await delegate(params.validatorId, params.amount, params.privateKey)
        break
      case 'undelegate':
        result = await undelegate(params.validatorId, params.amount, params.privateKey)
        break
      case 'withdraw':
        result = await withdraw(params.validatorId, params.withdrawalId, params.privateKey)
        break
      case 'pendingRewards':
        result = await pendingRewards(params.delegator, params.validatorId)
        break
      case 'claimRewards':
        result = await claimRewards(params.validatorId, params.privateKey)
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
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
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
    message: 'Sonic Transaction API',
    availableActions: [
      'connectWallet',
      'getAccountAddress',
      'getNativeBalance',
      'getTokenBalance',
      'transferToken',
      'getTokenAllowance',
      'approveToken',
      'bridgeToSonic',
      'claimOnSonic',
      'bridgeToEthereum',
      'claimOnEthereum',
      'delegate',
      'undelegate',
      'withdraw',
      'pendingRewards',
      'claimRewards',
      'getBlockNumber',
      'getTransactionStatus',
      'getTokenInfo',
    ],
  })
}
