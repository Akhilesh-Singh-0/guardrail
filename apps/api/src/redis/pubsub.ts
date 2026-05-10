import IORedis from 'ioredis'

import { env } from '../config/env'

import { broadcastToUser } from '../websocket/socket.rooms'

type UsageUpdateMessage = {
  type: 'USAGE_UPDATE'
  data: object
}

const createRedisClient = () =>
  new IORedis(env.REDIS_URL, {
    maxRetriesPerRequest: null
})

const publisher = createRedisClient()
const subscriber = createRedisClient()

export const getUserChannel = (
  userId: string
): string => {
  return `usage:${userId}`
}

export const publishUsageUpdate = async (
  userId: string,
  data: object
): Promise<void> => {
  const channel = getUserChannel(userId)

  const message: UsageUpdateMessage = {
    type: 'USAGE_UPDATE',
    data
  }

  await publisher.publish(
    channel,
    JSON.stringify(message)
  )
}

export const initSubscriber = async (): Promise<void> => {
  await subscriber.psubscribe('usage:*')

  subscriber.on(
    'pmessage',
    (
      _pattern: string,
      channel: string,
      message: string
    ) => {
      try {
        const userId = channel.replace(
          'usage:',
          ''
        )

        const parsed =
          JSON.parse(message)

        broadcastToUser(userId, parsed)
      } catch (error) {
        console.error(
          '[PubSub] Failed to process message:',
          error
        )
      }
    }
  )

  console.log(
    '[PubSub] Subscriber initialized'
  )
}

export const closePubSub = async (): Promise<void> => {
  await Promise.all([
    publisher.quit(),
    subscriber.quit()
  ])
}