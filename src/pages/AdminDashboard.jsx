import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiGetDB, apiSaveConfig, apiSaveAgents, apiSaveBranding } from '../utils/api'

const defaultConfig = {
  target1: 7.0, target2: 4.0, speed1: 50, speed2: 50,
  max1: 10, max2: 10, prize1: 'جائزة أولى',
  prizeA: 'جائزة أ', prizeB: 'جائزة ب', prizeAWeight: 70,
}

const TABS = ['الإحصائيات', 'المندوبون', 'الإعدادات', 'الهوية', 'النتائج']

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [tab, setTab] = useState(0)
  const [config, setConfig] = useState(defaultConfig)
  const [results, setResults] = useState([])
  const [agents, setAgents] = useState([])
  const [participants, setParticipants] = useState({})
  const [branding, setBranding] = useState({ companyName: '', welcome: '', logoUrl: null })
  const [newAgent, setNewAgent] = useState('')
  const [savedMsg, setSavedMsg] = useState('')
  const [loading, setLoading] = useState(true)
  const [logoPreview, setLogoPreview] = useState(null)
  const logoRef = useRef()

  useEffect(() => {
    if (!localStorage.getItem('admin_auth')) navigate('/admin')
    loadData()
    const interval = setInterval(loadData, 5000)
    return () => clearInterval(interval)
  }, [])

  async function loadData() {
    const db = await apiGetDB()
    if (db.config) setConfig({ ...defaultConfig, ...db.config })
    setResults(db.results || [])
    setAgents(db.agents || [])
    setParticipants(db.participants || {})
    if (db.branding) setBranding(db.branding)
    setLoading(false)
  }

  async function handleSaveConfig() {
    await apiSaveConfig(config)
    setSavedMsg('config'); setTimeout(() => setSavedMsg(''), 2000)
  }

  async function handleAddAgent() {
    if (!newAgent.trim()) return
    const id = newAgent.trim().toLowerCase().replace(/\s+/g, '-')
    if (agents.find(a => a.id === id)) return
    const updated = [...agents, { id, name: newAgent.trim(), createdAt: Date.now() }]
    setAgents(updated); await apiSaveAgents(updated); setNewAgent('')
  }

  async function handleDeleteAgent(id) {
    const updated = agents.filter(a => a.id !== id)
    setAgents(updated); await apiSaveAgents(updated)
  }

  async function handleSaveBranding() {
    const formData = new FormData()
    formData.append('companyName', branding.companyName || '')
    formData.append('welcome', branding.welcome || '')
    if (logoRef.current && logoRef.current.files[0]) {
      formData.append('logo', logoRef.current.files[0])
    }
    const res = await apiSaveBranding(formData)
    if (res.branding) setBranding(res.branding)
    setSavedMsg('branding'); setTimeout(() => setSavedMsg(''), 2000)
  }

  function handleLogoChange(e) {
    const file = e.target.files[0]
    if (file) setLogoPreview(URL.createObjectURL(file))
  }

  function handleLogout() { localStorage.removeItem('admin_auth'); navigate('/admin') }

  function getAgentStats(agentId) {
    const tokens = Object.entries(participants).filter(([,v]) => v.agentId === agentId).map(([k]) => k)
    const ar = results.filter(r => tokens.includes(r.token))
    return { total: ar.length, wins: ar.filter(r => r.prize).length, losses: ar.filter(r => !r.prize).length }
  }

  const wins = results.filter(r => r.prize).length
  const losses = results.filter(r => !r.prize).length

  const inp = { width: '100%', background: 'rgba(5,15,35,0.8)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 14px', color: 'var(--text)', fontSize: '0.9rem', fontFamily: 'var(--font-ar)', outline: 'none' }
  const lbl = { fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: 6, letterSpacing: 1, textTransform: 'uppercase', fontFamily: 'var(--font-en)' }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <div style={{ fontFamily: 'var(--font-display)', color: 'var(--text-muted)', letterSpacing: 3 }}>LOADING...</div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '1.5rem', position: 'relative' }}>
      <div className="grid-bg" />
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, transparent, var(--blue), var(--cyan), var(--gold), transparent)', zIndex: 100 }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 1100, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.65rem', color: 'var(--blue2)', letterSpacing: 4, marginBottom: '0.3rem' }}>ADMIN PANEL</div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 900, background: 'linear-gradient(135deg, var(--text), var(--blue2))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              لوحة التحكم
            </h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', display: 'inline-block', animation: 'pulse-blue 2s infinite' }} />
              LIVE
            </div>
            <button onClick={handleLogout} style={{ ...inp, width: 'auto', padding: '10px 20px', cursor: 'pointer', color: 'var(--text-muted)' }}>خروج</button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          {TABS.map((t, i) => (
            <button key={i} onClick={() => setTab(i)} style={{ background: tab === i ? 'var(--blue)' : 'rgba(10,20,40,0.8)', color: tab === i ? '#fff' : 'var(--text-muted)', border: '1px solid ' + (tab === i ? 'var(--blue)' : 'var(--border)'), borderRadius: 10, padding: '9px 20px', fontSize: '0.88rem', fontWeight: tab === i ? 700 : 400, cursor: 'pointer', fontFamily: 'var(--font-ar)', transition: 'all 0.2s', boxShadow: tab === i ? '0 4px 15px rgba(26,108,240,0.4)' : 'none' }}>
              {t}
            </button>
          ))}
        </div>

        {/* TAB 0: Stats */}
        {tab === 0 && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              {[
                { label: 'إجمالي المشاركين', value: results.length, color: 'var(--cyan)' },
                { label: 'الفائزون', value: wins, color: 'var(--green)' },
                { label: 'الخاسرون', value: losses, color: 'var(--red)' },
                { label: 'المندوبون', value: agents.length, color: 'var(--gold)' },
              ].map((s, i) => (
                <div key={i} style={{ background: 'rgba(10,20,40,0.8)', border: '1px solid var(--border)', borderRadius: 14, padding: '1.5rem', textAlign: 'center', backdropFilter: 'blur(10px)' }}>
                  <div style={{ fontSize: '2.5rem', fontWeight: 900, color: s.color, fontFamily: 'var(--font-display)' }}>{s.value}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>{s.label}</div>
                </div>
              ))}
            </div>
            {agents.length > 0 && (
              <div className="card-neon">
                <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--gold)', marginBottom: '1rem', fontFamily: 'var(--font-display)', letterSpacing: 2 }}>AGENT STATS</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {agents.map(a => {
                    const s = getAgentStats(a.id)
                    return (
                      <div key={a.id} style={{ background: 'rgba(5,15,35,0.6)', border: '1px solid var(--border)', borderRadius: 10, padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <div style={{ fontWeight: 700 }}>{a.name}</div>
                        <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.85rem' }}>
                          <span style={{ color: 'var(--text-muted)' }}>مشاركون: <b style={{ color: 'var(--text)' }}>{s.total}</b></span>
                          <span style={{ color: 'var(--green)' }}>فوز: <b>{s.wins}</b></span>
                          <span style={{ color: 'var(--red)' }}>خسارة: <b>{s.losses}</b></span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 1: Agents */}
        {tab === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="card-neon">
              <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--cyan)', marginBottom: '1rem', fontFamily: 'var(--font-display)', letterSpacing: 2 }}>ADD AGENT</h3>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <input style={{ ...inp, flex: 1 }} placeholder="اسم المندوب" value={newAgent} onChange={e => setNewAgent(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddAgent()} />
                <button className="btn-primary" style={{ width: 'auto', padding: '12px 24px' }} onClick={handleAddAgent}>إضافة</button>
              </div>
            </div>
            {agents.length === 0
              ? <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem', fontFamily: 'var(--font-display)', fontSize: '0.8rem', letterSpacing: 2 }}>NO AGENTS YET</div>
              : agents.map(a => {
                const url = window.location.origin + '/agent/' + a.id
                const s = getAgentStats(a.id)
                return (
                  <div key={a.id} className="card-neon" style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.3rem' }}>{a.name}</div>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.6rem', color: 'var(--blue2)', wordBreak: 'break-all', marginBottom: '0.5rem' }}>{url}</div>
                        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.82rem' }}>
                          <span style={{ color: 'var(--text-muted)' }}>مشاركون: <b style={{ color: 'var(--text)' }}>{s.total}</b></span>
                          <span style={{ color: 'var(--green)' }}>فوز: <b>{s.wins}</b></span>
                          <span style={{ color: 'var(--red)' }}>خسارة: <b>{s.losses}</b></span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => navigator.clipboard.writeText(url)} style={{ ...inp, width: 'auto', padding: '8px 14px', cursor: 'pointer', fontSize: '0.8rem' }}>نسخ</button>
                        <button onClick={() => handleDeleteAgent(a.id)} style={{ background: 'rgba(255,64,96,0.1)', color: 'var(--red)', border: '1px solid rgba(255,64,96,0.3)', borderRadius: 10, padding: '8px 14px', fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'var(--font-ar)' }}>حذف</button>
                      </div>
                    </div>
                  </div>
                )
              })
            }
          </div>
        )}

        {/* TAB 2: Config */}
        {tab === 2 && (
          <div className="card-neon" style={{ maxWidth: 640 }}>
            <h2 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--cyan)', fontFamily: 'var(--font-display)', letterSpacing: 2 }}>COMPETITION SETTINGS</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

              {[
                { label: 'التحدي الأول', color: 'var(--cyan)', fields: [
                  { key: 'target1', label: 'الوقت المطلوب (ثانية)', type: 'number', min: 0.1, max: 60, step: 0.1 },
                  { key: 'max1', label: 'الحد الأقصى (ثانية)', type: 'number', min: 1, max: 99 },
                ]},
                { label: 'التحدي الثاني', color: 'var(--gold)', fields: [
                  { key: 'target2', label: 'الوقت المطلوب (ثانية)', type: 'number', min: 0.1, max: 60, step: 0.1 },
                  { key: 'max2', label: 'الحد الأقصى (ثانية)', type: 'number', min: 1, max: 99 },
                ]},
              ].map((section, si) => (
                <div key={si} style={{ background: 'rgba(5,15,35,0.6)', borderRadius: 10, padding: '1rem', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '0.75rem', color: section.color, marginBottom: '0.75rem', fontWeight: 700, fontFamily: 'var(--font-display)', letterSpacing: 2 }}>{section.label}</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    {section.fields.map(f => (
                      <div key={f.key}>
                        <label style={lbl}>{f.label}</label>
                        <input style={inp} type={f.type} min={f.min} max={f.max} step={f.step || 1}
                          value={config[f.key]}
                          onChange={e => setConfig({ ...config, [f.key]: parseFloat(e.target.value) })}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <div style={{ background: 'rgba(5,15,35,0.6)', borderRadius: 10, padding: '1rem', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--green)', marginBottom: '0.75rem', fontWeight: 700, fontFamily: 'var(--font-display)', letterSpacing: 2 }}>PRIZES</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div><label style={lbl}>جائزة الفوز الأول</label><input style={inp} type="text" value={config.prize1} onChange={e => setConfig({ ...config, prize1: e.target.value })} /></div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div><label style={lbl}>جائزة أ</label><input style={inp} type="text" value={config.prizeA} onChange={e => setConfig({ ...config, prizeA: e.target.value })} /></div>
                    <div><label style={lbl}>جائزة ب</label><input style={inp} type="text" value={config.prizeB} onChange={e => setConfig({ ...config, prizeB: e.target.value })} /></div>
                  </div>
                  <div>
                    <label style={lbl}>نسبة جائزة أ: {config.prizeAWeight}% — جائزة ب: {100 - config.prizeAWeight}%</label>
                    <input type="range" min="0" max="100" value={config.prizeAWeight} onChange={e => setConfig({ ...config, prizeAWeight: +e.target.value })} style={{ width: '100%', accentColor: 'var(--gold)' }} />
                  </div>
                </div>
              </div>

              <button className="btn-primary" onClick={handleSaveConfig} style={{ background: savedMsg === 'config' ? 'var(--green)' : undefined }}>
                {savedMsg === 'config' ? '✓ تم الحفظ' : 'حفظ الإعدادات'}
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: Branding */}
        {tab === 3 && (
          <div className="card-neon" style={{ maxWidth: 560 }}>
            <h2 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--gold)', fontFamily: 'var(--font-display)', letterSpacing: 2 }}>BRANDING</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

              {/* Logo upload */}
              <div>
                <label style={lbl}>شعار الشركة (Logo)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                  <div style={{ width: 80, height: 80, background: 'rgba(5,15,35,0.8)', border: '2px dashed var(--border)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                    {(logoPreview || branding.logoUrl)
                      ? <img src={logoPreview || branding.logoUrl} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                      : <span style={{ fontSize: '2rem' }}>🖼</span>
                    }
                  </div>
                  <div style={{ flex: 1 }}>
                    <input ref={logoRef} type="file" accept="image/*" onChange={handleLogoChange} style={{ display: 'none' }} id="logo-upload" />
                    <label htmlFor="logo-upload" style={{ ...inp, display: 'inline-block', cursor: 'pointer', textAlign: 'center', width: 'auto', padding: '10px 20px', fontSize: '0.85rem' }}>
                      📁 اختر صورة
                    </label>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>PNG, JPG, SVG — بحد أقصى 2MB</div>
                  </div>
                </div>
              </div>

              <div>
                <label style={lbl}>اسم الشركة</label>
                <input style={inp} type="text" placeholder="شركتنا السياحية" value={branding.companyName || ''} onChange={e => setBranding({ ...branding, companyName: e.target.value })} />
              </div>

              <div>
                <label style={lbl}>الرسالة الترحيبية (تظهر للمتسابق)</label>
                <textarea style={{ ...inp, minHeight: 120, resize: 'vertical', lineHeight: 1.8 }}
                  placeholder="مرحباً بك في مسابقتنا! نتمنى لك تجربة ممتعة..."
                  value={branding.welcome || ''}
                  onChange={e => setBranding({ ...branding, welcome: e.target.value })}
                />
              </div>

              {branding.welcome && (
                <div style={{ background: 'rgba(26,108,240,0.05)', border: '1px solid rgba(26,108,240,0.15)', borderRadius: 10, padding: '1rem' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--blue2)', marginBottom: '0.5rem', fontFamily: 'var(--font-display)', letterSpacing: 2 }}>PREVIEW</div>
                  <p style={{ color: 'var(--text)', lineHeight: 1.9, fontSize: '0.9rem' }}>{branding.welcome}</p>
                </div>
              )}

              <button className="btn-gold" onClick={handleSaveBranding} style={{ background: savedMsg === 'branding' ? 'var(--green)' : undefined, color: savedMsg === 'branding' ? '#fff' : undefined }}>
                {savedMsg === 'branding' ? '✓ تم الحفظ' : 'حفظ الهوية'}
              </button>
            </div>
          </div>
        )}

        {/* TAB 4: Results */}
        {tab === 4 && (
          <div className="card-neon">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--cyan)', fontFamily: 'var(--font-display)', letterSpacing: 2 }}>ALL RESULTS ({results.length})</h2>
            </div>
            {results.length === 0
              ? <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem', fontFamily: 'var(--font-display)', fontSize: '0.8rem', letterSpacing: 2 }}>NO RESULTS YET</div>
              : <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: 520, overflowY: 'auto' }}>
                  {[...results].reverse().map((r, i) => (
                    <div key={i} style={{ background: 'rgba(5,15,35,0.6)', border: '1px solid var(--border)', borderRadius: 10, padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 700 }}>{r.name}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>
                          {new Date(r.timestamp).toLocaleString('ar')} — تحدي {r.challenge}
                        </div>
                      </div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: r.prize ? 'var(--green)' : 'var(--red)', background: r.prize ? 'rgba(0,232,122,0.08)' : 'rgba(255,64,96,0.08)', border: '1px solid ' + (r.prize ? 'rgba(0,232,122,0.25)' : 'rgba(255,64,96,0.25)'), borderRadius: 8, padding: '4px 12px' }}>
                        {r.prize || 'خسارة'}
                      </div>
                    </div>
                  ))}
                </div>
            }
          </div>
        )}
      </div>
    </div>
  )
}
