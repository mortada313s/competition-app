import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'

export default function AgentPage() {
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [token, setToken] = useState(null)
  const [error, setError] = useState('')

  function generateToken() {
    const timestamp = Date.now().toString(36)
    const rand = Math.random().toString(36).substring(2, 8)
    return timestamp + '-' + rand
  }

  function handleGenerate() {
    if (!name.trim() || !password.trim()) {
      setError('يرجى تعبئة جميع الحقول')
      return
    }
    if (password.length < 4) {
      setError('كلمة المرور يجب أن تكون 4 أحرف على الأقل')
      return
    }
    setError('')
    setToken(generateToken())
  }

  function handleReset() {
    setName('')
    setPassword('')
    setToken(null)
    setError('')
  }

  const challengeUrl = token ? window.location.origin + '/challenge/' + token : ''

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      background: 'var(--bg)'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.75rem',
          color: 'var(--accent)',
          letterSpacing: '4px',
          marginBottom: '0.75rem'
        }}>
          COMPETITION
        </div>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--text)', lineHeight: 1.2 }}>
          تسجيل المتسابق
        </h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', fontSize: '0.95rem' }}>
          سجّل بياناتك للحصول على باركود الدخول
        </p>
      </div>

      <div className="card" style={{ width: '100%', maxWidth: '420px' }}>
        {!token ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                الاسم الكامل
              </label>
              <input
                className="input-field"
                type="text"
                placeholder="أدخل اسمك"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                كلمة المرور
              </label>
              <input
                className="input-field"
                type="password"
                placeholder="أدخل كلمة مرور"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
            {error && (
              <div style={{
                background: '#2a1015',
                border: '1px solid #5a2020',
                borderRadius: 'var(--radius)',
                padding: '12px 16px',
                color: '#e05a5a',
                fontSize: '0.9rem'
              }}>
                {error}
              </div>
            )}
            <button className="btn-primary" onClick={handleGenerate}>
              توليد الباركود
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>مرحباً</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--accent)' }}>{name}</div>
            </div>
            <div style={{ background: '#ffffff', padding: '20px', borderRadius: 'var(--radius)' }}>
              <QRCodeSVG value={challengeUrl} size={200} level="H" />
            </div>
            <div style={{
              background: 'var(--surface2)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              padding: '10px 16px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.7rem',
              color: 'var(--text-muted)',
              wordBreak: 'break-all',
              textAlign: 'center'
            }}>
              {challengeUrl}
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center' }}>
              امسح الباركود بكاميرا هاتفك للدخول إلى التحدي
            </p>
            <button
              className="btn-primary"
              onClick={handleReset}
              style={{ background: 'var(--surface2)', color: 'var(--text)', border: '1px solid var(--border)' }}
            >
              تسجيل شخص جديد
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
