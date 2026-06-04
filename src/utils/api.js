const BASE = window.location.origin

export async function apiSaveParticipant(token, name, agentId) {
  await fetch(BASE + '/api/participant', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, name, agentId })
  })
}

export async function apiCheckToken(token) {
  const res = await fetch(BASE + '/api/check/' + token)
  return res.json()
}

export async function apiSaveResult(name, token, prize, challenge) {
  const res = await fetch(BASE + '/api/result', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, token, prize, challenge })
  })
  return res.json()
}

export async function apiSaveConfig(config) {
  await fetch(BASE + '/api/config', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config)
  })
}

export async function apiSaveAgents(agents) {
  await fetch(BASE + '/api/agents', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ agents })
  })
}

export async function apiGetDB() {
  const res = await fetch(BASE + '/api/db')
  return res.json()
}

export async function apiSaveBranding(formData) {
  const res = await fetch(BASE + '/api/branding', {
    method: 'POST', body: formData
  })
  return res.json()
}
