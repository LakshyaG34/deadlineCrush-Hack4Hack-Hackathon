const { Queue, Worker } = require('bullmq')
const IORedis = require('ioredis')
const config = require('../config')

const QUEUE_NAME = 'submission-processing'
let queue = null
let redisConnection = null

function getRedisConnection() {
  if (!config.redis.url) return null
  if (!redisConnection) {
    redisConnection = new IORedis(config.redis.url, { maxRetriesPerRequest: null })
  }
  return redisConnection
}

function initQueue() {
  const connection = getRedisConnection()
  if (connection && !queue) {
    queue = new Queue(QUEUE_NAME, { connection })
  }
  return queue
}

function getQueue() {
  return queue || initQueue()
}

async function addSubmissionJob(submission) {
  const activeQueue = getQueue()
  if (!activeQueue) {
    // No Redis locally: mark as queued, ready for a worker once REDIS_URL is set.
    return null
  }
  return activeQueue.add(
    'process-submission',
    { submissionId: submission.id },
    {
      jobId: submission.id,
      attempts: 5,
      backoff: { type: 'exponential', delay: 3000 },
      removeOnComplete: 1000,
      removeOnFail: 2000
    }
  )
}

function createSubmissionWorker(processor, options = {}) {
  const connection = getRedisConnection()
  if (!connection) {
    throw new Error('Redis connection is required to create a worker')
  }

  return new Worker(QUEUE_NAME, processor, {
    connection,
    concurrency: options.concurrency || config.worker.concurrency,
    lockDuration: options.lockDuration || config.worker.lockDurationMs
  })
}

async function closeQueue() {
  if (queue) {
    await queue.close()
    queue = null
  }
  if (redisConnection) {
    await redisConnection.quit()
    redisConnection = null
  }
}

module.exports = {
  QUEUE_NAME,
  initQueue,
  getQueue,
  getRedisConnection,
  addSubmissionJob,
  createSubmissionWorker,
  closeQueue
}
