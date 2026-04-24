import { redis } from './config/redis'
import express from "express"
import { prisma } from './config/prisma'
import { env } from "./config/env"
import { connectRedis } from "./config/redis"
import { requestId } from './middleware/requestId'
import { errorHandler } from './middleware/errorHandler'

const app = express()

app.use(requestId)
app.use(express.json())

app.get("/health", async (req, res) => {
    try {
      await redis.ping()
      await prisma.$queryRaw`SELECT 1`
      res.json({
        status: "ok",
        redis: "ok",
        prisma: "ok",
        uptime: process.uptime()
      })
    } catch {
      res.status(500).json({
        status: "error",
        redis: "unavailable",
        prisma: "unavilable",
        uptime: process.uptime()
      })
    }
  })

const startServer = async () => {
  
  await connectRedis()

  app.listen(env.PORT, () => {
    console.log(`Server is running on port ${env.PORT}`)
  })
}

app.use(errorHandler)

startServer()