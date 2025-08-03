export interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
}

export interface User {
  id: string
  walletAddress?: string
  isConnected: boolean
}

export interface Transaction {
  id: string
  type: "swap" | "stake" | "unstake" | "farm" | "harvest"
  status: "pending" | "confirmed" | "failed"
  hash?: string
  timestamp: Date
  parameters: Record<string, any>
}

export interface TokenBalance {
  symbol: string
  amount: string
  usdValue: string
  contractAddress?: string
}

export interface DeFiPool {
  id: string
  name: string
  tokens: string[]
  apy: number
  tvl: string
  type: "liquidity" | "staking" | "lending"
}
