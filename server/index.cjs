const http = require('http')
const fs = require('fs')
const path = require('path')
const mysql = require('mysql2/promise')

const DIST = path.join(__dirname, '../dist')
const UPLOADS_DIR = path.join(__dirname, 'uploads')

if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR)

// ── DB Connection Pool ──
const pool = mysql.createPool({
  host: 'localhost',
  user: 'competition_user',
  password: 'Competition@2026',
  database: 'competition_db',
  charset: 'utf8mb4',
  waitForConnections: true,
  connectionLimit: 10,
})

// ── Helpers ──
async function query(sql, params = []) {
  const [rows] = await pool.execute(sql, params)
  return rows
}

async function getDB() {
  const [admins, agents, participants, results, configs, brandings] = await Promise.all([
    query('SELECT username AS name FROM admin LIMIT 1'),
    query('SELECT * FROM agents ORDER BY created_at ASC'),
    query('SELECT * FROM participants'),
    query('SELECT * FROM results ORDER BY created_at ASC'),
    query('SELECT * FROM config LIMIT 1'),
    query('SELECT * FROM branding LIMIT 1'),
  ])

  const cfg = configs[0] || {}
  const brand = brandings[0] || {}

  const participantsMap = {}
  participants.forEach(p => {
    participantsMap[p.token] = {
      name: p.name,
      agentId: p.agent_id,
      timestamp: new Date(p.created_at).getTime()
    }
  })

  return {
    admin: { name: admins[0]?.name || 'admin' },
    agents: agents.map(a => ({
      id: a.id, name: a.name, code: a.code,
      createdAt: new Date(a.created_at).getTime()
    })),
    participants: participantsMap,
    results: results.map(r => ({
      id: r.id,
      name: r.participant_name,
      token: r.participant_token,
      prize: r.prize,
      challenge: r.challenge,
      timestamp: new Date(r.created_at).getTime()
    })),
    config: {
      target1: parseFloat(cfg.target1) || 7.0,
      target2: parseFloat(cfg.target2) || 4.0,
      max1: cfg.max1 || 10,
      max2: cfg.max2 || 10,
      prize1: cfg.prize1 || 'جائزة أولى',
      prizeA: cfg.prize_a || 'جائزة أ',
      prizeB: cfg.prize_b || 'جائزة ب',
      prizeAWeight: cfg.prize_a_weight || 70,
    },
    branding: {
      companyName: brand.company_name || '',
      welcome: brand.welcome || '',
      logoUrl: brand.logo_url || null,
    }
  }
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
      parts[nameMatch[1]] = {
        data: buffer.slice(dataStart, dataEnd),
        filename: filenameMatch ? filenameMatch[1] : null,
        header
      }
    }
    start = nextBoundary === -1 ? buffer.length : nextBoundary
  }
  return parts
}

// ── Server ──
const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') { res.writeHead(200); res.end(); return }

  const url = req.url

  try {
    if (url.startsWith('/api/')) {
      res.setHeader('Content-Type', 'application/json')

      // ── GET /api/db ──
      if (req.method === 'GET' && url === '/api/db') {
        const db = await getDB()
        res.end(JSON.stringify(db)); return
      }

      // ── GET /api/check/:token ──
      if (req.method === 'GET' && url.startsWith('/api/check/')) {
        const token = url.replace('/api/check/', '')
        const rows = await query('SELECT id FROM results WHERE participant_token = ? LIMIT 1', [token])
        res.end(JSON.stringify({ used: rows.length > 0 })); return
      }

      // ── DELETE ──
      if (req.method === 'DELETE') {
        if (url === '/api/results/all') {
          await query('DELETE FROM results')
          res.end(JSON.stringify({ ok: true })); return
        }
        if (url.startsWith('/api/results/')) {
          const id = parseInt(url.replace('/api/results/', ''))
          if (!isNaN(id)) {
            await query('DELETE FROM results WHERE id = ?', [id])
            res.end(JSON.stringify({ ok: true }))
          } else {
            res.writeHead(400); res.end(JSON.stringify({ ok: false }))
          }
          return
        }
      }

      // ── POST ──
      if (req.method === 'POST') {
        const chunks = []
        req.on('data', chunk => chunks.push(chunk))
        await new Promise(resolve => req.on('end', resolve))
        const body = Buffer.concat(chunks)
        const contentType = req.headers['content-type'] || ''

        // multipart (branding upload)
        if (contentType.includes('multipart/form-data')) {
          const boundaryMatch = contentType.match(/boundary=(.+)/)
          if (!boundaryMatch) { res.writeHead(400); res.end('{}'); return }
          const parts = parseMultipart(body, boundaryMatch[1])
          let logoUrl = null
          if (parts.logo && parts.logo.filename) {
            const ext = path.extname(parts.logo.filename) || '.png'
            const logoPath = path.join(UPLOADS_DIR, 'logo' + ext)
            fs.writeFileSync(logoPath, parts.logo.data)
            logoUrl = '/uploads/logo' + ext + '?v=' + Date.now()
          }
          const companyName = parts.companyName ? parts.companyName.data.toString().trim() : null
          const welcome = parts.welcome ? parts.welcome.data.toString().trim() : null
          if (companyName !== null) await query('UPDATE branding SET company_name = ? WHERE id = 1', [companyName])
          if (welcome !== null) await query('UPDATE branding SET welcome = ? WHERE id = 1', [welcome])
          if (logoUrl) await query('UPDATE branding SET logo_url = ? WHERE id = 1', [logoUrl])
          const db = await getDB()
          res.end(JSON.stringify({ ok: true, branding: db.branding })); return
        }

        const data = JSON.parse(body.toString())

        // Admin login
        if (url === '/api/admin/login') {
          const rows = await query('SELECT * FROM admin LIMIT 1')
          const admin = rows[0]
          if (admin && data.name === admin.username && data.pass === admin.password) {
            res.end(JSON.stringify({ ok: true }))
          } else {
            res.end(JSON.stringify({ ok: false, error: 'اسم المستخدم أو كلمة المرور غير صحيحة' }))
          }
          return
        }

        // Admin update
        if (url === '/api/admin/update') {
          const rows = await query('SELECT * FROM admin LIMIT 1')
          const admin = rows[0]
          if (!admin || data.currentPass !== admin.password) {
            res.end(JSON.stringify({ ok: false, error: 'كلمة المرور الحالية غير صحيحة' })); return
          }
          const newName = data.newName || admin.username
          const newPass = data.newPass || admin.password
          await query('UPDATE admin SET username = ?, password = ? WHERE id = 1', [newName, newPass])
          res.end(JSON.stringify({ ok: true })); return
        }

        // Agent login
        if (url === '/api/agent/login') {
          const rows = await query('SELECT * FROM agents WHERE name = ? AND code = ? LIMIT 1', [data.name, data.code])
          if (rows.length > 0) {
            res.end(JSON.stringify({ ok: true, agent: { id: rows[0].id, name: rows[0].name } }))
          } else {
            res.end(JSON.stringify({ ok: false, error: 'اسم المندوب أو الرمز غير صحيح' }))
          }
          return
        }

        // Save participant
        if (url === '/api/participant') {
          await query(
            'INSERT IGNORE INTO participants (token, name, agent_id) VALUES (?, ?, ?)',
            [data.token, data.name, data.agentId || null]
          )
          res.end(JSON.stringify({ ok: true })); return
        }

        // Save result
        if (url === '/api/result') {
          const used = await query('SELECT id FROM results WHERE participant_token = ? LIMIT 1', [data.token])
          if (used.length > 0) { res.end(JSON.stringify({ ok: false, reason: 'used' })); return }
          await query(
            'INSERT INTO results (participant_token, participant_name, prize, challenge) VALUES (?, ?, ?, ?)',
            [data.token, data.name, data.prize || null, data.challenge]
          )
          res.end(JSON.stringify({ ok: true })); return
        }

        // Save config
        if (url === '/api/config') {
          await query(
            `UPDATE config SET
              target1 = ?, target2 = ?, max1 = ?, max2 = ?,
              prize1 = ?, prize_a = ?, prize_b = ?, prize_a_weight = ?
             WHERE id = 1`,
            [data.target1, data.target2, data.max1, data.max2,
             data.prize1, data.prizeA, data.prizeB, data.prizeAWeight]
          )
          res.end(JSON.stringify({ ok: true })); return
        }

        // Save agents
        if (url === '/api/agents') {
          const conn = await pool.getConnection()
          try {
            await conn.beginTransaction()
            await conn.execute('DELETE FROM agents')
            for (const a of data.agents) {
              await conn.execute(
                'INSERT INTO agents (id, name, code) VALUES (?, ?, ?)',
                [a.id, a.name, a.code]
              )
            }
            await conn.commit()
          } catch (e) {
            await conn.rollback(); throw e
          } finally {
            conn.release()
          }
          res.end(JSON.stringify({ ok: true })); return
        }

        res.writeHead(404); res.end('{}')
      }
      return
    }

    // ── Uploads ──
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

    // ── Static files ──
    let filePath = path.join(DIST, url === '/' ? 'index.html' : url.split('?')[0])
    if (!fs.existsSync(filePath)) filePath = path.join(DIST, 'index.html')
    const ext = path.extname(filePath)
    const mime = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png' }
    res.setHeader('Content-Type', mime[ext] || 'text/plain')
    fs.createReadStream(filePath).pipe(res)

  } catch (err) {
    console.error('Server error:', err)
    res.writeHead(500)
    res.end(JSON.stringify({ error: 'Internal server error' }))
  }
})

server.listen(4000, '0.0.0.0', () => {
  console.log('Server running on http://0.0.0.0:4000')
  console.log('Database: MySQL (competition_db)')
})
