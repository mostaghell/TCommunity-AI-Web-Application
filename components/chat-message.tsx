"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"
import { User, Sparkles, ThumbsUp, ThumbsDown, Copy, Check, Code } from "lucide-react"
import ReactMarkdown from "react-markdown"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism"
import remarkGfm from "remark-gfm"
import rehypeRaw from "rehype-raw"

import { AudioPlayer } from "./audio-player"

type Message = {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
}

interface ChatMessageProps {
  message: Message
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user"
  const [liked, setLiked] = useState<boolean | null>(null)
  const [copied, setCopied] = useState(false)

  // Handle copy message content
  const handleCopy = (code: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(code).then(() => {
        setCopied(true)
        setTimeout(() => {
          setCopied(false)
        }, 2000)
      })
    } else {
      // Fallback for environments where clipboard API is not available
      const textArea = document.createElement('textarea')
      textArea.value = code
      document.body.appendChild(textArea)
      textArea.select()
      try {
        document.execCommand('copy')
        setCopied(true)
        setTimeout(() => {
          setCopied(false)
        }, 2000)
      } catch (err) {
        console.error('Failed to copy text:', err)
      }
      document.body.removeChild(textArea)
    }
  }

  // Handle like/dislike
  const handleFeedback = (isLike: boolean) => {
    setLiked(isLike)
    console.log(`Message ${message.id} ${isLike ? "liked" : "disliked"}`)
  }

  return (
    <div className={cn("flex w-full", isUser ? "justify-end" : "justify-start")}>
      <div className={cn("flex items-start gap-3 max-w-[85%]", isUser && "flex-row-reverse")}>
        <div className="relative">
          <div
            className={cn("absolute inset-0 rounded-full blur-md opacity-70", isUser ? "bg-[#d63384]" : "bg-[#c2185b]")}
          />
          <div
            className={cn(
              "relative flex h-10 w-10 shrink-0 select-none items-center justify-center rounded-full",
              isUser ? "bg-[#5a1c3a]" : "bg-[#3a1c2d]",
              "border-2",
              isUser ? "border-[#d63384]" : "border-[#c2185b]",
            )}
          >
            {isUser ? <User className="h-5 w-5 text-[#f3d9e2]" /> : <Sparkles className="h-5 w-5 text-[#f3d9e2]" />}
          </div>
        </div>

        <div className={cn("relative group", isUser ? "text-right" : "text-left")}>
          <div
            className={cn(
              "absolute inset-0 rounded-2xl blur-md opacity-20 transition-opacity duration-300 group-hover:opacity-40",
              isUser ? "bg-[#d63384]" : "bg-[#c2185b]",
            )}
          />

          <div
            className={cn(
              "relative rounded-2xl p-5 shadow-lg",
              isUser
                ? "bg-[#5a1c3a]/80 backdrop-blur-xl border border-[#d63384]/30 rounded-tr-none text-[#f3d9e2]"
                : "bg-[#3a1c2d]/80 backdrop-blur-xl border border-[#c2185b]/30 rounded-tl-none text-[#f3d9e2]",
              "transition-all duration-300 hover:shadow-[0_0_20px_rgba(214,51,132,0.2)]",
            )}
          >
            <div className="prose prose-invert max-w-none">
              {isUser ? (
                <p className="m-0 leading-relaxed whitespace-pre-wrap">{message.content}</p>
              ) : message.content.startsWith('AUDIO:') ? (
                <AudioPlayer audioUrl={message.content.replace('AUDIO:', '')} />
              ) : (
                <div className="text-content" dir="auto" style={{
                  direction: /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(message.content) ? 'rtl' : 'ltr',
                  textAlign: /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(message.content) ? 'right' : 'left'
                }}>
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw]}
                    components={{
                      code({ node, inline, className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || '')
                        return !inline && match ? (
                          <div className="relative group">
                            <div className="flex items-center justify-between bg-[#692d1b]/50 px-4 py-2 rounded-t-lg border border-[#c2185b]/30">
                              <span className="text-xs text-[#ff8fab] font-medium">{match[1]}</span>
                              <button
                                onClick={() => handleCopy(String(children).replace(/\n$/, ''))}
                                className="p-1 rounded hover:bg-[#3a1c5a]/50 transition-colors opacity-0 group-hover:opacity-100"
                                title="Copy code"
                              >
                                {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Code className="h-3.5 w-3.5 text-[#ff8fab]" />}
                              </button>
                            </div>
                            <SyntaxHighlighter
                              style={oneDark}
                              language={match[1]}
                              PreTag="div"
                              customStyle={{
                                margin: 0,
                                borderRadius: '0 0 8px 8px',
                                border: '1px solid rgba(194, 24, 91, 0.3)',
                                borderTop: 'none',
                                backgroundColor: 'rgba(90, 28, 45, 0.8)',
                                fontSize: '14px',
                                lineHeight: '1.5'
                              }}
                              {...props}
                            >
                              {String(children).replace(/\n$/, '')}
                            </SyntaxHighlighter>
                          </div>
                        ) : (
                          <code className="bg-[#692d1b]/50 text-[#f3d9e2] px-2 py-1 rounded text-sm border border-[#c2185b]/30" {...props}>
                            {children}
                          </code>
                        )
                      },
                      p: ({ children }) => (
                        <p className="m-0 mb-4 last:mb-0 leading-relaxed text-[#f3d9e2]">{children}</p>
                      ),
                      h1: ({ children }) => (
                        <h1 className="text-xl font-bold text-[#f3d9e2] mb-3 mt-0">{children}</h1>
                      ),
                      h2: ({ children }) => (
                        <h2 className="text-lg font-semibold text-[#f3d9e2] mb-2 mt-0">{children}</h2>
                      ),
                      h3: ({ children }) => (
                        <h3 className="text-base font-medium text-[#f3d9e2] mb-2 mt-0">{children}</h3>
                      ),
                      ul: ({ children }) => (
                        <ul className="list-disc list-inside text-[#f3d9e2] mb-4 space-y-1">{children}</ul>
                      ),
                      ol: ({ children }) => (
                        <ol className="list-decimal list-inside text-[#f3d9e2] mb-4 space-y-1">{children}</ol>
                      ),
                      li: ({ children }) => (
                        <li className="text-[#f3d9e2]">{children}</li>
                      ),
                      blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-[#c2185b] pl-4 italic text-[#ff8fab] mb-4">{children}</blockquote>
                      ),
                      strong: ({ children }) => (
                        <strong className="font-semibold text-[#ff8fab]">{children}</strong>
                      ),
                      em: ({ children }) => (
                        <em className="italic text-[#ff6b9d]">{children}</em>
                      )
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>
              )}
            </div>

            <div
              className={cn(
                "mt-2 flex items-center gap-2",
                isUser ? "justify-end text-[#ff8fab]" : "justify-between text-[#ff6b9d]",
              )}
            >
              <span className="text-xs opacity-60">{formatDistanceToNow(message.timestamp, { addSuffix: true })}</span>

              {!isUser && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    <button
                      onClick={() => handleFeedback(true)}
                      className={cn(
                        "p-1 rounded hover:bg-[#5a1c3a]/50 transition-colors",
                        liked === true && "text-green-400",
                      )}
                      title="Like"
                    >
                      <ThumbsUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleFeedback(false)}
                      className={cn(
                        "p-1 rounded hover:bg-[#5a1c3a]/50 transition-colors",
                        liked === false && "text-red-400",
                      )}
                      title="Dislike"
                    >
                      <ThumbsDown className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => handleCopy(message.content)}
                    className="p-1 rounded hover:bg-[#5a1c3a]/50 transition-colors"
                    title="Copy message"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
              )}
            </div>

            {/* Decorative elements */}
            <div
              className={cn(
                "absolute w-3 h-3 rotate-45",
                isUser
                  ? "bg-[#3a1c5a] top-4 right-[-6px] border-r border-t border-[#9d4edd]/30"
                  : "bg-[#5a1c1a] top-4 left-[-6px] border-l border-t border-[#c2185b]/30",
              )}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
