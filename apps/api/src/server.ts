import app from './app'
import { env } from './config/env'
import { connectRedis } from './config/redis'

const startServer = async () => {
  await connectRedis()
  
  app.listen(env.PORT, () => {
    console.log(`Server running on port ${env.PORT}`)
  })
}

startServer()