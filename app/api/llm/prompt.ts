// SYSTEM PROMPT
const systemPrompt = `
You are DefiPal⁠—a smart assistant built specifically to interpret user requests into API function calls for interacting with the Sonic Blaze Testnet
(using functions backed by viem and wagmi). Your task is to translate user messages into *exactly one* call to a function
you have been taught: matching name, arguments types, and proper formatting. Do not output natural‑language when you call a function.

PREDEFINED TOKEN ADDRESSES:
- Wrapped S (wS): 0x039e2fB66102314Ce7b64Ce5Ce3E5183bc94aD38
- USDC: 0xA4879Fed32Ecbef99399e5cbC247E533421C4eC6
- Coral: 0xAF93888cbD250300470A1618206e036E11470149

PREDEFINED CONTRACTS:
- Multicall3: 0xcA11bde05977b3631167028862bE2a173976CA11

IMPORTANT RULES:
– If user intent is ambiguous (e.g. missing validatorId), you must ask a follow‑up question as a standard assistant message.
– If intent is outside your domain (e.g. create NFT) respond conversationally and do not select any function.
– For token amounts, users may say "2 S" or "2 stS"; host code will resolve decimals—here you just pass strings like "2.0".
– For the predefined tokens (wS, USDC), automatically use their addresses without asking the user.
– Only ask for contract addresses if the token mentioned is NOT in the predefined list above.

SYSTEM EXAMPLES:

User: "What is my wallet address?"  
Assistant →  
\`\`\`json
{
  "name": "getAccountAddress",
  "arguments": {}
}
\`\`\`

User: "Check my native balance"  
Assistant →  
\`\`\`json
{
  "name": "getNativeBalance",
  "arguments": {}
}
\`\`\`

User: "Check my wS balance"  
Assistant →  
\`\`\`json
{
  "name": "getTokenBalance",
  "arguments": { "tokenAddress": "0x039e2fB66102314Ce7b64Ce5Ce3E5183bc94aD38" }
}
\`\`\`

User: "Transfer 10 USDC to 0x123..."  
Assistant →  
\`\`\`json
{
  "name": "transferToken",
  "arguments": {
    "tokenAddress": "0xA4879Fed32Ecbef99399e5cbC247E533421C4eC6",
    "toAddress": "0x123...",
    "amount": "10.0"
  }
}
\`\`\`

User: "Delegate 3 S to validator 9"  
Assistant →  
\`\`\`json
{
  "name": "delegate",
  "arguments": { "validatorId": 9, "amount": "3.0" }
}
\`\`\`

User: "Bridge 25 ONYX to Sonic with token contract 0xOnyx…"  
Assistant →  
\`\`\`json
{
  "name": "bridgeToSonic",
  "arguments": {
    "tokenAddress": "0xOnyx…",
    "amount": "25.0"
  }
}
\`\`\`

User: "Check pending rewards from validator 1"  
Assistant →  
\`\`\`json
{
  "name": "pendingRewards",
  "arguments": { "validatorId": 1 }
}
\`\`\`
`;

// FUNCTION DECLARATIONS
const functions = [
  {
    name: "connectWallet",
    description: "Connect wallet and get connection status",
    parameters: {
      type: "object",
      required: [],
      properties: {}
    }
  },
  {
    name: "getAccountAddress",
    description: "Get the connected wallet address",
    parameters: {
      type: "object",
      required: [],
      properties: {}
    }
  },
  {
    name: "getNativeBalance",
    description: "Get native token balance (S) of connected wallet",
    parameters: {
      type: "object",
      required: [],
      properties: {}
    }
  },
  {
    name: "getTokenBalance",
    description: "Get ERC‑20 token balance of your wallet on Sonic Blaze Testnet",
    parameters: {
      type: "object",
      required: ["tokenAddress"],
      properties: {
        tokenAddress: { type: "string", description: "Hex‑prefixed contract addr" }
      }
    }
  },
  {
    name: "transferToken",
    description: "Transfer ERC‑20 tokens from your wallet to another address",
    parameters: {
      type: "object",
      required: ["tokenAddress","toAddress","amount"],
      properties: {
        tokenAddress: { type: "string" },
        toAddress: { type: "string" },
        amount: { type: "string", description: "Numeric in S or token decimals" }
      }
    }
  },
  {
    name: "getTokenAllowance",
    description: "Check token allowance for a spender address",
    parameters: {
      type: "object",
      required: ["tokenAddress","spender"],
      properties: {
        tokenAddress: { type: "string" },
        spender: { type: "string" }
      }
    }
  },
  {
    name: "approveToken",
    description: "Approve spender to transfer tokens from your wallet",
    parameters: {
      type: "object",
      required: ["tokenAddress","spender","amount"],
      properties: {
        tokenAddress: { type: "string" },
        spender: { type: "string" },
        amount: { type: "string", description: "Numeric in S or token decimals" }
      }
    }
  },
  {
    name: "getTokenInfo",
    description: "Get token information (name, symbol, decimals)",
    parameters: {
      type: "object",
      required: ["tokenAddress"],
      properties: {
        tokenAddress: { type: "string" }
      }
    }
  },
  {
    name: "delegate",
    description: "Delegate native S tokens to a validator (staking)",
    parameters: {
      type: "object",
      required: ["validatorId","amount"],
      properties: {
        validatorId: { type: "integer" },
        amount: { type: "string" }
      }
    }
  },
  {
    name: "pendingRewards",
    description: "Fetch pending staking rewards from validator",
    parameters: {
      type: "object",
      required: ["validatorId"],
      properties: { validatorId: { type: "integer" } }
    }
  },
  {
    name: "undelegate",
    description: "Initiate undelegation from a validator to get a withdrawalId",
    parameters: {
      type: "object",
      required: ["validatorId","amount"],
      properties: {
        validatorId: { type: "integer" },
        amount: { type: "string" }
      }
    }
  },
  {
    name: "withdraw",
    description: "Withdraw completed undelegation using withdrawalId",
    parameters: {
      type: "object",
      required: ["validatorId","withdrawalId"],
      properties: {
        validatorId: { type: "integer" },
        withdrawalId: { type: "string" }
      }
    }
  },
  {
    name: "claimRewards",
    description: "Claim your staking rewards from a validator",
    parameters: {
      type: "object",
      required: ["validatorId"],
      properties: { validatorId: { type: "integer" } }
    }
  },
  {
    name: "bridgeToSonic",
    description: "Lock ERC‑20 tokens on Ethereum and bridge them to Sonic Blaze Testnet",
    parameters: {
      type: "object",
      required: ["tokenAddress","amount"],
      properties: {
        tokenAddress: { type: "string" },
        amount: { type: "string" }
      }
    }
  },
  {
    name: "claimOnSonic",
    description: "Claim assets on Sonic side after bridging to Sonic",
    parameters: {
      type: "object",
      required: ["depositBlockNumber","depositId","tokenAddress","amount"],
      properties: {
        depositBlockNumber: { type: "string" },
        depositId: { type: "string" },
        tokenAddress: { type: "string" },
        amount: { type: "string" }
      }
    }
  },
  {
    name: "bridgeToEthereum",
    description: "Initiate withdrawal of tokens back to Ethereum from Sonic",
    parameters: {
      type: "object",
      required: ["tokenAddress","amount"],
      properties: {
        tokenAddress: { type: "string" },
        amount: { type: "string" }
      }
    }
  },
  {
    name: "claimOnEthereum",
    description: "Claim assets back on Ethereum after bridging back",
    parameters: {
      type: "object",
      required: ["withdrawalBlockNumber","withdrawalId","tokenAddress","amount"],
      properties: {
        withdrawalBlockNumber: { type: "string" },
        withdrawalId: { type: "string" },
        tokenAddress: { type: "string" },
        amount: { type: "string" }
      }
    }
  },
  {
    name: "getBlockNumber",
    description: "Get current block number on Sonic Blaze Testnet",
    parameters: {
      type: "object",
      required: [],
      properties: {}
    }
  },
  {
    name: "getTransactionStatus",
    description: "Check transaction status by transaction hash",
    parameters: {
      type: "object",
      required: ["txHash"],
      properties: {
        txHash: { type: "string" }
      }
    }
  }
];

export { systemPrompt, functions };
