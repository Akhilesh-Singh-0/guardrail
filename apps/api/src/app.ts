import express from 'express'
import { requestId } from './middleware/requestId'
import { errorHandler } from './middleware/errorHandler'
import authRouter from './modules/auth/auth.routes'
import { prisma } from './config/prisma'
import { redis } from './config/redis'

const app = express()

app.use(requestId)
app.use('/auth', authRouter)
app.use(express.json())

app.get("/health", async (req, res) => {
    try {
      await redis.ping()
      await prisma.$queryRaw`SELECT 1`
      res.json({
        status: "ok",
        redis: "ok",
        db: "ok",
        uptime: process.uptime()
      })
    } catch {
      res.status(500).json({
        status: "error",
        redis: "unavailable",
        db: "unavailable",
        uptime: process.uptime()
      })
    }
})

app.use(errorHandler)

export default app