const http = require('http')
const fs = require('fs')
const path = require('path')

const DB_FILE = path.join(__dirname, 'db.json')
const DIST = path.join(__dirname, '../dist')
const UPLOADS_DIR = path.join(__dirname, 'uploads')

if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR)

function readDB() {
  try { return JSON.parse(fs.readFileSync(DB_FILE, 'utf8')) }
  catch { return { results: [], participants: {}, agents: [], config: null, branding: null, admin: { name: 'admin', pass: 'admin1234' } } }
}

function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2))
}

function parseMultipart(buffer, boundary) {
  const parts = {}
  const boundaryBuffer = Buffer.from('--' + boundary)
  let start = 0
  while (start < buffer.length) {
    const boundaryIdx = buffer.indexOf(boundaryBuffer, start)
    if (boundaryIdx === -1) break
    const headerStart = boundaryIdx + boundaryBuffer.length + 2
    const headerEnd = buffer.indexOf(Buffer.from('\r\n\r\n'), headerStart)
    if (headerEnd === -1) break
    const header = buffer.slice(headerStart, headerEnd).toString()
    const dataStart = headerEnd + 4
    const nextBoundary = buffer.indexOf(boundaryBuffer, dataStart)
    const dataEnd = nextBoundary === -1 ? buffer.length : nextBoundary - 2
    const nameMatch = header.match(/name="([^"]+)"/)
    const filenameMatch = header.match(/filename="([^"]+)"/)
    if (nameMatch) {
      parts[nameMatch[1]] = { data: buffer.slice(dataStart, dataEnd), filename: filenameMatch ? filenameMatch[1] : null, header }
    }
    start = nextBoundary === -1 ? buffer.length : nextBoundary
  }
  return parts
}

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') { res.writeHead(200); res.end(); return }

  const url = req.url

  if (url.startsWith('/api/')) {
    res.setHeader('Content-Type', 'application/json')

    if (req.method === 'GET' && url === '/api/db') {
      const db = readDB()
      // لا نرسل كلمة مرور المدير للفرونت إند
      const safe = { ...db, admin: { name: db.admin?.name || 'admin' } }
      res.end(JSON.stringify(safe)); return
    }

    if (req.method === 'GET' && url.startsWith('/api/check/')) {
      const token = url.replace('/api/check/', '')
      const db = readDB()
      const used = db.results && db.results.some(r => r.token === token)
      res.end(JSON.stringify({ used })); return
    }

    if (req.method === 'DELETE') {
      const db = readDB()
      if (url === '/api/results/all') {
        db.results = []
        writeDB(db)
        res.end(JSON.stringify({ ok: true })); return
      }
      if (url.startsWith('/api/results/')) {
        const idx = parseInt(url.replace('/api/results/', ''))
        if (!isNaN(idx) && idx >= 0 && idx < db.results.length) {
          db.results.splice(idx, 1)
          writeDB(db)
          res.end(JSON.stringify({ ok: true }))
        } else {
          res.writeHead(400); res.end(JSON.stringify({ ok: false }))
        }
        return
      }
    }

    if (req.method === 'POST') {
      const chunks = []
      req.on('data', chunk => chunks.push(chunk))
      req.on('end', () => {
        const body = Buffer.concat(chunks)
        const contentType = req.headers['content-type'] || ''

        if (contentType.includes('multipart/form-data')) {
          const boundaryMatch = contentType.match(/boundary=(.+)/)
          if (!boundaryMatch) { res.writeHead(400); res.end('{}'); return }
          const parts = parseMultipart(body, boundaryMatch[1])
          const db = readDB()
          if (!db.branding) db.branding = {}
          if (parts.logo && parts.logo.filename) {
            const ext = path.extname(parts.logo.filename) || '.png'
            const logoPath = path.join(UPLOADS_DIR, 'logo' + ext)
            fs.writeFileSync(logoPath, parts.logo.data)
            db.branding.logoUrl = '/uploads/logo' + ext + '?v=' + Date.now()
          }
          if (parts.welcome) db.branding.welcome = parts.welcome.data.toString().trim()
          if (parts.companyName) db.branding.companyName = parts.companyName.data.toString().trim()
          writeDB(db)
          res.end(JSON.stringify({ ok: true, branding: db.branding })); return
        }

        const data = JSON.parse(body.toString())
        const db = readDB()

        if (url === '/api/admin/login') {
          const admin = db.admin || { name: 'admin', pass: 'admin1234' }
          if (data.name === admin.name && data.pass === admin.pass) {
            res.end(JSON.stringify({ ok: true }))
          } else {
            res.end(JSON.stringify({ ok: false, error: 'اسم المستخدم أو كلمة المرور غير صحيحة' }))
          }
          return
        }

        if (url === '/api/admin/update') {
          const admin = db.admin || { name: 'admin', pass: 'admin1234' }
          if (data.currentPass !== admin.pass) {
            res.end(JSON.stringify({ ok: false, error: 'كلمة المرور الحالية غير صحيحة' })); return
          }
          db.admin = { name: data.newName || admin.name, pass: data.newPass || admin.pass }
          writeDB(db)
          res.end(JSON.stringify({ ok: true })); return
        }

        if (url === '/api/agent/login') {
          const agents = db.agents || []
          const agent = agents.find(a => a.name === data.name && a.code === data.code)
          if (agent) {
            res.end(JSON.stringify({ ok: true, agent: { id: agent.id, name: agent.name } }))
          } else {
            res.end(JSON.stringify({ ok: false, error: 'اسم المندوب أو الرمز غير صحيح' }))
          }
          return
        }

        if (url === '/api/participant') {
          db.participants[data.token] = { name: data.name, agentId: data.agentId, timestamp: Date.now() }
          writeDB(db); res.end(JSON.stringify({ ok: true }))
        }
        else if (url === '/api/result') {
          const alreadyUsed = db.results.some(r => r.token === data.token)
          if (alreadyUsed) { res.end(JSON.stringify({ ok: false, reason: 'used' })); return }
          db.results.push({ name: data.name, token: data.token, prize: data.prize, challenge: data.challenge, timestamp: Date.now() })
          writeDB(db); res.end(JSON.stringify({ ok: true }))
        }
        else if (url === '/api/config') {
          db.config = data; writeDB(db); res.end(JSON.stringify({ ok: true }))
        }
        else if (url === '/api/agents') {
          db.agents = data.agents; writeDB(db); res.end(JSON.stringify({ ok: true }))
        }
        else if (url === '/api/branding') {
          if (!db.branding) db.branding = {}
          db.branding = { ...db.branding, ...data }
          writeDB(db); res.end(JSON.stringify({ ok: true }))
        }
        else { res.writeHead(404); res.end('{}') }
      })
      return
    }
  }

  if (url.startsWith('/uploads/')) {
    const filePath = path.join(UPLOADS_DIR, url.replace('/uploads/', '').split('?')[0])
    if (fs.existsSync(filePath)) {
      const ext = path.extname(filePath)
      const mime = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml', '.webp': 'image/webp' }
      res.setHeader('Content-Type', mime[ext] || 'image/png')
      fs.createReadStream(filePath).pipe(res)
    } else { res.writeHead(404); res.end() }
    return
  }

  let filePath = path.join(DIST, url === '/' ? 'index.html' : url.split('?')[0])
  if (!fs.existsSync(filePath)) filePath = path.join(DIST, 'index.html')
  const ext = path.extname(filePath)
  const mime = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png' }
  res.setHeader('Content-Type', mime[ext] || 'text/plain')
  fs.createReadStream(filePath).pipe(res)
})

server.listen(4000, '0.0.0.0', () => console.log('Server running on http://0.0.0.0:4000'))
