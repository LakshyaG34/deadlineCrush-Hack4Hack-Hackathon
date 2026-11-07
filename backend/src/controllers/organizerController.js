const submissionService = require('../services/submissionService')

async function getOrganizerSummary(_req, res) {
  try {
    const summary = await submissionService.getOrganizerSummary()
    res.json(summary)
  } catch (error) {
    console.error('get organizer summary failed', error)
    res.status(500).json({ error: 'Could not fetch organizer summary.' })
  }
}

async function getOrganizerSubmissions(_req, res) {
  try {
    const rows = await submissionService.getAllSubmissions(200)
    res.json(rows)
  } catch (error) {
    console.error('get organizer submissions failed', error)
    res.status(500).json({ error: 'Could not fetch submissions list.' })
  }
}

async function exportOrganizerSubmissionsCsv(_req, res) {
  try {
    const rows = await submissionService.getAllSubmissions()
    const csv = submissionService.generateSubmissionsCsv(rows)
    res.setHeader('Content-Type', 'text/csv; charset=utf-8')
    res.setHeader('Content-Disposition', 'attachment; filename="submissions.csv"')
    res.send(csv)
  } catch (error) {
    console.error('export submissions csv failed', error)
    res.status(500).json({ error: 'Could not generate submissions export.' })
  }
}

module.exports = {
  getOrganizerSummary,
  getOrganizerSubmissions,
  exportOrganizerSubmissionsCsv
}
