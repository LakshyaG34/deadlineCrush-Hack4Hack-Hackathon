const jwt = require('jsonwebtoken')
const config = require('../config')

function getTeamIdFromHeader(req) {
  const teamId = req.header('x-team-id')
  if (!teamId || teamId.length > 100) return null
  return teamId
}

function participant(req, res, next) {
  const auth = req.header('authorization') || ''

  if (auth.startsWith('Bearer ')) {
    try {
      if (!config.auth.jwtSecret) {
        return res.status(401).json({ error: 'Your session has expired. Please sign in again.' })
      }
      const claims = jwt.verify(auth.slice(7), config.auth.jwtSecret)
      const teamId = claims.teamId || claims.team_id || claims.sub
      if (teamId) {
        req.teamId = String(teamId)
        return next()
      }
    } catch {
      return res.status(401).json({ error: 'Your session has expired. Please sign in again.' })
    }
  }

  if (config.isProduction) {
    return res.status(401).json({ error: 'Sign in as a team member to continue.' })
  }

  const teamId = getTeamIdFromHeader(req)
  if (!teamId) {
    return res.status(401).json({ error: 'Sign in as a team member to continue.' })
  }

  req.teamId = teamId
  next()
}

function organizer(req, res, next) {
  const secret = config.auth.organizerApiKey
  if (!secret || req.header('x-organizer-key') !== secret) {
    return res.status(403).json({ error: 'Organizer access required.' })
  }
  next()
}

module.exports = {
  participant,
  organizer,
  getTeamIdFromHeader
}
