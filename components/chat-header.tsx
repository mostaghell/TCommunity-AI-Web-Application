"use client"

import { motion } from "framer-motion"
import { Plus, Menu } from "lucide-react"
import ModelSelector from "@/components/model-selector"
import { useChat } from "@/contexts/chat-context"

interface ChatHeaderProps {
  selectedModel: string
  onModelChange: (model: string) => void
  onToggleSidebar?: () => void
}

export default function ChatHeader({ selectedModel, onModelChange, onToggleSidebar }: ChatHeaderProps) {
  const { createNewChat } = useChat()
  
  const handleNewChat = () => {
    createNewChat()
  }
  return (
    <motion.div
      className="sticky top-0 z-20 p-4 flex justify-between items-center bg-[#1a0a18]/70 backdrop-blur-xl border-b border-[#5a1c3a]/30"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, type: "spring" }}
    >
      {/* Left side: Menu button, Logo and title */}
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <motion.button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg bg-[#2d1b2e]/50 hover:bg-[#2d1b2e] transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Menu className="h-5 w-5 text-[#ff8fab]" />
          </motion.button>
        )}
        <div>
          <h1 className="text-2xl font-bold">
            <span className="bg-gradient-to-r from-[#ff8fab] via-[#d63384] to-[#c2185b] text-transparent bg-clip-text">
              TC AI
            </span>
          </h1>
          <p className="text-xs text-[#bc87a2] tracking-wide">Your Cognitive AI Assistant</p>
        </div>
      </div>

      {/* Right side: New Chat button and Model selector */}
      <div className="flex items-center gap-3">
        <motion.button
          onClick={handleNewChat}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#d63384] to-[#c2185b] hover:from-[#e63946] hover:to-[#d63384] transition-all duration-200 text-white font-medium"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Plus className="h-4 w-4" />
          New Chat
        </motion.button>
        
        <div className="w-56">
          <ModelSelector onModelChange={onModelChange} selectedModel={selectedModel} />
        </div>
      </div>
    </motion.div>
  )
}
