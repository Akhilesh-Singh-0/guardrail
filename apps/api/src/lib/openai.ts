import OpenAI from 'openai'
import { env } from '../config/env'
import { AppError } from './AppError'

const client = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
  timeout: 10000,
})

export type Message = {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface OpenAIResponse {
  content: string
  usage: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}

export async function callOpenAI(
  model: string,
  messages: Message[],
  requestId?: string
): Promise<OpenAIResponse> {
  try {
    const response = await client.chat.completions.create(
        {
          model,
          messages,
        },
        {
          headers: requestId ? { 'x-request-id': requestId } : undefined,
        }
    )

    const choice = response.choices?.[0]

    if (!choice || !choice.message?.content) {
      throw new AppError('Empty response from OpenAI', 500, 'OPENAI_EMPTY_RESPONSE')
    }

    const usage = response.usage

    if (!usage) {
      throw new AppError('Missing usage data from OpenAI', 500, 'OPENAI_MISSING_USAGE')
    }

    return {
      content: choice.message.content,
      usage: {
        promptTokens: usage.prompt_tokens,
        completionTokens: usage.completion_tokens,
        totalTokens: usage.total_tokens,
      },
    }
  } catch (error: any) {
    if (error instanceof AppError) throw error

    if (error?.status === 429) {
      throw new AppError('OpenAI rate limit exceeded', 429, 'OPENAI_RATE_LIMIT')
    }

    if (error?.status === 401) {
      throw new AppError('Invalid OpenAI API key', 401, 'OPENAI_INVALID_KEY')
    }

    if (error?.status === 400) {
      throw new AppError('Invalid OpenAI request', 400, 'OPENAI_BAD_REQUEST')
    }

    throw new AppError(
      `OpenAI request failed: ${error?.message || 'unknown error'}`,
      500,
      'OPENAI_ERROR'
    )
  }
}