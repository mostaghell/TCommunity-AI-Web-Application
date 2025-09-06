"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { SendHorizontal, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ChatInputProps {
  value: string
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  onSubmit: (e: React.FormEvent) => void
  disabled?: boolean
}

export default function ChatInput({ value, onChange, onSubmit, disabled = false }: ChatInputProps) {
  const [isFocused, setIsFocused] = useState(false)

  // Auto-resize textarea based on content
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target
    textarea.style.height = "auto"
    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`
    onChange(e)
  }

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="max-w-4xl mx-auto"
    >
      <div className="relative">
        {/* Glow effect */}
        <motion.div
          className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#d63384]/30 to-[#c2185b]/30 blur-md"
          animate={{
            opacity: isFocused ? 0.7 : 0.3,
            scale: isFocused ? 1.02 : 1,
          }}
          transition={{ duration: 0.3 }}
        />

        <form onSubmit={onSubmit} className="relative">
          <div className="relative flex items-center">
            <Button
              type="button"
              size="icon"
              disabled={disabled}
              className="absolute left-3 h-9 w-9 rounded-full bg-[#2d1b2e] border border-[#d63384]/30 text-[#d63384] hover:bg-[#5a1c3a] transition-colors duration-200"
            >
              <Sparkles className="h-4 w-4" />
              <span className="sr-only">AI Suggestions</span>
            </Button>

            <textarea
              value={value}
              onChange={handleTextareaChange}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Send a message..."
              className={cn(
                "w-full resize-none rounded-2xl border px-14 py-4",
                "bg-[#2d1b2e]/80 backdrop-blur-xl",
                "border-[#d63384]/30 focus:border-[#d63384]/50 focus:ring-2 focus:ring-[#d63384]/20",
                "placeholder:text-[#bc87a2] text-[#f3d9e2]",
                "transition-all duration-300 ease-in-out",
                "min-h-[60px] max-h-[200px] overflow-y-auto",
                "shadow-[0_0_15px_rgba(214,51,132,0.15)]",
                "focus:shadow-[0_0_25px_rgba(214,51,132,0.3)]",
                disabled && "opacity-50 cursor-not-allowed",
              )}
              disabled={disabled}
              rows={1}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  if (!disabled && value.trim()) {
                    onSubmit(e)
                  }
                }
              }}
            />

            <Button
              type="submit"
              size="icon"
              disabled={disabled || !value.trim()}
              className={cn(
                "absolute right-3 h-9 w-9 rounded-full",
                "bg-gradient-to-r from-[#d63384] to-[#c2185b] hover:from-[#ff6b9d] hover:to-[#e91e63]",
                "text-white shadow-lg shadow-[#d63384]/20",
                "transition-all duration-300 ease-in-out",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                !value.trim() && "opacity-70",
              )}
            >
              <SendHorizontal className="h-4 w-4" />
              <span className="sr-only">Send message</span>
            </Button>
          </div>
        </form>
      </div>

      {/* Decorative elements */}
      <div className="flex justify-center mt-4 space-x-1 opacity-50">
        <div className="w-1 h-1 rounded-full bg-[#d63384]" />
        <div className="w-1 h-1 rounded-full bg-[#ff6b9d]" />
        <div className="w-1 h-1 rounded-full bg-[#c2185b]" />
      </div>
    </motion.div>
  )
}
