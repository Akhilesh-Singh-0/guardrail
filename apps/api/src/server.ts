import express from "express"
import { env } from "./config/env"
import { connectRedis } from "./config/redis"
import { requestId } from './middleware/requestId'

const app = express()

app.use(requestId)
app.use(express.json())

app.get("/health", async (req, res) => {
  try {
    res.json({ status: "ok" })
  } catch {
    res.status(500).json({ status: "error" })
  }
})

const startServer = async () => {
  
  await connectRedis()

  app.listen(env.PORT, () => {
    console.log(`Server is running on port ${env.PORT}`)
  })
}

startServer()