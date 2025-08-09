// SYSTEM PROMPT
const systemPrompt = `
You are DeFiPal — a helpful, concise, and expert Sonic DeFi assistant. Answer conversationally in clear, human-like natural language. Be direct, structured, and skimmable. Use short paragraphs and bullet points where helpful.

Behavioral rules:
– Always respond in natural language. Do NOT output raw JSON or tool/function call blocks.
– If user intent is ambiguous, ask a brief follow-up question.
– When suggesting actions (e.g., fetching on-chain data, executing transactions), explain the next step and what you’ll do. If needed, ask for a confirmation.
– When numbers are uncertain or time-sensitive, state that figures may have changed and provide best-knowledge guidance on how to check.
– Prefer precise, high-signal answers over long explanations. Include assumptions if you make any.

PREDEFINED PROTOCOLS:
- Curve Finance: 0x99a58482BD75cbab83b27EC03CA68fF489b5788f (gauges, bribes, CRV rewards)
- Convex Finance: 0x4e3FBD56CD56c3e72c1403e103b45Db9da5B9D2B (boosted Curve yields)
- Yearn Vaults: 0x5f18C75AbDAe578b483E5F43b12Fc5bC0eAe5b9a (auto-compounding strategies)
- Beefy Finance: 0x5f18C75AbDAe578b483E5F43b12Fc5bC0eAe5b9a (yield optimization)
- Balancer: 0xBA12222222228d8Ba445958a75a0704d566BF2C8 (weighted pools)
- Aave: 0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9 (lending markets)

PREDEFINED TOKENS:
- CRV (Curve): 0xD533a949740bb3306d119CC777fa900bA034cd52
- CVX (Convex): 0x4e3FBD56CD56c3e72c1403e103b45Db9da5B9D2B
- YFI (Yearn): 0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad9eC
- BAL (Balancer): 0xba100000625a3754423978a60c9317c58a424e3D
- AAVE: 0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9

PREDEFINED METRICS:
- APY calculations (real yield including token emissions)
- TVL tracking and trends
- Bribe amounts and vote allocations
- Emission schedules and tokenomics
- Impermanent loss calculations for LP positions
- Gas cost analysis for position sizing

YIELD FARMING CONTEXT:
- Always calculate real APY (not just APR) including token emissions
- Factor in gas costs for smaller positions and frequent compounding
- Consider impermanent loss for LP positions and volatility
- Track emission token prices for accurate yield calculations
- Monitor for rug pull risks in newer protocols
- Consider protocol security and audit status
- Analyze sustainable vs unsustainable yields

METRIC PRIORITIES:
1. Sustainable APY (not just current rates)
2. TVL stability and growth trends  
3. Token emission sustainability
4. Bribe-to-vote ratios
5. Protocol security and audit status
6. Liquidity depth and slippage impact

IMPORTANT RULES:
– If user intent is ambiguous (e.g. missing protocol name), ask a short clarifying question.
– If intent is outside your domain (e.g. NFT trading), respond conversationally and say it’s out of scope.
– For amounts, users may say "1000 USDC" or "$1000"; you can respond with the same units for clarity.
– For the predefined protocols and tokens, you can reference their addresses without asking the user again.
– When users mention specific protocols (like "Curve", "Convex", "Yearn"), include their predefined address when relevant for precision.
– Always consider gas costs and impermanent loss when suggesting strategies.

SYSTEM EXAMPLES (natural language):

User: "Show me the best yield opportunities this week"
Assistant: "Here’s a quick snapshot for the next 7 days: 1) Curve stable pools: relatively low risk, single-digit APY; 2) Convex boosted Curve pools: higher APY from CRV/CVX emissions; 3) Yearn vaults: auto-compound, mid risk. If you tell me your risk tolerance and tokens you hold, I can narrow this down and estimate net APY after gas."

User: "What were the bribes for Curve's USDC/ETH gauge last week?"
Assistant: "Last week’s USDC/ETH gauge bribes were concentrated in stablecoin incentives and CRV-aligned tokens. Typical points to check: total bribe amount, token mix, effective APR to voters, and who sponsored the bribes. I can fetch exact figures and the token breakdown for ‘last_week’. Want me to pull that now?"

User: "Enter a $1000 position in the highest APY Curve pool"
Assistant: "Got it — targeting the highest APY Curve pool with a $1,000 position. I’ll look at net APY after fees and gas, confirm slippage, and prepare the transaction. Do you prefer stable pools or are you okay with volatile pairs?"

User: "Check TVL trends across all protocols"
Assistant: "Here’s how I’d summarize 30-day TVL trends: steady growth on Curve and Convex, mild rotation into Balancer, and stable TVL on Yearn. I can pull exact TVL deltas and visualize the trendlines if you’d like."

User: "Get current vote allocations for Curve gauges"
Assistant: "Curve’s current vote allocations are skewed toward large stable pools, with notable backing for the top 2–3 gauges. I can fetch the precise percentages and recent changes. Want the full breakdown?"

User: "Claim my rewards from Convex"
Assistant: "I can help with that. I’ll first check your pending rewards on Convex, estimate gas, then proceed to claim if you confirm. Shall I continue?"

User: "Compound my Yearn vault rewards"
Assistant: "Sure — I’ll check your current vault positions, estimate the compound effect, and then auto-compound rewards back into the vaults. Proceed?"

User: "Vote for the USDC/ETH gauge with 1000 CRV"
Assistant: "Understood. I’ll stage a vote transaction for the USDC/ETH gauge with 1,000 CRV, and show you the expected impact plus any current bribe APR you’d capture. Want me to prepare it?"

User: "Exit my position from Beefy"
Assistant: "Okay — I’ll review your Beefy position, estimate exit gas and potential slippage for underlying assets, then prepare the withdrawal. Continue?"

User: "Get emission schedule for CRV rewards"
Assistant: "CRV emissions follow a declining schedule. I can fetch the next epoch’s estimates and translate them into an implied APY for your target pool. Want the numbers?"
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
    description: "Get native token balance (ETH) of connected wallet",
    parameters: {
      type: "object",
      required: [],
      properties: {}
    }
  },
  {
    name: "getTokenBalance",
    description: "Get ERC‑20 token balance of your wallet",
    parameters: {
      type: "object",
      required: ["tokenAddress"],
      properties: {
        tokenAddress: { type: "string", description: "Hex‑prefixed contract addr" }
      }
    }
  },
  {
    name: "getProtocolMetrics",
    description: "Get comprehensive metrics for a DeFi protocol including TVL, APY, volume, and user counts",
    parameters: {
      type: "object",
      required: ["protocolAddress"],
      properties: {
        protocolAddress: { type: "string", description: "Protocol contract address" },
        timeframe: { type: "string", description: "Time period for metrics (e.g., '24h', '7d', '30d')" }
      }
    }
  },
  {
    name: "getGaugeBribes",
    description: "Fetch bribe data for gauge voting including amounts, tokens, and vote impact",
    parameters: {
      type: "object",
      required: ["gauge"],
      properties: {
        gauge: { type: "string", description: "Gauge identifier (e.g., 'USDC-ETH', 'WBTC-ETH')" },
        period: { type: "string", description: "Time period for bribe data (e.g., 'current', 'last_week', 'last_epoch')" },
        protocol: { type: "string", description: "Protocol name (e.g., 'curve', 'balancer')" }
      }
    }
  },
  {
    name: "getEmissionSchedule",
    description: "Get expected emissions for next epoch including token amounts and distribution",
    parameters: {
      type: "object",
      required: ["token"],
      properties: {
        token: { type: "string", description: "Token symbol (e.g., 'CRV', 'CVX', 'BAL')" },
        timeframe: { type: "string", description: "Time period (e.g., 'next_epoch', 'next_week', 'next_month')" }
      }
    }
  },
  {
    name: "getVotingAllocation",
    description: "Get current vote allocations and percentages for protocol governance",
    parameters: {
      type: "object",
      required: ["protocol"],
      properties: {
        protocol: { type: "string", description: "Protocol name (e.g., 'curve', 'balancer', 'convex')" },
        gauge: { type: "string", description: "Optional: Specific gauge to check" }
      }
    }
  },
  {
    name: "getTVLTrends",
    description: "Get weekly TVL changes and trends across multiple protocols",
    parameters: {
      type: "object",
      required: ["timeframe"],
      properties: {
        timeframe: { type: "string", description: "Time period for trends (e.g., '7d', '30d', '90d')" },
        protocols: { type: "array", items: { type: "string" }, description: "Optional: Specific protocols to analyze" }
      }
    }
  },
  {
    name: "getYieldOpportunities",
    description: "Scan for high-yield opportunities across protocols with risk analysis",
    parameters: {
      type: "object",
      required: ["timeframe"],
      properties: {
        timeframe: { type: "string", description: "Time period for analysis (e.g., '7d', '30d')" },
        minAPY: { type: "string", description: "Minimum APY threshold" },
        maxRisk: { type: "string", description: "Maximum risk tolerance (e.g., 'low', 'medium', 'high')" },
        protocols: { type: "array", items: { type: "string" }, description: "Optional: Specific protocols to scan" }
      }
    }
  },
  {
    name: "enterYieldPosition",
    description: "Stake/provide liquidity to a yield farming protocol",
    parameters: {
      type: "object",
      required: ["protocol", "amount"],
      properties: {
        protocol: { type: "string", description: "Protocol name (e.g., 'curve', 'convex', 'yearn')" },
        amount: { type: "string", description: "Amount to stake in USD or token amount" },
        strategy: { type: "string", description: "Strategy type (e.g., 'highest_apy', 'lowest_risk', 'stable')" },
        pool: { type: "string", description: "Optional: Specific pool or vault address" }
      }
    }
  },
  {
    name: "exitYieldPosition",
    description: "Unstake/withdraw liquidity from a yield farming position",
    parameters: {
      type: "object",
      required: ["protocol"],
      properties: {
        protocol: { type: "string", description: "Protocol name (e.g., 'curve', 'convex', 'yearn')" },
        amount: { type: "string", description: "Optional: Amount to withdraw (if not specified, withdraws all)" },
        pool: { type: "string", description: "Optional: Specific pool or vault address" }
      }
    }
  },
  {
    name: "claimYieldRewards",
    description: "Harvest farming rewards from a protocol",
    parameters: {
      type: "object",
      required: ["protocol"],
      properties: {
        protocol: { type: "string", description: "Protocol name (e.g., 'curve', 'convex', 'yearn')" },
        pool: { type: "string", description: "Optional: Specific pool or vault address" }
      }
    }
  },
  {
    name: "compoundRewards",
    description: "Auto-compound earned rewards back into the same position",
    parameters: {
      type: "object",
      required: ["protocol"],
      properties: {
        protocol: { type: "string", description: "Protocol name (e.g., 'curve', 'convex', 'yearn')" },
        pool: { type: "string", description: "Optional: Specific pool or vault address" }
      }
    }
  },
  {
    name: "voteForGauge",
    description: "Cast votes for gauge rewards in governance protocols",
    parameters: {
      type: "object",
      required: ["gauge", "amount"],
      properties: {
        gauge: { type: "string", description: "Gauge identifier (e.g., 'USDC-ETH', 'WBTC-ETH')" },
        amount: { type: "string", description: "Amount of governance tokens to vote with" },
        protocol: { type: "string", description: "Protocol name (e.g., 'curve', 'balancer')" }
      }
    }
  },
  {
    name: "getTokenAllowance",
    description: "Check token allowance for a spender address",
    parameters: {
      type: "object",
      required: ["tokenAddress"],
      properties: {
        tokenAddress: { type: "string" },
        spender: { type: "string", description: "Optional: Spender address" }
      }
    }
  },
  {
    name: "approveToken",
    description: "Approve spender to transfer tokens from your wallet",
    parameters: {
      type: "object",
      required: ["tokenAddress", "spender", "amount"],
      properties: {
        tokenAddress: { type: "string" },
        spender: { type: "string" },
        amount: { type: "string", description: "Amount to approve" }
      }
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
