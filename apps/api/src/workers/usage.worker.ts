import { Job, Worker } from 'bullmq'
import { Decimal } from 'decimal.js'
import IORedis from 'ioredis'
import { env } from '../config/env'
import { prisma } from '../config/prisma'
import { UsageJobData } from '../queues/usage.queue'
import { publishUsageUpdate } from '../redis/pubsub'

const connection = new IORedis(
  env.REDIS_URL,
  {
    maxRetriesPerRequest: null
  }
)

const processUsageJob = async (
  job: Job<UsageJobData>
): Promise<void> => {
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

    await publishUsageUpdate(userId, {
      userId,
      model,
      costUsd,
      totalTokens,
      requestId
    })

  } catch (error) {
    const prismaError = error as {
      code?: string
    }

    if (prismaError.code === 'P2002') {
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

export const usageWorker =
  new Worker<UsageJobData>(
    'usage-processing',
    processUsageJob,
    {
      connection,
      prefix: 'guardrail',
      concurrency: 5
    }
  )

usageWorker.on('completed', job => {
  console.log(JSON.stringify({
    msg: 'Job completed',
    jobId: job.id
  }))
})

usageWorker.on('failed', (job, error) => {
  console.error(JSON.stringify({
    msg: 'Job failed',
    jobId: job?.id,
    error:
      error instanceof Error
        ? error.message
        : 'Unknown error'
  }))
})

const shutdown = async (): Promise<void> => {
  console.log(
    '[Worker] Shutting down gracefully...'
  )

  await usageWorker.close()
  await connection.quit()

  console.log(
    '[Worker] Shutdown complete'
  )

  process.exit(0)
}

process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)

console.log(
  '[Worker] Usage worker started'
)