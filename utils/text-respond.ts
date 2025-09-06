import models from "../data/models.json"

interface Message {
  role: string
  content: string
}

// Clean response from markdown formatting
function cleanMarkdownResponse(response: string): string {
  let cleaned = response.trim()
  
  // Remove markdown code block wrapper from start
  if (cleaned.startsWith('```markdown')) {
    cleaned = cleaned.replace(/^```markdown\s*\n?/, '')
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*\n?/, '')
  }
  
  // Remove markdown code block wrapper from end
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.replace(/\n?\s*```$/, '')
  }
  
  // Remove markdown formatting characters
  cleaned = cleaned
    // Remove headers (##, ###, etc.)
    .replace(/^#{1,6}\s+/gm, '')
    // Remove bold (**text** or __text__)
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    // Remove italic (*text* or _text_)
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/_(.*?)_/g, '$1')
    // Remove horizontal rules (--- or ***)
    .replace(/^[-*]{3,}\s*$/gm, '')
    // Remove table formatting (|)
    .replace(/\|/g, ' ')
    // Remove extra whitespace and empty lines
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    .trim()
  
  return cleaned
}

// Free models that work with GET method (no API token required)
const FREE_MODELS = [
  "openai", "openai-fast", "gpt-5-nano",
  "gemini", "llama-roblox", "llama-fast-roblox",
  "mistral", "qwen-coder", "bidara", "midijourney",
  "evil", "unity"
]

// Check if user has premium access (API token)
function hasPremiumAccess(): boolean {
  return !!process.env.POLLINATIONS_API_TOKEN
}

// Generate text using GET method (free, no authentication)
async function generateTextFree(prompt: string, model = "openai", systemMessage?: string): Promise<string> {
  try {
    console.log('Using FREE API (GET method) with model:', model)
    
    // Add timestamp to prevent caching and combine with system message
    const timestamp = Date.now()
    const fullPrompt = systemMessage 
      ? `${systemMessage}\n\nUser: ${prompt}\n\n[Request ID: ${timestamp}]`
      : `${prompt}\n\n[Request ID: ${timestamp}]`
    
    // Encode the prompt for URL
    const encodedPrompt = encodeURIComponent(fullPrompt)
    const url = `https://text.pollinations.ai/${encodedPrompt}?model=${model}`
    
    const response = await fetch(url, {
      method: "GET",
      headers: {
        'Accept': 'text/plain; charset=utf-8',
        'Accept-Charset': 'utf-8',
        'Referer': 'http://localhost:3000'
      }
    })

    console.log('Free API Response status:', response.status)
    console.log('Free API URL:', url)
    console.log('Free API Model:', model)
    console.log('Free API Prompt length:', fullPrompt.length)

    if (!response.ok) {
      console.log('Free API Response error details:', await response.text())
      // If the model fails due to authentication/tier requirements
      if (response.status === 402) {
        console.log(`Model ${model} failed with 402 - requires authentication or higher tier`)
        return `متأسفانه مدل ${model} نیاز به احراز هویت یا سطح دسترسی بالاتر دارد و برای کاربران anonymous در دسترس نیست.\n\n🔐 برای استفاده از این مدل، لطفاً از مدل‌های رایگان دیگر استفاده کنید یا در صورت نیاز، احراز هویت انجام دهید.`
      }
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.text()
    console.log('Free API Response data:', data)
    const cleanedData = cleanMarkdownResponse(data)
    console.log('Cleaned response:', cleanedData)
    return cleanedData
  } catch (error) {
    console.error("Error generating text with free API:", error)
    throw error
  }
}

// Generate text using POST method (premium, requires API token)
async function generateTextPremium(messages: Message[], model = "openai", isPrivate = true): Promise<string> {
  try {
    console.log('Using PREMIUM API (POST method) with:', { messages, model, private: isPrivate })
    
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    }
    
    // Add API token
    const apiToken = process.env.POLLINATIONS_API_TOKEN
    if (apiToken) {
      headers["Authorization"] = `Bearer ${apiToken}`
    }
    
    const response = await fetch("https://text.pollinations.ai/", {
      method: "POST",
      headers,
      body: JSON.stringify({
        messages,
        model,
        private: isPrivate,
      }),
    })

    console.log('Premium API Response status:', response.status)
    console.log('Premium API Response headers:', Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Premium API Error response body:', errorText)
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    // Check if response is audio
    const contentType = response.headers.get('content-type')
    console.log('Response content-type:', contentType)
    console.log('Response headers:', Object.fromEntries(response.headers.entries()))
    
    if (contentType && contentType.includes('audio/')) {
      // For audio responses, create a blob URL
      const audioBlob = await response.blob()
      console.log('Audio blob size:', audioBlob.size, 'bytes')
      console.log('Audio blob type:', audioBlob.type)
      
      if (audioBlob.size === 0) {
        console.error('Audio blob is empty')
        return "⚠️ فایل صوتی خالی دریافت شد. لطفاً دوباره تلاش کنید."
      }
      
      const audioUrl = URL.createObjectURL(audioBlob)
      console.log('Audio response received, blob URL created:', audioUrl)
      return `AUDIO:${audioUrl}`
    }

    const data = await response.text()
    console.log('Premium API Response data:', data)
    
    // Check if the response is actually audio content disguised as text
    if (model === 'openai-audio' && !contentType?.includes('audio/')) {
      console.log('openai-audio model returned text instead of audio')
      // If it's supposed to be audio but we got text, it might be an error or unsupported
      if (data.includes('error') || data.includes('not supported') || data.includes('unavailable')) {
        return "⚠️ مدل صوتی در حال حاضر در دسترس نیست. لطفاً از مدل‌های متنی استفاده کنید."
      }
    }
    
    const cleanedData = cleanMarkdownResponse(data)
    console.log('Cleaned response:', cleanedData)
    return cleanedData
  } catch (error) {
    console.error("Error generating text with premium API:", error)
    throw error
  }
}

// Main function that decides which API to use
async function generateText(messages: Message[], model = "openai", isPrivate = true): Promise<string> {
  const isPremiumUser = hasPremiumAccess()
  const isModelFree = FREE_MODELS.includes(model)
  
  console.log('User type:', isPremiumUser ? 'Premium' : 'Free')
  console.log('Model:', model, 'Is free model:', isModelFree)
  
  // Calculate total message length for premium API limit check
  const totalMessageLength = JSON.stringify(messages).length
  const MAX_PREMIUM_LENGTH = 4500 // Leave some buffer for the 5000 limit
  
  console.log('Total message length:', totalMessageLength, 'Max allowed:', MAX_PREMIUM_LENGTH)
  
  // If user has premium access, model is not free, and message length is acceptable
  if (isPremiumUser && !isModelFree && totalMessageLength <= MAX_PREMIUM_LENGTH) {
    try {
      return await generateTextPremium(messages, model, isPrivate)
    } catch (error) {
      console.log('Premium API failed, falling back to free API:', error)
      // Fall through to free API
    }
  }
  
  // For free users, free models, or when premium API fails/exceeds length
  // Extract system message and user prompt
  const systemMessage = messages.find(msg => msg.role === 'system')?.content
  const lastUserMessage = messages.filter(msg => msg.role === 'user').pop()
  const prompt = lastUserMessage ? lastUserMessage.content : messages[messages.length - 1]?.content || ''
  
  // Use the requested model if it's free, otherwise use openai
  const freeModel = isModelFree ? model : "openai"

  return generateTextFree(prompt, freeModel, systemMessage)
}

export { models, generateText }
