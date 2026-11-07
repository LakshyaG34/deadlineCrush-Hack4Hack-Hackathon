const yauzl = require('yauzl')
const dns = require('node:dns/promises')
const { isIP } = require('node:net')
const config = require('../config')

const timeout = ms => new Promise((_, reject) => setTimeout(() => reject(new Error('Link check timed out')), ms))

function isPublicAddress(address) {
  if (isIP(address) === 4) {
    const octets = address.split('.').map(Number)
    const [a, b] = octets
    return !(
      a === 0 ||
      a === 10 ||
      a === 127 ||
      a >= 224 ||
      (a === 100 && b >= 64 && b <= 127) ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      (a === 198 && (b === 18 || b === 19))
    )
  }
  const ip = address.toLowerCase()
  return !(
    ip === '::' ||
    ip === '::1' ||
    ip.startsWith('fc') ||
    ip.startsWith('fd') ||
    ip.startsWith('fe8') ||
    ip.startsWith('fe9') ||
    ip.startsWith('fea') ||
    ip.startsWith('feb') ||
    ip.startsWith('::ffff:127.') ||
    ip.startsWith('::ffff:10.') ||
    ip.startsWith('::ffff:192.168.')
  )
}

async function inspectZip(buffer, maxExpandedBytes = config.worker.maxArchiveExpandedBytes) {
  const archive = await new Promise((resolve, reject) => {
    yauzl.fromBuffer(buffer, { lazyEntries: true, decodeStrings: true }, (err, zip) => {
      if (err) reject(err)
      else resolve(zip)
    })
  })

  return new Promise((resolve, reject) => {
    let expanded = 0
    let entries = 0

    archive.on('error', reject)
    archive.on('entry', entry => {
      entries++
      const name = entry.fileName.replaceAll('\\', '/')
      if (name.startsWith('/') || name.split('/').includes('..')) {
        archive.close()
        reject(new Error('Archive contains an unsafe path'))
        return
      }

      expanded += Number(entry.uncompressedSize || 0)
      const ratio = Number(entry.compressedSize)
        ? Number(entry.uncompressedSize) / Number(entry.compressedSize)
        : Number(entry.uncompressedSize)
        ? Infinity
        : 1

      if (expanded > maxExpandedBytes || ratio > 200 || entries > 10000) {
        archive.close()
        reject(new Error('Archive exceeds safe extraction limits'))
        return
      }

      archive.readEntry()
    })

    archive.on('end', () => resolve({ entries, expanded }))
    archive.readEntry()
  })
}

async function checkLink(url) {
  if (!url) return true
  let parsed
  try {
    parsed = new URL(url)
  } catch {
    return false
  }

  if (!['http:', 'https:'].includes(parsed.protocol) || parsed.username || parsed.password) {
    return false
  }

  try {
    let current = parsed
    for (let hop = 0; hop < 5; hop++) {
      const hostname = current.hostname.replace(/^\[|\]$/g, '').toLowerCase()
      if (hostname === 'localhost' || hostname.endsWith('.localhost') || hostname.endsWith('.local')) {
        return false
      }

      const addresses = isIP(hostname) ? [{ address: hostname }] : await dns.lookup(hostname, { all: true, verbatim: true })
      if (!addresses.length || addresses.some(({ address }) => !isPublicAddress(address))) {
        return false
      }

      const response = await Promise.race([
        fetch(current, { method: 'HEAD', redirect: 'manual', signal: AbortSignal.timeout(7000) }),
        timeout(8000)
      ])

      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get('location')
        if (!location) return false
        current = new URL(location, current)
        if (hop === 4) return false
        continue
      }

      return response.status >= 200 && response.status < 400
    }
    return false
  } catch {
    return false
  }
}

module.exports = {
  isPublicAddress,
  inspectZip,
  checkLink
}
