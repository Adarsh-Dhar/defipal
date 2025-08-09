import { NextRequest, NextResponse } from 'next/server'
import { systemPrompt, functions } from './prompt'
import { GoogleGenAI } from '@google/genai'

interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      )
    }

    const googleApiKey = process.env.GOOGLE_API_KEY

    if (!googleApiKey) {
      return NextResponse.json(
        { error: 'Google API key not configured. Set GOOGLE_API_KEY in your environment.' },
        { status: 500 }
      )
    }

    const ai = new GoogleGenAI({ apiKey: googleApiKey })

    // Build a single prompt string using system prompt + transcript
    const prompt = [
      systemPrompt,
      ...((messages as ChatMessage[]).map((m) => `${m.role.toUpperCase()}: ${m.content}`))
    ].join('\n\n')

    const geminiResponse: any = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt
    })

    const responseText: string = (geminiResponse as any)?.text || ''

    return NextResponse.json({
      content: responseText
    })

  } catch (error) {
    console.error('LLM API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 