import { type NextRequest, NextResponse } from "next/server"
import { google } from "@ai-sdk/google"
import { generateText } from "ai"

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData()
    const file = form.get("image") as File | null
    const prompt = String(form.get("prompt") || "")
    const model = String(form.get("model") || "gemini-2.5-flash") as "gemini-2.5-flash" | "gemini-2.5-pro"
    const thinkingBudget = Number(form.get("thinkingBudget") || 0)
    const apiKey = String(form.get("apiKey") || "")

    // Debug logging
    console.log("Received API key length:", apiKey.length)
    console.log("API key starts with:", apiKey.substring(0, 10))
    console.log("Has env API key:", !!process.env.GOOGLE_GENERATIVE_AI_API_KEY)
    
    // Check for API key - prioritize user-provided key, fallback to environment variable
    const geminiApiKey = apiKey || process.env.GOOGLE_GENERATIVE_AI_API_KEY
    if (!geminiApiKey) {
      return new NextResponse("Missing Gemini API key. Please provide your API key in the settings.", {
        status: 400,
      })
    }
    
    console.log("Using API key length:", geminiApiKey.length)
    console.log("Final API key starts with:", geminiApiKey.substring(0, 10))

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

    console.log("About to call generateText with model:", model)
    
    // Initialize the google provider with the API key
    const googleProvider = google({
      apiKey: geminiApiKey,
    })
    
    const { text } = await generateText({
      model: googleProvider(model),
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
    console.error("Full error:", err)
    console.error("Error name:", err?.name)
    console.error("Error message:", err?.message)
    console.error("Error stack:", err?.stack)
    
    // Return detailed error information
    const errorMessage = err?.message || "Failed to generate report"
    const errorDetails = err?.code ? ` (Code: ${err.code})` : ""
    
    return new NextResponse(`${errorMessage}${errorDetails}`, { status: 500 })
  }
}
