import { type NextRequest, NextResponse } from "next/server"
import { google } from "@ai-sdk/google"
import { generateText } from "ai"

export async function POST(req: NextRequest) {
  try {
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      return new NextResponse("Missing GOOGLE_GENERATIVE_AI_API_KEY. Add it in your project settings and redeploy.", {
        status: 500,
      })
    }

    const form = await req.formData()
    const file = form.get("image") as File | null
    const prompt = String(form.get("prompt") || "")
    const model = String(form.get("model") || "gemini-2.5-flash") as "gemini-2.5-flash" | "gemini-2.5-pro"
    const thinkingBudget = Number(form.get("thinkingBudget") || 0)

    const contentParts: any[] = []
    if (prompt) {
      contentParts.push({ type: "text", text: prompt })
    }

    if (file) {
      const ab = await file.arrayBuffer()
      const bytes = new Uint8Array(ab)
      contentParts.push({
        type: "image",
        image: bytes,
        mimeType: file.type || "image/jpeg",
      })
    }

    const { text } = await generateText({
      model: google(model),
      messages: [
        {
          role: "user",
          content: contentParts,
        },
      ],
      providerOptions: {
        google: {
          thinkingConfig: {
            thinkingBudget: isFinite(thinkingBudget) ? Math.max(0, Math.min(8192, thinkingBudget)) : 0,
            includeThoughts: false,
          },
        },
      },
    })

    return NextResponse.json({ report: text })
  } catch (err: any) {
    console.error(err)
    return new NextResponse(err?.message || "Failed to generate report", { status: 500 })
  }
}
