const crypto = require('node:crypto')
const path = require('node:path')
const config = require('../config')
const s3 = require('../lib/s3')
const { getDB, getInMemoryStore } = require('../lib/db')
const { addSubmissionJob } = require('../lib/queue')
const submissionService = require('./submissionService')

async function saveUploadIntent(intent) {
  const db = getDB()
  if (db) {
    await db.collection('upload_intents').insertOne(intent)
    return
  }
  const store = getInMemoryStore()
  store.pendingUploads.set(intent.uploadId, intent)
}

async function getUploadIntent(uploadId, teamId, key) {
  const db = getDB()
  if (db) {
    const query = { uploadId, teamId }
    if (key) query.key = key
    return db.collection('upload_intents').findOne(query)
  }
  const store = getInMemoryStore()
  const intent = store.pendingUploads.get(uploadId)
  if (intent && intent.teamId === teamId && (!key || intent.key === key)) {
    return intent
  }
  return null
}

async function deleteUploadIntent(uploadId, teamId) {
  const db = getDB()
  if (db) {
    await db.collection('upload_intents').deleteOne({ uploadId, teamId })
    return
  }
  const store = getInMemoryStore()
  store.pendingUploads.delete(uploadId)
}

async function initiateMultipartUpload({ teamId, fileName, fileSize, contentType }) {
  if (!config.aws.isConfigured) {
    const error = new Error('S3 is not configured. Set AWS_BUCKET, AWS_REGION, AWS_ACCESS_KEY and AWS_SECRET_KEY.')
    error.status = 503
    throw error
  }

  if (!fileName || !Number.isFinite(fileSize) || fileSize < 1 || fileSize > config.upload.maxFileBytes) {
    const error = new Error('Choose a file no larger than 100 MB.')
    error.status = 400
    throw error
  }

  const startedAt = Date.now()
  if (!config.deadline.isOnTime(startedAt)) {
    const attempt = {
      teamId,
      attemptedAt: new Date(startedAt),
      fileName: String(fileName).slice(0, 150)
    }
    await submissionService.recordLateAttempt(attempt)
    const error = new Error('The submission deadline has passed.')
    error.status = 403
    throw error
  }

  const safeName = path.basename(fileName).replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 150)
  const key = `submissions/${crypto.randomUUID()}/${safeName}`

  const result = await s3.createMultipartUpload({
    key,
    contentType: contentType || 'application/octet-stream',
    metadata: { 'team-id': teamId }
  })

  const intent = {
    uploadId: result.UploadId,
    teamId,
    key,
    startedAt,
    expiresAt: config.deadline.getUploadExpiry(startedAt)
  }

  await saveUploadIntent(intent)

  return {
    uploadId: result.UploadId,
    key,
    partSize: config.upload.partBytes,
    initiatedAt: startedAt,
    expiresAt: intent.expiresAt
  }
}

async function getPartUrl({ teamId, uploadId, key, partNumber }) {
  if (!config.aws.isConfigured) {
    const error = new Error('S3 is not configured.')
    error.status = 503
    throw error
  }

  const parsedPartNumber = Number(partNumber)
  if (
    typeof key !== 'string' ||
    !key.startsWith('submissions/') ||
    !Number.isInteger(parsedPartNumber) ||
    parsedPartNumber < 1 ||
    parsedPartNumber > config.upload.maxParts
  ) {
    const error = new Error('Invalid upload part.')
    error.status = 400
    throw error
  }

  const intent = await getUploadIntent(uploadId, teamId, key)
  if (!intent || intent.teamId !== teamId || intent.key !== key || Date.now() > intent.expiresAt) {
    const error = new Error('This upload permission has expired.')
    error.status = 403
    throw error
  }

  const url = await s3.getPartUploadUrl({
    key,
    uploadId,
    partNumber: parsedPartNumber,
    expiresIn: config.upload.signedUrlExpiresIn
  })

  return { url }
}

async function listUploadedParts({ teamId, uploadId, key }) {
  if (!config.aws.isConfigured) {
    const error = new Error('S3 is not configured.')
    error.status = 503
    throw error
  }

  const completed = await submissionService.findSubmissionByUploadId(uploadId, teamId)
  if (completed) {
    return {
      completed: true,
      submission: {
        id: completed.id,
        version: `v${completed.version}`,
        status: completed.status
      }
    }
  }

  const intent = await getUploadIntent(uploadId, teamId, key)
  if (!intent || intent.teamId !== teamId || intent.key !== key || Date.now() > intent.expiresAt) {
    const error = new Error('This upload permission has expired.')
    error.status = 403
    throw error
  }

  const result = await s3.listMultipartParts({ key, uploadId })

  return {
    completed: false,
    parts: (result.Parts || []).map(part => ({
      PartNumber: part.PartNumber,
      ETag: part.ETag,
      Size: part.Size
    }))
  }
}

async function completeMultipartSubmission({
  teamId,
  uploadId,
  key,
  parts,
  fileSize,
  fileName,
  contentType,
  projectName,
  description,
  githubUrl,
  liveUrl,
  demoUrl
}) {
  if (!config.aws.isConfigured) {
    const error = new Error('S3 is not configured.')
    error.status = 503
    throw error
  }

  if (
    typeof key !== 'string' ||
    !key.startsWith('submissions/') ||
    !Array.isArray(parts) ||
    parts.length < 1 ||
    parts.length > config.upload.maxParts ||
    !uploadId
  ) {
    const error = new Error('Upload details are incomplete.')
    error.status = 400
    throw error
  }

  if (!Number.isFinite(fileSize) || fileSize < 1 || fileSize > config.upload.maxFileBytes) {
    const error = new Error('The file must be no larger than 100 MB.')
    error.status = 400
    throw error
  }

  const intent = await getUploadIntent(uploadId, teamId, key)
  if (!intent || intent.teamId !== teamId || intent.key !== key) {
    const error = new Error('Upload session not found for this team.')
    error.status = 403
    throw error
  }

  const alreadyCompleted = await submissionService.findSubmissionByUploadId(uploadId, teamId)
  if (alreadyCompleted) {
    await addSubmissionJob(alreadyCompleted)
    return {
      status: 200,
      data: {
        id: alreadyCompleted.id,
        version: `v${alreadyCompleted.version}`,
        status: alreadyCompleted.status,
        createdAt: alreadyCompleted.createdAt
      }
    }
  }

  if (!projectName?.trim() || !description?.trim() || !githubUrl?.trim()) {
    const error = new Error('Project name, description, and GitHub URL are required.')
    error.status = 400
    throw error
  }

  const now = Date.now()
  if (
    now > intent.expiresAt ||
    (config.deadline.deadlineDate && intent.startedAt > config.deadline.deadlineDate.getTime())
  ) {
    await s3.abortMultipartUpload({ key, uploadId }).catch(() => {})
    const error = new Error('The upload grace period has ended. This attempt was not accepted.')
    error.status = 403
    throw error
  }

  const completed = await s3.completeMultipartUpload({ key, uploadId, parts })
  const version = await submissionService.getNextVersion(teamId)
  const id = crypto.randomUUID()

  const submission = {
    id,
    uploadId,
    teamId,
    version,
    projectName: projectName.trim(),
    description: description.trim(),
    githubUrl,
    liveUrl: liveUrl || '',
    demoUrl: demoUrl || '',
    file: {
      key,
      fileName,
      fileSize,
      contentType,
      etag: completed.ETag
    },
    status: 'queued',
    createdAt: new Date(now),
    onTime: config.deadline.isOnTime(intent.startedAt),
    idempotencyKey: `${teamId}:${version}`
  }

  await submissionService.createSubmission(submission)
  await deleteUploadIntent(uploadId, teamId)
  await addSubmissionJob(submission)

  return {
    status: 201,
    data: {
      id,
      version: `v${version}`,
      status: submission.status,
      createdAt: submission.createdAt
    }
  }
}

module.exports = {
  saveUploadIntent,
  getUploadIntent,
  deleteUploadIntent,
  initiateMultipartUpload,
  getPartUrl,
  listUploadedParts,
  completeMultipartSubmission
}
