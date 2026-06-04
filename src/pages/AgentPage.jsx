import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { apiAgentLogin, apiSaveParticipant } from '../utils/api'

export default function AgentPage() {
  const [phase, setPhase] = useState('login')
  const [agentName, setAgentName] = useState('')
  const [agentCode, setAgentCode] = useState('')
  const [agentId, setAgentId] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)

  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [token, setToken] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    if (!agentName.trim() || !agentCode.trim()) { setLoginError('يرجى تعبئة جميع الحقول'); return }
    setLoginLoading(true)
    setLoginError('')
    const res = await apiAgentLogin(agentName.trim(), agentCode.trim())
    if (res.ok) {
      setAgentId(res.agent.id)
      setPhase('register')
    } else {
      setLoginError(res.error || 'خطأ في تسجيل الدخول')
    }
    setLoginLoading(false)
  }

  async function handleGenerate() {
    if (!name.trim() || !password.trim()) { setError('يرجى تعبئة جميع الحقول'); return }
    if (password.length < 4) { setError('كلمة المرور يجب أن تكون 4 أحرف على الأقل'); return }
    setError('')
    setLoading(true)
    const t = Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 8)
    await apiSaveParticipant(t, name.trim(), agentId)
    setToken(t)
    setLoading(false)
  }

  function handleReset() { setName(''); setPassword(''); setToken(null); setError('') }
  function handleLogout() { setPhase('login'); setAgentName(''); setAgentCode(''); setAgentId(''); handleReset() }

  const challengeUrl = token ? window.location.origin + '/challenge/' + token : ''

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', position: 'relative' }}>
      <div className="grid-bg" />
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, transparent, var(--blue), var(--cyan), var(--gold), transparent)' }} />

      {/* LOGIN PHASE */}
      {phase === 'login' && (
        <div style={{ width: '100%', maxWidth: 420 }} className="animate-fadeUp">
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <div style={{ width: 72, height: 72, margin: '0 auto 1.25rem', background: 'linear-gradient(135deg, var(--blue), var(--cyan))', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', boxShadow: '0 0 40px rgba(0,212,255,0.3)' }}>
              👤
            </div>
            <div className="tag" style={{ marginBottom: '1rem' }}>AGENT LOGIN</div>
            <h1 style={{ fontSize: '2rem', fontWeight: 900, background: 'linear-gradient(135deg, var(--text), var(--blue2))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              دخول المندوب
            </h1>
            <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', fontSize: '0.9rem' }}>
              أدخل بياناتك للوصول إلى صفحة التسجيل
            </p>
          </div>

          <div className="card-neon">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.6rem', fontSize: '0.78rem', color: 'var(--text-muted)', letterSpacing: 1, textTransform: 'uppercase', fontFamily: 'var(--font-en)' }}>
                  Agent Name / اسم المندوب
                </label>
                <input className="input-field" type="text" placeholder="أدخل اسمك" value={agentName} onChange={e => setAgentName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.6rem', fontSize: '0.78rem', color: 'var(--text-muted)', letterSpacing: 1, textTransform: 'uppercase', fontFamily: 'var(--font-en)' }}>
                  Agent Code / الرمز السري
                </label>
                <input className="input-field" type="password" placeholder="••••••••" value={agentCode} onChange={e => setAgentCode(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} />
              </div>
              {loginError && (
                <div style={{ background: 'rgba(255,64,96,0.1)', border: '1px solid rgba(255,64,96,0.3)', borderRadius: 10, padding: '12px 16px', color: '#ff7090', fontSize: '0.88rem' }}>
                  ⚠ {loginError}
                </div>
              )}
              <button className="btn-primary" onClick={handleLogin} disabled={loginLoading} style={{ marginTop: '0.25rem' }}>
                {loginLoading ? '...' : '🔐 تسجيل الدخول'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REGISTER PHASE */}
      {phase === 'register' && (
        <div style={{ width: '100%', maxWidth: 440 }}>

          {/* Agent header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }} className="animate-fadeUp">
            <div>
              <div className="tag tag-gold">AGENT: {agentId}</div>
            </div>
            <button onClick={handleLogout} style={{ background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 14px', fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'var(--font-ar)' }}>
              خروج
            </button>
          </div>

          {!token ? (
            <>
              <div style={{ textAlign: 'center', marginBottom: '2rem' }} className="animate-fadeUp">
                <div style={{ width: 64, height: 64, margin: '0 auto 1rem', background: 'linear-gradient(135deg, var(--gold), #c8860a)', borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', boxShadow: '0 0 30px rgba(240,185,64,0.3)' }}>
                  🏆
                </div>
                <div className="tag tag-gold" style={{ marginBottom: '0.75rem' }}>COMPETITION ZONE</div>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 900, background: 'linear-gradient(135deg, var(--text), var(--gold))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  تسجيل المتسابق
                </h1>
                <p style={{ color: 'var(--text-muted)', marginTop: '0.4rem', fontSize: '0.88rem' }}>
                  سجّل بيانات المتسابق لتوليد باركود الدخول
                </p>
              </div>

              <div className="card-neon animate-fadeUp-1">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.6rem', fontSize: '0.78rem', color: 'var(--text-muted)', letterSpacing: 1, textTransform: 'uppercase', fontFamily: 'var(--font-en)' }}>
                      Full Name / الاسم الكامل
                    </label>
                    <input className="input-field" type="text" placeholder="أدخل اسم المتسابق" value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleGenerate()} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.6rem', fontSize: '0.78rem', color: 'var(--text-muted)', letterSpacing: 1, textTransform: 'uppercase', fontFamily: 'var(--font-en)' }}>
                      Password / كلمة المرور
                    </label>
                    <input className="input-field" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleGenerate()} />
                  </div>
                  {error && (
                    <div style={{ background: 'rgba(255,64,96,0.1)', border: '1px solid rgba(255,64,96,0.3)', borderRadius: 10, padding: '12px 16px', color: '#ff7090', fontSize: '0.88rem' }}>
                      ⚠ {error}
                    </div>
                  )}
                  <button className="btn-gold" onClick={handleGenerate} disabled={loading}>
                    {loading ? '...' : '⚡ توليد باركود الدخول'}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center' }} className="animate-fadeUp">
              <div style={{ marginBottom: '1.5rem' }}>
                <div className="tag tag-gold" style={{ marginBottom: '1rem' }}>READY TO PLAY</div>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '0.25rem' }}>
                  مرحباً، <span style={{ color: 'var(--gold)' }}>{name}</span>
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>امسح الباركود لبدء التحدي</p>
              </div>

              <div className="card-neon animate-float" style={{ marginBottom: '1.5rem' }}>
                <div style={{ background: '#fff', padding: 20, borderRadius: 12, display: 'inline-block', boxShadow: '0 0 40px rgba(240,185,64,0.3)', animation: 'pulse-gold 3s ease-in-out infinite' }}>
                  <QRCodeSVG value={challengeUrl} size={200} level="H" />
                </div>
                <div className="divider" />
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.6rem', color: 'var(--blue2)', wordBreak: 'break-all', letterSpacing: 1 }}>
                  {challengeUrl}
                </div>
              </div>

              <button className="btn-ghost" onClick={handleReset}>← تسجيل شخص جديد</button>
            </div>
          )}
        </div>
      )}

      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, transparent, var(--gold), var(--cyan), transparent)' }} />
    </div>
  )
}
