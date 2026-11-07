const assert = require('node:assert')
const http = require('node:http')
const app = require('../src/app')
const config = require('../src/config')
const submissionService = require('../src/services/submissionService')
const uploadService = require('../src/services/uploadService')
const { isPublicAddress } = require('../src/services/validationService')

async function runTests() {
  console.log('--- Starting Modular Codebase Tests ---')

  // 1. Config Test
  assert.strictEqual(typeof config.port, 'number')
  assert(Array.isArray(config.frontendOrigins))
  assert.strictEqual(config.upload.maxFileBytes, 100 * 1024 * 1024)
  assert.strictEqual(config.upload.partBytes, 8 * 1024 * 1024)
  console.log('✓ Config module verified')

  // 2. Validation Service Test (SSRF address check)
  assert.strictEqual(isPublicAddress('127.0.0.1'), false)
  assert.strictEqual(isPublicAddress('10.0.0.1'), false)
  assert.strictEqual(isPublicAddress('192.168.1.1'), false)
  assert.strictEqual(isPublicAddress('172.16.0.1'), false)
  assert.strictEqual(isPublicAddress('8.8.8.8'), true)
  assert.strictEqual(isPublicAddress('1.1.1.1'), true)
  assert.strictEqual(isPublicAddress('::1'), false)
  console.log('✓ Validation service verified')

  // 3. Submission Service in-memory Test
  const testSub = {
    id: 'test-uuid-1',
    uploadId: 'upload-test-1',
    teamId: 'team-modular',
    version: 1,
    projectName: 'Modular Test Project',
    description: 'A test project for modular file structure',
    githubUrl: 'https://github.com/example/test',
    status: 'queued',
    createdAt: new Date()
  }

  await submissionService.createSubmission(testSub)
  const found = await submissionService.findSubmissionByUploadId('upload-test-1', 'team-modular')
  assert.strictEqual(found?.id, 'test-uuid-1')

  const teamSubs = await submissionService.getTeamSubmissions('team-modular')
  assert.strictEqual(teamSubs.length, 1)

  const nextVer = await submissionService.getNextVersion('team-modular')
  assert.strictEqual(nextVer, 2)

  const summary = await submissionService.getOrganizerSummary()
  assert(summary.total >= 1)
  assert(summary.checking >= 1)

  const csv = submissionService.generateSubmissionsCsv([testSub])
  assert(csv.includes('"team-modular"'))
  assert(csv.includes('"Modular Test Project"'))
  console.log('✓ Submission service verified')

  // 4. HTTP API Endpoints Test
  const server = http.createServer(app)
  await new Promise(resolve => server.listen(0, resolve))
  const port = server.address().port

  try {
    // Health endpoint
    const healthRes = await fetch(`http://localhost:${port}/api/health`)
    assert.strictEqual(healthRes.status, 200)
    const healthJson = await healthRes.json()
    assert.strictEqual(healthJson.status, 'ok')
    assert.strictEqual(typeof healthJson.database, 'boolean')

    // Participant unauthorized without team id in header
    const noTeamRes = await fetch(`http://localhost:${port}/api/submissions/mine`)
    assert.strictEqual(noTeamRes.status, 401)

    // Participant authorized with team id in header
    const teamRes = await fetch(`http://localhost:${port}/api/submissions/mine`, {
      headers: { 'x-team-id': 'team-modular' }
    })
    assert.strictEqual(teamRes.status, 200)
    const teamJson = await teamRes.json()
    assert(Array.isArray(teamJson))
    assert.strictEqual(teamJson[0].id, 'test-uuid-1')

    // Organizer unauthorized without key
    const orgRes = await fetch(`http://localhost:${port}/api/organizer/summary`)
    assert.strictEqual(orgRes.status, 403)

    // 404 handler
    const notFoundRes = await fetch(`http://localhost:${port}/api/unknown-route`)
    assert.strictEqual(notFoundRes.status, 404)

    console.log('✓ HTTP API routes & middlewares verified')
  } finally {
    server.close()
  }

  console.log('--- All Modular Codebase Tests Passed Successfully! ---')
}

runTests().catch(err => {
  console.error('Test suite failed:', err)
  process.exit(1)
})
