import { NextRequest, NextResponse } from 'next/server'
import { systemPrompt, functions } from './prompt'

interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

interface OpenRouterRequest {
  model: string
  messages: ChatMessage[]
  max_tokens?: number
  temperature?: number
  tools?: any[]
  tool_choice?: string
}

interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string
      role: string
      tool_calls?: Array<{
        id: string
        type: string
        function: {
          name: string
          arguments: string
        }
      }>
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

    // Add debugging
    console.log('API Key length:', openRouterApiKey?.length)
    console.log('API Key starts with:', openRouterApiKey?.substring(0, 10))

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
        content: systemPrompt
      },
      ...messages
    ]

    // Convert functions to tools format
    const tools = functions.map(func => ({
      type: 'function',
      function: func
    }))

    const requestBody: OpenRouterRequest = {
      model: 'openrouter/horizon-beta',
      messages: openRouterMessages,
      max_tokens: 500,
      temperature: 0.7,
      tools: tools,
      tool_choice: 'auto'
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

    // Add debugging for response headers
    console.log('Response status:', response.status)
    console.log('Response headers:', Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      const errorText = await response.text()
      console.error('OpenRouter API error:', errorText)
      return NextResponse.json(
        { error: 'Failed to get response from AI service' },
        { status: 500 }
      )
    }

    const data: OpenRouterResponse = await response.json()

    // Add debugging to see the actual response
    console.log('Response data:', JSON.stringify(data, null, 2))

    if (!data.choices || data.choices.length === 0) {
      console.log('No choices in response')
      return NextResponse.json(
        { error: 'No response from AI service' },
        { status: 500 }
      )
    }

    const choice = data.choices[0]
    console.log('Choice:', JSON.stringify(choice, null, 2))

    const aiResponse = choice.message.content
    const toolCalls = choice.message.tool_calls

    console.log('AI Response:', aiResponse)
    console.log('Tool Calls:', toolCalls)

    // Convert tool_calls back to function_call format for compatibility
    const functionCall = toolCalls && toolCalls.length > 0 ? {
      name: toolCalls[0].function.name,
      arguments: toolCalls[0].function.arguments
    } : undefined

    // If there's a tool call but no content, provide a default response
    let responseContent = aiResponse
    if (functionCall && !aiResponse) {
      responseContent = `I'll help you with that. Let me execute the ${functionCall.name} function for you.`
    }

    return NextResponse.json({
      content: responseContent,
      function_call: functionCall,
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