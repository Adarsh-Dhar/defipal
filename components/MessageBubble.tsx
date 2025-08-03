"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import type { Message } from "@/types"

interface MessageBubbleProps {
  message: Message
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user"

  return (
    <div className={cn("flex w-full", isUser ? "justify-end" : "justify-start")}>
      <motion.div
        whileHover={{ scale: 1.02 }}
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-3 shadow-sm",
          isUser ? "bg-primary text-primary-foreground ml-4" : "bg-secondary text-secondary-foreground mr-4",
        )}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        <div className={cn("text-xs mt-2 opacity-70", isUser ? "text-right" : "text-left")}>
          {message.timestamp.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </motion.div>
    </div>
  )
}
