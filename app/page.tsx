"use client"

import { useState, useEffect } from "react"
import { ChatContainer } from "@/components/ChatContainer"
import { ChatInput } from "@/components/ChatInput"
import { motion } from "framer-motion"
import type { Message } from "@/types"
import { useSonicTransactions } from "@/hooks/useSonicTransactions"
import { useAccount } from 'wagmi'
import { WalletDebug } from "@/components/WalletDebug"

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content:
        "Hello! I'm DeFiPal, your AI assistant for Sonic DeFi. I can help you swap tokens, check balances, find farming opportunities, and manage your staking. What would you like to do?",
      role: "assistant",
      timestamp: new Date(),
    },
  ])
  const [isTyping, setIsTyping] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Get wallet connection state
  const { address, isConnected } = useAccount()

  // Ensure component is mounted before rendering wallet status
  useEffect(() => {
    setMounted(true)
  }, [])

  // Get Sonic transaction functions
  const {
    connectWallet,
    disconnectWallet,
    getAccountAddress,
    getNativeBalance,
    getTokenBalance,
    transferToken,
    getTokenAllowance,
    approveToken,
    bridgeToSonic,
    claimOnSonic,
    bridgeToEthereum,
    claimOnEthereum,
    delegate,
    undelegate,
    withdraw,
    pendingRewards,
    claimRewards,
    getBlockNumber,
    getTransactionStatus,
    getTokenInfo,
  } = useSonicTransactions()

  // Function mapping for executing LLM function calls
  const executeFunction = async (functionName: string, args: any) => {
    try {
      switch (functionName) {
        case 'connectWallet':
          return await connectWallet()
        case 'disconnectWallet':
          return await disconnectWallet()
        case 'getAccountAddress':
          return await getAccountAddress()
        case 'getNativeBalance':
          return await getNativeBalance()
        case 'getTokenBalance':
          return await getTokenBalance(args.tokenAddress)
        case 'transferToken':
          return await transferToken(args.tokenAddress, args.toAddress, args.amount)
        case 'getTokenAllowance':
          return await getTokenAllowance(args.tokenAddress, args.spender)
        case 'approveToken':
          return await approveToken(args.tokenAddress, args.spender, args.amount)
        case 'bridgeToSonic':
          return await bridgeToSonic(args.tokenAddress, args.amount)
        case 'claimOnSonic':
          return await claimOnSonic(args.depositBlockNumber, args.depositId, args.tokenAddress, args.amount)
        case 'bridgeToEthereum':
          return await bridgeToEthereum(args.tokenAddress, args.amount)
        case 'claimOnEthereum':
          return await claimOnEthereum(args.withdrawalBlockNumber, args.withdrawalId, args.tokenAddress, args.amount)
        case 'delegate':
          return await delegate(args.validatorId, args.amount)
        case 'undelegate':
          return await undelegate(args.validatorId, args.amount)
        case 'withdraw':
          return await withdraw(args.validatorId, args.withdrawalId)
        case 'pendingRewards':
          return await pendingRewards(args.validatorId)
        case 'claimRewards':
          return await claimRewards(args.validatorId)
        case 'getBlockNumber':
          return await getBlockNumber()
        case 'getTransactionStatus':
          return await getTransactionStatus(args.txHash)
        case 'getTokenInfo':
          return await getTokenInfo(args.tokenAddress)
        default:
          throw new Error(`Unknown function: ${functionName}`)
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Function execution failed'
      }
    }
  }

  const handleSendMessage = async (content: string) => {
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      role: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setIsTyping(true)

    try {
      // Prepare messages for API (excluding the initial greeting)
      const apiMessages = messages
        .filter(msg => msg.role !== "assistant" || msg.id !== "1")
        .map(msg => ({
          role: msg.role,
          content: msg.content
        }))
        .concat({
          role: "user" as const,
          content
        })

      const response = await fetch('/api/llm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: apiMessages
        })
      })

      if (!response.ok) {
        throw new Error('Failed to get AI response')
      }

      const data = await response.json()
      
      let assistantContent = data.content

      // If there's a function call, execute it and add the result to the response
      if (data.function_call) {
        const { name, arguments: functionArgs } = data.function_call
        const parsedArgs = typeof functionArgs === 'string' ? JSON.parse(functionArgs) : functionArgs
        
        const result = await executeFunction(name, parsedArgs)
        
        if (result.success) {
          assistantContent += `\n\n✅ Function executed successfully!\nResult: ${JSON.stringify(result.data, null, 2)}`
        } else {
          assistantContent += `\n\n❌ Function execution failed: ${result.error}`
        }
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: assistantContent,
        role: "assistant",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error getting AI response:', error)
      
      // Fallback response
      const fallbackMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm having trouble connecting to my AI service right now. Please try again in a moment, or check your internet connection.",
        role: "assistant",
        timestamp: new Date(),
      }
      
      setMessages((prev) => [...prev, fallbackMessage])
    } finally {
      setIsTyping(false)
    }
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)]"
      >
        <div className="w-full max-w-md mx-auto">
          {/* Wallet Status */}
          {mounted && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-xs font-medium text-gray-700">
                    {isConnected ? 'Wallet Connected' : 'Wallet Disconnected'}
                  </span>
                </div>
                {isConnected && address && (
                  <div className="text-xs text-gray-600">
                    {address.slice(0, 6)}...{address.slice(-4)}
                  </div>
                )}
              </div>
            </div>
          )}

          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="glass-morphism rounded-2xl shadow-2xl overflow-hidden"
          >
            <ChatContainer messages={messages} isTyping={isTyping} />
            <ChatInput onSendMessage={handleSendMessage} />
          </motion.div>
        </div>
      </motion.div>
      
      {/* Debug component - remove this after testing */}
      <WalletDebug />
    </>
  )
}
