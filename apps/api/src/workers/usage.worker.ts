import { Worker, Job } from "bullmq"
import IORedis from "ioredis"
import { prisma } from "../config/prisma"
import { UsageJobData } from "../queues/usage.queue"
import { Decimal } from "decimal.js"

const connection = new IORedis(process.env.REDIS_URL!, {
  maxRetriesPerRequest: null
})

const processUsageJob = async (job: Job<UsageJobData>): Promise<void> => {
  const {
    userId,
    idempotencyKey,
    requestId,
    model,
    promptTokens,
    completionTokens,
    totalTokens,
    costUsd
  } = job.data

  try {
    await prisma.usageEvent.create({
      data: {
        idempotencyKey,
        requestId,
        userId,
        model,
        promptTokens,
        completionTokens,
        totalTokens,
        costUSD: new Decimal(costUsd)
      }
    })

    console.log(JSON.stringify({
      msg: 'UsageEvent written',
      jobId: job.id,
      userId,
      model,
      costUsd,
      requestId
    }))

  } catch (error: any) {
    
    if (error.code === 'P2002') {
      console.log(JSON.stringify({
        msg: 'Duplicate job skipped',
        jobId: job.id,
        idempotencyKey
      }))
      return
    }

    throw error
  }
}

export const usageWorker = new Worker<UsageJobData>(
  "usage-processing",
  processUsageJob,
  {
    connection,
    prefix: "guardrail",
    concurrency: 5
  }
)

usageWorker.on('completed', (job) => {
  console.log(JSON.stringify({
    msg: 'Job completed',
    jobId: job.id
  }))
})

usageWorker.on('failed', (job, error) => {
  console.error(JSON.stringify({
    msg: 'Job failed',
    jobId: job?.id,
    error: error.message
  }))
})

const shutdown = async () => {
  console.log('[Worker] Shutting down gracefully...')
  await usageWorker.close()
  console.log('[Worker] Shutdown complete')
  process.exit(0)
}

process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)

console.log('[Worker] Usage worker started, waiting for jobs...')