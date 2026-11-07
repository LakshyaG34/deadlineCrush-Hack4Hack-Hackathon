require('dotenv').config()

const config = {
  port: Number(process.env.PORT || 4000),
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  
  frontendOrigins: (process.env.FRONTEND_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map(x => x.trim()),

  upload: {
    maxFileBytes: 100 * 1024 * 1024, // 100 MB
    partBytes: 8 * 1024 * 1024,      // 8 MB per part
    maxParts: 13,
    signedUrlExpiresIn: 600,         // 10 minutes
  },

  deadline: {
    deadlineDate: process.env.SUBMISSION_DEADLINE ? new Date(process.env.SUBMISSION_DEADLINE) : null,
    graceMinutes: Number(process.env.SUBMISSION_GRACE_MINUTES || 5),
    get graceMs() {
      return this.graceMinutes * 60 * 1000
    },
    isOnTime(timestamp = Date.now()) {
      return !this.deadlineDate || timestamp <= this.deadlineDate.getTime()
    },
    getUploadExpiry(startedAt = Date.now()) {
      if (this.deadlineDate) {
        return this.deadlineDate.getTime() + this.graceMs
      }
      return startedAt + 24 * 60 * 60 * 1000
    }
  },

  mongodb: {
    uri: process.env.MONGODB_URI,
    dbName: process.env.MONGODB_DB || 'deadline_crush'
  },

  redis: {
    url: process.env.REDIS_URL
  },

  aws: {
    bucket: process.env.AWS_BUCKET,
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
    get isConfigured() {
      return Boolean(this.bucket && this.region && this.accessKeyId && this.secretAccessKey)
    }
  },

  auth: {
    jwtSecret: process.env.JWT_SECRET,
    organizerApiKey: process.env.ORGANIZER_API_KEY
  },

  worker: {
    concurrency: Number(process.env.WORKER_CONCURRENCY || 8),
    lockDurationMs: 10 * 60 * 1000,
    maxArchiveExpandedBytes: Number(process.env.MAX_ARCHIVE_EXPANDED_BYTES || 500 * 1024 * 1024),
    allowedMimeTypes: new Set([
      'application/pdf',
      'application/zip',
      'image/png',
      'image/jpeg',
      'video/mp4',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ])
  }
}

module.exports = config
