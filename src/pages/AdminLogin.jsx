import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiAdminLogin } from '../utils/api'

export default function AdminLogin() {
  const [name, setName] = useState('')
  const [pass, setPass] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleLogin() {
    if (!name.trim() || !pass.trim()) { setError('يرجى تعبئة جميع الحقول'); return }
    setLoading(true); setError('')
    const res = await apiAdminLogin(name.trim(), pass.trim())
    if (res.ok) {
      localStorage.setItem('admin_auth', 'true')
      navigate('/admin/dashboard')
    } else {
      setError(res.error || 'خطأ في تسجيل الدخول')
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', position: 'relative' }}>
      <div className="grid-bg" />
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, transparent, var(--blue), var(--cyan), var(--gold), transparent)' }} />

      <div style={{ width: '100%', maxWidth: 400 }} className="animate-fadeUp">
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ width: 72, height: 72, margin: '0 auto 1.25rem', background: 'linear-gradient(135deg, var(--blue), var(--cyan))', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', boxShadow: '0 0 40px rgba(26,108,240,0.4)' }}>🔐</div>
          <div className="tag" style={{ marginBottom: '1rem' }}>ADMIN PANEL</div>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, background: 'linear-gradient(135deg, var(--text), var(--blue2))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            دخول المدير
          </h1>
        </div>

        <div className="card-neon">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.6rem', fontSize: '0.78rem', color: 'var(--text-muted)', letterSpacing: 1, textTransform: 'uppercase', fontFamily: 'var(--font-en)' }}>Username</label>
              <input className="input-field" type="text" placeholder="اسم المستخدم" value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.6rem', fontSize: '0.78rem', color: 'var(--text-muted)', letterSpacing: 1, textTransform: 'uppercase', fontFamily: 'var(--font-en)' }}>Password</label>
              <input className="input-field" type="password" placeholder="••••••••" value={pass} onChange={e => setPass(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} />
            </div>
            {error && (
              <div style={{ background: 'rgba(255,64,96,0.1)', border: '1px solid rgba(255,64,96,0.3)', borderRadius: 10, padding: '12px 16px', color: '#ff7090', fontSize: '0.88rem' }}>⚠ {error}</div>
            )}
            <button className="btn-primary" onClick={handleLogin} disabled={loading}>
              {loading ? '...' : '🔐 دخول'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
