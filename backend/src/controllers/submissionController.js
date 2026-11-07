const submissionService = require('../services/submissionService')

async function getMySubmissions(req, res) {
  try {
    const records = await submissionService.getTeamSubmissions(req.teamId)
    res.json(records)
  } catch (error) {
    console.error('get team submissions failed', error)
    res.status(500).json({ error: 'Could not fetch your submissions.' })
  }
}

module.exports = {
  getMySubmissions
}
