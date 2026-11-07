const express = require('express')
const cors = require('cors')
const config = require('./config')
const routes = require('./routes')

const app = express()

// CORS configuration
app.use(
  cors({
    origin: config.frontendOrigins,
    exposedHeaders: ['ETag'],
    allowedHeaders: ['Content-Type', 'x-team-id', 'x-organizer-key', 'Authorization']
  })
)

// Body parser
app.use(express.json({ limit: '1mb' }))

// Mount API routes
app.use('/api', routes)

// 404 handler for unmatched routes
app.use((_req, res) => {
  res.status(404).json({ error: 'Endpoint not found' })
})

// Global error handler
app.use((err, _req, res, _next) => {
  console.error('Unhandled server error:', err)
  res.status(500).json({ error: 'An unexpected server error occurred.' })
})

module.exports = app
