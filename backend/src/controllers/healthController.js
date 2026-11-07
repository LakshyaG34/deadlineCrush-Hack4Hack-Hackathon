const { isConnected } = require('../lib/db')
const { getQueue } = require('../lib/queue')
const { getS3Client } = require('../lib/s3')

function getHealth(_req, res) {
  res.json({
    status: 'ok',
    storage: Boolean(getS3Client()),
    database: isConnected(),
    queue: Boolean(getQueue())
  })
}

module.exports = {
  getHealth
}
