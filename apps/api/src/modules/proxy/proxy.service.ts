import { callOpenAI, Message } from "../../lib/openai"
import { calculateCost, getSupportedModels } from "../../lib/pricing"
import { AppError } from "../../lib/AppError"
import { checkCanProceed } from "../limits/limits.service"
import { checkAndIncrementAtomic } from "../../redis/counter"
import { generateIdempotencyKey } from "../../lib/idempotency"
import Decimal from "decimal.js"

interface ChatRequest {
  userId: string
  model: string
  messages: Message[]
  requestId: string
}

const supportedModels = getSupportedModels()

const estimatePromptCost = (
  model: (typeof supportedModels)[number],
  messages: Message[]
): Decimal => {
  const totalChars = messages.reduce((sum, m) => sum + m.content.length, 0)
  const estimatedTokens = Math.ceil(totalChars / 4)
  return calculateCost(model, estimatedTokens, 0)
}

const applySafetyBuffer = (estimatedCost: Decimal): Decimal => {
  const concurrencyFactor = new Decimal(5)
  return estimatedCost.mul(concurrencyFactor)
}

export const processChatRequest = async ({
  userId,
  model,
  messages,
  requestId
}: ChatRequest) => {
  if (!supportedModels.includes(model as any)) {
    throw new AppError("Unsupported model", 400, "INVALID_MODEL")
  }

  const typedModel = model as (typeof supportedModels)[number]

  const idempotencyKey = generateIdempotencyKey(userId, requestId)

  const estimatedCost = estimatePromptCost(typedModel, messages)
  const bufferedCost = applySafetyBuffer(estimatedCost)

  const { allowed, reason } = await checkCanProceed(bufferedCost, userId)

  if (!allowed) {
    throw new AppError(
      reason ?? "Spending limit exceeded",
      402,
      "LIMIT_EXCEEDED"
    )
  }

  const response = await callOpenAI(typedModel, messages, requestId)

  const actualCost = calculateCost(
    typedModel,
    response.usage.promptTokens,
    response.usage.completionTokens
  )

  const { getUserLimits } = await import("../limits/limits.repository")
  const limits = await getUserLimits(userId)

  await checkAndIncrementAtomic(
    userId,
    actualCost,
    new Decimal(limits.dailyLimitUSD.toString()),
    new Decimal(limits.monthlyLimitUSD.toString())
  )

  const { usageQueue } = await import("../../queues/usage.queue")

  await usageQueue.add(
    "process-usage",
    {
      userId,
      requestId,
      idempotencyKey,
      model: typedModel,
      promptTokens: response.usage.promptTokens,
      completionTokens: response.usage.completionTokens,
      totalTokens: response.usage.totalTokens,
      costUsd: actualCost.toString()
    },
    {
      jobId: idempotencyKey
    }
  )

  return {
    content: response.content,
    usage: response.usage,
    costUSD: actualCost.toString(),
    model: typedModel
  }
}