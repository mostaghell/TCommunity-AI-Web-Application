'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: number
}

export interface Chat {
  id: string
  title: string
  messages: Message[]
  createdAt: number
  updatedAt: number
}

interface ChatContextType {
  chats: Chat[]
  currentChatId: string | null
  currentChat: Chat | null
  createNewChat: () => string
  selectChat: (chatId: string) => void
  deleteChat: (chatId: string) => void
  updateChatTitle: (chatId: string, title: string) => void
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void
  clearCurrentChat: () => void
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

const STORAGE_KEY = 'ai-chat-data'

export function ChatProvider({ children }: { children: ReactNode }) {
  const [chats, setChats] = useState<Chat[]>([])
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY)
      if (savedData) {
        const { chats: savedChats, currentChatId: savedCurrentChatId } = JSON.parse(savedData)
        setChats(savedChats || [])
        setCurrentChatId(savedCurrentChatId || null)
      }
    } catch (error) {
      console.error('Error loading chat data:', error)
    }
  }, [])

  // Save data to localStorage whenever chats or currentChatId changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ chats, currentChatId }))
    } catch (error) {
      console.error('Error saving chat data:', error)
    }
  }, [chats, currentChatId])

  const currentChat = chats.find(chat => chat.id === currentChatId) || null

  const createNewChat = (): string => {
    const newChatId = `chat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const newChat: Chat = {
      id: newChatId,
      title: 'New Chat',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
    
    setChats(prev => [newChat, ...prev])
    setCurrentChatId(newChatId)
    return newChatId
  }

  const selectChat = (chatId: string) => {
    setCurrentChatId(chatId)
  }

  const deleteChat = (chatId: string) => {
    setChats(prev => prev.filter(chat => chat.id !== chatId))
    if (currentChatId === chatId) {
      const remainingChats = chats.filter(chat => chat.id !== chatId)
      setCurrentChatId(remainingChats.length > 0 ? remainingChats[0].id : null)
    }
  }

  const updateChatTitle = (chatId: string, title: string) => {
    setChats(prev => prev.map(chat => 
      chat.id === chatId 
        ? { ...chat, title, updatedAt: Date.now() }
        : chat
    ))
  }

  const addMessage = (message: Omit<Message, 'id' | 'timestamp'>) => {
    if (!currentChatId) return

    const newMessage: Message = {
      ...message,
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now()
    }

    setChats(prev => prev.map(chat => {
      if (chat.id === currentChatId) {
        const updatedChat = {
          ...chat,
          messages: [...chat.messages, newMessage],
          updatedAt: Date.now()
        }
        
        // Auto-generate title from first user message
        if (chat.title === 'New Chat' && message.role === 'user') {
          updatedChat.title = message.content.slice(0, 50) + (message.content.length > 50 ? '...' : '')
        }
        
        return updatedChat
      }
      return chat
    }))
  }

  const clearCurrentChat = () => {
    if (!currentChatId) return
    
    setChats(prev => prev.map(chat => 
      chat.id === currentChatId 
        ? { ...chat, messages: [], updatedAt: Date.now() }
        : chat
    ))
  }

  const value: ChatContextType = {
    chats,
    currentChatId,
    currentChat,
    createNewChat,
    selectChat,
    deleteChat,
    updateChatTitle,
    addMessage,
    clearCurrentChat
  }

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  )
}

export function useChat() {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider')
  }
  return context
}