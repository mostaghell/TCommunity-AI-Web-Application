"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { AnimatePresence, motion } from "framer-motion"
import ChatHeader from "@/components/chat-header"
import ChatMessage from "@/components/chat-message"
import ChatInput from "@/components/chat-input"
import TypingIndicator from "@/components/typing-indicator"
import MessageSkeleton from "@/components/message-skeleton"
import BackgroundEffect from "@/components/background-effect"
import { ChatSidebar } from "@/components/chat-sidebar"
import { useChat } from "@/contexts/chat-context"
import { cn } from "@/lib/utils"

export default function ChatPage() {
  const { 
    currentChat, 
    currentChatId, 
    createNewChat, 
    addMessage 
  } = useChat()
  
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isTyping, setIsTyping] = useState(false)
  const [selectedModel, setSelectedModel] = useState("openai")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const messages = currentChat?.messages || []

  // Initialize with welcome message if no current chat
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
      
      // Create initial chat if none exists
      if (!currentChatId) {
        const newChatId = createNewChat()
        // Add welcome message to the new chat
        setTimeout(() => {
          const welcomeContent = "# Welcome to TCAI!\n\nI'm your **TCAI Assistant**. How can I help you today?\n\nI can assist with:\n- Answering questions\n- Writing code\n- Explaining concepts\n- And much more!"
          
          addMessage({
            content: welcomeContent,
            role: "assistant"
          })
        }, 100)
      }
    }, 1500)

    return () => clearTimeout(timer)
  }, [currentChatId, createNewChat, addMessage])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isTyping])

  // Handle sending a message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || !currentChatId) return

    // Add user message
    addMessage({
      content: input,
      role: "user"
    })
    
    const currentInput = input
    setInput("")

    // Show typing indicator
    setIsTyping(true)

    try {
      // Send request to API
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            { 
              role: "system", 
              content: "پاسخ دهید به همان زبانی که کاربر سوال پرسیده. اگر فارسی پرسید، فارسی جواب دهید. اگر انگلیسی پرسید، انگلیسی جواب دهید. پاسخ‌های ساده، مفید و مستقیم بدهید. از جواب‌های اضافی، پیچیده یا نامربوط خودداری کنید." 
            },
            ...messages.map(msg => ({ role: msg.role, content: msg.content })),
            { role: "user", content: currentInput }
          ],
          model: selectedModel,
          isPrivate: true,
        }),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const responseText = await response.text()

      // Add AI response
      addMessage({
        content: responseText,
        role: "assistant"
      })
    } catch (error) {
      console.error("Error sending message:", error)

      // Add error message
      addMessage({
        content: "Sorry, I encountered an error. Please try again later.",
        role: "assistant"
      })
    } finally {
      setIsTyping(false)
    }
  }

  const handleModelChange = (model: string) => {
    setSelectedModel(model)
  }

  return (
    <div className="relative flex h-screen bg-[#0a0118] text-[#f3d9e2] overflow-hidden">
      <BackgroundEffect />
      
      <ChatSidebar 
        isOpen={sidebarOpen} 
        onToggle={() => setSidebarOpen(!sidebarOpen)} 
      />
      
      <div className={cn(
        "flex flex-col flex-1 transition-all duration-300",
        sidebarOpen ? "lg:ml-[280px]" : "ml-0"
      )}>
        <ChatHeader 
          selectedModel={selectedModel} 
          onModelChange={handleModelChange}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />

        <main className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-track-[#2d1b2e] scrollbar-thumb-[#d63384] z-10">
          <div className="max-w-4xl mx-auto space-y-4 py-4">
            {isLoading ? (
              // Show skeletons while loading
              <div className="space-y-8">
                <MessageSkeleton role="assistant" />
                <MessageSkeleton role="user" />
                <MessageSkeleton role="assistant" />
              </div>
            ) : (
              // Show actual messages
              <AnimatePresence initial={false}>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 30, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{
                      duration: 0.4,
                      type: "spring",
                      stiffness: 100,
                      damping: 15,
                    }}
                  >
                    <ChatMessage message={{
                      id: message.id,
                      content: message.content,
                      role: message.role,
                      timestamp: new Date(message.timestamp)
                    }} />
                  </motion.div>
                ))}

                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex items-start max-w-[80%]">
                      <div className="relative bg-[#2e0b1a]/80 backdrop-blur-xl rounded-2xl rounded-tl-sm p-5 shadow-[0_0_20px_rgba(214,51,132,0.2)]">
                        <div className="absolute inset-0 rounded-2xl rounded-tl-sm bg-gradient-to-r from-[#d63384]/10 to-[#c2185b]/10 z-[-1]" />
                        <TypingIndicator />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            )}
            <div ref={messagesEndRef} />
          </div>
        </main>

        <div className="relative p-6 z-10">
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0118] to-transparent z-[-1]" />
          <ChatInput
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onSubmit={handleSendMessage}
            disabled={isTyping || isLoading || !currentChatId}
          />
        </div>
      </div>
    </div>
  )
}
