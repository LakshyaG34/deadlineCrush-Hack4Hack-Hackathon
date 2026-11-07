const { getDB, getInMemoryStore } = require('../lib/db')

async function createSubmission(doc) {
  const db = getDB()
  if (db) {
    await db.collection('submissions').insertOne(doc)
    return doc
  }
  const store = getInMemoryStore()
  store.submissions.push(doc)
  return doc
}

async function updateSubmission(id, updates) {
  const db = getDB()
  if (db) {
    return db.collection('submissions').updateOne({ _id: id }, { $set: updates })
  }
  const store = getInMemoryStore()
  store.submissions = store.submissions.map(item => (item.id === id ? { ...item, ...updates } : item))
}

async function findSubmissionByUploadId(uploadId, teamId) {
  const db = getDB()
  if (db) {
    return db.collection('submissions').findOne({ uploadId, teamId })
  }
  const store = getInMemoryStore()
  return store.submissions.find(s => s.uploadId === uploadId && s.teamId === teamId)
}

async function getNextVersion(teamId) {
  const db = getDB()
  if (db) {
    const counter = await db.collection('team_submission_counters').findOneAndUpdate(
      { _id: teamId },
      { $inc: { version: 1 } },
      { upsert: true, returnDocument: 'after' }
    )
    return counter?.version || counter?.value?.version
  }
  const store = getInMemoryStore()
  return store.submissions.filter(s => s.teamId === teamId).reduce((max, item) => Math.max(max, item.version), 0) + 1
}

async function recordLateAttempt(attempt) {
  const db = getDB()
  if (db) {
    await db.collection('late_attempts').insertOne(attempt)
    return
  }
  const store = getInMemoryStore()
  store.lateAttempts.push(attempt)
}

async function getTeamSubmissions(teamId) {
  const db = getDB()
  if (db) {
    return db.collection('submissions').find({ teamId }).sort({ version: -1 }).toArray()
  }
  const store = getInMemoryStore()
  return store.submissions.filter(s => s.teamId === teamId).sort((a, b) => b.version - a.version)
}

async function getOrganizerSummary() {
  const db = getDB()
  if (!db) {
    const store = getInMemoryStore()
    const { submissions, lateAttempts } = store
    return {
      total: submissions.length,
      checking: submissions.filter(s => ['queued', 'processing'].includes(s.status)).length,
      accepted: submissions.filter(s => s.status === 'accepted').length,
      failed: submissions.filter(s => s.status === 'needs-fix').length,
      lateAttempts: lateAttempts.length
    }
  }

  const result = await db.collection('submissions').aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]).toArray()
  const counts = Object.fromEntries(result.map(x => [x._id, x.count]))
  const lateCount = await db.collection('late_attempts').countDocuments()

  return {
    total: result.reduce((n, x) => n + x.count, 0),
    checking: (counts.queued || 0) + (counts.processing || 0),
    accepted: counts.accepted || 0,
    failed: counts['needs-fix'] || 0,
    lateAttempts: lateCount
  }
}

async function getAllSubmissions(limit = null) {
  const db = getDB()
  if (db) {
    let cursor = db.collection('submissions').find({}).sort({ createdAt: -1 })
    if (limit) cursor = cursor.limit(limit)
    return cursor.toArray()
  }

  const store = getInMemoryStore()
  const rows = [...store.submissions].sort((a, b) => b.createdAt - a.createdAt)
  return limit ? rows.slice(0, limit) : rows
}

function generateSubmissionsCsv(rows) {
  const quote = v => `"${String(v ?? '').replaceAll('"', '""')}"`
  const header = ['Team ID', 'Project', 'Status', 'Version', 'Submitted', 'GitHub URL']
  const dataRows = rows.map(r => [
    r.teamId,
    r.projectName,
    r.status,
    `v${r.version}`,
    r.createdAt?.toISOString?.() || r.createdAt,
    r.githubUrl
  ])

  return [header, ...dataRows]
    .map(row => row.map(quote).join(','))
    .join('\r\n')
}

module.exports = {
  createSubmission,
  updateSubmission,
  findSubmissionByUploadId,
  getNextVersion,
  recordLateAttempt,
  getTeamSubmissions,
  getOrganizerSummary,
  getAllSubmissions,
  generateSubmissionsCsv
}
