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
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.content,
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
