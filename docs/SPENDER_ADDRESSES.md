# Predefined Spender Addresses

This document outlines the predefined spender addresses available in DefiPal for token allowance operations.

## Available Spender Addresses

| **What You're Doing** | **Spender Contract** | **Address (Testnet)** | **Purpose** |
|----------------------|---------------------|----------------------|-------------|
| Bridge tokens back to Ethereum | Sonic Bridge | `0x9Ef7629F9B930168b76283AdD7120777b3c895B3` | Must approve this contract to withdraw minted ERC‑20 tokens on L2 |
| Bridge tokens from Ethereum to Sonic | Token Deposit (L1 Bridge) | `0xa1E2481a9CD0Cb0447EeB1cbc26F1b3fff3bec20` | When bridging from Ethereum → Sonic (on L1), approve here first |
| Utility/meta‑tx services | Multicall3 | `0xcA11bde05977b3631167028862bE2a173976CA11` | Rarely needs allowance unless you're approving tokens for gas payment flows |

## How to Use

### 1. Check Available Spender Options

When you call `getTokenAllowance` without providing a spender address, the function will return a list of predefined spender options:

```typescript
const result = await getTokenAllowance(tokenAddress)
// Returns:
// {
//   success: true,
//   data: {
//     message: "Please select a spender from the predefined options:",
//     spenderOptions: [
//       {
//         address: "0x9Ef7629F9B930168b76283AdD7120777b3c895B3",
//         name: "Sonic Bridge",
//         description: "Bridge tokens back to Ethereum - Must approve this contract to withdraw minted ERC‑20 tokens on L2"
//       },
//       // ... more options
//     ]
//   }
// }
```

### 2. Check Allowance for Specific Spender

To check allowance for a specific spender, provide the spender address:

```typescript
const result = await getTokenAllowance(tokenAddress, spenderAddress)
// Returns the allowance amount as a string
```

### 3. Using with AI Assistant

You can ask the AI assistant to check token allowances:

- **"Check token allowance for wS"** - Returns predefined spender options
- **"Check token allowance for USDC with Sonic Bridge"** - Checks allowance for specific spender

## Integration with LLM

The AI assistant is trained to recognize these predefined spender addresses and will automatically use them when appropriate. For example:

- When bridging tokens, it will use the appropriate bridge contract address
- When checking allowances without specifying a spender, it will return the predefined options
- When you mention specific operations (like "bridge to Ethereum"), it will use the correct spender address

## Notes

- These addresses are specific to the Sonic Blaze Testnet
- The addresses are hardcoded in the system for convenience and security
- Users can still provide custom spender addresses if needed
- The system will validate all addresses before making contract calls 