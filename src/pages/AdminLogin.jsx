import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const ADMIN_USER = 'admin'
const ADMIN_PASS = 'admin1234'

export default function AdminLogin() {
  const [user, setUser] = useState('')
  const [pass, setPass] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  function handleLogin() {
    if (user === ADMIN_USER && pass === ADMIN_PASS) {
      localStorage.setItem('admin_auth', 'true')
      navigate('/admin/dashboard')
    } else {
      setError('اسم المستخدم أو كلمة المرور غير صحيحة')
    }
  }

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
          ADMIN PANEL
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 900 }}>لوحة التحكم</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
          تسجيل دخول المدير
        </p>
      </div>

      <div className="card" style={{ width: '100%', maxWidth: '380px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              اسم المستخدم
            </label>
            <input
              className="input-field"
              type="text"
              placeholder="admin"
              value={user}
              onChange={e => setUser(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              كلمة المرور
            </label>
            <input
              className="input-field"
              type="password"
              placeholder="••••••••"
              value={pass}
              onChange={e => setPass(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
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
          <button className="btn-primary" onClick={handleLogin}>
            دخول
          </button>
        </div>
      </div>
    </div>
  )
}
