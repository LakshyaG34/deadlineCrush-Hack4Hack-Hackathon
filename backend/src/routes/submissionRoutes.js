const express = require('express')
const { participant } = require('../middlewares/auth')
const { getMySubmissions } = require('../controllers/submissionController')

const router = express.Router()

router.get('/mine', participant, getMySubmissions)

module.exports = router
