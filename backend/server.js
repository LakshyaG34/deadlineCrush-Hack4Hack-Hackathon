require('dotenv').config()
const app = require('./src/app')
const config = require('./src/config')
const { connectDB, closeDB } = require('./src/lib/db')
const { initQueue, closeQueue } = require('./src/lib/queue')

async function startServer() {
  try {
    // Connect to database if configured (falls back to in-memory)
    await connectDB()

    // Initialize queue if Redis is configured
    initQueue()

    const server = app.listen(config.port, () => {
      console.log(`Deadline Crush API listening on ${config.port}`)
    })

    // Graceful shutdown
    const shutdown = async signal => {
      console.log(`Received ${signal}. Shutting down gracefully...`)
      server.close(async () => {
        await closeQueue()
        await closeDB()
        console.log('HTTP server and resources closed.')
        process.exit(0)
      })
    }

    process.on('SIGINT', () => shutdown('SIGINT'))
    process.on('SIGTERM', () => shutdown('SIGTERM'))

    return server
  } catch (error) {
    console.error('API startup failed', error)
    process.exit(1)
  }
}

if (require.main === module) {
  startServer()
}

module.exports = { startServer }
