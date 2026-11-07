const { MongoClient } = require('mongodb')
const config = require('../config')

let client = null
let db = null

// In-memory fallback stores for local development without MongoDB
const inMemoryStore = {
  submissions: [],
  pendingUploads: new Map(),
  lateAttempts: []
}

async function connectDB() {
  if (!config.mongodb.uri) {
    console.log('No MONGODB_URI configured. Running with in-memory storage.')
    return null
  }

  if (db) return db

  client = new MongoClient(config.mongodb.uri)
  await client.connect()
  db = client.db(config.mongodb.dbName)

  // Ensure necessary indexes
  const submissions = db.collection('submissions')
  await submissions.createIndex({ teamId: 1, version: 1 }, { unique: true })
  await submissions.createIndex({ uploadId: 1 }, { unique: true, sparse: true })
  await submissions.createIndex({ createdAt: -1 })

  console.log(`MongoDB connected to database: ${config.mongodb.dbName}`)
  return db
}

function getDB() {
  return db
}

function getClient() {
  return client
}

function isConnected() {
  return Boolean(db)
}

function getInMemoryStore() {
  return inMemoryStore
}

async function closeDB() {
  if (client) {
    await client.close()
    client = null
    db = null
  }
}

module.exports = {
  connectDB,
  getDB,
  getClient,
  isConnected,
  getInMemoryStore,
  closeDB
}
