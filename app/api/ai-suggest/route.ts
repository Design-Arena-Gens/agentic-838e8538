import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

export async function POST(request: NextRequest) {
  try {
    const { message, sender, platform, apiKey } = await request.json()

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key is required' },
        { status: 400 }
      )
    }

    const openai = new OpenAI({
      apiKey: apiKey,
    })

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are a helpful assistant that generates professional and friendly reply suggestions for ${platform} messages. Keep replies concise, warm, and appropriate for the platform. Consider the context and tone of the incoming message.`
        },
        {
          role: 'user',
          content: `Generate a reply suggestion for this message from ${sender}: "${message}"`
        }
      ],
      temperature: 0.7,
      max_tokens: 200,
    })

    const suggestion = completion.choices[0]?.message?.content || 'Unable to generate suggestion'

    return NextResponse.json({ suggestion })
  } catch (error: any) {
    console.error('Error generating AI suggestion:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate suggestion' },
      { status: 500 }
    )
  }
}
