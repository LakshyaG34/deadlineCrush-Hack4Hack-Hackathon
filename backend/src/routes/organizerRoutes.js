const express = require('express')
const { organizer } = require('../middlewares/auth')
const {
  getOrganizerSummary,
  getOrganizerSubmissions,
  exportOrganizerSubmissionsCsv
} = require('../controllers/organizerController')

const router = express.Router()

router.get('/summary', organizer, getOrganizerSummary)
router.get('/submissions.csv', organizer, exportOrganizerSubmissionsCsv)
router.get('/submissions', organizer, getOrganizerSubmissions)

module.exports = router
