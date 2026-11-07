const uploadService = require('../services/uploadService')

async function initiateMultipartUpload(req, res) {
  try {
    const { fileName, fileSize, contentType } = req.body || {}
    const result = await uploadService.initiateMultipartUpload({
      teamId: req.teamId,
      fileName,
      fileSize,
      contentType
    })
    res.status(201).json(result)
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ error: error.message })
    }
    console.error('multipart initiate failed', error)
    res.status(500).json({ error: 'Could not start secure upload.' })
  }
}

async function getPartUploadUrl(req, res) {
  try {
    const { key, partNumber } = req.query
    const result = await uploadService.getPartUrl({
      teamId: req.teamId,
      uploadId: req.params.uploadId,
      key,
      partNumber
    })
    res.json(result)
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ error: error.message })
    }
    console.error('part url failed', error)
    res.status(500).json({ error: 'Could not authorize this upload part.' })
  }
}

async function listUploadedParts(req, res) {
  try {
    const { key } = req.query
    const result = await uploadService.listUploadedParts({
      teamId: req.teamId,
      uploadId: req.params.uploadId,
      key
    })
    res.json(result)
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ error: error.message })
    }
    console.error('list parts failed', error)
    res.status(500).json({ error: 'Could not resume this upload.' })
  }
}

async function completeMultipartUpload(req, res) {
  try {
    const {
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
    } = req.body || {}

    const result = await uploadService.completeMultipartSubmission({
      teamId: req.teamId,
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
    })

    res.status(result.status).json(result.data)
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ error: error.message })
    }
    console.error('multipart complete failed', error)
    res.status(500).json({ error: 'Could not finalize your submission.' })
  }
}

module.exports = {
  initiateMultipartUpload,
  getPartUploadUrl,
  listUploadedParts,
  completeMultipartUpload
}
