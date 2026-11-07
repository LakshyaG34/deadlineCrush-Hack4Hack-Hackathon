const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

export function getAuthHeaders() {
  const teamId = localStorage.getItem('teamId') || 'demo-team'
  const token = localStorage.getItem('teamToken')
  return {
    'Content-Type': 'application/json',
    'x-team-id': teamId,
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  }
}

export async function initiateMultipartUpload({ fileName, fileSize, contentType }) {
  const headers = getAuthHeaders()
  const response = await fetch(`${API_BASE}/uploads/multipart/initiate`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ fileName, fileSize, contentType })
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.error || 'Could not start upload')
  }

  return response.json()
}

export async function listUploadedParts(uploadId, key) {
  const headers = getAuthHeaders()
  const response = await fetch(
    `${API_BASE}/uploads/multipart/${uploadId}/parts?key=${encodeURIComponent(key)}`,
    { headers }
  )

  if (!response.ok) {
    throw new Error('Could not resume this upload. Choose the file again to start a fresh upload.')
  }

  return response.json()
}

export async function getPartUploadUrl(uploadId, key, partNumber) {
  const headers = getAuthHeaders()
  const response = await fetch(
    `${API_BASE}/uploads/multipart/${uploadId}/part-url?partNumber=${partNumber}&key=${encodeURIComponent(key)}`,
    { headers }
  )

  if (!response.ok) {
    throw new Error('Could not authorize an upload part')
  }

  return response.json()
}

export async function uploadPartToS3(url, chunk, contentType) {
  const response = await fetch(url, {
    method: 'PUT',
    body: chunk,
    headers: { 'Content-Type': contentType || 'application/octet-stream' }
  })

  if (!response.ok) {
    throw new Error('A file part failed to upload. You can retry your submission.')
  }

  return response.headers.get('ETag')
}

export async function completeMultipartUpload(payload) {
  const headers = getAuthHeaders()
  const response = await fetch(`${API_BASE}/uploads/multipart/complete`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload)
  })

  const result = await response.json()
  if (!response.ok) {
    throw new Error(result.error || 'Could not submit project')
  }

  return result
}

export async function fetchMySubmissions() {
  const headers = getAuthHeaders()
  const response = await fetch(`${API_BASE}/submissions/mine`, { headers })
  if (!response.ok) {
    throw new Error('Could not fetch submissions')
  }
  return response.json()
}
