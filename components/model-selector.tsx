"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, Sparkles, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface Model {
  name: string
  description: string
  company: string
  vision: boolean
  audio: boolean
  cost: number
  farsi_name: string
  reasoning?: boolean
  tools?: boolean
  input_modalities?: string[]
  output_modalities?: string[]
  free?: boolean
}

interface ModelSelectorProps {
  onModelChange: (model: string) => void
  selectedModel: string
}

export default function ModelSelector({ onModelChange, selectedModel }: ModelSelectorProps) {
  const [models, setModels] = useState<Model[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [hoveredModel, setHoveredModel] = useState<string | null>(null)

  // Define the default model name
  const DEFAULT_MODEL = "openai"

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await fetch("/api/models")
        let data = await response.json()

        // Set models data
        setModels(data)

        // Set default model if not already selected
        if (!selectedModel) {
          onModelChange(DEFAULT_MODEL)
        }
      } catch (error) {
        console.error("Failed to fetch models:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchModels()
  }, [selectedModel, onModelChange])

  const selectedModelData = models.find((model) => model.name === selectedModel)

  const toggleDropdown = () => {
    if (!isLoading) {
      setIsOpen(!isOpen)
    }
  }

  const handleSelectModel = (modelName: string) => {
    onModelChange(modelName)
    setIsOpen(false)
  }

  // Get cost rating (1-3) as stars
  const getCostRating = (cost: number) => {
    return Array(cost)
      .fill(0)
      .map((_, i) => <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#9d4edd]" />)
  }

  // Check if a model is free
  const isFreeModel = (model: Model) => model.free === true

  return (
    <div className="relative">
      {/* Selected model button */}
      <button
        onClick={toggleDropdown}
        disabled={isLoading}
        className={cn(
          "w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg",
          "bg-gradient-to-r from-[#2e0b1a]/90 to-[#5a1c1a]/90 backdrop-blur-xl",
          "border border-[#9d4edd]/30 hover:border-[#9d4edd]/50",
          "text-[#e2d9f3] text-sm",
          "transition-all duration-300",
          "focus:outline-none focus:ring-2 focus:ring-[#9d4edd]/30",
          isOpen && "border-[#9d4edd]/50 shadow-[0_0_15px_rgba(157,78,221,0.2)]",
          isLoading && "opacity-70 cursor-not-allowed",
        )}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          {isLoading ? (
            <div className="animate-pulse w-5 h-5 rounded-full bg-[#9d4edd]/30" />
          ) : (
            <div className="relative flex-shrink-0">
              <div className="absolute inset-0 rounded-full opacity-20 blur-sm bg-[#9d4edd]" />
              <Sparkles className="relative w-4 h-4 text-[#9d4edd]" />
            </div>
          )}

          <div className="truncate min-w-0 flex-1">
            {isLoading ? (
              <div className="animate-pulse w-32 h-4 bg-[#9d4edd]/30 rounded" />
            ) : (
              <div className="flex flex-col">
                <span className="font-medium text-sm leading-tight text-[#e2d9f3]">
                  {selectedModelData?.description || "Select Model"}
                </span>
                {selectedModelData && (
                  <div className="text-xs text-[#a287bc] opacity-80 leading-tight flex items-center gap-2">
                    <span>{selectedModelData.company}</span>
                    <span>•</span>
                    <span className={cn(
                      "px-1.5 py-0.5 rounded text-[10px] font-medium",
                      selectedModelData.free ? "bg-green-500/20 text-green-400" : "bg-blue-500/20 text-blue-400"
                    )}>
                      {selectedModelData.free ? "Free" : "Premium"}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.3 }}>
            <ChevronDown className="w-4 h-4 text-[#9d4edd]" />
          </motion.div>
        </div>
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "absolute right-0 mt-2 w-80 z-50 overflow-hidden",
              "bg-gradient-to-b from-[#2e0b1a] to-[#5a1c1a]/90 backdrop-blur-xl",
              "border border-[#9d4edd]/30 rounded-lg shadow-lg",
              "shadow-[0_5px_30px_rgba(157,78,221,0.25)]",
            )}
          >
            <div className="max-h-[350px] overflow-y-auto scrollbar-thin scrollbar-track-[#1a0b2e] scrollbar-thumb-[#9d4edd]/50">
              {models.map((model) => (
                <div
                  key={model.name}
                  onClick={() => handleSelectModel(model.name)}
                  onMouseEnter={() => setHoveredModel(model.name)}
                  onMouseLeave={() => setHoveredModel(null)}
                  className={cn(
                    "relative px-3 py-3 cursor-pointer",
                    "border-b border-[#9d4edd]/10 last:border-0",
                    "transition-all duration-200",
                    hoveredModel === model.name && "bg-[#3a1c5a]/50",
                    selectedModel === model.name && "bg-[#3a1c5a]",
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                         <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-[#e2d9f3] text-sm leading-tight">
                                {model.description}
                              </span>
                              {selectedModel === model.name && <Check className="w-4 h-4 text-[#9d4edd] flex-shrink-0" />}
                            </div>
                            <div className="text-xs text-[#a287bc] opacity-75 mt-0.5 flex items-center gap-2">
                               <span>{model.company}</span>
                               <span>•</span>
                               <span className={cn(
                                 "px-1.5 py-0.5 rounded text-[10px] font-medium",
                                 model.free ? "bg-green-500/20 text-green-400" : "bg-blue-500/20 text-blue-400"
                               )}>
                                 {model.free ? "Free" : "Premium"}
                               </span>
                             </div>
                          </div>
                       </div>

                    </div>
                   </div>

                   {/* Hover effect */}
                    {hoveredModel === model.name && (
                      <motion.div
                        layoutId="hoverHighlight"
                        className="absolute inset-0 bg-gradient-to-r from-[#d63384]/5 to-[#c2185b]/5 pointer-events-none"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      />
                    )}
                  </div>
                ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
