"use client"

import { motion } from "framer-motion"

export default function TypingIndicator() {
  return (
    <div className="flex items-center gap-2">
      <motion.div
        className="relative flex items-center justify-center"
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 5, 0, -5, 0],
        }}
        transition={{
          duration: 2,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "loop",
        }}
      >
        <div className="absolute inset-0 bg-[#c2185b] rounded-full blur-md opacity-40" />
        <div className="relative w-8 h-8 flex items-center justify-center bg-[#5a1c1a] rounded-full border border-[#c2185b]/50">
          <div className="w-1.5 h-1.5 bg-[#c2185b] rounded-full" />
        </div>
      </motion.div>

      <div className="flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="h-2.5 w-2.5 rounded-full bg-[#ff6b9d]"
            initial={{ y: 0, opacity: 0.3 }}
            animate={{
              y: [0, -8, 0],
              opacity: [0.3, 1, 0.3],
            }}
            transition={{
              duration: 1.2,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "loop",
              delay: i * 0.15,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <span className="text-sm text-[#ff6b9d] animate-pulse">Thinking...</span>
    </div>
  )
}
