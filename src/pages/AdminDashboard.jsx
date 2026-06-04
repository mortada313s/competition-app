import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiGetDB, apiSaveConfig, apiSaveAgents, apiSaveBranding, apiAdminUpdate, apiDeleteResult, apiDeleteAllResults } from '../utils/api'

const defaultConfig = {
  target1: 7.0, target2: 4.0,
  max1: 10, max2: 10,
  prize1: 'جائزة أولى', prizeA: 'جائزة أ', prizeB: 'جائزة ب', prizeAWeight: 70,
}

const TABS = ['الإحصائيات', 'المندوبون', 'الإعدادات', 'الهوية', 'النتائج', 'الحساب']

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [tab, setTab] = useState(0)
  const [config, setConfig] = useState(defaultConfig)
  const [results, setResults] = useState([])
  const [agents, setAgents] = useState([])
  const [participants, setParticipants] = useState({})
  const [branding, setBranding] = useState({ companyName: '', welcome: '', logoUrl: null })
  const [adminName, setAdminName] = useState('admin')
  const [newAgent, setNewAgent] = useState({ name: '', code: '' })
  const [savedMsg, setSavedMsg] = useState('')
  const [loading, setLoading] = useState(true)
  const [logoPreview, setLogoPreview] = useState(null)
  const [showCodes, setShowCodes] = useState({})
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false)
  const [accountForm, setAccountForm] = useState({ currentPass: '', newName: '', newPass: '', confirmPass: '' })
  const [accountError, setAccountError] = useState('')
  const [accountSuccess, setAccountSuccess] = useState(false)
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
    if (db.admin?.name) setAdminName(db.admin.name)
    setLoading(false)
  }

  async function handleSaveConfig() {
    await apiSaveConfig(config)
    setSavedMsg('config'); setTimeout(() => setSavedMsg(''), 2000)
  }

  async function handleAddAgent() {
    if (!newAgent.name.trim() || !newAgent.code.trim() || newAgent.code.length < 4) return
    const id = newAgent.name.trim().toLowerCase().replace(/\s+/g, '-') + '-' + Date.now().toString(36)
    if (agents.find(a => a.name === newAgent.name.trim())) return
    const updated = [...agents, { id, name: newAgent.name.trim(), code: newAgent.code.trim(), createdAt: Date.now() }]
    setAgents(updated); await apiSaveAgents(updated); setNewAgent({ name: '', code: '' })
  }

  async function handleDeleteAgent(id) {
    const updated = agents.filter(a => a.id !== id)
    setAgents(updated); await apiSaveAgents(updated)
  }

  async function handleSaveBranding() {
    const formData = new FormData()
    formData.append('companyName', branding.companyName || '')
    formData.append('welcome', branding.welcome || '')
    if (logoRef.current?.files[0]) formData.append('logo', logoRef.current.files[0])
    const res = await apiSaveBranding(formData)
    if (res.branding) setBranding(res.branding)
    setSavedMsg('branding'); setTimeout(() => setSavedMsg(''), 2000)
  }

  async function handleDeleteResult(index) {
    await apiDeleteResult(index)
    await loadData()
  }

  async function handleDeleteAllResults() {
    await apiDeleteAllResults()
    setConfirmDeleteAll(false)
    await loadData()
  }

  async function handleUpdateAccount() {
    setAccountError(''); setAccountSuccess(false)
    if (!accountForm.currentPass) { setAccountError('أدخل كلمة المرور الحالية'); return }
    if (accountForm.newPass && accountForm.newPass !== accountForm.confirmPass) { setAccountError('كلمة المرور الجديدة غير متطابقة'); return }
    if (accountForm.newPass && accountForm.newPass.length < 4) { setAccountError('كلمة المرور الجديدة يجب أن تكون 4 أحرف على الأقل'); return }
    const res = await apiAdminUpdate(accountForm.currentPass, accountForm.newName || adminName, accountForm.newPass || accountForm.currentPass)
    if (res.ok) {
      setAccountSuccess(true)
      setAccountForm({ currentPass: '', newName: '', newPass: '', confirmPass: '' })
      await loadData()
      setTimeout(() => setAccountSuccess(false), 3000)
    } else {
      setAccountError(res.error || 'حدث خطأ')
    }
  }

  function handleLogout() { localStorage.removeItem('admin_auth'); navigate('/admin') }
  function toggleCode(id) { setShowCodes(p => ({ ...p, [id]: !p[id] })) }

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
              {adminName}
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
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '0.75rem', alignItems: 'end' }}>
                <div>
                  <label style={lbl}>اسم المندوب</label>
                  <input style={inp} type="text" placeholder="مثال: أحمد" value={newAgent.name} onChange={e => setNewAgent({ ...newAgent, name: e.target.value })} />
                </div>
                <div>
                  <label style={lbl}>الرمز السري</label>
                  <input style={inp} type="text" placeholder="4 أحرف على الأقل" value={newAgent.code} onChange={e => setNewAgent({ ...newAgent, code: e.target.value })} onKeyDown={e => e.key === 'Enter' && handleAddAgent()} />
                </div>
                <button className="btn-primary" style={{ width: 'auto', padding: '12px 24px' }} onClick={handleAddAgent}>إضافة</button>
              </div>
            </div>

            <div style={{ background: 'rgba(26,108,240,0.05)', border: '1px solid rgba(26,108,240,0.15)', borderRadius: 12, padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--blue2)', fontFamily: 'var(--font-display)', letterSpacing: 2, marginBottom: '0.3rem' }}>AGENT LOGIN URL</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.75rem', color: 'var(--text)' }}>{window.location.origin}/agent</div>
              </div>
              <button onClick={() => navigator.clipboard.writeText(window.location.origin + '/agent')} style={{ ...inp, width: 'auto', padding: '8px 16px', cursor: 'pointer', fontSize: '0.8rem', color: 'var(--blue2)' }}>نسخ الرابط</button>
            </div>

            {agents.length === 0
              ? <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem', fontFamily: 'var(--font-display)', fontSize: '0.8rem', letterSpacing: 2 }}>NO AGENTS YET</div>
              : agents.map(a => {
                const s = getAgentStats(a.id)
                return (
                  <div key={a.id} className="card-neon" style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.4rem' }}>{a.name}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>الرمز:</span>
                          <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.75rem', color: showCodes[a.id] ? 'var(--gold)' : 'var(--text-muted)', letterSpacing: 2 }}>
                            {showCodes[a.id] ? a.code : '••••'}
                          </span>
                          <button onClick={() => toggleCode(a.id)} style={{ background: 'transparent', border: 'none', color: 'var(--blue2)', cursor: 'pointer', fontSize: '0.75rem', fontFamily: 'var(--font-ar)' }}>
                            {showCodes[a.id] ? 'إخفاء' : 'إظهار'}
                          </button>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.82rem' }}>
                          <span style={{ color: 'var(--text-muted)' }}>مشاركون: <b style={{ color: 'var(--text)' }}>{s.total}</b></span>
                          <span style={{ color: 'var(--green)' }}>فوز: <b>{s.wins}</b></span>
                          <span style={{ color: 'var(--red)' }}>خسارة: <b>{s.losses}</b></span>
                        </div>
                      </div>
                      <button onClick={() => handleDeleteAgent(a.id)} style={{ background: 'rgba(255,64,96,0.1)', color: 'var(--red)', border: '1px solid rgba(255,64,96,0.3)', borderRadius: 10, padding: '8px 14px', fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'var(--font-ar)' }}>حذف</button>
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
                  { key: 'target1', label: 'الوقت المطلوب (ثانية)', min: 0.1, max: 60, step: 0.1 },
                  { key: 'max1', label: 'الحد الأقصى (ثانية)', min: 1, max: 99 },
                ]},
                { label: 'التحدي الثاني', color: 'var(--gold)', fields: [
                  { key: 'target2', label: 'الوقت المطلوب (ثانية)', min: 0.1, max: 60, step: 0.1 },
                  { key: 'max2', label: 'الحد الأقصى (ثانية)', min: 1, max: 99 },
                ]},
              ].map((section, si) => (
                <div key={si} style={{ background: 'rgba(5,15,35,0.6)', borderRadius: 10, padding: '1rem', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '0.75rem', color: section.color, marginBottom: '0.75rem', fontWeight: 700, fontFamily: 'var(--font-display)', letterSpacing: 2 }}>{section.label}</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    {section.fields.map(f => (
                      <div key={f.key}>
                        <label style={lbl}>{f.label}</label>
                        <input style={inp} type="number" min={f.min} max={f.max} step={f.step || 1} value={config[f.key]} onChange={e => setConfig({ ...config, [f.key]: parseFloat(e.target.value) })} />
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
              <div>
                <label style={lbl}>شعار الشركة</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                  <div style={{ width: 80, height: 80, background: 'rgba(5,15,35,0.8)', border: '2px dashed var(--border)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                    {(logoPreview || branding.logoUrl) ? <img src={logoPreview || branding.logoUrl} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <span style={{ fontSize: '2rem' }}>🖼</span>}
                  </div>
                  <div style={{ flex: 1 }}>
                    <input ref={logoRef} type="file" accept="image/*" onChange={e => { const f = e.target.files[0]; if(f) setLogoPreview(URL.createObjectURL(f)) }} style={{ display: 'none' }} id="logo-upload" />
                    <label htmlFor="logo-upload" style={{ ...inp, display: 'inline-block', cursor: 'pointer', textAlign: 'center', width: 'auto', padding: '10px 20px', fontSize: '0.85rem' }}>📁 اختر صورة</label>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>PNG, JPG, SVG</div>
                  </div>
                </div>
              </div>
              <div><label style={lbl}>اسم الشركة</label><input style={inp} type="text" placeholder="شركتنا السياحية" value={branding.companyName || ''} onChange={e => setBranding({ ...branding, companyName: e.target.value })} /></div>
              <div>
                <label style={lbl}>الرسالة الترحيبية</label>
                <textarea style={{ ...inp, minHeight: 120, resize: 'vertical', lineHeight: 1.8 }} placeholder="مرحباً بك في مسابقتنا..." value={branding.welcome || ''} onChange={e => setBranding({ ...branding, welcome: e.target.value })} />
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <h2 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--cyan)', fontFamily: 'var(--font-display)', letterSpacing: 2 }}>
                ALL RESULTS ({results.length})
              </h2>
              {results.length > 0 && (
                confirmDeleteAll
                  ? <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.82rem', color: 'var(--red)' }}>هل أنت متأكد؟</span>
                      <button onClick={handleDeleteAllResults} style={{ background: 'var(--red)', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 14px', fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'var(--font-ar)' }}>نعم، احذف الكل</button>
                      <button onClick={() => setConfirmDeleteAll(false)} style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 14px', fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'var(--font-ar)' }}>إلغاء</button>
                    </div>
                  : <button onClick={() => setConfirmDeleteAll(true)} style={{ background: 'rgba(255,64,96,0.1)', color: 'var(--red)', border: '1px solid rgba(255,64,96,0.3)', borderRadius: 8, padding: '7px 16px', fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'var(--font-ar)' }}>
                      🗑 حذف الكل
                    </button>
              )}
            </div>
            {results.length === 0
              ? <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem', fontFamily: 'var(--font-display)', fontSize: '0.8rem', letterSpacing: 2 }}>NO RESULTS YET</div>
              : <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: 520, overflowY: 'auto' }}>
                  {[...results].reverse().map((r, i) => {
                    const realIndex = results.length - 1 - i
                    return (
                      <div key={i} style={{ background: 'rgba(5,15,35,0.6)', border: '1px solid var(--border)', borderRadius: 10, padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700 }}>{r.name}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>
                            {new Date(r.timestamp).toLocaleString('ar')} — تحدي {r.challenge}
                          </div>
                        </div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: r.prize ? 'var(--green)' : 'var(--red)', background: r.prize ? 'rgba(0,232,122,0.08)' : 'rgba(255,64,96,0.08)', border: '1px solid ' + (r.prize ? 'rgba(0,232,122,0.25)' : 'rgba(255,64,96,0.25)'), borderRadius: 8, padding: '4px 12px', whiteSpace: 'nowrap' }}>
                          {r.prize || 'خسارة'}
                        </div>
                        <button onClick={() => handleDeleteResult(realIndex)} style={{ background: 'rgba(255,64,96,0.08)', color: 'var(--red)', border: '1px solid rgba(255,64,96,0.2)', borderRadius: 8, padding: '6px 10px', fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'var(--font-ar)', flexShrink: 0 }}>
                          ✕
                        </button>
                      </div>
                    )
                  })}
                </div>
            }
          </div>
        )}

        {/* TAB 5: Account */}
        {tab === 5 && (
          <div className="card-neon" style={{ maxWidth: 480 }}>
            <h2 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--cyan)', fontFamily: 'var(--font-display)', letterSpacing: 2 }}>ACCOUNT SETTINGS</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

              <div style={{ background: 'rgba(5,15,35,0.6)', borderRadius: 10, padding: '1rem', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem', fontFamily: 'var(--font-display)', letterSpacing: 2 }}>CURRENT ACCOUNT</div>
                <div style={{ fontWeight: 700, color: 'var(--gold)', fontSize: '1.1rem' }}>{adminName}</div>
              </div>

              <div>
                <label style={lbl}>كلمة المرور الحالية *</label>
                <input style={inp} type="password" placeholder="••••••••" value={accountForm.currentPass} onChange={e => setAccountForm({ ...accountForm, currentPass: e.target.value })} />
              </div>

              <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, var(--border), transparent)' }} />

              <div>
                <label style={lbl}>اسم المستخدم الجديد (اختياري)</label>
                <input style={inp} type="text" placeholder={adminName} value={accountForm.newName} onChange={e => setAccountForm({ ...accountForm, newName: e.target.value })} />
              </div>

              <div>
                <label style={lbl}>كلمة المرور الجديدة (اختياري)</label>
                <input style={inp} type="password" placeholder="••••••••" value={accountForm.newPass} onChange={e => setAccountForm({ ...accountForm, newPass: e.target.value })} />
              </div>

              <div>
                <label style={lbl}>تأكيد كلمة المرور الجديدة</label>
                <input style={inp} type="password" placeholder="••••••••" value={accountForm.confirmPass} onChange={e => setAccountForm({ ...accountForm, confirmPass: e.target.value })} />
              </div>

              {accountError && (
                <div style={{ background: 'rgba(255,64,96,0.1)', border: '1px solid rgba(255,64,96,0.3)', borderRadius: 10, padding: '12px 16px', color: '#ff7090', fontSize: '0.88rem' }}>⚠ {accountError}</div>
              )}

              {accountSuccess && (
                <div style={{ background: 'rgba(0,232,122,0.08)', border: '1px solid rgba(0,232,122,0.25)', borderRadius: 10, padding: '12px 16px', color: 'var(--green)', fontSize: '0.88rem' }}>✓ تم تحديث بيانات الحساب بنجاح</div>
              )}

              <button className="btn-primary" onClick={handleUpdateAccount}>
                حفظ التغييرات
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
