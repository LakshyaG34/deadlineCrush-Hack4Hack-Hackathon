require('dotenv').config()
const config = require('./src/config')
const { connectDB, getDB, closeDB } = require('./src/lib/db')
const { createSubmissionWorker, closeQueue } = require('./src/lib/queue')
const { processSubmissionJob, handleJobFailed } = require('./src/worker/processor')

async function startWorker() {
  if (!config.mongodb.uri || !config.redis.url || !config.aws.bucket) {
    throw new Error('Worker requires MONGODB_URI, REDIS_URL and AWS_BUCKET.')
  }

  await connectDB()
  const db = getDB()

  const worker = createSubmissionWorker(job => processSubmissionJob(job, { db }), {
    concurrency: config.worker.concurrency,
    lockDuration: config.worker.lockDurationMs
  })

  worker.on('completed', job => console.log(`Processed ${job.id}`))
  worker.on('failed', (job, error) => handleJobFailed(job, error, { db }))

  const shutdown = async signal => {
    console.log(`Received ${signal}. Shutting down worker...`)
    await worker.close()
    await closeQueue()
    await closeDB()
    process.exit(0)
  }

  process.on('SIGINT', () => shutdown('SIGINT'))
  process.on('SIGTERM', () => shutdown('SIGTERM'))

  console.log('Submission worker online')
  return worker
}

if (require.main === module) {
  startWorker().catch(error => {
    console.error(error)
    process.exit(1)
  })
}

module.exports = { startWorker }
