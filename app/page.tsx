"use client"

import { useState } from "react"
import { ChatContainer } from "@/components/ChatContainer"
import { ChatInput } from "@/components/ChatInput"
import { motion } from "framer-motion"
import type { Message } from "@/types"

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

    // TODO: Replace with actual AI API call
    // const response = await fetchChatCompletion(content)

    // Simulate AI response delay
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: getSimulatedResponse(content),
        role: "assistant",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
      setIsTyping(false)
    }, 1500)
  }

  // Simulated responses for demo purposes
  const getSimulatedResponse = (input: string): string => {
    const lowerInput = input.toLowerCase()

    if (lowerInput.includes("swap") || lowerInput.includes("exchange")) {
      return "I can help you swap tokens on Sonic! Please specify the amount and tokens you'd like to swap (e.g., '10 S for USDC'). I'll prepare the transaction for your approval."
    }

    if (lowerInput.includes("balance")) {
      return "I'll check your wallet balance. Please connect your wallet first, then I can show you your current token holdings across Sonic DeFi protocols."
    }

    if (lowerInput.includes("farm") || lowerInput.includes("yield")) {
      return "Here are some safe farming opportunities on Sonic:\n\n• S-USDC LP: ~12% APY\n• S-ETH LP: ~15% APY\n• USDC Lending: ~8% APY\n\nWould you like me to help you start farming in any of these pools?"
    }

    if (lowerInput.includes("stake") || lowerInput.includes("staking")) {
      return "I can help you stake your S tokens! Current staking rewards are ~18% APY. How much S would you like to stake?"
    }

    return "I understand you want to perform a DeFi operation. Could you be more specific? I can help with swapping, checking balances, farming, staking, and more on Sonic DeFi."
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)]"
    >
      <div className="w-full max-w-md mx-auto">
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
  )
}
