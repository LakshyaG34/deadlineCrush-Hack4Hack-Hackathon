import { useState } from 'react'
import {
  initiateMultipartUpload,
  listUploadedParts,
  getPartUploadUrl,
  uploadPartToS3,
  completeMultipartUpload
} from '../services/api'

export function useMultipartUpload() {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [notice, setNotice] = useState('')

  async function uploadSubmission({ file, form, onSuccess }) {
    if (!file) {
      setNotice('Choose a project file before submitting.')
      return false
    }

    if (file.size > 100 * 1024 * 1024) {
      setNotice('Your file must be 100 MB or smaller.')
      return false
    }

    setUploading(true)
    setProgress(0)
    setNotice('')

    const teamId = localStorage.getItem('teamId') || 'demo-team'
    const sessionKey = `deadline-crush:${teamId}:${file.name}:${file.size}:${file.lastModified}`

    try {
      let upload = null
      try {
        upload = JSON.parse(localStorage.getItem(sessionKey) || 'null')
      } catch {
        upload = null
      }

      if (!upload || upload.expiresAt <= Date.now()) {
        upload = await initiateMultipartUpload({
          fileName: file.name,
          fileSize: file.size,
          contentType: file.type || 'application/octet-stream'
        })
        upload.fileName = file.name
        upload.fileSize = file.size
        upload.fileLastModified = file.lastModified
        localStorage.setItem(sessionKey, JSON.stringify(upload))
      }

      const partSize = upload.partSize
      const partResult = await listUploadedParts(upload.uploadId, upload.key)

      if (partResult.completed) {
        localStorage.removeItem(sessionKey)
        setNotice(`Submission ${partResult.submission.version} was already received.`)
        if (onSuccess) onSuccess(partResult.submission, true)
        return true
      }

      const uploadedParts = new Map(partResult.parts.map(part => [part.PartNumber, part]))

      for (let startByte = 0, partNumber = 1; startByte < file.size; startByte += partSize, partNumber++) {
        const chunk = file.slice(startByte, Math.min(startByte + partSize, file.size))
        const saved = uploadedParts.get(partNumber)

        if (!saved || saved.Size !== chunk.size) {
          const { url } = await getPartUploadUrl(upload.uploadId, upload.key, partNumber)
          const etag = await uploadPartToS3(url, chunk, file.type)
          uploadedParts.set(partNumber, {
            PartNumber: partNumber,
            ETag: etag,
            Size: chunk.size
          })
        }

        setProgress(Math.round(Math.min(startByte + partSize, file.size) / file.size * 100))
      }

      const parts = [...uploadedParts.values()]
        .sort((a, b) => a.PartNumber - b.PartNumber)
        .map(({ PartNumber, ETag }) => ({ PartNumber, ETag }))

      const result = await completeMultipartUpload({
        ...form,
        uploadId: upload.uploadId,
        key: upload.key,
        fileName: file.name,
        fileSize: file.size,
        contentType: file.type,
        parts
      })

      localStorage.removeItem(sessionKey)
      setNotice(`Submission ${result.version || ''} received. Your file is queued for review.`)

      if (onSuccess) {
        onSuccess(result, false)
      }
      return true
    } catch (error) {
      setNotice(error.message || 'Something went wrong.')
      return false
    } finally {
      setUploading(false)
    }
  }

  return {
    uploading,
    progress,
    notice,
    setNotice,
    uploadSubmission
  }
}
