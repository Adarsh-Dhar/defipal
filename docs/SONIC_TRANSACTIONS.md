# Sonic Transaction Functions

This document provides comprehensive documentation for all the transaction functions available in your Sonic-based chat app that acts as a user's blockchain pal.

## Table of Contents

1. [Overview](#overview)
2. [Setup & Configuration](#setup--configuration)
3. [Wallet & Account Functions](#wallet--account-functions)
4. [Token Functions](#token-functions)
5. [Bridging Functions](#bridging-functions)
6. [Staking Functions](#staking-functions)
7. [Utility & Info Functions](#utility--info-functions)
8. [API Reference](#api-reference)
9. [Usage Examples](#usage-examples)
10. [Error Handling](#error-handling)

## Overview

The Sonic transaction functions provide a complete interface for interacting with the Sonic blockchain, including:

- **Wallet Management**: Connect wallets and get account information
- **Token Operations**: Transfer tokens, check balances, manage allowances
- **Cross-Chain Bridging**: Bridge tokens between Ethereum and Sonic networks
- **Staking**: Delegate, undelegate, and manage staking rewards
- **Utilities**: Get blockchain information and transaction status

## Setup & Configuration

### Prerequisites

```bash
pnpm add viem wagmi @wagmi/core @wagmi/connectors @tanstack/react-query
```

### Network Configuration

Update the Sonic network configuration in `app/api/tx/route.ts`:

```typescript
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
```

### Contract Addresses

Update the contract addresses with actual Sonic addresses:

```typescript
const TOKENS = {
  USDC: '0xA0b86a33E6441b6c4C8B8B8B8B8B8B8B8B8B8B8', // Replace with actual USDC address
  WETH: '0xB8B8B8B8B8B8B8B8B8B8B8B8B8B8B8B8B8B8B8B8', // Replace with actual WETH address
}

const BRIDGE_CONTRACTS = {
  SONIC_BRIDGE: '0xC8C8C8C8C8C8C8C8C8C8C8C8C8C8C8C8C8C8C8C8', // Replace with actual bridge address
  ETHEREUM_BRIDGE: '0xD8D8D8D8D8D8D8D8D8D8D8D8D8D8D8D8D8D8D8D8', // Replace with actual bridge address
}

const STAKING_CONTRACT = '0xE8E8E8E8E8E8E8E8E8E8E8E8E8E8E8E8E8E8E8E8' // Replace with actual staking contract
```

## Wallet & Account Functions

### `connectWallet()`

Connect to the user's wallet and return the wallet address.

```typescript
const { connectWallet } = useSonicTransactions()
const result = await connectWallet()
// Returns: { success: true, data: "0x742d35Cc6634C0532925a3b8D4C9db96590b5b8c" }
```

### `getAccountAddress()`

Get the currently connected account address.

```typescript
const { getAccountAddress } = useSonicTransactions()
const result = await getAccountAddress()
// Returns: { success: true, data: "0x742d35Cc6634C0532925a3b8D4C9db96590b5b8c" }
```

### `getNativeBalance(address: string)`

Get the native S token balance for a given address.

```typescript
const { getNativeBalance } = useSonicTransactions()
const result = await getNativeBalance("0x742d35Cc6634C0532925a3b8D4C9db96590b5b8c")
// Returns: { success: true, data: "1234.567" }
```

## Token Functions

### `getTokenBalance(address: string, tokenAddress: string)`

Get the ERC-20 token balance for a user.

```typescript
const { getTokenBalance } = useSonicTransactions()
const result = await getTokenBalance(
  "0x742d35Cc6634C0532925a3b8D4C9db96590b5b8c",
  "0xA0b86a33E6441b6c4C8B8B8B8B8B8B8B8B8B8B8"
)
// Returns: { success: true, data: "500.00" }
```

### `transferToken(tokenAddress: string, to: string, amount: string, privateKey: string)`

Transfer an ERC-20 token to another address.

```typescript
const { transferToken } = useSonicTransactions()
const result = await transferToken(
  "0xA0b86a33E6441b6c4C8B8B8B8B8B8B8B8B8B8B8", // USDC address
  "0x1234567890123456789012345678901234567890", // recipient
  "100.0", // amount
  "0x..." // private key
)
// Returns: { success: true, data: "0x..." } // transaction hash
```

### `getTokenAllowance(tokenAddress: string, owner: string, spender: string)`

Check how much a contract is allowed to spend on behalf of a user.

```typescript
const { getTokenAllowance } = useSonicTransactions()
const result = await getTokenAllowance(
  "0xA0b86a33E6441b6c4C8B8B8B8B8B8B8B8B8B8B8", // token address
  "0x742d35Cc6634C0532925a3b8D4C9db96590b5b8c", // owner
  "0x1234567890123456789012345678901234567890"  // spender
)
// Returns: { success: true, data: "1000.00" }
```

### `approveToken(tokenAddress: string, spender: string, amount: string, privateKey: string)`

Approve a contract to spend tokens on the user's behalf.

```typescript
const { approveToken } = useSonicTransactions()
const result = await approveToken(
  "0xA0b86a33E6441b6c4C8B8B8B8B8B8B8B8B8B8B8", // token address
  "0x1234567890123456789012345678901234567890", // spender
  "1000.0", // amount
  "0x..." // private key
)
// Returns: { success: true, data: "0x..." } // transaction hash
```

## Bridging Functions

### `bridgeToSonic(tokenAddress: string, amount: string, privateKey: string)`

Bridge tokens from Ethereum to Sonic.

```typescript
const { bridgeToSonic } = useSonicTransactions()
const result = await bridgeToSonic(
  "0xA0b86a33E6441b6c4C8B8B8B8B8B8B8B8B8B8B8", // token address
  "100.0", // amount
  "0x..." // private key
)
// Returns: { success: true, data: { depositId: "123456", txHash: "0x..." } }
```

### `claimOnSonic(depositBlockNumber: string, depositId: string, tokenAddress: string, amount: string, privateKey: string)`

Claim bridged tokens on Sonic after deposit.

```typescript
const { claimOnSonic } = useSonicTransactions()
const result = await claimOnSonic(
  "12345678", // deposit block number
  "123456", // deposit ID
  "0xA0b86a33E6441b6c4C8B8B8B8B8B8B8B8B8B8B8", // token address
  "100.0", // amount
  "0x..." // private key
)
// Returns: { success: true, data: "0x..." } // transaction hash
```

### `bridgeToEthereum(tokenAddress: string, amount: string, privateKey: string)`

Bridge tokens from Sonic back to Ethereum.

```typescript
const { bridgeToEthereum } = useSonicTransactions()
const result = await bridgeToEthereum(
  "0xA0b86a33E6441b6c4C8B8B8B8B8B8B8B8B8B8B8", // token address
  "100.0", // amount
  "0x..." // private key
)
// Returns: { success: true, data: { withdrawalId: "123456", txHash: "0x..." } }
```

### `claimOnEthereum(withdrawalBlockNumber: string, withdrawalId: string, tokenAddress: string, amount: string, privateKey: string)`

Claim bridged tokens on Ethereum after withdrawal.

```typescript
const { claimOnEthereum } = useSonicTransactions()
const result = await claimOnEthereum(
  "12345678", // withdrawal block number
  "123456", // withdrawal ID
  "0xA0b86a33E6441b6c4C8B8B8B8B8B8B8B8B8B8B8", // token address
  "100.0", // amount
  "0x..." // private key
)
// Returns: { success: true, data: "0x..." } // transaction hash
```

## Staking Functions

### `delegate(validatorId: string, amount: string, privateKey: string)`

Delegate stake to a validator.

```typescript
const { delegate } = useSonicTransactions()
const result = await delegate(
  "1", // validator ID
  "1000.0", // amount to stake
  "0x..." // private key
)
// Returns: { success: true, data: "0x..." } // transaction hash
```

### `undelegate(validatorId: string, amount: string, privateKey: string)`

Begin the withdrawal process for staked tokens.

```typescript
const { undelegate } = useSonicTransactions()
const result = await undelegate(
  "1", // validator ID
  "500.0", // amount to undelegate
  "0x..." // private key
)
// Returns: { success: true, data: { withdrawalId: "123456", txHash: "0x..." } }
```

### `withdraw(validatorId: string, withdrawalId: string, privateKey: string)`

Claim unlocked stake after withdrawal period.

```typescript
const { withdraw } = useSonicTransactions()
const result = await withdraw(
  "1", // validator ID
  "123456", // withdrawal ID
  "0x..." // private key
)
// Returns: { success: true, data: "0x..." } // transaction hash
```

### `pendingRewards(delegator: string, validatorId: string)`

Check claimable staking rewards.

```typescript
const { pendingRewards } = useSonicTransactions()
const result = await pendingRewards(
  "0x742d35Cc6634C0532925a3b8D4C9db96590b5b8c", // delegator address
  "1" // validator ID
)
// Returns: { success: true, data: "50.25" }
```

### `claimRewards(validatorId: string, privateKey: string)`

Claim pending staking rewards.

```typescript
const { claimRewards } = useSonicTransactions()
const result = await claimRewards(
  "1", // validator ID
  "0x..." // private key
)
// Returns: { success: true, data: "0x..." } // transaction hash
```

## Utility & Info Functions

### `getBlockNumber()`

Get the latest block number.

```typescript
const { getBlockNumber } = useSonicTransactions()
const result = await getBlockNumber()
// Returns: { success: true, data: "12345678" }
```

### `getTransactionStatus(txHash: string)`

Get the status of a transaction.

```typescript
const { getTransactionStatus } = useSonicTransactions()
const result = await getTransactionStatus("0x...")
// Returns: { success: true, data: { status: "success", blockNumber: "12345678", gasUsed: "21000" } }
```

### `getTokenInfo(tokenAddress: string)`

Get token metadata (name, symbol, decimals).

```typescript
const { getTokenInfo } = useSonicTransactions()
const result = await getTokenInfo("0xA0b86a33E6441b6c4C8B8B8B8B8B8B8B8B8B8B8")
// Returns: { success: true, data: { name: "USD Coin", symbol: "USDC", decimals: 6 } }
```

## API Reference

### Hook Usage

```typescript
import { useSonicTransactions } from '@/hooks/useSonicTransactions'

function MyComponent() {
  const {
    loading,
    error,
    clearError,
    connectWallet,
    getNativeBalance,
    transferToken,
    // ... all other functions
  } = useSonicTransactions()

  // Use the functions
  const handleConnect = async () => {
    const result = await connectWallet()
    if (result.success) {
      console.log('Connected:', result.data)
    }
  }

  return (
    <div>
      {loading && <div>Loading...</div>}
      {error && <div>Error: {error}</div>}
      <button onClick={handleConnect}>Connect Wallet</button>
    </div>
  )
}
```

### API Endpoint

All functions are available via the `/api/tx` endpoint:

```typescript
// POST /api/tx
{
  "action": "connectWallet",
  // ... additional parameters
}

// Response
{
  "success": true,
  "data": "0x742d35Cc6634C0532925a3b8D4C9db96590b5b8c"
}
```

## Usage Examples

### Complete Token Transfer Flow

```typescript
import { useSonicTransactions } from '@/hooks/useSonicTransactions'

function TokenTransfer() {
  const { transferToken, getTokenBalance, loading, error } = useSonicTransactions()
  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('')
  const [privateKey, setPrivateKey] = useState('')

  const handleTransfer = async () => {
    // First check balance
    const balanceResult = await getTokenBalance(
      "0x742d35Cc6634C0532925a3b8D4C9db96590b5b8c",
      "0xA0b86a33E6441b6c4C8B8B8B8B8B8B8B8B8B8B8"
    )

    if (balanceResult.success && parseFloat(balanceResult.data) >= parseFloat(amount)) {
      // Proceed with transfer
      const result = await transferToken(
        "0xA0b86a33E6441b6c4C8B8B8B8B8B8B8B8B8B8B8",
        recipient,
        amount,
        privateKey
      )

      if (result.success) {
        console.log('Transfer successful:', result.data)
      }
    }
  }

  return (
    <div>
      <input
        type="text"
        placeholder="Recipient address"
        value={recipient}
        onChange={(e) => setRecipient(e.target.value)}
      />
      <input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <input
        type="password"
        placeholder="Private key"
        value={privateKey}
        onChange={(e) => setPrivateKey(e.target.value)}
      />
      <button onClick={handleTransfer} disabled={loading}>
        {loading ? 'Transferring...' : 'Transfer'}
      </button>
    </div>
  )
}
```

### Bridge Flow Example

```typescript
function BridgeFlow() {
  const { bridgeToSonic, claimOnSonic, loading } = useSonicTransactions()
  const [step, setStep] = useState(1)
  const [bridgeData, setBridgeData] = useState(null)

  const handleBridgeToSonic = async () => {
    const result = await bridgeToSonic(
      "0xA0b86a33E6441b6c4C8B8B8B8B8B8B8B8B8B8B8",
      "100.0",
      "0x..."
    )

    if (result.success) {
      setBridgeData(result.data)
      setStep(2)
    }
  }

  const handleClaimOnSonic = async () => {
    if (bridgeData) {
      const result = await claimOnSonic(
        bridgeData.blockNumber,
        bridgeData.depositId,
        "0xA0b86a33E6441b6c4C8B8B8B8B8B8B8B8B8B8B8",
        "100.0",
        "0x..."
      )

      if (result.success) {
        console.log('Claimed successfully:', result.data)
      }
    }
  }

  return (
    <div>
      {step === 1 && (
        <button onClick={handleBridgeToSonic} disabled={loading}>
          Bridge to Sonic
        </button>
      )}
      {step === 2 && (
        <button onClick={handleClaimOnSonic} disabled={loading}>
          Claim on Sonic
        </button>
      )}
    </div>
  )
}
```

## Error Handling

All functions return a consistent error format:

```typescript
// Success response
{
  success: true,
  data: "result data"
}

// Error response
{
  success: false,
  error: "Error message"
}
```

### Common Error Types

1. **Network Errors**: Connection issues with Sonic RPC
2. **Contract Errors**: Invalid contract addresses or function calls
3. **Transaction Errors**: Insufficient gas, invalid parameters
4. **Authentication Errors**: Invalid private keys or permissions

### Error Handling Example

```typescript
const { transferToken } = useSonicTransactions()

const handleTransfer = async () => {
  try {
    const result = await transferToken(tokenAddress, recipient, amount, privateKey)
    
    if (result.success) {
      console.log('Transfer successful:', result.data)
    } else {
      console.error('Transfer failed:', result.error)
      // Handle specific error types
      if (result.error.includes('insufficient funds')) {
        // Show insufficient funds message
      } else if (result.error.includes('invalid address')) {
        // Show invalid address message
      }
    }
  } catch (error) {
    console.error('Unexpected error:', error)
  }
}
```

## Security Considerations

1. **Private Key Management**: Never store private keys in plain text or localStorage
2. **Environment Variables**: Use environment variables for sensitive configuration
3. **Input Validation**: Always validate user inputs before sending to blockchain
4. **Error Messages**: Don't expose sensitive information in error messages
5. **Rate Limiting**: Implement rate limiting for API endpoints

## Testing

The demo component (`components/SonicTransactionDemo.tsx`) provides a comprehensive testing interface for all functions. You can use it to:

1. Test all transaction functions
2. Verify error handling
3. Check response formats
4. Validate user inputs

## Next Steps

1. Replace placeholder contract addresses with actual Sonic addresses
2. Implement proper wallet connection using wagmi
3. Add transaction monitoring and notifications
4. Implement proper error handling and user feedback
5. Add transaction history and status tracking
6. Implement gas estimation and optimization 