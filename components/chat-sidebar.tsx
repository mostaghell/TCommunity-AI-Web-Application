'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useChat } from '../contexts/chat-context'
import { cn } from '../lib/utils'
import { 
  MessageSquare, 
  Plus, 
  MoreHorizontal, 
  Trash2, 
  Edit3, 
  Check, 
  X,
  ChevronLeft,
  ChevronRight,
  Edit2
} from 'lucide-react'

interface ChatSidebarProps {
  isOpen: boolean
  onToggle: () => void
}

export function ChatSidebar({ isOpen, onToggle }: ChatSidebarProps) {
  const { 
    chats, 
    currentChatId, 
    createNewChat, 
    selectChat, 
    deleteChat, 
    updateChatTitle 
  } = useChat()
  
  const [editingChatId, setEditingChatId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)

  const handleNewChat = () => {
    createNewChat()
  }

  const handleEditStart = (chatId: string, currentTitle: string) => {
    setEditingChatId(chatId)
    setEditTitle(currentTitle)
  }

  const handleEditSave = () => {
    if (editingChatId && editTitle.trim()) {
      updateChatTitle(editingChatId, editTitle.trim())
    }
    setEditingChatId(null)
    setEditTitle('')
  }

  const handleEditCancel = () => {
    setEditingChatId(null)
    setEditTitle('')
  }

  const handleDelete = (chatId: string) => {
    deleteChat(chatId)
    setShowDeleteConfirm(null)
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString('fa-IR', { weekday: 'short' })
    } else {
      return date.toLocaleDateString('fa-IR', { month: 'short', day: 'numeric' })
    }
  }

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className={cn(
          "fixed top-4 z-50 p-2 rounded-lg transition-all duration-300",
          "bg-[#2e0b1a]/90 backdrop-blur-xl border border-[#d63384]/30",
          "hover:bg-[#5a1c3a]/50 hover:border-[#d63384]/50",
          "text-[#ff8fab] hover:text-[#ff6b9d]",
          isOpen ? "left-[280px]" : "left-4"
        )}
      >
        {isOpen ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
      </button>

      {/* Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className={cn(
              "fixed left-0 top-0 h-full w-[280px] z-40",
              "bg-gradient-to-b from-[#2e0b1a]/95 to-[#5a1c1a]/95 backdrop-blur-xl",
              "border-r border-[#d63384]/30",
              "flex flex-col"
            )}
          >
            {/* Header */}
            <div className="p-4 border-b border-[#d63384]/30">
              <button
                onClick={handleNewChat}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-lg",
                  "bg-gradient-to-r from-[#d63384]/20 to-[#c2185b]/20",
                  "border border-[#d63384]/30 hover:border-[#d63384]/50",
                  "text-[#ff8fab] hover:text-[#ff6b9d]",
                  "transition-all duration-200 hover:scale-[1.02]",
                  "hover:shadow-[0_0_20px_rgba(214,51,132,0.2)]"
                )}
              >
                <Plus className="h-5 w-5" />
                <span className="font-medium">New Chat</span>
              </button>
            </div>

            {/* Chat List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {chats.length === 0 ? (
                <div className="text-center py-8 text-[#ff8fab]/60">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No chats yet</p>
                  <p className="text-xs mt-1">Start a new conversation</p>
                </div>
              ) : (
                chats.map((chat) => (
                  <div key={chat.id} className="group relative">
                    <motion.div
                      whileHover={{ scale: 1.01 }}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg cursor-pointer",
                        "transition-all duration-200",
                        currentChatId === chat.id
                          ? "bg-[#d63384]/20 border border-[#d63384]/40 text-[#ff6b9d]"
                          : "hover:bg-[#5a1c3a]/30 text-[#ff8fab]/80 hover:text-[#ff8fab]"
                      )}
                      onClick={() => selectChat(chat.id)}
                    >
                      <MessageSquare className="h-4 w-4 flex-shrink-0" />
                      
                      <div className="flex-1 min-w-0">
                        {editingChatId === chat.id ? (
                          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="text"
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              className={cn(
                                "flex-1 bg-[#5a1c1a]/50 border border-[#c2185b]/30",
                                "rounded px-2 py-1 text-sm text-[#f3d9e2]",
                                "focus:outline-none focus:border-[#d63384]/50"
                              )}
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleEditSave()
                                if (e.key === 'Escape') handleEditCancel()
                              }}
                            />
                            <button
                              onClick={handleEditSave}
                              className="p-1 hover:bg-[#d63384]/20 rounded text-green-400"
                            >
                              <Check className="h-3 w-3" />
                            </button>
                            <button
                              onClick={handleEditCancel}
                              className="p-1 hover:bg-[#d63384]/20 rounded text-red-400"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <div className="font-medium text-sm truncate">
                              {chat.title}
                            </div>
                            <div className="text-xs opacity-60 mt-1">
                              {formatDate(chat.updatedAt)} • {chat.messages.length} messages
                            </div>
                          </>
                        )}
                      </div>

                      {editingChatId !== chat.id && (
                        <div className="flex gap-1">
                          <motion.button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEditStart(chat.id, chat.title)
                            }}
                            className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-[#2d1b2e] transition-all"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Edit2 className="h-3 w-3 text-[#bc87a2]" />
                          </motion.button>
                          
                          <motion.button
                            onClick={(e) => {
                              e.stopPropagation()
                              if (window.confirm('Are you sure you want to delete this chat?')) {
                                deleteChat(chat.id)
                              }
                            }}
                            className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-[#d63384]/20 transition-all"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Trash2 className="h-3 w-3 text-[#d63384]" />
                          </motion.button>
                        </div>
                      )}
                    </motion.div>

                    {/* Delete Confirmation */}
                    <AnimatePresence>
                      {showDeleteConfirm === chat.id && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className={cn(
                            "absolute top-full left-0 right-0 mt-1 z-50",
                            "bg-[#5a1c1a]/95 backdrop-blur-xl border border-[#c2185b]/30",
                            "rounded-lg p-3 shadow-lg"
                          )}
                        >
                          <div className="text-sm text-[#f3d9e2] mb-3">
                            Delete this chat?
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditStart(chat.id, chat.title)}
                              className={cn(
                                "flex-1 flex items-center justify-center gap-1 px-2 py-1",
                                "bg-[#d63384]/20 hover:bg-[#d63384]/30 rounded text-xs",
                                "text-[#ff8fab] transition-colors"
                              )}
                            >
                              <Edit3 className="h-3 w-3" />
                              Rename
                            </button>
                            <button
                              onClick={() => handleDelete(chat.id)}
                              className={cn(
                                "flex-1 flex items-center justify-center gap-1 px-2 py-1",
                                "bg-red-500/20 hover:bg-red-500/30 rounded text-xs",
                                "text-red-400 transition-colors"
                              )}
                            >
                              <Trash2 className="h-3 w-3" />
                              Delete
                            </button>
                            <button
                              onClick={() => setShowDeleteConfirm(null)}
                              className={cn(
                                "px-2 py-1 bg-[#5a1c3a]/50 hover:bg-[#5a1c3a]/70",
                                "rounded text-xs text-[#ff8fab]/60 transition-colors"
                              )}
                            >
                              Cancel
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onToggle}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
          />
        )}
      </AnimatePresence>
    </>
  )
}