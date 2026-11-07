const {
  S3Client,
  CreateMultipartUploadCommand,
  UploadPartCommand,
  ListPartsCommand,
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand,
  GetObjectCommand
} = require('@aws-sdk/client-s3')
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner')
const config = require('../config')

let s3Client = null

function getS3Client() {
  if (!s3Client && config.aws.isConfigured) {
    s3Client = new S3Client({
      region: config.aws.region,
      credentials: {
        accessKeyId: config.aws.accessKeyId,
        secretAccessKey: config.aws.secretAccessKey
      }
    })
  }
  return s3Client
}

async function createMultipartUpload({ key, contentType, metadata }) {
  const client = getS3Client()
  if (!client) throw new Error('S3 is not configured')
  const command = new CreateMultipartUploadCommand({
    Bucket: config.aws.bucket,
    Key: key,
    ContentType: contentType || 'application/octet-stream',
    ServerSideEncryption: 'AES256',
    Metadata: metadata || {}
  })
  return client.send(command)
}

async function getPartUploadUrl({ key, uploadId, partNumber, expiresIn = 600 }) {
  const client = getS3Client()
  if (!client) throw new Error('S3 is not configured')
  const command = new UploadPartCommand({
    Bucket: config.aws.bucket,
    Key: key,
    UploadId: uploadId,
    PartNumber: partNumber
  })
  return getSignedUrl(client, command, { expiresIn })
}

async function listMultipartParts({ key, uploadId }) {
  const client = getS3Client()
  if (!client) throw new Error('S3 is not configured')
  const command = new ListPartsCommand({
    Bucket: config.aws.bucket,
    Key: key,
    UploadId: uploadId
  })
  return client.send(command)
}

async function completeMultipartUpload({ key, uploadId, parts }) {
  const client = getS3Client()
  if (!client) throw new Error('S3 is not configured')
  const command = new CompleteMultipartUploadCommand({
    Bucket: config.aws.bucket,
    Key: key,
    UploadId: uploadId,
    MultipartUpload: {
      Parts: parts
        .map(p => ({ PartNumber: Number(p.PartNumber), ETag: p.ETag }))
        .sort((a, b) => a.PartNumber - b.PartNumber)
    }
  })
  return client.send(command)
}

async function abortMultipartUpload({ key, uploadId }) {
  const client = getS3Client()
  if (!client) return
  const command = new AbortMultipartUploadCommand({
    Bucket: config.aws.bucket,
    Key: key,
    UploadId: uploadId
  })
  return client.send(command)
}

async function getObject({ key }) {
  const client = getS3Client()
  if (!client) throw new Error('S3 is not configured')
  const command = new GetObjectCommand({
    Bucket: config.aws.bucket,
    Key: key
  })
  return client.send(command)
}

module.exports = {
  getS3Client,
  createMultipartUpload,
  getPartUploadUrl,
  listMultipartParts,
  completeMultipartUpload,
  abortMultipartUpload,
  getObject
}
