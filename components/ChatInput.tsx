"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send } from "lucide-react"
import { motion } from "framer-motion"

interface ChatInputProps {
  onSendMessage: (message: string) => void
}

export function ChatInput({ onSendMessage }: ChatInputProps) {
  const [input, setInput] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim()) {
      onSendMessage(input.trim())
      setInput("")
    }
  }

  return (
    <div className="border-t border-border/40 p-4 bg-background/50">
      <form onSubmit={handleSubmit} className="flex items-center space-x-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me to swap, check balance, or find farming opportunities..."
          className="flex-1 bg-background/80 border-border/60 focus:border-primary/60"
          maxLength={500}
        />
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button type="submit" size="icon" disabled={!input.trim()} className="rounded-full" aria-label="Send message">
            <Send className="w-4 h-4" />
          </Button>
        </motion.div>
      </form>
    </div>
  )
}
