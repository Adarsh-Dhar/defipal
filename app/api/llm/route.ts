import { NextRequest, NextResponse } from 'next/server'

interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

interface OpenRouterRequest {
  model: string
  messages: ChatMessage[]
  max_tokens?: number
  temperature?: number
}

interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string
      role: string
    }
  }>
  usage: {
    total_tokens: number
    prompt_tokens: number
    completion_tokens: number
  }
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

    const openRouterApiKey = process.env.OPENROUTER_API_KEY || "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"
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'DeFiPal'

    if (!openRouterApiKey) {
      return NextResponse.json(
        { error: 'OpenRouter API key not configured' },
        { status: 500 }
      )
    }

    // Prepare messages for OpenRouter
    const openRouterMessages: ChatMessage[] = [
      {
        role: 'system',
        content: `You are DeFiPal, an AI assistant for Sonic DeFi. You help users with:
- Token swapping and exchanges
- Checking wallet balances
- Finding farming opportunities
- Managing staking positions
- Providing DeFi education and guidance

Always be helpful, concise, and focus on Sonic DeFi ecosystem. If asked about other chains or protocols, redirect them to Sonic DeFi features.`
      },
      ...messages
    ]

    const requestBody: OpenRouterRequest = {
      model: 'deepseek/deepseek-r1:free',
      messages: openRouterMessages,
      max_tokens: 500,
      temperature: 0.7
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openRouterApiKey}`,
        'HTTP-Referer': siteUrl,
        'X-Title': siteName,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('OpenRouter API error:', errorText)
      return NextResponse.json(
        { error: 'Failed to get response from AI service' },
        { status: 500 }
      )
    }

    const data: OpenRouterResponse = await response.json()
    
    if (!data.choices || data.choices.length === 0) {
      return NextResponse.json(
        { error: 'No response from AI service' },
        { status: 500 }
      )
    }

    const aiResponse = data.choices[0].message.content

    return NextResponse.json({
      content: aiResponse,
      usage: data.usage
    })

  } catch (error) {
    console.error('LLM API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 