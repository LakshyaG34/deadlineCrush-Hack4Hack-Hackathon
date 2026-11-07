const express = require('express')
const { participant } = require('../middlewares/auth')
const {
  initiateMultipartUpload,
  getPartUploadUrl,
  listUploadedParts,
  completeMultipartUpload
} = require('../controllers/uploadController')

const router = express.Router()

router.post('/multipart/initiate', participant, initiateMultipartUpload)
router.get('/multipart/:uploadId/part-url', participant, getPartUploadUrl)
router.get('/multipart/:uploadId/parts', participant, listUploadedParts)
router.post('/multipart/complete', participant, completeMultipartUpload)

module.exports = router
