const express = require('express')
const healthRoutes = require('./healthRoutes')
const uploadRoutes = require('./uploadRoutes')
const submissionRoutes = require('./submissionRoutes')
const organizerRoutes = require('./organizerRoutes')

const router = express.Router()

router.use('/', healthRoutes)
router.use('/uploads', uploadRoutes)
router.use('/submissions', submissionRoutes)
router.use('/organizer', organizerRoutes)

module.exports = router
