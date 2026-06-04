import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { apiSaveParticipant } from '../utils/api'

export default function AgentPage() {
  const { agentId } = useParams()
  const agent = agentId || 'default'
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [token, setToken] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleGenerate() {
    if (!name.trim() || !password.trim()) { setError('يرجى تعبئة جميع الحقول'); return }
    if (password.length < 4) { setError('كلمة المرور يجب أن تكون 4 أحرف على الأقل'); return }
    setError('')
    setLoading(true)
    const t = Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 8)
    await apiSaveParticipant(t, name.trim(), agent)
    setToken(t)
    setLoading(false)
  }

  function handleReset() { setName(''); setPassword(''); setToken(null); setError('') }

  const challengeUrl = token ? window.location.origin + '/challenge/' + token : ''

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', position: 'relative' }}>
      <div className="grid-bg" />

      {/* Top decoration */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, transparent, var(--blue), var(--cyan), var(--gold), transparent)' }} />

      {!token ? (
        <div style={{ width: '100%', maxWidth: 440 }}>

          {/* Logo area */}
          <div className="animate-fadeUp" style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <div style={{ width: 72, height: 72, margin: '0 auto 1.25rem', position: 'relative' }}>
              <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, var(--blue) 0%, var(--cyan) 100%)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', boxShadow: '0 0 40px rgba(0,212,255,0.4)', animation: 'pulse-blue 3s ease-in-out infinite' }}>
                🏆
              </div>
            </div>
            <div className="tag" style={{ marginBottom: '1rem' }}>COMPETITION ZONE</div>
            <h1 style={{ fontSize: '2rem', fontWeight: 900, background: 'linear-gradient(135deg, var(--text) 0%, var(--blue2) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1.2, marginBottom: '0.5rem' }}>
              تسجيل المتسابق
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              سجّل بياناتك للحصول على باركود الدخول
            </p>
            {agent !== 'default' && (
              <div className="tag tag-gold" style={{ marginTop: '0.75rem' }}>مندوب: {agent}</div>
            )}
          </div>

          {/* Form card */}
          <div className="card-neon animate-fadeUp-1" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

              <div>
                <label style={{ display: 'block', marginBottom: '0.6rem', fontSize: '0.82rem', color: 'var(--text-muted)', letterSpacing: 1, textTransform: 'uppercase', fontFamily: 'var(--font-en)' }}>
                  Full Name / الاسم الكامل
                </label>
                <input className="input-field" type="text" placeholder="أدخل اسمك الكامل" value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleGenerate()} />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.6rem', fontSize: '0.82rem', color: 'var(--text-muted)', letterSpacing: 1, textTransform: 'uppercase', fontFamily: 'var(--font-en)' }}>
                  Password / كلمة المرور
                </label>
                <input className="input-field" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleGenerate()} />
              </div>

              {error && (
                <div style={{ background: 'rgba(255,64,96,0.1)', border: '1px solid rgba(255,64,96,0.3)', borderRadius: 10, padding: '12px 16px', color: '#ff7090', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                  ⚠ {error}
                </div>
              )}

              <button className="btn-gold" onClick={handleGenerate} disabled={loading} style={{ marginTop: '0.25rem', fontSize: '1.05rem' }}>
                {loading ? '...' : '⚡ توليد باركود الدخول'}
              </button>
            </div>
          </div>

          {/* Footer info */}
          <div className="animate-fadeUp-2" style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '1.5rem' }}>
            {['تحدي واحد', 'باركود فريد', 'نتائج فورية'].map((t, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t}</div>
              </div>
            ))}
          </div>
        </div>

      ) : (
        <div style={{ width: '100%', maxWidth: 440, textAlign: 'center' }} className="animate-fadeUp">

          <div style={{ marginBottom: '1.5rem' }}>
            <div className="tag tag-gold" style={{ marginBottom: '1rem' }}>READY TO PLAY</div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '0.25rem' }}>
              مرحباً، <span style={{ color: 'var(--gold)' }}>{name}</span>
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>امسح الباركود لبدء التحدي</p>
          </div>

          {/* QR Container */}
          <div className="card-neon animate-float" style={{ padding: '2rem', marginBottom: '1.5rem', background: 'rgba(5,15,35,0.9)' }}>
            <div style={{ background: '#ffffff', padding: '20px', borderRadius: 12, display: 'inline-block', boxShadow: '0 0 40px rgba(240,185,64,0.3)', animation: 'pulse-gold 3s ease-in-out infinite' }}>
              <QRCodeSVG value={challengeUrl} size={200} level="H" />
            </div>

            <div className="divider" />

            <div style={{ background: 'rgba(26,108,240,0.08)', border: '1px solid rgba(26,108,240,0.15)', borderRadius: 8, padding: '8px 12px', fontFamily: 'var(--font-display)', fontSize: '0.6rem', color: 'var(--blue2)', wordBreak: 'break-all', letterSpacing: 1 }}>
              {challengeUrl}
            </div>
          </div>

          <button className="btn-ghost" onClick={handleReset}>
            ← تسجيل شخص جديد
          </button>
        </div>
      )}

      {/* Bottom decoration */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, transparent, var(--gold), var(--cyan), var(--blue), transparent)' }} />
    </div>
  )
}
