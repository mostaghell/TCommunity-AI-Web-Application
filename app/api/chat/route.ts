import { type NextRequest, NextResponse } from "next/server"
import { models, generateText } from "@/utils/text-respond"

const messageHistory: Record<string, { role: string; content: string }[]> = {}

export const maxDuration = 60

export async function POST(req: NextRequest) {
  try {
    const { messages, model = "openai", isPrivate = true } = await req.json()

    const deviceId = req.headers.get("x-device-id") || req.cookies.get("sessionId")?.value || "anonymous"
    const deviceIdB64 = deviceId ? Buffer.from(deviceId).toString("base64") : "anonymous"

    console.log("Device ID (Base64):", deviceIdB64)

    if (!messages || !messages.length) {
      return NextResponse.json({ error: "Messages are required" }, { status: 400 })
    }

    const userPrompt = messages[messages.length - 1].content

    if (!userPrompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    if (model !== "openai" && !models.find((m) => m.name === model)) {
      return NextResponse.json({ error: "Invalid model specified" }, { status: 400 })
    }

    const previousMessages = messageHistory[deviceIdB64]?.slice(-10) || []

    const processedMessages = [
      ...previousMessages,
      {
        role: "system",
        content:
          "به همان زبانی که کاربر سوال پرسیده پاسخ دهید. اگر فارسی پرسید، فارسی جواب دهید. اگر انگلیسی پرسید، انگلیسی جواب دهید. پاسخ‌های ساده، واضح و مفید ارائه دهید.",
      },
      { role: "user", content: userPrompt },
    ]

    const response = await generateText(processedMessages, model, isPrivate)

    messageHistory[deviceIdB64] = [
      ...(previousMessages || []),
      { role: "user", content: userPrompt },
      { role: "assistant", content: response },
    ]

    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        controller.enqueue(encoder.encode(response))
        controller.close()
      },
    })

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "X-Content-Type-Options": "nosniff",
      },
    })
  } catch (error) {
    console.error("Error in text generation:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json(models)
}
