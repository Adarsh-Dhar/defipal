# Connected Wallet Integration Guide

This guide explains how to use the connected wallet for signing all transaction functions in the Sonic DeFi application.

## Overview

The application now uses **wagmi** for wallet connection and **viem** for blockchain interactions. All transactions are signed by the connected wallet instead of using private keys, making it much more secure and user-friendly.

## Key Benefits

1. **Security**: No private keys in frontend code
2. **User Experience**: Users sign transactions through their wallet (MetaMask)
3. **Compatibility**: Works with any wallet that supports EIP-1193
4. **Chain Support**: Automatically handles Sonic network switching

## How It Works

### 1. Wallet Connection

Users connect their wallet through the header component:

```typescript
import { useAccount, useConnect, useDisconnect } from 'wagmi'

const { address, isConnected } = useAccount()
const { connect, connectors } = useConnect()
const { disconnect } = useDisconnect()

const handleConnectWallet = () => {
  if (isConnected) {
    disconnect()
  } else {
    const connector = connectors[0]
    if (connector.ready) {
      connect({ connector })
    }
  }
}
```

### 2. Transaction Functions

All transaction functions now use the connected wallet:

```typescript
import { useSonicTransactions } from '@/hooks/useSonicTransactions'

const { transferToken, delegate, bridgeToSonic } = useSonicTransactions()

// Transfer tokens
const result = await transferToken(tokenAddress, recipient, amount)

// Delegate for staking
const result = await delegate(validatorId, amount)

// Bridge tokens
const result = await bridgeToSonic(tokenAddress, amount)
```

## Function Categories

### 1. Wallet & Account Functions

```typescript
// Get connected wallet address
const { getAccountAddress } = useSonicTransactions()
const result = await getAccountAddress()

// Get native token balance
const { getNativeBalance } = useSonicTransactions()
const result = await getNativeBalance()
```

### 2. Token Functions

```typescript
const { 
  getTokenBalance, 
  transferToken, 
  getTokenAllowance, 
  approveToken 
} = useSonicTransactions()

// Get token balance
const balance = await getTokenBalance(tokenAddress)

// Transfer tokens
const result = await transferToken(tokenAddress, recipient, amount)

// Check allowance
const allowance = await getTokenAllowance(tokenAddress, spender)

// Approve tokens
const result = await approveToken(tokenAddress, spender, amount)
```

### 3. Bridging Functions

```typescript
const { 
  bridgeToSonic, 
  claimOnSonic, 
  bridgeToEthereum, 
  claimOnEthereum 
} = useSonicTransactions()

// Bridge to Sonic
const result = await bridgeToSonic(tokenAddress, amount)

// Claim on Sonic
const result = await claimOnSonic(depositBlockNumber, depositId, tokenAddress, amount)

// Bridge to Ethereum
const result = await bridgeToEthereum(tokenAddress, amount)

// Claim on Ethereum
const result = await claimOnEthereum(withdrawalBlockNumber, withdrawalId, tokenAddress, amount)
```

### 4. Staking Functions

```typescript
const { 
  delegate, 
  undelegate, 
  withdraw, 
  pendingRewards, 
  claimRewards 
} = useSonicTransactions()

// Delegate tokens
const result = await delegate(validatorId, amount)

// Undelegate tokens
const result = await undelegate(validatorId, amount)

// Withdraw tokens
const result = await withdraw(validatorId, withdrawalId)

// Check pending rewards
const rewards = await pendingRewards(validatorId)

// Claim rewards
const result = await claimRewards(validatorId)
```

### 5. Utility Functions

```typescript
const { 
  getBlockNumber, 
  getTransactionStatus, 
  getTokenInfo 
} = useSonicTransactions()

// Get current block number
const blockNumber = await getBlockNumber()

// Check transaction status
const status = await getTransactionStatus(txHash)

// Get token information
const tokenInfo = await getTokenInfo(tokenAddress)
```

## Error Handling

All functions return a consistent result format:

```typescript
interface TransactionResult {
  success: boolean
  data?: any
  error?: string
}
```

Example usage:

```typescript
const result = await transferToken(tokenAddress, recipient, amount)

if (result.success) {
  console.log('Transaction hash:', result.data.txHash)
} else {
  console.error('Error:', result.error)
}
```

## Wallet Connection Status

Check if wallet is connected before executing transactions:

```typescript
import { useAccount } from 'wagmi'

const { address, isConnected } = useAccount()

const handleTransaction = async () => {
  if (!isConnected) {
    alert('Please connect your wallet first')
    return
  }
  
  // Execute transaction
  const result = await transferToken(tokenAddress, recipient, amount)
}
```

## Loading States

All functions provide loading states:

```typescript
const { transferToken, loading } = useSonicTransactions()

return (
  <Button 
    onClick={handleTransfer}
    disabled={loading || !isConnected}
  >
    {loading ? <Loader2 className="animate-spin" /> : 'Transfer'}
  </Button>
)
```

## Example Component

See `components/WalletExample.tsx` for a complete example of how to use the connected wallet functionality.

## API Route Changes

The API route (`app/api/tx/route.ts`) now only handles read-only operations. All write operations (transfers, approvals, staking) are handled directly by the frontend using the connected wallet.

## Security Best Practices

1. **Never store private keys** in frontend code
2. **Always check wallet connection** before executing transactions
3. **Handle errors gracefully** and provide user feedback
4. **Use loading states** to prevent multiple submissions
5. **Validate inputs** before sending transactions

## Troubleshooting

### Common Issues

1. **"Wallet not connected" error**
   - Ensure user has connected their wallet
   - Check if the wallet is on the correct network (Sonic Blaze testnet)

2. **Transaction fails**
   - Check if user has sufficient balance
   - Verify the contract addresses are correct
   - Ensure the wallet is on the correct network

3. **Function not working**
   - Check if the function is available in the hook
   - Verify all required parameters are provided
   - Check console for detailed error messages

### Debug Mode

Enable debug logging to see detailed transaction information:

```typescript
// In your component
console.log('Transaction result:', result)
console.log('Wallet address:', address)
console.log('Is connected:', isConnected)
```

## Migration from Private Key Approach

If you were previously using private keys:

1. **Remove private key inputs** from your forms
2. **Update function calls** to remove private key parameters
3. **Add wallet connection checks** before transactions
4. **Update UI** to show wallet connection status
5. **Test all functions** with connected wallet

The new approach is much more secure and user-friendly! 