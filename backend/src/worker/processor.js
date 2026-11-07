const fileType = require('file-type')
const config = require('../config')
const { getObject } = require('../lib/s3')
const { inspectZip, checkLink } = require('../services/validationService')

async function processSubmissionJob(job, { db }) {
  const { submissionId } = job.data
  const now = new Date()

  // Atomically claim the job
  const claim = await db.collection('submissions').findOneAndUpdate(
    {
      id: submissionId,
      status: { $nin: ['accepted', 'needs-fix'] },
      $or: [{ status: 'queued' }, { status: 'processing', leaseUntil: { $lt: now } }]
    },
    {
      $set: {
        status: 'processing',
        leaseUntil: new Date(Date.now() + 5 * 60 * 1000),
        updatedAt: now
      },
      $inc: { attempts: 1 }
    },
    { returnDocument: 'after' }
  )

  const record = claim?.value || claim
  if (!record) return { skipped: true }

  const problems = []

  try {
    const response = await getObject({ key: record.file.key })
    const buffer = Buffer.from(await response.Body.transformToByteArray())
    const detected = await fileType.fromBuffer(buffer)

    if (!detected || !config.worker.allowedMimeTypes.has(detected.mime)) {
      problems.push('File contents do not match a supported file type.')
    }

    if (buffer.length !== record.file.fileSize) {
      problems.push('Uploaded file size did not match the declared size.')
    }

    let archive = null
    if (detected?.mime === 'application/zip') {
      try {
        archive = await inspectZip(buffer, config.worker.maxArchiveExpandedBytes)
      } catch (error) {
        problems.push(error.message || 'Archive could not be safely inspected.')
      }
    }

    const links = await Promise.all([
      checkLink(record.githubUrl),
      checkLink(record.liveUrl),
      checkLink(record.demoUrl)
    ])

    if (!links.every(Boolean)) {
      problems.push('One or more project links could not be reached.')
    }

    const status = problems.length ? 'needs-fix' : 'accepted'

    await db.collection('submissions').updateOne(
      { id: submissionId, status: 'processing' },
      {
        $set: {
          status,
          checks: { contentType: detected?.mime || null, links, archive },
          errors: problems,
          processedAt: new Date(),
          updatedAt: new Date()
        },
        $unset: { leaseUntil: '' }
      }
    )

    return { status, errors: problems }
  } catch (error) {
    await db.collection('submissions').updateOne(
      { id: submissionId, status: 'processing' },
      {
        $set: {
          status: 'queued',
          lastError: error.message,
          updatedAt: new Date()
        },
        $unset: { leaseUntil: '' }
      }
    )
    throw error
  }
}

async function handleJobFailed(job, error, { db }) {
  console.error(`Job ${job?.id} failed: ${error.message}`)
  if (job && job.attemptsMade >= Number(job.opts?.attempts || 1)) {
    await db.collection('submissions').updateOne(
      { id: job.data.submissionId, status: { $in: ['queued', 'processing'] } },
      {
        $set: {
          status: 'needs-fix',
          errors: ['Automated checks could not finish after several retries. Please contact the organizers.'],
          updatedAt: new Date()
        },
        $unset: { leaseUntil: '' }
      }
    )
  }
}

module.exports = {
  processSubmissionJob,
  handleJobFailed
}
