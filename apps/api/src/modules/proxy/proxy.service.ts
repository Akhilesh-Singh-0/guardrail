import { callOpenAI, Message } from "../../lib/openai";
import { calculateCost, getSupportedModels } from "../../lib/pricing";
import { AppError } from "../../lib/AppError";

interface ChatRequest {
    userId: string
    model: string
    messages: Message[]
    requestId: string
}

const supportedModels = getSupportedModels()

export const processChatRequest = async({
    userId,
    model,
    messages,
    requestId
}: ChatRequest) => {

    if(!supportedModels.includes(model as any)){
        throw new AppError('Unsupported model', 400, 'INVALID_MODEL')
    }

    const typedModel = model as (typeof supportedModels)[number]

    const response = await callOpenAI(typedModel, messages, requestId)

    const cost = calculateCost(
        typedModel,
        response.usage.promptTokens,
        response.usage.completionTokens
    )

    console.log('[Proxy] Usage:', {
        userId,
        model: typedModel,
        tokens: response.usage,
        costUSD: cost.toFixed(8),
        requestId
    })

    return {
        content: response.content,
        usage: response.usage,
        costUSD: cost.toString(),
        model: typedModel
    }
}